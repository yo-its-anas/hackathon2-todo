#!/bin/bash
# Entrypoint script for running FastAPI and MCP server in same container
# Used by Hugging Face Spaces Docker deployment

set -e

# Default ports
API_PORT="${PORT:-7860}"
MCP_PORT="${MCP_SERVER_PORT:-8001}"

echo "Starting Todo Backend Services..."
echo "  - FastAPI API: port $API_PORT"
echo "  - MCP Server:  port $MCP_PORT (internal)"

# Start MCP server in background
echo "Starting MCP server..."
python -m app.mcp.server &
MCP_PID=$!

# Give MCP server time to start
sleep 2

# Check if MCP server started successfully
if ! kill -0 $MCP_PID 2>/dev/null; then
    echo "ERROR: MCP server failed to start"
    exit 1
fi
echo "MCP server started (PID: $MCP_PID)"

# Start FastAPI server in foreground
echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$API_PORT"
