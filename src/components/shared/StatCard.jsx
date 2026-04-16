import React from 'react';

export default function StatCard({ label, value, unit, icon: Icon, accent = false }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? 'bg-primary/5 border border-primary/10' : 'bg-card border border-border'}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}