import React from "react";

interface PredictionResultProps {
  predictedAqi: number | null;
}

const getAqiCategory = (aqi: number): { label: string; color: string; bg: string; border: string } => {
  if (aqi <= 50) return { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" };
  return { label: "Hazardous", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
};

const PredictionResult: React.FC<PredictionResultProps> = ({ predictedAqi }) => {
  if (predictedAqi === null) return null;

  const category = getAqiCategory(predictedAqi);
  const pct = Math.min((predictedAqi / 300) * 100, 100);

  return (
    <div className={`rounded-2xl border ${category.border} ${category.bg} p-8 backdrop-blur-sm transition-all duration-500`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
            Prediction Result
          </h2>
          <p className="mt-1 text-sm text-slate-300">Next-period forecast</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${category.color} ${category.border} bg-slate-950/40`}>
          {category.label}
        </span>
      </div>

      <div className={`text-6xl font-black tracking-tight ${category.color}`}>
        {predictedAqi.toFixed(1)}
        <span className="ml-2 text-lg font-normal text-slate-400">AQI</span>
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>0</span>
          <span>150</span>
          <span>300+</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #34d399, #fbbf24, #f87171, #a78bfa)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
