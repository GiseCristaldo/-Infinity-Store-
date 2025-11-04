import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const errorMessage = this.state.error?.message || 'Error desconocido';
      const errorStack = this.state.errorInfo?.componentStack || this.state.error?.stack || '';

      return (
        <div style={{ padding: 16 }}>
          <h2>Ocurrió un error en esta sección.</h2>
          <p>Intenta recargar la página o volver atrás.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={this.handleReload} style={{ padding: '6px 12px' }}>Recargar</button>
            <button onClick={this.handleGoHome} style={{ padding: '6px 12px' }}>Ir al inicio</button>
          </div>

          {isAdminRoute && (
            <div style={{ marginTop: 16, background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <strong>Detalles técnicos (solo admin):</strong>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}><strong>Mensaje:</strong> {errorMessage}</div>
                {errorStack && (
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {errorStack}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;