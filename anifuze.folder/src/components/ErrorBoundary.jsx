import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  goHome = () => {
    window.location.assign('/');
  };

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B17] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">AniFuze Encountered an Issue</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            An unexpected error occurred while rendering the page component.
          </p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer" onClick={this.retry}>
              Try Again
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer" onClick={this.goHome}>
              Go Home
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
