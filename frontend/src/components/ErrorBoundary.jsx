import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h2>Ocurrió un error en esta sección.</h2>
          <p>Intenta recargar la página o volver atrás.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;