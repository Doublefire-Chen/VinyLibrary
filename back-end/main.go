package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

// initialize the variables
func init() {
	loadEnvVariables()
	secretKey = []byte(os.Getenv("SECRET_KEY"))
}

func main() {

	router := gin.Default()

	// Routes
	router.POST("/login", Login)       // Route for login (to get the token)
	router.POST("/register", Register) // Route for register

	// Protected routes
	protected := router.Group("/api")
	protected.Use(AuthMiddleware()) // Apply authorization middleware
	{
		protected.GET("/vinyls", GetVinylInfo)
		protected.POST("/vinyls", AddVinyl)
		protected.POST("/upload", UploadAlbumPicture)
		protected.PUT("/vinyls/:id", UpdateVinyl)
		protected.DELETE("/vinyls/:id", DeleteVinyl)
		protected.PUT("/vinyls/:id/play", AddPlayNum)
		protected.POST("/changepwd", ChangePassword)
		protected.POST("/deleteuser", DeleteAccount)
		protected.GET("/logout", Logout)
	}

	log.Fatal(router.Run(":1234"))
}
