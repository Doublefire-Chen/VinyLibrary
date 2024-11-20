package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Track struct {
	Side   string `json:"side"`
	Order  int    `json:"order"`
	Title  string `json:"title"`
	Length string `json:"length"` // Length of the track, for example "4:20"
}

type Vinyl struct {
	ID              int     `json:"id"`
	Title           string  `json:"title"`
	Artist          string  `json:"artist"`
	Year            int     `json:"year"`
	VinylType       string  `json:"vinyl_type"`
	VinylNumber     int     `json:"vinyl_number"`
	Tracklist       []Track `json:"tracklist"`
	AlbumPictureURL string  `json:"album_picture_url"`
	PlayNum         int     `json:"play_num"`
	Timebuyed       string  `json:"timebuyed"`
	Price           float64 `json:"price"`
	Currency        string  `json:"currency"`
	Description     string  `json:"description"`
}

// Load environment variables from the .env file
func loadEnvVariables() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

// Database connection
func connectDB() (*sql.DB, error) {

	// 从环境变量获取数据库连接的详细信息
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	dbSslMode := os.Getenv("DB_SSLMODE")

	// 对密码进行URL编码，以处理特殊字符
	encodedPassword := url.QueryEscape(dbPassword)

	// 构造连接字符串（PostgreSQL URL）
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		dbUser, encodedPassword, dbHost, dbPort, dbName, dbSslMode)

	// 打开数据库连接
	return sql.Open("postgres", connStr)
}

// GetVinylInfo retrieves the vinyl collection from the database
func GetVinylInfo(c *gin.Context) {
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	rows, err := db.Query("SELECT id, title, artist, year, vinyl_type, vinyl_number, tracklist, album_picture_url, play_num, timebuyed, price, currency, description FROM vinyls")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve data"})
		return
	}
	defer rows.Close()

	var vinyls []Vinyl
	for rows.Next() {
		var v Vinyl
		var tracklistJSON []byte // temporary variable to hold the raw JSON data

		// Scan the row data; tracklist is retrieved as []byte
		if err := rows.Scan(&v.ID, &v.Title, &v.Artist, &v.Year, &v.VinylType, &v.VinylNumber, &tracklistJSON, &v.AlbumPictureURL, &v.PlayNum, &v.Timebuyed, &v.Price, &v.Currency, &v.Description); err != nil {
			fmt.Printf("Error scanning data: %v\n", err) // Print scan error details
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning data"})
			return
		}

		// Unmarshal tracklist JSON into the Tracklist field in the Vinyl struct
		if err := json.Unmarshal(tracklistJSON, &v.Tracklist); err != nil {
			fmt.Printf("Error unmarshaling tracklist JSON: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding tracklist"})
			return
		}

		vinyls = append(vinyls, v)
	}

	c.JSON(http.StatusOK, vinyls)
}

// AddVinyl adds a new vinyl record to the database
func AddVinyl(c *gin.Context) {
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	// Bind incoming JSON to the Vinyl struct
	var vinyl Vinyl
	if err := c.ShouldBindJSON(&vinyl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		// show error info in console
		log.Println(err)
		return
	}

	// Convert the tracklist to JSON
	tracklistJSON, err := json.Marshal(vinyl.Tracklist)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode tracklist"})
		return
	}

	// Insert data into the vinyls table
	query := `INSERT INTO vinyls (title, artist, year, vinyl_type, vinyl_number, tracklist, album_picture_url, play_num, timebuyed, price, currency, description)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`

	err = db.QueryRow(query, vinyl.Title, vinyl.Artist, vinyl.Year, vinyl.VinylType, vinyl.VinylNumber, tracklistJSON, vinyl.AlbumPictureURL, vinyl.PlayNum, vinyl.Timebuyed, vinyl.Price, vinyl.Currency, vinyl.Description).Scan(&vinyl.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert vinyl"})
		// show error info in console
		log.Println(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vinyl added successfully", "id": vinyl.ID})
}

// UploadAlbumPicture handles the album picture upload
func UploadAlbumPicture(c *gin.Context) {

	// Retrieve title, artist, vinyl type, and number of vinyls from form data
	title := c.PostForm("title")
	artist := c.PostForm("artist")
	vinylType := c.PostForm("vinyl_type")
	vinylNumber := c.PostForm("vinyl_number")

	// Ensure that title, artist, vinyl type, and number of vinyls are provided
	if title == "" || artist == "" || vinylType == "" || vinylNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing title, artist, vinyl type, or number of vinyls"})
		return
	}

	// Retrieve the file from form data
	file, err := c.FormFile("album_picture")
	if err != nil {
		// for debug
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Define the album directory
	albumDir := "./album"
	if _, err := os.Stat(albumDir); os.IsNotExist(err) {
		// Create the album directory if it doesn't exist
		err = os.Mkdir(albumDir, os.ModePerm)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create album directory"})
			return
		}
	}

	// Sanitize title and artist for file name to avoid invalid characters
	// sanitizedTitle := url.QueryEscape(title)
	// sanitizedArtist := url.QueryEscape(artist)

	// Extract file extension from the uploaded file
	extension := filepath.Ext(file.Filename)

	// Generate the filename as {Title}_{Artist}({number}{type}).{extension}
	filename := fmt.Sprintf("%s_%s(%s%s)%s", title, artist, vinylNumber, vinylType, extension)
	filePath := filepath.Join(albumDir, filename)

	// Save the file to the album directory
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Return the URL for the uploaded file
	fileURL := fmt.Sprintf("%s/album/%s", os.Getenv("DOMAIN"), filename)
	sanitizedFileURL := url.PathEscape(fileURL)
	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "url": sanitizedFileURL})
}

func DeleteVinyl(c *gin.Context) {
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing id"})
		fmt.Println(id)
		return
	}

	_, err = db.Exec("DELETE FROM vinyls WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vinyl"})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vinyl id = " + id + " deleted successfully"})
}

func AddPlayNum(c *gin.Context) {
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing id"})
		fmt.Println(id)
		return
	}

	var playNum int
	query := "UPDATE vinyls SET play_num = play_num + 1 WHERE id = $1 RETURNING play_num"
	err = db.QueryRow(query, id).Scan(&playNum)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update play_num"})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vinyl id = " + id + " play_num updated successfully, now play_num = " + fmt.Sprint(playNum)})
}

func UpdateVinyl(c *gin.Context) {
	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing id"})
		fmt.Println(id)
		return
	}

	var vinyl Vinyl
	if err := c.ShouldBindJSON(&vinyl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		// show error info in console
		log.Println(err)
		return
	}

	// Convert the tracklist to JSON
	tracklistJSON, err := json.Marshal(vinyl.Tracklist)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode tracklist"})
		return
	}

	// Insert data into the vinyls table
	query := `UPDATE vinyls SET title = $1, artist = $2, year = $3, vinyl_type = $4, vinyl_number = $5, tracklist = $6, album_picture_url = $7, play_num = $8, timebuyed = $9, price = $10, currency = $11, description = $12 WHERE id = $13`

	_, err = db.Exec(query, vinyl.Title, vinyl.Artist, vinyl.Year, vinyl.VinylType, vinyl.VinylNumber, tracklistJSON, vinyl.AlbumPictureURL, vinyl.PlayNum, vinyl.Timebuyed, vinyl.Price, vinyl.Currency, vinyl.Description, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vinyl"})
		// show error info in console
		log.Println(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vinyl updated successfully", "id": id})
}
