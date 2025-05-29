package main

import (
	"archive/zip"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

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
	Timebought      string  `json:"timebought"`
	Price           float64 `json:"price"`
	Currency        string  `json:"currency"`
	Description     string  `json:"description"`
}

type PlayHistory struct {
	ID       int    `json:"id"`
	VinylID  int    `json:"vinyl_id"`
	Username string `json:"username"`
	PlayTime string `json:"play_time"`
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

	// 构造连接字符串（PostgreSQL URL）
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=%s",
		dbUser, dbPassword, dbName, dbHost, dbPort, dbSslMode)

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

	rows, err := db.Query("SELECT id, title, artist, year, vinyl_type, vinyl_number, tracklist, album_picture_url, play_num, timebought, price, currency, description FROM vinyls where status = 'active' ORDER BY id ASC")
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
		if err := rows.Scan(&v.ID, &v.Title, &v.Artist, &v.Year, &v.VinylType, &v.VinylNumber, &tracklistJSON, &v.AlbumPictureURL, &v.PlayNum, &v.Timebought, &v.Price, &v.Currency, &v.Description); err != nil {
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
	query := `INSERT INTO vinyls (title, artist, year, vinyl_type, vinyl_number, tracklist, album_picture_url, play_num, timebought, price, currency, description, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active') RETURNING id`

	err = db.QueryRow(query, vinyl.Title, vinyl.Artist, vinyl.Year, vinyl.VinylType, vinyl.VinylNumber, tracklistJSON, vinyl.AlbumPictureURL, vinyl.PlayNum, vinyl.Timebought, vinyl.Price, vinyl.Currency, vinyl.Description).Scan(&vinyl.ID)

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

	// Sanitize title and artist to avoid invalid file characters
	safeTitle := sanitizeFilename(title)
	safeArtist := sanitizeFilename(artist)

	// Extract file extension
	extension := filepath.Ext(file.Filename)

	// Generate safe filename
	filename := fmt.Sprintf("%s_%s(%s%s)%s", safeTitle, safeArtist, vinylNumber, vinylType, extension)
	filePath := filepath.Join(albumDir, filename)

	// Save file
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Escape filename for URL safety
	album_base_url := os.Getenv("ALBUM_BASE_URL")
	escapedFilename := url.PathEscape(filename)
	fileURL := fmt.Sprintf("%s/api/album/%s", album_base_url, escapedFilename)

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "url": fileURL})
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

	// check if trash folder exists, if not, create it
	if _, err := os.Stat("./album/trash"); os.IsNotExist(err) {
		err = os.Mkdir("./album/trash", os.ModePerm)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create trash directory"})
			return
		}
	}

	// delete the album picture, not real delete, just put it in the trash folder
	// get the album picture url
	var albumPictureURL string
	err = db.QueryRow("SELECT album_picture_url FROM vinyls WHERE id = $1", id).Scan(&albumPictureURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get album picture url"})
		fmt.Println(err)
		return
	}
	filename := filepath.Base(albumPictureURL)
	// unescape the filename
	filename, err = url.PathUnescape(filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unescape filename"})
		fmt.Println(err)
		return
	}
	// move the file to trash folder
	os.Rename("./album/"+filename, "./album/trash/"+filename)

	_, err = db.Exec("update vinyls set status = 'deleted' where id = $1", id)
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

	// Get user_id and play_time from request body
	var playData struct {
		UserID   int    `json:"user_id"`
		VinylID  int    `json:"vinyl_id"`
		PlayTime string `json:"play_time"`
	}
	if err := c.ShouldBindJSON(&playData); err != nil {
		// print request body for debug
		fmt.Println(c.Request.Body)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	vinyl_id := playData.VinylID
	user_id := playData.UserID
	play_time := playData.PlayTime

	//check if these 3 parameters are not empty
	if vinyl_id == 0 || user_id == 0 || play_time == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing vinyl_id, user_id or play_time"})
		fmt.Println(vinyl_id, user_id, play_time)
		return
	}

	// First, record play information
	var playID int
	if user_id != 0 && play_time != "" {
		query := `INSERT INTO play (vinyl_id, user_id, play_time, status)
			VALUES ($1, $2, $3, True) returning id`
		err = db.QueryRow(query, vinyl_id, user_id, play_time).Scan(&playID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record play info"})
			fmt.Println(err)
			return
		}
	}

	// Then, update play_num
	var playNum int
	query := "UPDATE vinyls SET play_num = play_num + 1 WHERE id = $1 RETURNING play_num"
	err = db.QueryRow(query, vinyl_id).Scan(&playNum)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update play_num"})
		fmt.Println(err)
		return
	}

	// If playID is available, include it in the response
	c.JSON(http.StatusOK, gin.H{
		"message":  "Play num updated successfully",
		"play_num": playNum,
		"play_id":  playID,
	})
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
	query := `UPDATE vinyls SET title = $1, artist = $2, year = $3, vinyl_type = $4, vinyl_number = $5, tracklist = $6, album_picture_url = $7, play_num = $8, timebought = $9, price = $10, currency = $11, description = $12 WHERE id = $13`

	_, err = db.Exec(query, vinyl.Title, vinyl.Artist, vinyl.Year, vinyl.VinylType, vinyl.VinylNumber, tracklistJSON, vinyl.AlbumPictureURL, vinyl.PlayNum, vinyl.Timebought, vinyl.Price, vinyl.Currency, vinyl.Description, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vinyl"})
		// show error info in console
		log.Println(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vinyl updated successfully", "id": id})
}

func ServeAlbumPicture(c *gin.Context) {
	filename := c.Param("filename")
	filePath := filepath.Join("./album", filename)

	// 检查文件是否存在
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// 通过 Gin 发送文件
	c.File(filePath)
}

// sanitizeFilename 移除或替换文件名中的非法字符
func sanitizeFilename(name string) string {
	// 过滤掉不安全字符，如 / \ : * ? " < > |
	illegalChars := []string{"/", "\\", ":", "*", "?", "\"", "<", ">", "|"}
	for _, char := range illegalChars {
		name = strings.ReplaceAll(name, char, "_")
	}
	return name
}

func GetVinylByID(c *gin.Context) {
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

	var v Vinyl
	var tracklistJSON []byte

	err = db.QueryRow("SELECT id, title, artist, year, vinyl_type, vinyl_number, tracklist, album_picture_url, play_num, timebought, price, currency, description FROM vinyls WHERE id = $1", id).Scan(&v.ID, &v.Title, &v.Artist, &v.Year, &v.VinylType, &v.VinylNumber, &tracklistJSON, &v.AlbumPictureURL, &v.PlayNum, &v.Timebought, &v.Price, &v.Currency, &v.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve data"})
		return
	}

	if err := json.Unmarshal(tracklistJSON, &v.Tracklist); err != nil {
		fmt.Printf("Error unmarshaling tracklist JSON: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding tracklist"})
		return
	}

	c.JSON(http.StatusOK, v)
}

