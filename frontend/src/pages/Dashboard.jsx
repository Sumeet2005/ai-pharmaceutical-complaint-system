import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ClipboardList, Eye, CheckCircle2, Trash2 } from "lucide-react";
import PageContainer from "src/components/common/PageContainer";
import Card from "src/components/common/Card";
import EmptyState from "src/components/common/EmptyState";
import Button from "src/components/common/Button";
import { fetchDashboardData, reviewComplaint, deleteComplaint } from "src/store/dashboardSlice";

// Skeleton row loader to replace spinners
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-28"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </td>
  </tr>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { complaints, status } = useSelector((state) => state.dashboard);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Delete Action states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Fetch complaints on load
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Compute dynamic KPI metrics from database records
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status?.toLowerCase() === "pending").length;
    const reviewed = complaints.filter((c) => c.status?.toLowerCase() === "reviewed").length;
    const critical = complaints.filter((c) => c.severity?.toLowerCase() === "critical").length;
    const high = complaints.filter((c) => c.severity?.toLowerCase() === "high").length;
    return { total, pending, reviewed, critical, high };
  }, [complaints]);

  // Filters mapping logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // 1. Search Query filter (matches ID, Product, Complainant/Customer, Batch Number)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        c.complaint_id?.toLowerCase().includes(q) ||
        c.product_name?.toLowerCase().includes(q) ||
        c.complainant_name?.toLowerCase().includes(q) ||
        c.batch_number?.toLowerCase().includes(q);

      // 2. Severity filter
      const matchesSeverity =
        selectedSeverity === "All Severities" ||
        c.severity?.toLowerCase() === selectedSeverity.toLowerCase();

      // 3. Status filter
      const matchesStatus =
        selectedStatus === "All Statuses" ||
        c.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [complaints, searchQuery, selectedSeverity, selectedStatus]);

  const handleOpenDetails = (complaint) => {
    navigate(`/complaint/${complaint.id}`);
  };

  const handleMarkAsReviewed = async (id) => {
    await dispatch(reviewComplaint(id));
  };

  // Toast triggers
  const triggerToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDeleteRequest = (complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;
    try {
      const resultAction = await dispatch(deleteComplaint(complaintToDelete.id));
      if (deleteComplaint.fulfilled.match(resultAction)) {
        triggerToast("Complaint deleted successfully.", "success");
      } else {
        throw new Error(resultAction.payload || "Failed to delete complaint.");
      }
    } catch (err) {
      triggerToast(err.message || "An error occurred while deleting.", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setComplaintToDelete(null);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "high":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "medium":
        return "bg-yellow-50 text-yellow-755 border-yellow-200";
      case "low":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "reviewed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "duplicate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <PageContainer
      title="Dashboard Overview"
      description="Monitor and track all registered complaints, quality issues, and regulatory reports."
    >
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between min-h-[104px]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Complaints</span>
          <span className="text-2xl font-black text-gray-800 mt-2">{stats.total}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between min-h-[104px]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</span>
          <span className="text-2xl font-black text-orange-600 mt-2">{stats.pending}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between min-h-[104px]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reviewed</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">{stats.reviewed}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between min-h-[104px]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Critical Cases</span>
          <span className="text-2xl font-black text-rose-600 mt-2">{stats.critical}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between min-h-[104px]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">High Severity</span>
          <span className="text-2xl font-black text-amber-600 mt-2">{stats.high}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search complaints by ID, product, customer, batch..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="All Severities">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* complaints Table Log */}
      <Card
        title="Complaints Log"
        subtitle="Real-time list of all complaints requiring triage and regulatory sign-off."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-bold">
              <tr>
                <th className="px-6 py-3">Complaint ID</th>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {status === "loading" && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {status !== "loading" &&
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{c.complaint_id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{c.product_name}</td>
                    <td className="px-6 py-4 text-gray-500">{c.complainant_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityColor(
                          c.severity
                        )}`}
                      >
                        {c.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                          c.status
                        )}`}
                        title={
                          c.is_duplicate
                            ? `Duplicate of ${c.duplicate_matched_id} ${Math.round(
                                (c.duplicate_similarity || 0) * 100
                              )}% Similar`
                            : undefined
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleOpenDetails(c)}
                          size="xs"
                          variant="secondary"
                          className="cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Button>
                        {c.status?.toLowerCase() === "pending" && (
                          <Button
                            onClick={() => handleMarkAsReviewed(c.id)}
                            size="xs"
                            variant="primary"
                            className="cursor-pointer flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white animate-fade-in"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Review
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteRequest(c)}
                          size="xs"
                          variant="secondary"
                          className="cursor-pointer flex items-center gap-1 font-bold border-rose-200 hover:border-rose-350 hover:bg-rose-50/55 text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 text-rose-500" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {status !== "loading" && filteredComplaints.length === 0 && (
            <div className="py-12 border-t border-gray-100">
              <EmptyState
                icon={ClipboardList}
                title="No matching complaints"
                description="No complaints registered matching your search query or filters. Try resetting filters, or upload a new file in the Intake workspace to register a new case."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && complaintToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 mx-4">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-bold text-gray-900">Delete Complaint</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Are you sure you want to delete this complaint? This action cannot be undone and will permanently remove the record from the audit trail.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4 text-xs space-y-1 font-semibold text-gray-700">
              <div>
                <span className="text-gray-400 font-bold">Complaint ID:</span>{" "}
                {complaintToDelete.complaint_id}
              </div>
              <div>
                <span className="text-gray-400 font-bold">Product Name:</span>{" "}
                {complaintToDelete.product_name}
              </div>
              <div>
                <span className="text-gray-400 font-bold">Customer Name:</span>{" "}
                {complaintToDelete.complainant_name}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setComplaintToDelete(null);
                }}
                variant="secondary"
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                variant="primary"
                className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-bold border-transparent"
              >
                Delete Complaint
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full sm:w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between transition-all duration-300 animate-slide-in ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 text-xs font-bold opacity-60 hover:opacity-100 focus:outline-none cursor-pointer"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

export default Dashboard;
