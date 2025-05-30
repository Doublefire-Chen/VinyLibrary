package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var listen_address string

// initialize the variables
func init() {
	loadEnvVariables()
	secretKey = []byte(os.Getenv("SECRET_KEY"))
	listen_address = os.Getenv("GO_PORT")
}

func main() {

	router := gin.Default()

	// CORS configuration
	// Since nginx acts as reverse proxy, all requests come from localhost
	corsConfig := cors.Config{
		AllowOrigins: []string{
			"http://127.0.0.1",
			"http://localhost",
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-CSRF-Token",
			"X-Real-IP",
			"X-Forwarded-For",
			"X-Forwarded-Proto",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Headers",
			"Cache-Control",
			"Content-Language",
			"Content-Type",
		},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}

	router.Use(cors.New(corsConfig))

	// API group - all routes now under /api prefix
	api := router.Group("/api")
	{
		// Public authentication routes
		api.POST("/auth/login", Login)
		api.POST("/auth/register", Register)

		// Public vinyl routes
		api.GET("/vinyls", GetVinylInfo)
		api.GET("/vinyls/:id", GetVinylByID)
		api.GET("/album/:filename", ServeAlbumPicture)
		api.GET("/history/:id", GetPlayHistoryByID)
		// Version information
		api.GET("/version", GetVersion)

		// Protected routes group
		protected := api.Group("/")
		protected.Use(AuthMiddleware())
		{
			// Vinyl management
			protected.POST("/vinyls", AddVinyl)
			protected.PUT("/vinyls/:id", UpdateVinyl)
			protected.DELETE("/vinyls/:id", DeleteVinyl)
			protected.POST("/vinyls/play", AddPlayNum)

			// File upload
			protected.POST("/upload", UploadAlbumPicture)

			// User management
			protected.POST("/auth/changepwd", ChangePassword)
			protected.POST("/auth/logout", Logout)

			// System operations
			protected.GET("/system/backup", Backup)
			protected.POST("/system/restore", Restore)

		}
	}

	// Health check endpoint (useful for monitoring)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Fatal(router.Run(listen_address))
}
