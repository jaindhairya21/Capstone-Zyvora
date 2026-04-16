import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Square, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceDot } from 'recharts';
import AngleDisplay from '@/components/shared/AngleDisplay';

export default function LiveTracking() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(30);
  const [data, setData] = useState([]);
  const [maxAngle, setMaxAngle] = useState(0);
  const [minAngle, setMinAngle] = useState(180);
  const maxPointRef = useRef({ time: 0, angle: 0 });
  const minPointRef = useRef({ time: 0, angle: 180 });

  // Simulate sensor data
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
      const newAngle = Math.round(30 + 60 * Math.sin(Date.now() / 2000) + (Math.random() - 0.5) * 15);
      const clampedAngle = Math.max(5, Math.min(135, newAngle));
      setCurrentAngle(clampedAngle);

      setData(prev => {
        const newPoint = { time: prev.length, angle: clampedAngle };
        const updated = [...prev, newPoint].slice(-60);
        return updated;
      });

      setMaxAngle(prev => {
        if (clampedAngle > prev) {
          maxPointRef.current = { time: data.length, angle: clampedAngle };
          return clampedAngle;
        }
        return prev;
      });

      setMinAngle(prev => {
        if (clampedAngle < prev) {
          minPointRef.current = { time: data.length, angle: clampedAngle };
          return clampedAngle;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, data.length]);

  const formatTime = useCallback((s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const handleStop = () => {
    setIsRunning(false);
    // In real app, would save session
    setTimeout(() => navigate('/history'), 500);
  };

  const handleReset = () => {
    setData([]);
    setElapsed(0);
    setMaxAngle(0);
    setMinAngle(180);
    setIsRunning(true);
  };

  return (
    <div className="px-5 pt-14 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Live Session</h1>
          <p className="text-sm text-muted-foreground">Recording in progress</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-secondary">
          <span className="text-lg font-mono font-medium text-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Live Angle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center"
      >
        <AngleDisplay angle={currentAngle} size="large" label="Knee Angle" />
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Max</p>
            <p className="text-lg font-semibold text-primary">{maxAngle}°</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Min</p>
            <p className="text-lg font-semibold text-foreground">{minAngle === 180 ? '--' : `${minAngle}°`}</p>
          </div>
        </div>
      </motion.div>

      {/* Graph */}
      <div className="bg-card border border-border rounded-3xl p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Angle Over Time</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -2, style: { fontSize: 9, fill: 'hsl(var(--muted-foreground))' } }}
              />
              <YAxis
                domain={[0, 140]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                label={{ value: 'Angle (°)', angle: -90, position: 'insideLeft', offset: 30, style: { fontSize: 9, fill: 'hsl(var(--muted-foreground))' } }}
              />
              <Line
                type="monotone"
                dataKey="angle"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                animationDuration={200}
              />
              {maxPointRef.current.angle > 0 && data.find(d => d.time === maxPointRef.current.time) && (
                <ReferenceDot
                  x={maxPointRef.current.time}
                  y={maxPointRef.current.angle}
                  r={4}
                  fill="hsl(var(--primary))"
                  stroke="white"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0"
          onClick={handleReset}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <AnimatePresence mode="wait">
          <motion.div
            key={isRunning ? 'pause' : 'play'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <Button
              className="w-16 h-16 rounded-full p-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6" fill="currentColor" />
              )}
            </Button>
          </motion.div>
        </AnimatePresence>

        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0 border-destructive/30 text-destructive hover:bg-destructive/5"
          onClick={handleStop}
        >
          <Square className="w-5 h-5" fill="currentColor" />
        </Button>
      </div>
    </div>
  );
}