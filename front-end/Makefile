# Makefile

.PHONY: build dev version clean help

version:
	@echo "🔧 Updating version from git tags..."
	@node scripts/version.js

build: version
	@echo "🚀 Starting build..."
	@pnpm run build:actual

dev: version
	@echo "🚀 Starting development server..."
	@pnpm run dev:actual

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf .next
	@rm -rf out
	@rm -f public/version.json

help:
	@echo "Available commands:"
	@echo "  make build    - Update version and build for production"
	@echo "  make dev      - Update version and start development server"
	@echo "  make version  - Update version from git tags"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make help     - Show this help message"