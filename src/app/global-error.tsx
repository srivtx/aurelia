"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F3",
          color: "#2d2320",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#9c8f85" }}>
          Something smudged
        </p>
        <h1 style={{ fontSize: 26, marginTop: 8 }}>A little makeup mishap</h1>
        <p style={{ fontSize: 14, color: "#5a4e46", marginTop: 12, maxWidth: 300, lineHeight: "21px" }}>
          An unexpected error occurred. Blot, reset, try again — it usually works.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 32,
            height: 48,
            padding: "0 28px",
            borderRadius: 999,
            background: "#A84A62",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
          }}
        >
          Try again
        </button>
        {/* keep the error digest visible for debugging */}
        <script
          dangerouslySetInnerHTML={{
            __html: `console.error(${JSON.stringify(error?.digest ?? error?.message ?? "unknown")})`,
          }}
        />
      </body>
    </html>
  );
}
