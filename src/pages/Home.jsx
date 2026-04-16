import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Bell, Timer, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AngleDisplay from '@/components/shared/AngleDisplay';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';

export default function Home() {
  const [currentAngle, setCurrentAngle] = useState(42);
  const [connected] = useState(true);
  const [battery] = useState(78);

  // Simulate gentle angle variation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAngle(prev => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.max(0, Math.min(140, Math.round(prev + delta)));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-5 pt-14 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Zyvora</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Good morning</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/alerts">
            <div className="relative p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
          </Link>
          <Link to="/profile">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Device Status */}
      <StatusBadge connected={connected} battery={battery} />

      {/* Live Angle Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-card border border-border rounded-3xl p-8 flex flex-col items-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Subtle animated ring */}
        <div className="relative mb-2 mt-2">
          <div className="absolute inset-0 m-auto w-36 h-36 rounded-full border-2 border-primary/10 animate-pulse-ring" />
          <div className="relative z-10">
            <AngleDisplay angle={currentAngle} size="large" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Current Knee Angle</p>
      </motion.div>

      {/* Start Session Button */}
      <Link to="/live" className="block">
        <Button className="w-full h-14 rounded-2xl text-base font-medium gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Play className="w-5 h-5" fill="currentColor" />
          Start Session
        </Button>
      </Link>

      {/* Today's Summary */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Today's Summary</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Duration" value="12" unit="min" icon={Timer} />
          <StatCard label="Max Bend" value="87" unit="°" icon={Target} accent />
          <StatCard label="Avg Angle" value="54" unit="°" icon={BarChart3} />
        </div>
      </div>
    </div>
  );
}