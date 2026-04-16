import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Home from '@/pages/Home';
import LiveTracking from '@/pages/LiveTracking';
import Progress from '@/pages/Progress';
import History from '@/pages/History';

// All tab pages are permanently mounted; visibility toggled via CSS only.
// This preserves scroll position, component state, and avoids re-fetching.
const TAB_PAGES = [
  { path: '/', Component: Home },
  { path: '/live', Component: LiveTracking },
  { path: '/progress', Component: Progress },
  { path: '/history', Component: History },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen bg-background font-inter"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-lg mx-auto pb-24">
        {TAB_PAGES.map(({ path, Component }) => (
          <div
            key={path}
            style={{ display: location.pathname === path ? 'block' : 'none' }}
            aria-hidden={location.pathname !== path}
          >
            <Component />
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}