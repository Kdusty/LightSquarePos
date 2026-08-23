import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could log this to an error reporting service like Sentry here.
    console.error("ErrorBoundary caught a critical rendering failure:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '24px', 
          background: 'var(--surface)', 
          borderRadius: 'var(--r-md)', 
          border: '1px solid rgba(239, 68, 68, 0.4)', 
          margin: '20px', 
          color: 'var(--text)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: 'var(--red-text)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Component Crashed
          </h2>
          <p style={{ opacity: 0.8, marginBottom: '16px' }}>
            A critical rendering error occurred in this module. The rest of the application is still running.
          </p>
          <details style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '12px', 
            background: 'rgba(0,0,0,0.1)', 
            padding: '12px', 
            borderRadius: 'var(--r-sm)', 
            marginBottom: '20px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>View Error Log (For Developers)</summary>
            <div style={{ marginTop: '8px', color: 'var(--red-text)' }}>
              {this.state.error && this.state.error.toString()}
            </div>
            <div style={{ opacity: 0.7 }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
          </details>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => { this.setState({ hasError: false }); }}
            >
              Attempt Recovery
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
            >
              Hard Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
