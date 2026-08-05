import { useState, useRef, useCallback } from 'react';

// Path to the converted TF.js model placed in public/model/
// (model.json + accompanying .bin weight files)
const MODEL_URL = '/model/model.json';
const WINDOW = 60; // angle readings fed to the model — match your training window

let modelPromise = null;

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import('@tensorflow/tfjs');
      // Try Layers model (Keras-converted) first; fall back to Graph model (SavedModel-converted)
      try {
        return await tf.loadLayersModel(MODEL_URL);
      } catch {
        return await tf.loadGraphModel(MODEL_URL);
      }
    })();
  }
  return modelPromise;
}

/**
 * Runs the locally-hosted TensorFlow.js model on the latest angle window
 * and returns a good/bad verdict.
 *
 * Output is mapped to a shape compatible with AIPredictionCard:
 * { formScore, formStatus, feedback, detail }
 */
export function useAIPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const predict = useCallback(async (angleWindow) => {
    if (inFlightRef.current || angleWindow.length < 5) return;
    inFlightRef.current = true;
    setLoading(true);

    try {
      const tf = await import('@tensorflow/tfjs');
      const model = await getModel();

      // Pad / truncate to the fixed window the model expects
      const angles = angleWindow.map(d => d.angle);
      const padded = [...angles];
      while (padded.length < WINDOW) padded.push(padded[padded.length - 1] ?? 0);
      const input = padded.slice(0, WINDOW);

      const output = tf.tidy(() => {
        const tensor = tf.tensor2d([input], [1, WINDOW]);
        return model.predict(tensor);
      });
      const data = await output.data();
      output.dispose();

      // Interpret model output:
      // - single sigmoid value (prob of "good")
      // - two-class softmax [probBad, probGood]
      let probGood;
      if (data.length === 1) {
        probGood = data[0];
      } else {
        probGood = data[1];
      }

      const label = probGood >= 0.5 ? 'good' : 'bad';
      const formScore = Math.round(probGood * 100);
      const formStatus = formScore >= 75 ? 'good' : formScore >= 50 ? 'warning' : 'poor';
      const feedback = label === 'good' ? 'Good form' : 'Adjust your movement';
      const detail = `Model verdict: ${label} (${formScore}%)`;

      setPrediction({
        detectedActivity: null,
        fallRisk: 'low',
        formScore,
        formStatus,
        feedback,
        detail,
      });
      return { formStatus, feedback };
    } catch (err) {
      setPrediction(null);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  return { prediction, loading, predict };
}