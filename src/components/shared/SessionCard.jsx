import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight, Clock, Target } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function SessionCard({ session }) {
  const durationMin = Math.floor((session.duration_seconds || 0) / 60);
  const durationSec = (session.duration_seconds || 0) % 60;

  return (
    <Link to={`/history/${session.id}`} className="block">
      <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 transition-all duration-200 active:scale-[0.98]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {format(new Date(session.created_date), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(session.created_date), 'h:mm a')}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {durationMin}m {durationSec}s
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Target className="w-3 h-3" />
                {session.max_angle}°
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.angle_data && session.angle_data.length > 0 && (
              <div className="w-16 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={session.angle_data.slice(0, 20)}>
                    <Line
                      type="monotone"
                      dataKey="angle"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </Link>
  );
}