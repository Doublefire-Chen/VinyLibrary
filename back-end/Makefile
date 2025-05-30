# Get version information
VERSION := $(shell git describe --tags --abbrev=0 2>/dev/null || echo "development")
GIT_HASH := $(shell git rev-parse HEAD 2>/dev/null | cut -c1-8 || echo "unknown")
BUILD_TIME := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

# Build configuration
BINARY_NAME := backend
OUTPUT_DIR := ./bin
OUTPUT_PATH := $(OUTPUT_DIR)/$(BINARY_NAME)

# Build flags
LDFLAGS := -X main.Version=$(VERSION) -X main.GitHash=$(GIT_HASH) -X main.BuildTime=$(BUILD_TIME)

.PHONY: build
build:
	@echo "Building $(BINARY_NAME)..."
	@echo "  Version: $(VERSION)"
	@echo "  Git Hash: $(GIT_HASH)"
	@echo "  Build Time: $(BUILD_TIME)"
	@mkdir -p $(OUTPUT_DIR)
	go build -ldflags "$(LDFLAGS)" -o $(OUTPUT_PATH)
	@echo "✅ Built successfully: $(OUTPUT_PATH)"

.PHONY: run
run: build
	$(OUTPUT_PATH)

.PHONY: clean
clean:
	@echo "Cleaning..."
	go clean
	rm -rf $(OUTPUT_DIR)
	@echo "✅ Cleaned"

.PHONY: dev
dev: build
	@echo "Starting development server..."
	$(OUTPUT_PATH)

.PHONY: info
info:
	@echo "Build Info:"
	@echo "  Binary: $(BINARY_NAME)"
	@echo "  Output: $(OUTPUT_PATH)"
	@echo "  Version: $(VERSION)"
	@echo "  Git Hash: $(GIT_HASH)"
