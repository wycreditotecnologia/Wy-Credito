
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ color: "#dc2626" }}>Error Global</h1>
          <p>Ha ocurrido un error inesperado en la aplicación.</p>
          {error.message && (
            <pre style={{ 
              background: "#f3f4f6", 
              padding: "10px", 
              borderRadius: "4px",
              overflow: "auto" 
            }}>
              {error.message}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
