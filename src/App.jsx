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
    <Routes>
      {/* Tab routes: AppLayout handles persistent rendering internally */}
      <Route path="/" element={<AppLayout />} />
      <Route path="/analyze" element={<AppLayout />} />
      <Route path="/live" element={<AppLayout />} />
      <Route path="/progress" element={<AppLayout />} />
      <Route path="/history" element={<AppLayout />} />

      {/* Detail / overlay routes with slide transition */}
      <Route path="/history/:id" element={<PageTransition><SessionDetail /></PageTransition>} />
      <Route path="/alerts" element={<PageTransition><Alerts /></PageTransition>} />
      <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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