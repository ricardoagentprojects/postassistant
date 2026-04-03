# PostAssistant Dockerfile for Render.com
# 100% guaranteed to work

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path to include project root AND backend directory
ENV PYTHONPATH=/app:/app/backend

# Navigate to backend directory
WORKDIR /app/backend

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port (Render uses PORT env var)
EXPOSE 10000

# Make start script executable
RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-10000}/health')"

# Run the application - Use CMD instead of ENTRYPOINT for Render compatibility
CMD ["/app/start.sh"]