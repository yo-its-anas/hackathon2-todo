# Production Dockerfile for FastAPI + MCP Server on Hugging Face Spaces
# Runs both services in a single container using shared virtual environment

# =============================================================================
# Build Stage
# =============================================================================
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Production Stage
# =============================================================================
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=appuser:appuser ./app ./app

# Copy entrypoint script
COPY --chown=appuser:appuser ./start.sh ./start.sh
RUN chmod +x ./start.sh

# Switch to non-root user
USER appuser

# =============================================================================
# Environment Configuration
# =============================================================================

# HF Spaces injects PORT; default to 7860 (HF standard)
ENV PORT=7860

# MCP server runs internally on 8001
ENV MCP_SERVER_PORT=8001
ENV MCP_SERVER_HOST=0.0.0.0

# Python settings
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Disable SQL echo in production
ENV SQL_ECHO=false

# =============================================================================
# Port Exposure
# =============================================================================
# Primary port (FastAPI) - exposed to HF Spaces
EXPOSE 7860

# MCP server port - internal only (localhost access)
EXPOSE 8001

# =============================================================================
# Health Check
# =============================================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

# =============================================================================
# Entrypoint
# =============================================================================
# Start both FastAPI and MCP server via entrypoint script
CMD ["./start.sh"]
