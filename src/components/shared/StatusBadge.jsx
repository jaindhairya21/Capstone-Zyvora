import React from 'react';
import { Bluetooth, BatteryMedium, BatteryLow, BatteryFull, BluetoothOff } from 'lucide-react';

export default function StatusBadge({ connected, battery }) {
  const BatteryIcon = battery > 70 ? BatteryFull : battery > 30 ? BatteryMedium : BatteryLow;

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        connected
          ? 'bg-primary/10 text-primary'
          : 'bg-destructive/10 text-destructive'
      }`}>
        {connected ? (
          <Bluetooth className="w-3 h-3" />
        ) : (
          <BluetoothOff className="w-3 h-3" />
        )}
        {connected ? 'Connected' : 'Disconnected'}
      </div>
      {connected && (
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
          <BatteryIcon className="w-3.5 h-3.5" />
          {battery}%
        </div>
      )}
    </div>
  );
}