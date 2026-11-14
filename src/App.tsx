import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HostDashboard } from './pages/HostDashboard';
import { Onboarding } from './pages/Onboarding';
import { HostBankSettlement } from './pages/HostBankSettlement';
import { HostParties } from './pages/HostParties';
import { HostQrCode } from './pages/HostQrCode';
import { GuestSprayPad } from './pages/GuestSprayPad';
import { ProjectorWall } from './pages/ProjectorWall';
import { SplitScreenDemo } from './pages/SplitScreenDemo';
import { MobileDemoStudio } from './pages/MobileDemoStudio';
import { PollarWalletProvider } from './services/pollar';
import { hasCompletedOnboarding } from './services/storage';

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
              window.location.href = '/onboarding';
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

const HomeRootRedirect: React.FC = () => {
  if (!hasCompletedOnboarding()) {
    return <Navigate to="/onboarding" replace />;
  }
  return <HostDashboard />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <PollarWalletProvider>
        <Router>
          <div className="min-h-screen bg-obsidian-950 text-white flex flex-col font-sans">
            <Routes>
              {/* Root with automatic Onboarding check */}
              <Route path="/" element={<HomeRootRedirect />} />

              {/* Host First-Time Onboarding & PIN Setup */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Host FinTech Dashboard */}
              <Route path="/host" element={<HostDashboard />} />

              {/* Dedicated Bank Settlement Vault */}
              <Route path="/bank" element={<HostBankSettlement />} />
              <Route path="/host/bank" element={<HostBankSettlement />} />

              {/* Dedicated Owambe Parties Manager */}
              <Route path="/parties" element={<HostParties />} />
              <Route path="/host/parties" element={<HostParties />} />

              {/* Dedicated Table QR Tent Card */}
              <Route path="/qr" element={<HostQrCode />} />
              <Route path="/host/qr" element={<HostQrCode />} />

              {/* Guest Mobile Spray Pad */}
              <Route path="/spray/:id" element={<GuestSprayPad />} />
              <Route path="/s/:id" element={<GuestSprayPad />} />

              {/* Venue Projector Live Wall */}
              <Route path="/wall/:id" element={<ProjectorWall />} />

              {/* 90-Second Demo Split Screen Studio */}
              <Route path="/demo" element={<SplitScreenDemo />} />

              {/* 4-Minute Full Mobile Demo Video Studio */}
              <Route path="/demo-mobile" element={<MobileDemoStudio />} />
              <Route path="/video" element={<MobileDemoStudio />} />

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
