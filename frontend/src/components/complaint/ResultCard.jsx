import React from "react";
import { CheckCircle2, FileText, Tag, User, Layers, ShieldAlert, Activity } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";

/**
 * ResultCard displays the successfully extracted structured complaint details
 * and their workflow indicators.
 */
const ResultCard = ({ result, onReset }) => {
  const complaint = result?.complaint ?? {};
  const uploaded_file = result?.uploaded_file ?? {};

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "high":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "under review":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const infoItems = [
    {
      label: "Complaint ID",
      value: complaint.complaint_id || "Generating...",
      icon: Tag,
      color: "text-primary bg-sky-50",
    },
    {
      label: "Product Name",
      value: complaint.product_name || "N/A",
      icon: Layers,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Batch / Lot Number",
      value: complaint.batch_number || "N/A",
      icon: Activity,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Complainant Name",
      value: complaint.complainant_name || "N/A",
      icon: User,
      color: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Complaint Ingested</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <FileText className="h-3.5 w-3.5" /> Parsed: {uploaded_file || "Document"}
            </p>
          </div>
        </div>
        <Button onClick={onReset} size="sm" variant="secondary" className="cursor-pointer">
          Upload Another Document
        </Button>
      </div>

      {/* Structured metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3"
            >
              <div className={`p-2.5 rounded-lg ${item.color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="block text-sm font-semibold text-gray-800 mt-1">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Severity & Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Severity Level
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">Assigned by AI QA Classifier</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(
              complaint.severity
            )}`}
          >
            {complaint.severity || "Medium"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                Workflow Status
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">Initial record state</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
              complaint.status
            )}`}
          >
            {complaint.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Complaint Text */}
      <Card
        title="Extracted Complaint Text"
        subtitle="Full narrative parsed and verified by the AI extraction model."
      >
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
            {complaint.complaint_text || "No narrative text found."}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ResultCard;
