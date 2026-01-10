/**
 * ErrorMessage Component
 *
 * Reusable error display with optional retry functionality.
 * Provides clear, user-friendly error messaging.
 */

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  type?: "error" | "warning" | "info"
}

export default function ErrorMessage({
  message,
  onRetry,
  type = "error",
}: ErrorMessageProps) {
  const colors = {
    error: {
      bg: "#ffebee",
      border: "var(--color-error)",
      text: "#c62828",
    },
    warning: {
      bg: "#fff3e0",
      border: "#f57c00",
      text: "#e65100",
    },
    info: {
      bg: "#e3f2fd",
      border: "#1976d2",
      text: "#0d47a1",
    },
  }

  const colorScheme = colors[type]

  return (
    <div
      className="error-message"
      style={{
        backgroundColor: colorScheme.bg,
        border: `2px solid ${colorScheme.border}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-md)",
        marginBottom: "var(--spacing-md)",
      }}
      role="alert"
      aria-live="assertive"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--spacing-sm)",
          marginBottom: onRetry ? "var(--spacing-sm)" : "0",
        }}
      >
        <span
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "bold",
          }}
          aria-hidden="true"
        >
          {type === "error" ? "⚠️" : type === "warning" ? "⚡" : "ℹ️"}
        </span>
        <p
          style={{
            flex: 1,
            color: colorScheme.text,
            fontSize: "var(--font-size-base)",
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: colorScheme.border,
            color: "white",
            padding: "var(--spacing-sm) var(--spacing-md)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "600",
            marginTop: "var(--spacing-sm)",
            minHeight: "var(--touch-target-min)",
            minWidth: "var(--touch-target-min)",
          }}
        >
          Try Again
        </button>
      )}
    </div>
  )
}
