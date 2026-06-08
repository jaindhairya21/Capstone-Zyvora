import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Square, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceDot } from 'recharts';
import AngleDisplay from '@/components/shared/AngleDisplay';
import BluetoothButton from '@/components/shared/BluetoothButton';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useBluetooth } from '@/hooks/useBluetooth';

export default function LiveTracking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { connected, connecting, error: btError, angle: btAngle, battery: btBattery, connect, disconnect, onAngleRef } = useBluetooth();

  const [isRunning, setIsRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(30);
  const [data, setData] = useState([]);
  const [maxAngle, setMaxAngle] = useState(0);
  const [minAngle, setMinAngle] = useState(180);
  const maxPointRef = useRef({ time: 0, angle: 0 });
  const minPointRef = useRef({ time: 0, angle: 180 });
  const dataLenRef = useRef(0);

  // Push a new angle reading into state (shared by BLE & simulation)
  const pushAngle = useCallback((clampedAngle) => {
    setCurrentAngle(clampedAngle);
    setData(prev => {
      const newPoint = { time: prev.length, angle: clampedAngle };
      dataLenRef.current = prev.length + 1;
      return [...prev, newPoint].slice(-60);
    });
    setMaxAngle(prev => {
      if (clampedAngle > prev) {
        maxPointRef.current = { time: dataLenRef.current - 1, angle: clampedAngle };
        return clampedAngle;
      }
      return prev;
    });
    setMinAngle(prev => {
      if (clampedAngle < prev) {
        minPointRef.current = { time: dataLenRef.current - 1, angle: clampedAngle };
        return clampedAngle;
      }
      return prev;
    });
  }, []);

  // Wire BLE angle callback
  useEffect(() => {
    if (connected) {
      onAngleRef.current = (angle) => { if (isRunning) pushAngle(angle); };
    } else {
      onAngleRef.current = null;
    }
  }, [connected, isRunning, pushAngle, onAngleRef]);

  // Simulation fallback — only runs when NOT connected via BLE
  useEffect(() => {
    if (!isRunning || connected) return;
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
      const newAngle = Math.round(30 + 60 * Math.sin(Date.now() / 2000) + (Math.random() - 0.5) * 15);
      const clampedAngle = Math.max(5, Math.min(135, newAngle));
      pushAngle(clampedAngle);

    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, connected, pushAngle]);

  // BLE timer tick — elapsed still needs to count when using real sensor
  useEffect(() => {
    if (!isRunning || !connected) return;
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, connected]);

  const formatTime = useCallback((s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const handleStop = async () => {
    setIsRunning(false);

    const newSession = {
      id: `optimistic-${Date.now()}`,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      duration_seconds: elapsed,
      max_angle: maxAngle,
      min_angle: minAngle === 180 ? 0 : minAngle,
      avg_angle: data.length
        ? Math.round(data.reduce((s, d) => s + d.angle, 0) / data.length)
        : 0,
      status: 'completed',
      angle_data: data,
    };

    // Optimistic update: inject session immediately into the cache (0ms feel)
    queryClient.setQueryData(['sessions'], (old = []) => [newSession, ...old]);

    // Fire-and-forget persist in background
    base44.entities.Session.create({
      duration_seconds: newSession.duration_seconds,
      max_angle: newSession.max_angle,
      min_angle: newSession.min_angle,
      avg_angle: newSession.avg_angle,
      status: 'completed',
      angle_data: newSession.angle_data,
    }).then(() => {
      // Refresh with real server data
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    });

    navigate('/history');
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
          <p className="text-sm text-muted-foreground">
            {connected ? 'Sensor connected via Bluetooth' : 'Simulation mode'}
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-secondary">
          <span className="text-lg font-mono font-medium text-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Bluetooth connect / error */}
      <div className="flex flex-col gap-2">
        <BluetoothButton
          connected={connected}
          connecting={connecting}
          onConnect={connect}
          onDisconnect={disconnect}
          className="self-start"
        />
        {btError && (
          <p className="text-xs text-destructive bg-destructive/5 rounded-xl px-3 py-2">{btError}</p>
        )}
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