func GetPlayHistoryByID(c *gin.Context) {

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing id"})
		fmt.Println("id is empty")
		return
	}

	db, err := connectDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to the database"})
		return
	}
	defer db.Close()

	// Retrieve vinyl info based on the provided ID
	var v Vinyl
	var tracklistJSON []byte
	err = db.QueryRow(`
		SELECT id, title, artist, year, vinyl_type, vinyl_number, tracklist, album_picture_url, play_num, timebought, price, currency, description 
		FROM vinyls 
		WHERE id = $1`, id).Scan(
		&v.ID, &v.Title, &v.Artist, &v.Year, &v.VinylType, &v.VinylNumber, &tracklistJSON,
		&v.AlbumPictureURL, &v.PlayNum, &v.Timebought, &v.Price, &v.Currency, &v.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve data"})
		return
	}
	if err := json.Unmarshal(tracklistJSON, &v.Tracklist); err != nil {
		fmt.Printf("Error unmarshaling tracklist JSON: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding tracklist"})
		return
	}

	// Retrieve play history with usernames
	var playHistory []PlayHistory
	query := `
		SELECT p.id, p.vinyl_id, u.username, p.play_time
		FROM play p
		JOIN users u ON p.user_id = u.id
		WHERE p.vinyl_id = $1 AND p.status = TRUE
		ORDER BY p.id DESC
	`
	rows, err := db.Query(query, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve play history"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var tmp PlayHistory
		if err := rows.Scan(&tmp.ID, &tmp.VinylID, &tmp.Username, &tmp.PlayTime); err != nil {
			fmt.Printf("Error scanning data: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning data"})
			log.Println(err)
			return
		}
		playHistory = append(playHistory, tmp)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error iterating rows"})
		return
	}

	// Return both vinyl info and play history
	c.JSON(http.StatusOK, gin.H{
		"vinyl":        v,
		"play_history": playHistory,
	})
}

