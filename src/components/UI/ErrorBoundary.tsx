import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught render error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 99999, color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>
          <AlertTriangle color="#ff3366" size={64} style={{ marginBottom: 20 }} />
          <h1 style={{ color: '#ff3366', margin: 0 }}>Render Exception Detected</h1>
          <p style={{ maxWidth: 600, textAlign: 'center', color: '#ccc', margin: '20px 0' }}>{this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: 'rgba(255, 51, 102, 0.2)', border: '1px solid #ff3366', color: '#ff3366', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reboot Simulation Kernel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
