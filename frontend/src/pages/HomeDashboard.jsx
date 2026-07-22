import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Eye,
} from "lucide-react";
import PageContainer from "src/components/common/PageContainer";
import Card from "src/components/common/Card";
import Button from "src/components/common/Button";
import { fetchDashboardData } from "src/store/dashboardSlice";
import { ROUTES } from "src/utils/constants/routes";

const HomeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { complaints, status } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Compute stats
  const stats = useMemo(() => {
    const total = complaints.length;
    const highPriority = complaints.filter(
      (c) => c.severity?.toLowerCase() === "critical" || c.severity?.toLowerCase() === "high"
    ).length;
    const pending = complaints.filter((c) => c.status?.toLowerCase() === "pending").length;
    const duplicates = complaints.filter((c) => c.status?.toLowerCase() === "duplicate").length;
    return { total, highPriority, pending, duplicates };
  }, [complaints]);

  // Get 5 most recent complaints
  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [complaints]);

  return (
    <PageContainer
      title="Welcome, QA Administrator"
      description="PharmacoGuard Quality Management System overview and automated ingestion status dashboard."
    >
      <div className="space-y-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            role="button"
            tabIndex={0}
            className="p-5 flex items-center justify-between cursor-pointer border border-slate-200 bg-white shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-md hover:border-primary/50 transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => navigate(ROUTES.COMPLAINT_INTAKE)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(ROUTES.COMPLAINT_INTAKE);
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Complaint Intake Workspace</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-semibold">Ingest new documents and run AI classifications.</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
          </div>

          <div
            role="button"
            tabIndex={0}
            className="p-5 flex items-center justify-between cursor-pointer border border-slate-200 bg-white shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-md hover:border-primary/50 transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(ROUTES.DASHBOARD);
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">QA Operations Dashboard</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-semibold">Explore historic logs, metrics, and persistent records.</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-650 group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white flex items-center gap-4 border border-slate-200 shadow-sm rounded-xl">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Complaints</span>
              <span className="text-2xl font-black text-gray-900 mt-0.5 block">{stats.total}</span>
            </div>
          </Card>

          <Card className="p-5 bg-white flex items-center gap-4 border border-slate-200 shadow-sm rounded-xl">
            <div className="p-3 bg-rose-50 text-rose-650 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">High Priority</span>
              <span className="text-2xl font-black text-rose-600 mt-0.5 block">{stats.highPriority}</span>
            </div>
          </Card>

          <Card className="p-5 bg-white flex items-center gap-4 border border-slate-200 shadow-sm rounded-xl">
            <div className="p-3 bg-amber-50 text-amber-605 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending Review</span>
              <span className="text-2xl font-black text-amber-600 mt-0.5 block">{stats.pending}</span>
            </div>
          </Card>

          <Card className="p-5 bg-white flex items-center gap-4 border border-slate-200 shadow-sm rounded-xl">
            <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duplicate Cases</span>
              <span className="text-2xl font-black text-indigo-600 mt-0.5 block">{stats.duplicates}</span>
            </div>
          </Card>
        </div>

        {/* AI & Pipeline Status and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Processing Status */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">AI Operations Status</h3>
            <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-gray-700">Groq LLM Pipeline</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-700">Adverse Event Classifier</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-gray-700">Semantic Deduplication</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">System Ingest Timeline</h3>
            <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block">System Event</span>
                    <p className="text-xs font-bold text-gray-805 mt-0.5">QA Ingestion Workspace successfully loaded database contexts.</p>
                  </div>
                </div>
                {recentComplaints.slice(0, 2).map((comp, idx) => (
                  <div key={comp.id || idx} className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block">
                        {comp.created_at ? new Date(comp.created_at).toLocaleDateString() : "Just Now"}
                      </span>
                      <p className="text-xs font-bold text-gray-805 mt-0.5">
                        New quality complaint received for product <span className="text-primary font-extrabold">{comp.product_name || "Unknown"}</span>.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Ingested Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Recent Ingestion Records</h3>
          <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Complaint ID</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {status === "loading" && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-xs text-gray-500 font-medium">
                        Loading database records...
                      </td>
                    </tr>
                  )}
                  {status !== "loading" && recentComplaints.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-xs text-gray-500 font-medium">
                        No recent complaints registered. Go to Ingest to add one.
                      </td>
                    </tr>
                  )}
                  {status !== "loading" &&
                    recentComplaints.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{comp.complaint_id}</td>
                        <td className="px-6 py-4 text-gray-700">{comp.product_name || "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{comp.complainant_name || "-"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              comp.severity?.toLowerCase() === "critical"
                                ? "bg-rose-50 text-rose-750 border-rose-100"
                                : comp.severity?.toLowerCase() === "high"
                                ? "bg-amber-50 text-amber-800 border-amber-100"
                                : comp.severity?.toLowerCase() === "medium"
                                ? "bg-sky-50 text-sky-850 border-sky-100"
                                : "bg-slate-50 text-slate-600 border-slate-100"
                            }`}
                          >
                            {comp.severity || "Medium"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              comp.status?.toLowerCase() === "reviewed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {comp.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => navigate(`/complaint/${comp.id}`)}
                            variant="secondary"
                            className="inline-flex items-center gap-1 py-1 px-2.5 text-xs cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default HomeDashboard;
