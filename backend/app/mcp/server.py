"""
FastMCP server setup.

MCP server with streamable-http transport for AI agent tool access.
"""
import logging
import os

from mcp.server.fastmcp import FastMCP

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get MCP server port from environment
MCP_SERVER_PORT = int(os.getenv("MCP_SERVER_PORT", "8001"))
MCP_SERVER_HOST = os.getenv("MCP_SERVER_HOST", "0.0.0.0")

# Create FastMCP server instance (stateless for production scalability)
mcp = FastMCP(
    name="Todo Tools",
    instructions="MCP tools for managing user tasks via natural language",
    stateless_http=True,
)

# Import tools AFTER mcp is created to register them via decorators
# This import triggers the @mcp.tool() decorators in tools.py
from app.mcp import tools  # noqa: F401, E402

logger.info("MCP tools module loaded - tools registered via decorators")


def get_mcp_server() -> FastMCP:
    """
    Get the FastMCP server instance.

    Returns:
        FastMCP: The configured MCP server
    """
    return mcp


# ASGI app for uvicorn - use streamable_http_app() per MCP SDK
app = mcp.streamable_http_app()


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting MCP server on {MCP_SERVER_HOST}:{MCP_SERVER_PORT}")
    logger.info(f"MCP endpoint: http://localhost:{MCP_SERVER_PORT}/mcp")

    # Run with uvicorn, specifying host and port
    uvicorn.run(
        "app.mcp.server:app",
        host=MCP_SERVER_HOST,
        port=MCP_SERVER_PORT,
        reload=False,
    )
