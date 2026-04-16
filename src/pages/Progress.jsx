import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '@/components/shared/StatCard';

const weeklyData = [
  { day: 'Mon', maxROM: 72, avg: 45 },
  { day: 'Tue', maxROM: 78, avg: 50 },
  { day: 'Wed', maxROM: 75, avg: 48 },
  { day: 'Thu', maxROM: 82, avg: 55 },
  { day: 'Fri', maxROM: 85, avg: 58 },
  { day: 'Sat', maxROM: 88, avg: 60 },
  { day: 'Sun', maxROM: 91, avg: 62 },
];

const monthlyData = [
  { week: 'W1', maxROM: 60, avg: 38 },
  { week: 'W2', maxROM: 72, avg: 48 },
  { week: 'W3', maxROM: 82, avg: 56 },
  { week: 'W4', maxROM: 91, avg: 62 },
];

export default function Progress() {
  const [period, setPeriod] = useState('week');
  const chartData = period === 'week' ? weeklyData : monthlyData;
  const xKey = period === 'week' ? 'day' : 'week';

  return (
    <div className="px-5 pt-14 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your recovery journey</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Best ROM" value="91" unit="°" icon={Trophy} accent />
        <StatCard label="Weekly ↑" value="+12" unit="°" icon={TrendingUp} />
        <StatCard label="Sessions" value="14" icon={Calendar} />
      </div>

      {/* Improvement Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ArrowUpRight className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Great improvement!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your range of motion improved 15% this week</p>
        </div>
      </motion.div>

      {/* Period Toggle */}
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="w-full bg-secondary rounded-xl h-10">
          <TabsTrigger value="week" className="flex-1 rounded-lg text-xs font-medium">
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="flex-1 rounded-lg text-xs font-medium">
            This Month
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Max ROM Chart */}
      <div className="bg-card border border-border rounded-3xl p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Max ROM by {period === 'week' ? 'Day' : 'Week'}</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="romGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 120]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Area
                type="monotone"
                dataKey="maxROM"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#romGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Session Angle */}
      <div className="bg-card border border-border rounded-3xl p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Average Session Angle</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Bar
                dataKey="avg"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}