import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, FileCode2, Clock, User, ShieldCheck } from "lucide-react";
import PageContainer from "src/components/common/PageContainer";
import Card from "src/components/common/Card";
import Loader from "src/components/common/Loader";
import { complaintApi } from "src/api/complaintApi";

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await complaintApi.getComplaint(id);
        setComplaint(data);
      } catch (err) {
        console.error(err);
        setError("Failed to retrieve complaint detail files. Please confirm record ID exists.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getStatusColor = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-255";
      case "reviewed":
        return "bg-emerald-50 text-emerald-700 border-emerald-255";
      case "duplicate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-255";
    }
  };

  if (loading) {
    return (
      <PageContainer title="Case File Investigation">
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (error || !complaint) {
    return (
      <PageContainer title="Case File Investigation">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-rose-500 text-4xl mb-4 font-bold">⚠️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Record Not Found</h3>
          <p className="text-sm text-gray-500 mb-6">{error || "The selected complaint record is invalid."}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Case File Investigation"
      description={`Triage history & compliance audit for quality incident ${complaint.complaint_id}`}
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-650 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Details & AI Assessment) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Complaint Summary */}
          <Card title="Complaint Summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Customer Name
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.complainant_name || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Customer Organization
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.customer_organization || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Customer Contact
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.customer_contact || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Complaint Source
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.complaint_source || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Product Name
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.product_name || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Product Strength/Grade
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.product_strength || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Dosage Form
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.dosage_form || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Batch / Lot Number
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.batch_number || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Manufacturing Date
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.manufacturing_date || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Expiry Date
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.expiry_date || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Quantity Affected
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.quantity_affected || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Complaint Category
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.complaint_category || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Complaint Date
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.complaint_date || "Not Available"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Requested Action
                </span>
                <span className="text-sm font-bold text-gray-850">
                  {complaint.requested_action || "Not Available"}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Narrative Description
              </span>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-705 leading-relaxed font-sans whitespace-pre-wrap">
                {complaint.complaint_text || "Not Available"}
              </div>
            </div>
          </Card>

          {/* AI Initial Assessment */}
          <Card title="AI Initial Assessment">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">AI Risk Level</span>
                  <span className="text-sm font-bold text-gray-850 mt-1">
                    {complaint.ai_risk_level || "Not Available"}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Initial QA Priority</span>
                  <span className="text-sm font-bold text-gray-850 mt-1">
                    {complaint.priority || "Not Available"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-150">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  AI Complaint Summary
                </span>
                <p className="text-xs leading-relaxed text-gray-600 font-medium whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-100 min-h-[70px]">
                  {complaint.ai_summary || "Not Available"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Timeline & Metadata) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Investigation Timeline */}
          <Card title="Investigation Timeline">
            <div className="relative pl-6 border-l-2 border-sky-100 space-y-8 py-2">
              {/* Event 1: Ingestion */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 bg-sky-100 text-primary h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">AI Intake & Classification</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Complaint document uploaded and analyzed.</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 mt-2 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    <Clock className="h-2.5 w-2.5" /> {new Date(complaint.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Event 2: Duplicate Check */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm ${
                  complaint.is_duplicate
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-primary"
                }`}>
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">
                    {complaint.is_duplicate ? "Duplicate Investigation" : "Duplicate Check Passed"}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {complaint.is_duplicate ? (
                      <span>
                        Shares a high semantic match with record{" "}
                        <strong className="text-amber-800">{complaint.duplicate_matched_id}</strong> (Similarity:{" "}
                        {Math.round((complaint.duplicate_similarity || 0) * 100)}%).
                      </span>
                    ) : (
                      "No matching historical duplicates found in database records."
                    )}
                  </p>
                  {complaint.is_duplicate && complaint.duplicate_reasoning && (
                    <div className="text-[11px] text-amber-850 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 mt-2 max-w-md font-medium leading-relaxed">
                      <strong>Audit Log:</strong> {complaint.duplicate_reasoning}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 mt-2 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    <Clock className="h-2.5 w-2.5" /> {new Date(complaint.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Event 3: Review Sign-off */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm ${
                  complaint.status?.toLowerCase() === "reviewed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Compliance Sign-off</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {complaint.status?.toLowerCase() === "reviewed"
                      ? "Case approved and committed to Persistent Ledger."
                      : "Pending final review sign-off."}
                  </p>
                  {complaint.status?.toLowerCase() === "reviewed" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <Clock className="h-2.5 w-2.5" /> {new Date(complaint.updated_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Review Information */}
          <Card title="Review Information">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Triage Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {complaint.status || "Not Available"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> QA Officer
                </span>
                <span className="text-sm font-semibold text-gray-850">
                  {complaint.status?.toLowerCase() === "reviewed" ? "Compliance QA Officer" : "Not Available"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Signed-off At
                </span>
                <span className="text-sm font-semibold text-gray-850">
                  {complaint.status?.toLowerCase() === "reviewed" ? (
                    new Date(complaint.updated_at).toLocaleDateString()
                  ) : (
                    <span className="text-gray-400 italic">Not Available</span>
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Document Metadata */}
          <Card title="Document Metadata">
            <div className="space-y-4 text-xs font-semibold text-gray-750">
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Record UUID</span>
                <span className="font-mono text-gray-850 select-all text-right">{complaint.id}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FileCode2 className="h-3.5 w-3.5" /> Complaint ID
                </span>
                <span className="text-gray-850">{complaint.complaint_id}</span>
              </div>

              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created Date
                </span>
                <span className="text-gray-850">{new Date(complaint.created_at).toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Updated Date
                </span>
                <span className="text-gray-850">{new Date(complaint.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ComplaintDetails;
