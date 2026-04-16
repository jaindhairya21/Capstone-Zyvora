import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const startY = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 180]);
  const scale = useTransform(y, [0, PULL_THRESHOLD * 0.6, PULL_THRESHOLD], [0.5, 0.8, 1]);

  const handleTouchStart = useCallback((e) => {
    const scrollEl = e.currentTarget;
    if (scrollEl.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      const resistance = Math.min(delta * 0.45, PULL_THRESHOLD + 16);
      y.set(resistance);
      setTriggered(resistance >= PULL_THRESHOLD);
    }
  }, [refreshing, y]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;

    if (triggered && !refreshing) {
      setRefreshing(true);
      await animate(y, PULL_THRESHOLD * 0.6, { duration: 0.15 });
      try {
        await onRefresh();
      } finally {
        await animate(y, 0, { duration: 0.35, ease: 'easeOut' });
        setRefreshing(false);
        setTriggered(false);
      }
    } else {
      await animate(y, 0, { duration: 0.3, ease: 'easeOut' });
      setTriggered(false);
    }
  }, [triggered, refreshing, onRefresh, y]);

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ height: y }}
        className="flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ opacity, scale }} className="flex flex-col items-center gap-1">
          <motion.div style={{ rotate }}>
            <RefreshCw
              className={`w-5 h-5 transition-colors ${triggered ? 'text-primary' : 'text-muted-foreground'} ${refreshing ? 'animate-spin' : ''}`}
            />
          </motion.div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {refreshing ? 'Refreshing…' : triggered ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </motion.div>
      </motion.div>

      {/* Page content shifted down */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}