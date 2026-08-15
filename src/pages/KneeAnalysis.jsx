import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FIELDS = [
  { key: 'left_knee_flex_ext_apdm', label: 'Left Knee Flex/Ext (APDM)' },
  { key: 'right_knee_flex_ext_apdm', label: 'Right Knee Flex/Ext (APDM)' },
  { key: 'left_knee_abduction_apdm', label: 'Left Knee Abduction (APDM)' },
  { key: 'right_knee_abduction_apdm', label: 'Right Knee Abduction (APDM)' },
];

const API_URL = 'https://timing-hyperlink-prewashed.ngrok-free.app/predict';

export default function KneeAnalysis() {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, v) =>
    setValues(prev => ({ ...prev, [key]: v === '' ? '' : Number(v) }));

  const valid = FIELDS.every(f => values[f.key] !== '' && values[f.key] !== undefined && !Number.isNaN(values[f.key]));

  const handleAnalyze = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          left_knee_flex_ext_apdm: values.left_knee_flex_ext_apdm,
          right_knee_flex_ext_apdm: values.right_knee_flex_ext_apdm,
          left_knee_abduction_apdm: values.left_knee_abduction_apdm,
          right_knee_abduction_apdm: values.right_knee_abduction_apdm,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isHigher = result?.prediction === 1;

  return (
    <div className="px-5 pt-14 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Knee Movement Analysis</h1>
        <p className="text-sm text-muted-foreground">Enter APDM knee metrics to evaluate deviation</p>
      </div>

      <div className="space-y-3">
        {FIELDS.map(f => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key} className="text-xs font-medium text-muted-foreground">
              {f.label}
            </Label>
            <Input
              id={f.key}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={values[f.key] ?? ''}
              onChange={e => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button
        className="w-full h-12 rounded-2xl gap-2"
        disabled={!valid || loading}
        onClick={handleAnalyze}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
        {loading ? 'Analyzing…' : 'Analyze Knee Movement'}
      </Button>

      {error && (
        <p className="text-sm text-destructive bg-destructive/5 rounded-xl px-3 py-2">{error}</p>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-5 border ${
            isHigher
              ? 'bg-destructive/5 border-destructive/30'
              : 'bg-primary/5 border-primary/30'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium uppercase tracking-wider ${
              isHigher ? 'text-destructive' : 'text-primary'
            }`}>
              {isHigher ? 'Higher knee-angle deviation' : 'Lower knee-angle deviation'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isHigher ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}>
              {result.label ?? (isHigher ? 'High' : 'Low')}
            </span>
          </div>

          <p className={`text-lg font-semibold ${
            isHigher ? 'text-destructive' : 'text-primary'
          }`}>
            {isHigher ? 'Higher knee-angle deviation' : 'Lower knee-angle deviation'}
          </p>

          {typeof result.higher_deviation_probability === 'number' && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Higher Deviation Probability</span>
                <span className="text-xs font-semibold text-foreground">
                  {(result.higher_deviation_probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${isHigher ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, result.higher_deviation_probability * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-lg bg-secondary">Prediction: {result.prediction}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}