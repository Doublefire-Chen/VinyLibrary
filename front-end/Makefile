# Makefile

.PHONY: build dev version clean install help

install:
	@if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ] || [ "package.json" -nt "node_modules" ]; then \
		echo "📦 Installing dependencies..."; \
		pnpm install; \
	else \
		echo "✅ Dependencies already installed"; \
	fi

version:
	@echo "🔧 Updating version from git tags..."
	@node scripts/version.js

build: install version
	@echo "🚀 Starting build..."
	@pnpm run build:actual

dev: install version
	@echo "🚀 Starting development server..."
	@pnpm run dev:actual

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf .next
	@rm -rf out
	@rm -f public/version.json

help:
	@echo "Available commands:"
	@echo "  make install  - Install project dependencies"
	@echo "  make build    - Install deps, update version and build for production"
	@echo "  make dev      - Install deps, update version and start development server"
	@echo "  make version  - Update version from git tags"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make help     - Show this help message"