import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Timer, Target, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => base44.entities.Session.filter({ id }),
  });

  const session = sessions[0];

  if (isLoading) {
    return (
      <div className="px-5 pt-14 space-y-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-5 pt-14 text-center">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  const durationMin = Math.floor((session.duration_seconds || 0) / 60);
  const durationSec = (session.duration_seconds || 0) % 60;

  return (
    <div className="px-5 pt-14 space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {format(new Date(session.created_date), 'MMM d, yyyy')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {format(new Date(session.created_date), 'h:mm a')} · {session.status}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Duration" value={`${durationMin}m ${durationSec}s`} icon={Timer} />
        <StatCard label="Max Angle" value={session.max_angle} unit="°" icon={Target} accent />
        <StatCard label="Min Angle" value={session.min_angle || '--'} unit="°" icon={TrendingDown} />
        <StatCard label="Avg Angle" value={session.avg_angle || '--'} unit="°" icon={BarChart3} />
      </div>

      {/* Graph */}
      {session.angle_data && session.angle_data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Session Graph</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={session.angle_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <ReferenceLine y={session.max_angle} stroke="hsl(var(--primary))" strokeDasharray="4 4" opacity={0.4} />
                <Line
                  type="monotone"
                  dataKey="angle"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {session.notes && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Notes</p>
          <p className="text-sm text-foreground selectable">{session.notes}</p>
        </div>
      )}
    </div>
  );
}