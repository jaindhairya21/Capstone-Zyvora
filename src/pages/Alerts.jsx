import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import PullToRefresh from '@/components/shared/PullToRefresh';

const typeConfig = {
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/40' },
  success: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900/40' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5', border: 'border-destructive/10' },
};

const demoAlerts = [
  { id: 1, type: 'success', title: 'Progress improving', message: 'Your range of motion improved by 8° this week. Keep up the great work!', created_date: new Date().toISOString() },
  { id: 2, type: 'warning', title: 'Movement too fast', message: 'Slow down your knee extension during exercises. Gentle movements lead to better recovery.', created_date: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, type: 'info', title: 'Session incomplete', message: "Yesterday's session was shorter than your goal. Try to complete at least 15 minutes.", created_date: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, type: 'warning', title: 'Sensor placement', message: "The sensor may not be positioned correctly. Make sure it's firmly attached above your knee.", created_date: new Date(Date.now() - 259200000).toISOString() },
  { id: 5, type: 'success', title: 'Goal reached!', message: 'You reached 90° flexion today — a new personal best!', created_date: new Date(Date.now() - 345600000).toISOString() },
];

export default function Alerts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 20),
    initialData: [],
  });

  const displayAlerts = alerts.length > 0 ? alerts : demoAlerts;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        className="px-5 space-y-5 pb-8"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 3rem))' }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Alerts & Feedback</h1>
            <p className="text-xs text-muted-foreground">{displayAlerts.length} notifications</p>
          </div>
        </div>

        <div className="space-y-3">
          {displayAlerts.map((alert, i) => {
            const config = typeConfig[alert.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${config.bg} border ${config.border} rounded-2xl p-4`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {format(new Date(alert.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PullToRefresh>
  );
}