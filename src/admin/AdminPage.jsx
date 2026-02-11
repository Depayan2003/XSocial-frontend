import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    const res = await api.get("/reports/pending");
    setReports(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const warnUser = async (userId) => {
    const reason = prompt("Warning reason");
    if (!reason) return;

    await api.post(`/admin/users/${userId}/warn`, { reason });
    alert("User warned");
  };

  const disableUser = async (userId) => {
    const reason = prompt("Disable reason");
    if (!reason) return;

    await api.delete(`/admin/users/${userId}`, {
      data: { reason }
    });

    alert("User disabled");
  };

  const resolveReport = async (reportId) => {
    await api.post(`/reports/${reportId}/resolve`);
    loadReports();
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Admin Reports
        </h1>
        <p className="text-sm text-gray-400">
          Review user reports and take action
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-gray-400">Loading reports…</div>
      )}

      {/* Empty */}
      {!loading && reports.length === 0 && (
        <div className="text-gray-500">
          No pending reports 🎉
        </div>
      )}

      {/* Reports */}
      <div className="flex flex-col gap-4">
        {reports.map(r => (
          <div
            key={r.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4"
          >
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-400">Reported user:</span>{" "}
                <span className="text-white">{r.reportedUser.email}</span>
              </div>

              <div>
                <span className="text-gray-400">Reported by:</span>{" "}
                <span className="text-white">{r.reporter.email}</span>
              </div>

              <div>
                <span className="text-gray-400">Reason:</span>{" "}
                <span className="text-gray-300">{r.reason}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => warnUser(r.reportedUser.id)}
                className="px-3 py-1 text-sm rounded
                           bg-yellow-600/20 text-yellow-400
                           hover:bg-yellow-600/30 transition"
              >
                Warn
              </button>

              <button
                onClick={() => disableUser(r.reportedUser.id)}
                className="px-3 py-1 text-sm rounded
                           bg-red-600/20 text-red-400
                           hover:bg-red-600/30 transition"
              >
                Disable
              </button>

              <button
                onClick={() => resolveReport(r.id)}
                className="px-3 py-1 text-sm rounded
                           bg-green-600/20 text-green-400
                           hover:bg-green-600/30 transition"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
