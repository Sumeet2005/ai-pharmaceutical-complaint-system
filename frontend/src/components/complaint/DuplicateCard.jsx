import React from "react";
import { AlertTriangle, Tag, User, Layers, ShieldAlert, FileText } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";

/**
 * DuplicateCard warns the user that the uploaded file is semantically similar
 * to an existing record, rendering a comparison layout.
 */
const DuplicateCard = ({ result, onReset }) => {
  const similarity = result?.similarity ?? 0;
  const existing = result?.existing ?? {};
  const similarityPercent = Math.round(similarity * 100);

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Duplicate Complaint Detected</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              The uploaded document shares a high semantic similarity ({similarityPercent}%) with an existing record.
            </p>
          </div>
        </div>
        <Button onClick={onReset} size="sm" variant="secondary" className="cursor-pointer">
          Try Another File
        </Button>
      </div>

      {/* Existing Complaint Details */}
      <Card
        title="Matching Existing Record"
        subtitle="This complaint is already registered in the database. Duplicate uploads are blocked."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400">Complaint ID</span>
              <span className="block text-sm font-semibold text-gray-800">{existing.complaint_id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400">Product Name</span>
              <span className="block text-sm font-semibold text-gray-800">{existing.product_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400">Batch Number</span>
              <span className="block text-sm font-semibold text-gray-800">{existing.batch_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400">Complainant Name</span>
              <span className="block text-sm font-semibold text-gray-800">{existing.complainant_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400">Severity</span>
              <span className="block text-sm font-semibold text-gray-800">{existing.severity}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400">Workflow Status</span>
              <span className="block text-sm font-semibold text-gray-800">{existing.status}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DuplicateCard;
