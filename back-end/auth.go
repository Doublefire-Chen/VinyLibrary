package main

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/argon2"
)

var secretKey []byte

// GenerateToken generates a JWT token with 24h expiration
func GenerateToken(userID int) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

// ParseToken parses a JWT token and returns the user ID
func ParseToken(tokenString string) (int, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid token claims")
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("user_id not found in token")
	}

	return int(userID), nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get token from cookie
		tokenString, err := c.Cookie("bearer-token")
		if err != nil || tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token is missing"})
			c.Abort()
			return
		}

		// 2. Parse token
		userID, err := ParseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// 3. Optionally refresh the token
		if c.Request.URL.Path != "/api/logout" {
			newToken, _ := GenerateToken(userID)
			c.SetCookie("bearer-token", newToken, 86400, "/", "", false, true)
		}

		// 4. Store userID in context
		c.Set("user_id", userID)
		c.Next()
	}
}

// Generate a random salt
func generateSalt() ([]byte, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return nil, err
	}
	return salt, nil
}

// Hash the password using Argon2
func hashPassword(password string, salt []byte) string {
	hashed := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	// for debug
	fmt.Println("salt: ", salt)
	fmt.Println("hashed: ", hashed)

	// Combine salt and hash for storage
	return base64.StdEncoding.EncodeToString(salt) + "$" + base64.StdEncoding.EncodeToString(hashed)
}

func Register(c *gin.Context) {
	if strings.ToLower(os.Getenv("CAN_REGISTER")) != "true" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Registration is disabled"})
		return
	}
	var registerReq struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&registerReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// case insensitive username
	username := strings.ToLower(strings.TrimSpace(registerReq.Username))

	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username cannot be empty"})
		return
	}

	// Generate salt
	salt, err := generateSalt()
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate salt"})
		return
	}

	// Hash the password using Argon2
	hashedPassword := hashPassword(registerReq.Password, salt)

	// Connect to the database
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	// Store the username and hashed password
	query := "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id"
	var userID int
	err = db.QueryRow(query, username, hashedPassword).Scan(&userID)
	if err != nil {
		if err.Error() == `pq: duplicate key value violates unique constraint "users_username_key"` {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert user"})
		fmt.Println(err) // for debugging
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User created successfully", "user_id": userID})
}

// Function to verify a password using Argon2
func verifyPassword(hashedPassword, inputPassword string) (bool, error) {
	// Split the stored password into salt and hash
	parts := splitStoredPassword(hashedPassword)
	if len(parts) != 2 {
		return false, errors.New("invalid stored password format")
	}

	// Decode the salt and hash
	salt, err := base64.StdEncoding.DecodeString(parts[0])
	if err != nil {
		return false, err
	}

	expectedHash, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return false, err
	}

	// Hash the input password using the same parameters and salt
	inputHash := argon2.IDKey([]byte(inputPassword), salt, 1, 64*1024, 4, uint32(len(expectedHash)))

	// Compare the hashes
	return hmacEqual(expectedHash, inputHash), nil
}

// Helper function to split the stored password (format: salt$hash)
func splitStoredPassword(storedPassword string) []string {
	return strings.Split(storedPassword, "$")
}

// Constant-time comparison to prevent timing attacks
func hmacEqual(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	result := 0
	for i := 0; i < len(a); i++ {
		result |= int(a[i] ^ b[i])
	}
	return result == 0
}

func Login(c *gin.Context) {
	var loginReq struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	username := strings.TrimSpace(loginReq.Username)

	// Get user from the database
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	var userID int
	var storedHashedPassword string
	query := "SELECT id, password FROM users WHERE LOWER(username) = LOWER($1)"
	err = db.QueryRow(query, username).Scan(&userID, &storedHashedPassword)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No user found in the database"})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Database error"})
		// for debug
		fmt.Println(err)
		return
	}

	// Verify the password
	match, err := verifyPassword(storedHashedPassword, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Error when verifying password"})
		return
	}

	if !match {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Generate token
	token, err := GenerateToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Set the session token as a cookie (use your custom token name here)
	c.SetCookie("bearer-token", token, 86400, "/", "", false, true) // Adjust parameters as needed
	// return user id
	c.JSON(http.StatusOK, gin.H{"user_id": userID, "message": loginReq.Username + " logged in successfully", "login_status": true})
}

func ChangePassword(c *gin.Context) {
	var changePasswordReq struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&changePasswordReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Get user from the database
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	query := "SELECT id, password FROM users WHERE id = $1"
	userID := c.MustGet("user_id").(int)
	var storedHashedPassword string
	err = db.QueryRow(query, userID).Scan(&userID, &storedHashedPassword)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Database error"})
		return
	}

	// Verify the old password
	match, err := verifyPassword(storedHashedPassword, changePasswordReq.OldPassword)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Error when verifying password"})
		return
	}

	if !match {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid old password"})
		return
	}

	// Generate salt
	salt, err := generateSalt()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate salt"})
		return
	}

	// Hash the new password using Argon2
	hashedPassword := hashPassword(changePasswordReq.NewPassword, salt)

	// Update the password
	query = "UPDATE users SET password = $1 WHERE id = $2"
	_, err = db.Exec(query, hashedPassword, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		fmt.Println(err) // for debugging
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func DeleteAccount(c *gin.Context) {
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()
	userID := c.MustGet("user_id").(int)

	_, err = db.Exec("DELETE FROM users WHERE id = $1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account user_id = " + fmt.Sprint(userID) + " deleted successfully"})
}

func Logout(c *gin.Context) {
	// Invalidate the cookie by setting its value to empty and max age to -1
	c.SetCookie("bearer-token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
