import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import { AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import PageTransition from '@/components/layout/PageTransition';
import Home from '@/pages/Home';
import LiveTracking from '@/pages/LiveTracking';
import Progress from '@/pages/Progress';
import History from '@/pages/History';
import SessionDetail from '@/pages/SessionDetail';
import Alerts from '@/pages/Alerts';
import Profile from '@/pages/Profile';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">Loading Zyvora...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveTracking />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="/history/:id" element={<PageTransition><SessionDetail /></PageTransition>} />
        <Route path="/alerts" element={<PageTransition><Alerts /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App