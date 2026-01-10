/**
 * EmptyState Component
 *
 * Reusable empty state display with optional call-to-action.
 * Provides friendly messaging when no data is available.
 */

interface EmptyStateProps {
  icon?: string
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon = "📭",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="empty-state"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-2xl)",
        textAlign: "center",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "2px dashed var(--color-border)",
      }}
    >
      <div
        style={{
          fontSize: "4rem",
          marginBottom: "var(--spacing-md)",
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h2
        style={{
          fontSize: "var(--font-size-2xl)",
          fontWeight: "600",
          color: "var(--color-text)",
          marginBottom: "var(--spacing-sm)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-text-secondary)",
          maxWidth: "400px",
          marginBottom: actionLabel ? "var(--spacing-lg)" : "0",
        }}
      >
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-base)",
            fontWeight: "600",
            minHeight: "var(--touch-target-min)",
            minWidth: "var(--touch-target-min)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
