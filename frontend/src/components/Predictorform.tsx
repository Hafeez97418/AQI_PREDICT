import React, { useState } from "react";
import api from "./axios";

interface PredictionResponse {
  Tomorrow_AQI: number;
  message: string;
}

interface PredictorFormProps {
  onResult: (predictedAqi: number) => void;
}

const PredictorForm: React.FC<PredictorFormProps> = ({ onResult }) => {
  const [city, setCity] = useState("");
  const [currentAqi, setCurrentAqi] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !currentAqi) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<PredictionResponse>("/predict", {
        city: city.trim(),
        current_aqi: Number(currentAqi),
      });
      console.log("Prediction response:", data);
      onResult(data.Tomorrow_AQI);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Prediction failed. Please try again."
      );
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-teal-400">
          AQI Predictor
        </h2>
        <p className="mt-1 text-2xl font-bold text-slate-100">
          Forecast Air Quality
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Enter a city and current AQI to generate a prediction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.currentTarget.value)}
            placeholder="e.g. Bangalore"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Current AQI
          </label>
          <input
            type="number"
            value={currentAqi}
            onChange={(e) => setCurrentAqi(e.currentTarget.value)}
            placeholder="e.g. 82"
            min={0}
            max={500}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !city.trim() || !currentAqi}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Predicting…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Predict AQI
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictorForm;
