# PostAssistant Development Makefile

.PHONY: help install dev db-migrate db-upgrade db-downgrade test lint format clean

help:
	@echo "PostAssistant Development Commands:"
	@echo ""
	@echo "  install     Install all dependencies (frontend + backend)"
	@echo "  dev         Start development environment with docker-compose"
	@echo "  db-init     Initialize database and run migrations"
	@echo "  db-migrate  Create new migration"
	@echo "  db-upgrade  Apply migrations"
	@echo "  db-downgrade  Rollback last migration"
	@echo "  test        Run tests"
	@echo "  lint        Run linters"
	@echo "  format      Format code"
	@echo "  clean       Clean temporary files"
	@echo ""

install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "✅ Dependencies installed"

dev:
	@echo "Starting development environment..."
	docker-compose up --build

dev-detach:
	@echo "Starting development environment in background..."
	docker-compose up --build -d

dev-down:
	@echo "Stopping development environment..."
	docker-compose down

db-init:
	@echo "Initializing database..."
	docker-compose exec backend alembic upgrade head

db-migrate:
	@echo "Creating new migration..."
	@read -p "Enter migration message: " msg; \
	docker-compose exec backend alembic revision --autogenerate -m "$$msg"

db-upgrade:
	@echo "Applying migrations..."
	docker-compose exec backend alembic upgrade head

db-downgrade:
	@echo "Rolling back last migration..."
	docker-compose exec backend alembic downgrade -1

db-shell:
	@echo "Opening database shell..."
	docker-compose exec postgres psql -U postassistant -d postassistant_dev

backend-shell:
	@echo "Opening backend shell..."
	docker-compose exec backend bash

test:
	@echo "Running tests..."
	docker-compose exec backend pytest

lint:
	@echo "Running linters..."
	@echo "Backend:"
	docker-compose exec backend black --check .
	docker-compose exec backend isort --check-only .
	docker-compose exec backend flake8 .
	@echo "Frontend:"
	cd frontend && npm run lint

format:
	@echo "Formatting code..."
	@echo "Backend:"
	docker-compose exec backend black .
	docker-compose exec backend isort .
	@echo "Frontend:"
	cd frontend && npm run format

clean:
	@echo "Cleaning temporary files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Clean completed"

logs:
	@echo "Showing logs..."
	docker-compose logs -f

logs-backend:
	@echo "Showing backend logs..."
	docker-compose logs -f backend

logs-frontend:
	@echo "Showing frontend logs..."
	docker-compose logs -f frontend

status:
	@echo "Container status:"
	docker-compose ps

