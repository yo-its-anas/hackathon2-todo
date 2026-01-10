/**
 * Landing Page
 *
 * Entry point for new users with clear navigation to sign-up and sign-in.
 */

export default function Home() {
  return (
    <main className="container">
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
          paddingTop: "var(--spacing-2xl)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-size-3xl)",
            fontWeight: "700",
            marginBottom: "var(--spacing-md)",
            color: "var(--color-primary)",
          }}
        >
          Welcome to Todo App
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-lg)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--spacing-2xl)",
            lineHeight: "1.6",
          }}
        >
          A simple, secure task management application. Organize your daily tasks,
          track your progress, and stay productive.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
            alignItems: "center",
          }}
        >
          <a
            href="/auth/signup"
            style={{
              display: "inline-block",
              backgroundColor: "var(--color-primary)",
              color: "white",
              padding: "var(--spacing-md) var(--spacing-xl)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "600",
              textDecoration: "none",
              minHeight: "var(--touch-target-min)",
              minWidth: "200px",
              textAlign: "center",
              lineHeight: "var(--touch-target-min)",
            }}
          >
            Get Started
          </a>

          <p style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <a
              href="/auth/signin"
              style={{
                color: "var(--color-primary)",
                fontWeight: "600",
              }}
            >
              Sign In
            </a>
          </p>
        </div>

        <div
          style={{
            marginTop: "var(--spacing-2xl)",
            paddingTop: "var(--spacing-2xl)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "600",
              marginBottom: "var(--spacing-lg)",
            }}
          >
            Features
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "grid",
              gap: "var(--spacing-md)",
            }}
          >
            <li style={{ fontSize: "var(--font-size-base)" }}>
              ✅ Create and manage tasks
            </li>
            <li style={{ fontSize: "var(--font-size-base)" }}>
              🔒 Secure authentication
            </li>
            <li style={{ fontSize: "var(--font-size-base)" }}>
              📱 Mobile-friendly interface
            </li>
            <li style={{ fontSize: "var(--font-size-base)" }}>
              ☁️ Cloud-based storage
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
