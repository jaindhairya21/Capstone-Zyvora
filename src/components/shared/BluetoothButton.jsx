import React from 'react';
import { Bluetooth, BluetoothConnected, BluetoothOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function BluetoothButton({ connected, connecting, onConnect, onDisconnect, className }) {
  if (connecting) {
    return (
      <Button variant="outline" size="sm" disabled className={cn('gap-2 rounded-full', className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting…
      </Button>
    );
  }

  if (connected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onDisconnect}
        className={cn('gap-2 rounded-full border-primary/40 text-primary hover:bg-primary/5', className)}
      >
        <BluetoothConnected className="w-4 h-4" />
        Connected
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onConnect}
      className={cn('gap-2 rounded-full', className)}
    >
      <Bluetooth className="w-4 h-4" />
      Connect Sensor
    </Button>
  );
}