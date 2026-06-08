import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle2, XCircle, Loader2, ShieldAlert } from 'lucide-react';

const statusConfig = {
  good:    { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', label: 'Good Form' },
  warning: { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-200 dark:border-amber-800',   label: 'Needs Attention' },
  poor:    { icon: XCircle,       color: 'text-destructive', bg: 'bg-destructive/5',                    border: 'border-destructive/20',                    label: 'Poor Form' },
};

const fallRiskConfig = {
  low:    { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Low Fall Risk' },
  medium: { color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30',   label: 'Medium Fall Risk' },
  high:   { color: 'text-red-600',    bg: 'bg-red-100 dark:bg-red-900/30',       label: 'HIGH FALL RISK' },
};

export default function AIPredictionCard({ prediction, loading, activityMode }) {
  const cfg = prediction ? (statusConfig[prediction.formStatus] || statusConfig.good) : null;
  const fallCfg = prediction ? (fallRiskConfig[prediction.fallRisk] || fallRiskConfig.low) : null;

  return (
    <div className="bg-card border border-border rounded-3xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Analysis</span>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
      </div>

      <AnimatePresence mode="wait">
        {!prediction && !loading && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground text-center py-2"
          >
            Collecting data… analysis starts after 5 readings.
          </motion.p>
        )}

        {prediction && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Form status + score */}
            <div className={`flex items-center justify-between rounded-2xl px-3 py-2.5 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-2">
                <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <span className={`text-lg font-bold tabular-nums ${cfg.color}`}>
                {prediction.formScore}<span className="text-xs font-normal">/100</span>
              </span>
            </div>

            {/* Fall risk — always show for walking, show only if medium/high otherwise */}
            {(activityMode === 'walking' || prediction.fallRisk !== 'low') && (
              <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${fallCfg.bg}`}>
                <ShieldAlert className={`w-4 h-4 ${fallCfg.color} flex-shrink-0`} />
                <span className={`text-sm font-medium ${fallCfg.color}`}>{fallCfg.label}</span>
              </div>
            )}

            {/* Feedback */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{prediction.feedback}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{prediction.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}