// helper function to generate HMAC signature
func generateSignature(data []byte, salt string) string {
	h := hmac.New(sha256.New, []byte(salt))
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

func Backup(c *gin.Context) {
	now := time.Now()
	zone, offset := now.Zone()
	backupName := fmt.Sprintf("backup_%s_%s%+03d.zip", now.Format("20060102_150405"), zone, offset/3600)
	backupDir := strings.TrimSuffix(backupName, ".zip")

	// 1. Create backup directory
	if err := os.MkdirAll(backupDir, os.ModePerm); err != nil {
		c.JSON(500, gin.H{"error": "Failed to create backup directory"})
		return
	}

	// 2. Copy album folder using Linux cp -r
	albumDir := "./album"
	albumBackupDir := filepath.Join(backupDir, "album")
	if err := os.MkdirAll(albumBackupDir, os.ModePerm); err != nil {
		os.RemoveAll(backupDir)
		c.JSON(500, gin.H{"error": "Failed to create album backup directory"})
		return
	}
	cmd := exec.Command("cp", "-r", albumDir+"/.", albumBackupDir)
	if err := cmd.Run(); err != nil {
		os.RemoveAll(backupDir)
		c.JSON(500, gin.H{"error": "Failed to copy album folder: " + err.Error()})
		return
	}

	// 3. Dump PostgreSQL database using pg_dump with env vars
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	dumpPath := filepath.Join(backupDir, "db_backup.sql")
	pgDumpCmd := exec.Command("pg_dump", "-U", dbUser, "-h", dbHost, "-p", dbPort, "-F", "p", "-d", dbName)
	pgDumpCmd.Env = append(os.Environ(), "PGPASSWORD="+dbPassword)
	dumpFile, err := os.Create(dumpPath)
	if err != nil {
		os.RemoveAll(backupDir)
		c.JSON(500, gin.H{"error": "Failed to create DB dump file"})
		return
	}
	defer dumpFile.Close()
	pgDumpCmd.Stdout = dumpFile
	if err := pgDumpCmd.Run(); err != nil {
		os.RemoveAll(backupDir)
		c.JSON(500, gin.H{"error": "Failed to dump database: " + err.Error()})
		return
	}

	// 4. Zip the backup directory
	zipPath := backupDir + ".zip"
	if err := zipDir(backupDir, zipPath); err != nil {
		os.RemoveAll(backupDir)
		c.JSON(500, gin.H{"error": "Failed to create zip archive"})
		return
	}

	// 5. Generate HMAC signature for the zip file
	// Read the BACKUP_SALT from environment
	backupSalt := os.Getenv("BACKUP_SALT")
	if backupSalt == "" {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		c.JSON(500, gin.H{"error": "BACKUP_SALT not configured"})
		return
	}

	// Read the zip file content to generate signature
	zipContent, err := os.ReadFile(zipPath)
	if err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		c.JSON(500, gin.H{"error": "Failed to read zip file for signing"})
		return
	}

	// Generate signature
	signature := generateSignature(zipContent, backupSalt)

	// Create a new zip with signature file included
	finalZipPath := strings.TrimSuffix(zipPath, ".zip") + "_signed.zip"
	finalZip, err := os.Create(finalZipPath)
	if err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		c.JSON(500, gin.H{"error": "Failed to create signed zip"})
		return
	}
	defer finalZip.Close()

	zipWriter := zip.NewWriter(finalZip)
	defer zipWriter.Close()

	// Add the original zip as "backup.zip" inside the final zip
	backupEntry, err := zipWriter.Create("backup.zip")
	if err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		os.Remove(finalZipPath)
		c.JSON(500, gin.H{"error": "Failed to add backup to signed zip"})
		return
	}
	if _, err := backupEntry.Write(zipContent); err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		os.Remove(finalZipPath)
		c.JSON(500, gin.H{"error": "Failed to write backup to signed zip"})
		return
	}

	// Add signature file
	sigEntry, err := zipWriter.Create("signature.txt")
	if err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		os.Remove(finalZipPath)
		c.JSON(500, gin.H{"error": "Failed to add signature to zip"})
		return
	}
	if _, err := sigEntry.Write([]byte(signature)); err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		os.Remove(finalZipPath)
		c.JSON(500, gin.H{"error": "Failed to write signature"})
		return
	}

	// Close the zip writer before serving
	if err := zipWriter.Close(); err != nil {
		os.RemoveAll(backupDir)
		os.Remove(zipPath)
		os.Remove(finalZipPath)
		c.JSON(500, gin.H{"error": "Failed to finalize signed zip"})
		return
	}

	// 5. Download the zip file and remove after sent
	file, err := os.Open(finalZipPath)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to open backup file"})
		return
	}
	defer file.Close()
	defer os.RemoveAll(backupDir) // Remove the unzipped backup directory
	defer os.Remove(zipPath)      // Remove the unsigned zip
	defer os.Remove(finalZipPath) // Remove the signed zip after serving

	fi, err := file.Stat()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to stat backup file"})
		return
	}
	c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
	c.Writer.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, strings.TrimSuffix(backupName, ".zip")+"_signed.zip"))
	http.ServeContent(c.Writer, c.Request, filepath.Base(finalZipPath), fi.ModTime(), file)
}

