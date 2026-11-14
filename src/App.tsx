import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HostDashboard } from './pages/HostDashboard';
import { GuestSprayPad } from './pages/GuestSprayPad';
import { ProjectorWall } from './pages/ProjectorWall';
import { PollarWalletProvider } from './services/pollar';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4">
            🍾
          </div>
          <h1 className="text-xl font-black font-display text-white mb-2">
            p-zeh Owambe
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mb-6">
            Something went wrong loading this screen. Click below to refresh your session.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="px-6 py-3 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30"
          >
            Refresh & Reset App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <PollarWalletProvider>
        <Router>
          <div className="min-h-screen bg-obsidian-950 text-white flex flex-col font-sans">
            <Routes>
              {/* Host FinTech App */}
              <Route path="/" element={<HostDashboard />} />
              <Route path="/host" element={<HostDashboard />} />

              {/* Guest Mobile Spray Pad */}
              <Route path="/spray/:id" element={<GuestSprayPad />} />
              <Route path="/s/:id" element={<GuestSprayPad />} />

              {/* Venue Projector Live Wall */}
              <Route path="/wall/:id" element={<ProjectorWall />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </PollarWalletProvider>
    </ErrorBoundary>
  );
};

export default App;
