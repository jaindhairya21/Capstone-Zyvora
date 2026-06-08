import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Web Bluetooth hook for Arduino BLE sensor integration.
 *
 * Expected Arduino setup:
 *   - Service UUID:      "12345678-1234-5678-1234-56789abcdef0"
 *   - Characteristic:   "12345678-1234-5678-1234-56789abcdef1"
 *   - Arduino sends a UTF-8 string like "87.3\n" (the angle in degrees)
 *     or a JSON string like {"angle":87.3} — both are handled.
 *
 * Compatible with any BLE device that streams angle values on the
 * characteristic above. You can change the UUIDs to match your firmware.
 */

const SERVICE_UUID      = '12345678-1234-5678-1234-56789abcdef0';
const CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1';

export function useBluetooth() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [angle, setAngle] = useState(null);
  const [battery, setBattery] = useState(null);

  const deviceRef       = useRef(null);
  const characteristicRef = useRef(null);
  const onAngleRef      = useRef(null); // external live callback

  // Parse incoming BLE notification
  const handleNotification = useCallback((event) => {
    const value = event.target.value;
    const text = new TextDecoder().decode(value).trim();
    let parsed = null;

    try {
      const json = JSON.parse(text);
      if (json.angle !== undefined) {
        parsed = parseFloat(json.angle);
        if (json.battery !== undefined) setBattery(Math.round(parseFloat(json.battery)));
      }
    } catch {
      parsed = parseFloat(text);
    }

    if (!isNaN(parsed)) {
      const clamped = Math.max(0, Math.min(180, Math.round(parsed * 10) / 10));
      setAngle(clamped);
      if (onAngleRef.current) onAngleRef.current(clamped);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth is not supported on this browser. Use Chrome on Android/desktop.');
      return;
    }

    setError(null);
    setConnecting(true);

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [SERVICE_UUID],
      });

      deviceRef.current = device;

      device.addEventListener('gattserverdisconnected', () => {
        setConnected(false);
        setAngle(null);
        characteristicRef.current = null;
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      characteristicRef.current = characteristic;
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleNotification);

      setConnected(true);
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        // NotFoundError = user cancelled the picker — not a real error
        setError(err.message || 'Bluetooth connection failed.');
      }
    } finally {
      setConnecting(false);
    }
  }, [handleNotification]);

  const disconnect = useCallback(async () => {
    if (characteristicRef.current) {
      characteristicRef.current.removeEventListener('characteristicvaluechanged', handleNotification);
    }
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setConnected(false);
    setAngle(null);
    deviceRef.current = null;
    characteristicRef.current = null;
  }, [handleNotification]);

  // Cleanup on unmount
  useEffect(() => () => { disconnect(); }, []);

  return {
    connected,
    connecting,
    error,
    angle,        // latest angle from BLE (null if not connected)
    battery,      // battery % if reported by firmware
    connect,
    disconnect,
    onAngleRef,   // assign a callback: onAngleRef.current = (angle) => { ... }
  };
}