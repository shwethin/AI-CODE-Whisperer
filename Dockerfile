# Multi-stage Dockerfile for Study Agent with Ollama

FROM python:3.11-slim as base

WORKDIR /app

# Copy application files
COPY server.py .
COPY core/ ./core/
COPY static/ ./static/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000')"

# Run the server
CMD ["python", "server.py"]
