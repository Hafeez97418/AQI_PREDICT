import React, { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "./axios";

interface CityDataPoint {
  date: string;
  aqi: number;
  predicted_aqi: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl">
      <p className="mb-2 font-mono text-xs text-slate-400">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {Number(p.value).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

const CityChart: React.FC = () => {
  const [cityInput, setCityInput] = useState("");
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [chartData, setChartData] = useState<CityDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchCityData = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { data } = await api.get<CityDataPoint[]>(`/history/${encodeURIComponent(city.trim())}`);
      setChartData(data);
      setActiveCity(city.trim());
    } catch {
      setError("Could not fetch data for this city.");
      setChartData([]);
      setActiveCity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCityData(cityInput);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-teal-400">
          City Analytics
        </h2>
        <p className="mt-1 text-xl font-bold text-slate-100">AQI Trend Chart</p>
        <p className="mt-1 text-sm text-slate-400">
          Search a city to visualise actual vs predicted AQI over time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Enter city name…"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={loading || !cityInput.trim()}
          className="flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
          Search
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-teal-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-slate-400">Loading chart data…</p>
          </div>
        </div>
      )}

      {!loading && searched && chartData.length === 0 && !error && (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <svg className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-sm text-slate-400">No data found for this city.</p>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div>
          {activeCity && (
            <p className="mb-4 text-sm text-slate-400">
              Showing AQI trends for{" "}
              <span className="font-semibold text-teal-400">{activeCity}</span>
              <span className="ml-2 text-slate-500">({chartData.length} records)</span>
            </p>
          )}
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
                formatter={(val) => <span style={{ color: "#94a3b8" }}>{val}</span>}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                name="Actual AQI"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={{ fill: "#2dd4bf", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="predicted_aqi"
                name="Predicted AQI"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ fill: "#f59e0b", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CityChart;
