FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements-full.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-full.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p models storage

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy models if they exist locally (optional)
RUN mkdir -p ./models

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=10)"

# Run the application
ENTRYPOINT ["docker-entrypoint.sh"]