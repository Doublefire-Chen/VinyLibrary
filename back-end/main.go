package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
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

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:3000", "http://example.com"}, // 允许的来源
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},                // 允许的请求方法
		AllowHeaders:     []string{"Content-Type", "Authorization"},               // 允许的请求头
		AllowCredentials: true,                                                    // 允许发送带有认证信息的请求
	}

	router.Use(cors.New(corsConfig))

	// Routes
	router.POST("/login", Login)                          // Route for login (to get the token)
	router.POST("/register", Register)                    // Route for register
	router.GET("/api/vinyls", GetVinylInfo)               // public api to get all vinyls
	router.GET("/api/album/:filename", ServeAlbumPicture) // public api to get album picture

	// Protected routes
	protected := router.Group("/api")
	protected.Use(AuthMiddleware()) // Apply authorization middleware
	{
		protected.POST("/vinyls", AddVinyl)
		protected.POST("/upload", UploadAlbumPicture)
		protected.GET("/vinyls/:id", GetVinylByID)
		protected.PUT("/vinyls/:id", UpdateVinyl)
		protected.DELETE("/vinyls/:id", DeleteVinyl)
		protected.POST("/vinyls/play", AddPlayNum)
		protected.POST("/changepwd", ChangePassword)
		protected.POST("/deleteuser", DeleteAccount)
	}

	log.Fatal(router.Run(":1234"))
}
