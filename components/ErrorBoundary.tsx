import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-2xl w-full glass-effect rounded-3xl p-8 border-2 border-red-500/50 shadow-2xl animate-slide-in-up">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-wiggle">💥</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2 animate-slide-in-up">
                Oops! Something Went Wrong
              </h1>
              <p className="text-slate-300 text-lg animate-slide-in-up stagger-1">
                The app encountered an unexpected error. Don't worry, your progress might be saved.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 rounded-xl p-4 mb-6">
                <p className="text-sm font-mono text-red-300 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-slate-400 mt-2">
                    <summary className="cursor-pointer hover:text-slate-300">
                      Show Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="primary-btn hover-lift ripple"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="secondary-btn hover-lift"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-400">
              <p>
                If this problem persists, try clearing your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
