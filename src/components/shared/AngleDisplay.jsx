import React from 'react';
import { motion } from 'framer-motion';

export default function AngleDisplay({ angle, size = 'large', label }) {
  const sizeClasses = {
    large: 'text-7xl',
    medium: 'text-5xl',
    small: 'text-3xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-1">
        <motion.span
          key={angle}
          initial={{ opacity: 0.7, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${sizeClasses[size]} font-light tracking-tight text-foreground tabular-nums`}
        >
          {angle}
        </motion.span>
        <span className={`${size === 'large' ? 'text-2xl' : 'text-lg'} font-light text-muted-foreground`}>
          °
        </span>
      </div>
    </div>
  );
}