// Helper: zip a directory
func zipDir(source, target string) error {
	zipfile, err := os.Create(target)
	if err != nil {
		return err
	}
	defer zipfile.Close()

	archive := zip.NewWriter(zipfile)
	defer archive.Close()

	return filepath.Walk(source, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		relPath, err := filepath.Rel(source, path)
		if err != nil {
			return err
		}
		f, err := archive.Create(relPath)
		if err != nil {
			return err
		}
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()
		_, err = io.Copy(f, file)
		return err
	})
}

// Restore restores the album folder and database from a backup zip file
func Restore(c *gin.Context) {
	// debug
	fmt.Println("Restore function called")

	// 1. Receive uploaded zip file
	file, err := c.FormFile("backup")
	if err != nil {
		c.JSON(400, gin.H{"error": "Backup file required"})
		return
	}

	backupZipPath := "./tmp_restore_backup.zip"
	if err := c.SaveUploadedFile(file, backupZipPath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save uploaded backup" + err.Error()})
		return
	}

	defer os.Remove(backupZipPath)

	// 2. Unzip to temp directory
	restoreDir := "./tmp_restore"
	if err := os.RemoveAll(restoreDir); err != nil {
		c.JSON(500, gin.H{"error": "Failed to clear previous temp restore dir" + err.Error()})
		return
	}
	if err := unzipFile(backupZipPath, restoreDir); err != nil {
		c.JSON(500, gin.H{"error": "Failed to unzip backup: " + err.Error()})
		return
	}
	defer os.RemoveAll(restoreDir)

	// 3. authorize the restore operation
	backupSalt := os.Getenv("BACKUP_SALT")
	if backupSalt == "" {
		c.JSON(500, gin.H{"error": "BACKUP_SALT not configured" + err.Error()})
		return
	}

	// Check if this is a signed backup
	signaturePath := filepath.Join(restoreDir, "signature.txt")
	backupPath := filepath.Join(restoreDir, "backup.zip")

	if _, err := os.Stat(signaturePath); err == nil {
		// This is a signed backup, verify it
		signatureBytes, err := os.ReadFile(signaturePath)
		log.Println("Signature file read:", string(signatureBytes))
		if err != nil || string(signatureBytes) == "" {
			log.Println("Failed to read signature file:", err)
			c.JSON(500, gin.H{"error": "Failed to read signature file" + err.Error()})
			return
		}

		backupBytes, err := os.ReadFile(backupPath)
		if err != nil || len(backupBytes) == 0 {
			log.Println("Failed to read backup data:", err)
			c.JSON(500, gin.H{"error": "Failed to read backup data" + err.Error()})
			return
		}

		expectedSignature := generateSignature(backupBytes, backupSalt)
		if string(signatureBytes) != expectedSignature {
			c.JSON(400, gin.H{"error": "Invalid backup signature - backup may have been tampered with"})
			return
		}

		// Extract the actual backup
		actualRestoreDir := "./tmp_restore_actual"

		if err := os.RemoveAll(actualRestoreDir); err != nil {
			log.Println("Failed to clear actual restore dir:", err)
			c.JSON(500, gin.H{"error": "Failed to clear actual restore dir" + err.Error()})
			return
		}
		if err := unzipFile(backupPath, actualRestoreDir); err != nil {
			log.Println("Failed to extract verified backup:", err)
			c.JSON(500, gin.H{"error": "Failed to extract verified backup" + err.Error()})
			return
		}

		defer os.RemoveAll(actualRestoreDir) // Clean up after restore

		// 4. Restore album folder
		albumBackupDir := filepath.Join(actualRestoreDir, "album")
		albumDir := "./album"
		if err := os.RemoveAll(albumDir); err != nil {
			log.Println("Failed to clear album folder:", err)
			c.JSON(500, gin.H{"error": "Failed to clear album folder" + err.Error()})
			return
		}
		if err := copyDir(albumBackupDir, albumDir); err != nil {
			log.Println("Failed to restore album folder:", err)
			c.JSON(500, gin.H{"error": "Failed to restore album folder: " + err.Error()})
			return
		}

		// 5. Drop and recreate schema BEFORE restoring the database
		db, err := connectDB()
		if err != nil {
			log.Println("Failed to connect to database:", err)
			c.JSON(500, gin.H{"error": "Failed to connect to database: " + err.Error()})
			return
		}
		defer db.Close()
		_, err = db.Exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
		if err != nil {
			log.Println("Failed to drop/recreate schema:", err)
			c.JSON(500, gin.H{"error": "Failed to drop/recreate schema: " + err.Error()})
			return
		}

		// 6. Restore PostgreSQL database
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbName := os.Getenv("DB_NAME")
		dumpPath := filepath.Join(actualRestoreDir, "db_backup.sql")

		psqlCmd := exec.Command("psql", "-U", dbUser, "-h", dbHost, "-p", dbPort, "-d", dbName, "-f", dumpPath)
		psqlCmd.Env = append(os.Environ(), "PGPASSWORD="+dbPassword)
		output, err := psqlCmd.CombinedOutput()
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to restore database", "details": string(output)})
			return
		}

		c.JSON(200, gin.H{"message": "Restore completed successfully"})
	} else {
		// print error message on terminal
		log.Println(err)
		c.JSON(400, gin.H{"error": "Invalid backup file - please upload a signed backup file"})
		return
	}

}

// Helper: unzip a zip file to target directory
func unzipFile(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()
	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}
		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}
		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}
		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			return err
		}
		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

// Helper: copy a directory recursively
func copyDir(src, dest string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		destPath := filepath.Join(dest, rel)
		if info.IsDir() {
			return os.MkdirAll(destPath, info.Mode())
		}
		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()
		destFile, err := os.Create(destPath)
		if err != nil {
			return err
		}
		defer destFile.Close()
		_, err = io.Copy(destFile, srcFile)
		return err
	})
}
