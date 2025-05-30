package main

import (
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

// Build-time variables that will be set during compilation
var (
	BuildTime = "unknown"
	Version   = "development"
	GitHash   = "unknown"
)

// VersionInfo represents the version information structure
type VersionInfo struct {
	Version   string `json:"version"`
	BuildTime string `json:"buildTime"`
	GitHash   string `json:"gitHash"`
}

// GetVersion returns version information with build-time data
func GetVersion(c *gin.Context) {
	versionInfo := VersionInfo{
		Version:   Version,
		BuildTime: BuildTime,
		GitHash:   GitHash,
	}

	c.JSON(http.StatusOK, versionInfo)
}

// GetVersionDynamic dynamically queries git for current version info (alternative approach)
func GetVersionDynamic(c *gin.Context) {
	versionInfo := VersionInfo{
		Version:   "development",
		BuildTime: BuildTime, // Still use build-time for when binary was compiled
		GitHash:   "unknown",
	}

	// Try to get git tag version
	if cmd := exec.Command("git", "describe", "--tags", "--abbrev=0"); cmd != nil {
		if output, err := cmd.Output(); err == nil {
			versionInfo.Version = strings.TrimSpace(string(output))
		}
	}

	// Try to get git commit hash
	if cmd := exec.Command("git", "rev-parse", "HEAD"); cmd != nil {
		if output, err := cmd.Output(); err == nil {
			fullHash := strings.TrimSpace(string(output))
			if len(fullHash) >= 8 {
				versionInfo.GitHash = fullHash[:8]
			}
		}
	}

	c.JSON(http.StatusOK, versionInfo)
}

// GetVersionFromFile reads version information from the build-generated file
// This can be used if you want to read backend version from a separate file
func GetVersionFromFile(c *gin.Context) {
	// Default values using build-time variables
	versionInfo := VersionInfo{
		Version:   Version,
		BuildTime: BuildTime,
		GitHash:   GitHash,
	}

	// Try to read a backend-specific version file if it exists
	if data, err := os.ReadFile("backend-version.json"); err == nil {
		if err := json.Unmarshal(data, &versionInfo); err != nil {
			// If unmarshal fails, keep the build-time values above
		}
	}

	c.JSON(http.StatusOK, versionInfo)
}
