import { useState, useRef, useCallback } from 'react';
import { MODEL_API_URL } from '@/lib/modelConfig';

/**
 * Sends a window of recent angle readings to your hosted pickle-model API
 * and returns the model's good/bad verdict.
 *
 * Expected API contract (your Python server must implement this):
 *   POST { MODEL_API_URL }
 *   body:    { "angles": [number, ...] }   // last ~60 angle readings
 *   returns: {
 *     label:      "good" | "bad",
 *     formScore:  number (0–100),
 *     formStatus: "good" | "warning" | "poor",
 *     feedback:   string,   // short tip
 *     detail:     string    // one-line explanation
 *   }
 */
export function useAIPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const predict = useCallback(async (angleWindow) => {
    if (inFlightRef.current || angleWindow.length < 5) return;
    inFlightRef.current = true;
    setLoading(true);

    const angles = angleWindow.map(d => d.angle);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(MODEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angles }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Model API ${res.status}`);
      const result = await res.json();

      setPrediction({
        detectedActivity: null,
        fallRisk: 'low',
        formScore: result.formScore ?? (result.label === 'good' ? 85 : 40),
        formStatus: result.formStatus ?? (result.label === 'good' ? 'good' : 'poor'),
        feedback: result.feedback ?? (result.label === 'good' ? 'Good form' : 'Adjust your movement'),
        detail: result.detail ?? `Model verdict: ${result.label}`,
      });
    } catch (err) {
      setPrediction(null);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  return { prediction, loading, predict };
}