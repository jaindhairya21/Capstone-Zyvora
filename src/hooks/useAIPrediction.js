import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Sends a window of recent angle readings to the LLM.
 * The AI auto-detects the activity from the pattern and returns:
 *   - detectedActivity: string (e.g. "walking", "knee exercise", "resting")
 *   - formScore: 0–100
 *   - formStatus: "good" | "warning" | "poor"
 *   - fallRisk: "low" | "medium" | "high"
 *   - feedback: short actionable string
 *   - detail: one-sentence explanation
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
    const avg = Math.round(angles.reduce((a, b) => a + b, 0) / angles.length);
    const max = Math.max(...angles);
    const min = Math.min(...angles);
    const variance = Math.round(angles.reduce((s, a) => s + Math.abs(a - avg), 0) / angles.length);
    const trend = angles.slice(-5);
    const trendDir = trend[trend.length - 1] - trend[0];

    const prompt = `You are a physiotherapy AI analyzing real-time knee joint angle sensor data.

Recent angle readings (degrees, sampled ~1/sec): [${angles.join(', ')}]
Stats: avg=${avg}°, max=${max}°, min=${min}°, variability=${variance}°, trend=${trendDir > 3 ? 'increasing' : trendDir < -3 ? 'decreasing' : 'stable'}

Step 1 — Identify the activity from the angle pattern:
- Walking: rhythmic oscillation between ~10–40° at regular intervals
- Knee exercise / rehab: deliberate large range movements (40–120°+), slow and controlled
- Therapy stretching: slow ramp up to high angle, hold, return
- Resting/sleeping: low angles (0–20°), minimal variability
- Unknown: does not clearly match any pattern

Step 2 — Evaluate form quality for the detected activity:
- For walking: check rhythm consistency, abnormal angles, fall risk (sudden drops >20° + high variability)
- For exercise/therapy: is ROM appropriate? Too limited (<30°) = insufficient effort. Sudden jerky movements (high variability) = injury risk.
- For resting: are there unexpected large movements suggesting discomfort or restlessness?

Respond with JSON only.`;

    const schema = {
      type: 'object',
      properties: {
        detectedActivity: { type: 'string', description: 'Short label of detected activity (e.g. "Walking", "Knee Exercise", "Resting")' },
        formScore: { type: 'number', description: '0–100 movement quality score' },
        formStatus: { type: 'string', enum: ['good', 'warning', 'poor'] },
        fallRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
        feedback: { type: 'string', description: 'Short actionable tip (max 8 words)' },
        detail: { type: 'string', description: 'One sentence clinical explanation' },
      },
      required: ['detectedActivity', 'formScore', 'formStatus', 'fallRisk', 'feedback', 'detail'],
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema,
      });
      setPrediction(result);
      return result;
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  return { prediction, loading, predict };
}