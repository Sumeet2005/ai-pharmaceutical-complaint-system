import React from "react";
import Button from "../common/Button";
import { Info, AlertTriangle, ShieldAlert } from "lucide-react";

/**
 * WorkspaceForm renders the Left Panel of the AI Complaint intake workspace.
 * Reorganizes fields into 4 QMS sections, including a refined AI Assessment panel.
 */
const WorkspaceForm = ({
  status,
  formValues,
  onChange,
  modifiedFields,
  highlightedFields,
  onCommit,
  isCommitting,
  uploadResult,
}) => {
  const isExtracted = status === "success" || status === "duplicate" || status === "modified";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (onChange) {
      onChange(name, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCommit) {
      onCommit();
    }
  };

  const getPlaceholder = () => {
    return isExtracted ? "" : "-";
  };

  const getInputClass = (fieldName) => {
    const isTextArea = fieldName === "complaintDescription";
    const heightClass = isTextArea ? "py-2.5 px-3.5" : "h-10 px-3.5";
    const base = `${heightClass} w-full border rounded-lg text-sm transition-all duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-gray-350 placeholder:font-semibold`;
    
    // Subtle duplicate field highlighting
    const isDupField =
      status === "duplicate" &&
      ["productName", "batchNumber", "complaintCategory", "complaintDescription"].includes(fieldName);

    if (isDupField) {
      return `${base} bg-amber-50/10 border-amber-300 text-gray-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-200`;
    }

    if (highlightedFields[fieldName]) {
      return `${base} bg-amber-50 border-amber-300 ring-2 ring-amber-250 animate-pulse`;
    }
    if (modifiedFields[fieldName]) {
      return `${base} bg-sky-50/20 border-sky-300 ring-1 ring-sky-300`;
    }
    return `${base} border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary`;
  };

  const renderLabel = (fieldName, labelText) => {
    return (
      <div className="flex justify-between items-center mb-2.5 h-[18px]">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-none">{labelText}</label>
        {modifiedFields[fieldName] && (
          <span className="text-[9px] text-sky-600 font-black uppercase tracking-widest leading-none shrink-0">
            ● Edited
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Panel Header & Status Badge */}
      <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-55">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">QMS Ingestion Ledger</h3>
          <p className="text-xs text-gray-500 font-medium">Verify and sign-off on extracted pharmaceutical quality incidents.</p>
        </div>
        <div>
          {status === "modified" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-755 border border-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
              Modified
            </span>
          )}
          {status === "duplicate" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Potential Duplicate
            </span>
          )}
          {status === "success" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ready to Commit
            </span>
          )}
          {status !== "success" && status !== "duplicate" && status !== "modified" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Pending Triage
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">
        {/* Instruction Banner for Empty State */}
        {!isExtracted && (
          <div className="py-2.5 px-4 bg-sky-50/50 border border-sky-100 rounded-xl flex gap-4 items-center animate-fade-in shadow-2xs">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-wider">AI Intake Workspace Ready</h5>
              <p className="text-[11px] text-gray-500 font-semibold leading-normal mt-0.5">
                Upload a pharmaceutical complaint document to begin AI extraction and triage review.
              </p>
            </div>
          </div>
        )}

        {/* Enterprise Duplicate Warning Alert Banner */}
        {status === "duplicate" && uploadResult && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex gap-4 items-start animate-fade-in shadow-2xs">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-bold text-amber-800">⚠️ Potential Duplicate Complaint Detected</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-xs font-semibold text-gray-700">
                <div>
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px] mb-0.5">Matched Complaint</span>
                  <span className="text-gray-900 font-bold">{uploadResult.existing?.complaint_id}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px] mb-0.5">Similarity Rating</span>
                  <span className="text-amber-700 font-bold">{Math.round((uploadResult.similarity || 0) * 100)}% Similarity</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px] mb-0.5">Core Reasons</span>
                  <span className="text-gray-800">{uploadResult.existing?.reasoning || "Same Product, Same Batch & High Semantic Similarity"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise Duplicate Information Card Panel */}
        {status === "duplicate" && uploadResult && (
          <div className="bg-amber-50/10 p-5 rounded-xl border border-amber-200/50 shadow-2xs space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-amber-150 pb-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Duplicate Analysis & Audit Log</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
              <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-3xs">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Matched Complaint ID</span>
                <span className="text-gray-850 font-extrabold">{uploadResult.existing?.complaint_id || "N/A"}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-3xs">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Similarity Rating</span>
                <span className="text-amber-750 font-extrabold">{Math.round((uploadResult.similarity || 0) * 100)}% Match</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-3xs">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Matched Product</span>
                <span className="text-gray-800 font-bold">{uploadResult.existing?.product_name || "N/A"}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-3xs">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Matched Batch</span>
                <span className="text-gray-800 font-bold">{uploadResult.existing?.batch_number || "N/A"}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-3xs">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Matched Customer</span>
                <span className="text-gray-800 font-bold">{uploadResult.existing?.complainant_name || "N/A"}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-3xs">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">Matched Date</span>
                <span className="text-gray-800 font-bold">{uploadResult.existing?.complaint_date || "N/A"}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-155 shadow-3xs md:col-span-3">
                <span className="text-gray-400 font-bold block uppercase text-[9px] tracking-wider mb-1">System Audit Reasoning</span>
                <p className="text-xs text-gray-700 leading-normal">{uploadResult.existing?.reasoning || "Same product and batch identification match."}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Origin & Customer Information */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-sky-100 pb-2 flex items-center gap-1">
            <span>Section 1:</span> Origin & Customer Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              {renderLabel("complaintSource", "Complaint Source")}
              <input
                type="text"
                name="complaintSource"
                value={formValues.complaintSource}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("complaintSource")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("customerName", "Customer Name")}
              <input
                type="text"
                name="customerName"
                value={formValues.customerName}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("customerName")}
                required
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("customerOrganization", "Customer Organization")}
              <input
                type="text"
                name="customerOrganization"
                value={formValues.customerOrganization}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("customerOrganization")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("customerContact", "Customer Contact")}
              <input
                type="text"
                name="customerContact"
                value={formValues.customerContact}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("customerContact")}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product & Batch Identification */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-sky-100 pb-2 flex items-center gap-1">
            <span>Section 2:</span> Product & Batch Identification
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col md:col-span-2">
              {renderLabel("productName", "Product Name")}
              <input
                type="text"
                name="productName"
                value={formValues.productName}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("productName")}
                required
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("productStrength", "Product Strength / Grade")}
              <input
                type="text"
                name="productStrength"
                value={formValues.productStrength}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("productStrength")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("dosageForm", "Dosage Form")}
              <input
                type="text"
                name="dosageForm"
                value={formValues.dosageForm}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("dosageForm")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("batchNumber", "Batch / Lot Number")}
              <input
                type="text"
                name="batchNumber"
                value={formValues.batchNumber}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("batchNumber")}
                required
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("mfgDate", "Manufacturing Date")}
              <input
                type="text"
                name="mfgDate"
                value={formValues.mfgDate}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("mfgDate")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("expDate", "Expiry Date")}
              <input
                type="text"
                name="expDate"
                value={formValues.expDate}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("expDate")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("affectedQty", "Quantity Affected")}
              <input
                type="text"
                name="affectedQty"
                value={formValues.affectedQty}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("affectedQty")}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Complaint Narrative */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-sky-100 pb-2 flex items-center gap-1">
            <span>Section 3:</span> Complaint Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              {renderLabel("complaintCategory", "Complaint Category")}
              <input
                type="text"
                name="complaintCategory"
                value={formValues.complaintCategory}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("complaintCategory")}
              />
            </div>
            <div className="flex flex-col">
              {renderLabel("complaintDate", "Complaint Date")}
              <input
                type="text"
                name="complaintDate"
                value={formValues.complaintDate}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("complaintDate")}
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              {renderLabel("requestedAction", "Requested Action")}
              <input
                type="text"
                name="requestedAction"
                value={formValues.requestedAction}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                className={getInputClass("requestedAction")}
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              {renderLabel("complaintDescription", "Complaint Description Narrative")}
              <textarea
                name="complaintDescription"
                value={formValues.complaintDescription}
                onChange={handleChange}
                placeholder={getPlaceholder()}
                disabled={!isExtracted}
                rows={5}
                className={`${getInputClass("complaintDescription")} resize-none`}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: AI Initial Assessment */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-sky-100 pb-2 flex items-center gap-1">
            <span>Section 4:</span> AI Initial Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col bg-white p-3.5 rounded-lg border border-gray-155 shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Risk Level</span>
                  <span className="text-sm font-bold text-gray-850 mt-1">{formValues.aiRiskLevel}</span>
                </div>
                <div className="flex flex-col bg-white p-3.5 rounded-lg border border-gray-150 shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Initial QA Priority</span>
                  <span className="text-sm font-bold text-gray-850 mt-1">{formValues.priority}</span>
                  <span className="text-[9px] text-gray-400 mt-1.5 italic leading-none">
                    Derived from the AI risk assessment.
                  </span>
                </div>
              </div>

              {/* AI Summary detail */}
              <div className="flex flex-col bg-white p-4 rounded-lg border border-gray-150 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  AI Complaint Summary
                </span>
                <p className="text-xs leading-relaxed text-gray-600 font-medium whitespace-pre-wrap flex-1 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 min-h-[70px]">
                  {formValues.aiComplaintSummary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-155 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isExtracted || isCommitting}
            className="cursor-pointer font-bold"
          >
            {isCommitting
              ? "Committing to Ledger..."
              : status === "duplicate"
              ? "Commit Duplicate Complaint"
              : "Commit to QMS Ledger"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceForm;
