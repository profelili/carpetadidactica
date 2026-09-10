import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          <h1 style={{ color: "#d8483f", fontSize: "24px" }}>
            ⚠️ Error en la aplicación
          </h1>
          <p style={{ color: "#5d6874", marginTop: "16px" }}>
            La aplicación encontró un error inesperado. Por favor, recarga la página.
          </p>
          {this.state.error && (
            <details style={{ marginTop: "20px" }}>
              <summary style={{ cursor: "pointer", color: "#2f6fb2" }}>
                Detalles del error
              </summary>
              <pre style={{
                background: "#f5f4ee",
                padding: "16px",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "12px",
                marginTop: "12px",
              }}>
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              background: "#123f35",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
