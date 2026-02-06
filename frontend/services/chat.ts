/**
 * Chat Service - Authenticated API methods for chat operations
 *
 * All methods use the authenticatedFetch wrapper to automatically:
 * - Attach JWT tokens
 * - Handle 401 errors (redirect to sign-in)
 * - Handle all HTTP errors with user-friendly messages
 * - Include proper headers
 */
import { authenticatedFetch, ApiError } from "@/lib/api-client"

export interface ToolResult {
  tool: string
  success: boolean
  result: Record<string, unknown> | null
}

export interface ChatResponse {
  conversation_id: number
  message: string
  tool_results: ToolResult[] | null
}

export interface ChatRequest {
  message: string
  conversation_id?: number | null
}

/**
 * Send a chat message to the AI agent.
 *
 * @param userId - The authenticated user's ID
 * @param request - Chat request with message and optional conversation_id
 * @returns ChatResponse with agent's response
 */
export async function sendChatMessage(
  userId: string,
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    // Agent tool execution can take 30-60s; use 120s timeout
    const response = await authenticatedFetch(
      `/api/${userId}/chat`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      2,
      120000
    )
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.userMessage)
    }
    throw new Error(
      "Unable to send message. Please check your connection and try again."
    )
  }
}
