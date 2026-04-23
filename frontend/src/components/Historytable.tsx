import React, { useEffect, useState, useCallback } from "react";
import api from "./axios";
import Pagination from "./Pagination";

interface HistoryRecord {
  id: number;
  city: string;
  date: string;
  aqi: number;
  predicted_aqi: number;
}

interface HistoryResponse {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  history: HistoryRecord[];
}

const LIMIT = 10;

const SkeletonRow: React.FC = () => (
  <tr className="border-b border-slate-800">
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 animate-pulse rounded bg-slate-800" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

const AqiBadge: React.FC<{ value: number }> = ({ value }) => {
  const color =
    value <= 50 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
      value <= 100 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" :
        value <= 150 ? "text-orange-400 bg-orange-500/10 border-orange-500/30" :
          value <= 200 ? "text-red-400 bg-red-500/10 border-red-500/30" :
            "text-purple-400 bg-purple-500/10 border-purple-500/30";

  return (
    <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${color}`}>
      {value.toFixed(1)}
    </span>
  );
};

const HistoryTable: React.FC = () => {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<HistoryResponse>(`/history?page=${p}&limit=${LIMIT}`);
      setData(res);
    } catch {
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-teal-400">
            Prediction History
          </h2>
          <p className="mt-1 text-xl font-bold text-slate-100">All Records</p>
        </div>
        {data && (
          <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {data.total_records} total records
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {["ID", "City", "Date", "Current AQI", "Predicted AQI"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} />)
              : data?.history.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-800/60 transition-colors duration-150 hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">#{row.id}</td>
                  <td className="px-5 py-4 font-medium text-slate-200">{row.city}</td>
                  <td className="px-5 py-4 text-slate-400">{row.date}</td>
                  <td className="px-5 py-4"><AqiBadge value={row.aqi} /></td>
                  <td className="px-5 py-4"><AqiBadge value={row.predicted_aqi} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && data && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
