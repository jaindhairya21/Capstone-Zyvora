import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SessionCard from '@/components/shared/SessionCard';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { Skeleton } from '@/components/ui/skeleton';

export default function History() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-created_date', 50),
    initialData: [],
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sessions'] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-5 pt-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] space-y-5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Session History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sessions.length} sessions recorded</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl">🦵</span>
              </div>
              <p className="text-sm font-medium text-foreground">No sessions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start a session to begin tracking</p>
            </motion.div>
          ) : (
            sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <SessionCard session={session} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}