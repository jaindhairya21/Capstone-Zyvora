import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Sends a window of recent angle readings + activity mode to the LLM
 * and returns structured predictions:
 *   - formScore: 0–100
 *   - formStatus: "good" | "warning" | "poor"
 *   - fallRisk: "low" | "medium" | "high"   (only relevant for walking)
 *   - feedback: short actionable string
 *   - detail: one-sentence explanation
 */

export function useAIPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const predict = useCallback(async (angleWindow, activityMode) => {
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

    const prompt = `You are a physiotherapy AI assistant analyzing knee joint angle sensor data in real-time.

Activity: ${activityMode}
Recent angle window (last ${angles.length} readings in degrees): [${angles.join(', ')}]
Stats: avg=${avg}°, max=${max}°, min=${min}°, variability=${variance}°, trend=${trendDir > 3 ? 'increasing' : trendDir < -3 ? 'decreasing' : 'stable'}

Based on these angles, analyze the patient's movement quality for ${activityMode}.

For WALKING specifically: also assess fall risk — sudden large drops (>20°) combined with high variability, or very asymmetric movement patterns indicate high fall risk.

For EXERCISE/THERAPY: check if the range of motion is appropriate (too limited = needs encouragement, excessive = risk of strain).

For SLEEPING: angles should be minimal and stable; large movements indicate restlessness.

Be concise and clinical. Return JSON only.`;

    const schema = {
      type: 'object',
      properties: {
        formScore: { type: 'number', description: '0-100 movement quality score' },
        formStatus: { type: 'string', enum: ['good', 'warning', 'poor'] },
        fallRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
        feedback: { type: 'string', description: 'Short actionable tip (max 8 words)' },
        detail: { type: 'string', description: 'One sentence clinical explanation' },
      },
      required: ['formScore', 'formStatus', 'fallRisk', 'feedback', 'detail'],
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema,
      });
      setPrediction(result);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  return { prediction, loading, predict };
}