/**
 * LoadingSpinner Component
 *
 * Reusable loading indicator for async operations.
 * Provides visual feedback during data fetching or form submissions.
 */

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  text?: string
}

export default function LoadingSpinner({
  size = "medium",
  text = "Loading...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  }

  return (
    <div
      className="loading-spinner"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-lg)",
      }}
    >
      <div
        className="loading"
        style={{
          width: size === "small" ? "16px" : size === "medium" ? "32px" : "48px",
          height:
            size === "small" ? "16px" : size === "medium" ? "32px" : "48px",
          border: "3px solid var(--color-border)",
          borderTop: "3px solid var(--color-primary)",
          borderRadius: "50%",
        }}
        role="status"
        aria-label={text}
      />
      {text && (
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-base)",
          }}
        >
          {text}
        </p>
      )}
    </div>
  )
}
