import React, { useState, useEffect } from "react";
import PageContainer from "src/components/common/PageContainer";
import WorkspaceForm from "src/components/complaint/WorkspaceForm";
import WorkspaceCopilot from "src/components/complaint/WorkspaceCopilot";
import { useUpload } from "src/hooks/useUpload";
import { CheckCircle2 } from "lucide-react";
import { complaintApi } from "src/api/complaintApi";

const Complaint = () => {
  const {
    status: uploadStatus,
    error,
    result: uploadResult,
    uploadFile,
    uploadText,
    resetUpload,
    isProcessing,
  } = useUpload();

  const [workspaceStatus, setWorkspaceStatus] = useState("idle");
  const [toasts, setToasts] = useState([]);
  const [isCommitting, setIsCommitting] = useState(false);

  // Simulated extraction progress states
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionText, setExtractionText] = useState("");
  const [displayResult, setDisplayResult] = useState(null);

  // Controlled form states
  const [initialData, setInitialData] = useState(null);
  const [formValues, setFormValues] = useState({
    complaintSource: "Not Provided",
    customerName: "",
    customerOrganization: "Not Provided",
    customerContact: "Not Provided",
    productName: "",
    productStrength: "Not Provided",
    dosageForm: "Not Provided",
    batchNumber: "",
    mfgDate: "Not Provided",
    expDate: "Not Provided",
    affectedQty: "Not Provided",
    complaintCategory: "Not Provided",
    complaintDate: "Not Provided",
    complaintDescription: "",
    requestedAction: "Not Provided",
    severity: "Medium",
    suggestedAction: "Not Provided",
    initialRisk: "Not Provided",
    aiRiskLevel: "Not Provided",
    priority: "Not Provided",
    aiComplaintSummary: "Not Provided",
    aiConfidence: "Not Provided",
  });

  const [modifiedFields, setModifiedFields] = useState({});
  const [highlightedFields, setHighlightedFields] = useState({});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // 1. Extraction Progress State Machine
  useEffect(() => {
    let intervalId = null;

    if (uploadStatus === "loading") {
      setWorkspaceStatus("loading");
      setDisplayResult(null);
      setExtractionProgress(10);
      setExtractionText("Ingesting document...");

      const steps = [
        { progress: 45, text: "Analyzing document..." },
        { progress: 65, text: "Extracting Customer Information..." },
        { progress: 80, text: "Extracting Product Details..." },
        { progress: 92, text: "Generating AI Summary..." },
      ];

      let stepIdx = 0;
      intervalId = setInterval(() => {
        if (stepIdx < steps.length) {
          setExtractionProgress(steps[stepIdx].progress);
          setExtractionText(steps[stepIdx].text);
          stepIdx++;
        } else {
          setExtractionText("Almost finished...");
          clearInterval(intervalId);
        }
      }, 700);

    } else if (uploadStatus === "success" || uploadStatus === "duplicate") {
      if (intervalId) clearInterval(intervalId);
      setExtractionProgress(100);
      setExtractionText("Completed");

      // Wait briefly so completion status is visible, then pop form values
      const timeoutId = setTimeout(() => {
        setDisplayResult(uploadResult);
        setWorkspaceStatus(uploadStatus);
      }, 700);

      return () => clearTimeout(timeoutId);
    } else if (uploadStatus === "rejected" || uploadStatus === "error") {
      if (intervalId) clearInterval(intervalId);
      setExtractionProgress(0);
      setExtractionText("");
      setWorkspaceStatus(uploadStatus);
      setDisplayResult(uploadResult);
    } else if (uploadStatus === "idle") {
      if (intervalId) clearInterval(intervalId);
      setWorkspaceStatus("idle");
      setDisplayResult(null);
      setExtractionProgress(0);
      setExtractionText("");
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [uploadStatus, uploadResult]);

  // 2. Synchronize Display values to form inputs on extraction complete
  useEffect(() => {
    if ((workspaceStatus === "success" || workspaceStatus === "duplicate") && displayResult?.complaint) {
      const aiData = displayResult?.ai_extracted_data;

      const complaintSourceVal = aiData?.complaint_source || "Not Provided";
      const customerNameVal = aiData?.customer_name || displayResult.complaint.complainant_name || "";
      const customerOrganizationVal = aiData?.customer_organization || "Not Provided";
      const customerContactVal = aiData?.customer_contact || "Not Provided";

      const productNameVal = aiData?.product_name || displayResult.complaint.product_name || "";
      const productStrengthVal = aiData?.strength || "Not Provided";
      const dosageFormVal = aiData?.dosage_form || "Not Provided";
      const batchNumberVal = aiData?.batch_number || displayResult.complaint.batch_number || "";
      const mfgDateVal = aiData?.manufacturing_date || "Not Provided";
      const expDateVal = aiData?.expiry_date || "Not Provided";
      const affectedQtyVal = aiData?.quantity_affected || "Not Provided";

      const complaintCategoryVal = aiData?.complaint_category || "Not Provided";
      const requestedActionVal = aiData?.requested_action || "Not Provided";

      // Calculate Complaint Date
      let dateVal = aiData?.complaint_date || displayResult.complaint.complaint_date;
      if ((!dateVal || dateVal === "Not Provided") && displayResult.complaint.created_at) {
        dateVal = new Date(displayResult.complaint.created_at).toLocaleDateString();
      }
      if (!dateVal) {
        dateVal = "Not Provided";
      }

      const severityVal = aiData?.severity || displayResult.complaint.severity || "Medium";

      // Calculate QA Priority
      let priorityVal = aiData?.priority || "Medium";
      if (!aiData?.priority || aiData.priority === "Not Provided") {
        if (severityVal === "Critical" || severityVal === "High") {
          priorityVal = "High";
        } else if (severityVal === "Low") {
          priorityVal = "Low";
        }
      }

      // Calculate AI Summary (Enforce 3-4 sentences max)
      let summaryVal = aiData?.ai_summary;
      if (!summaryVal || summaryVal === "Not Provided") {
        const text = aiData?.complaint_description || displayResult.complaint.complaint_text;
        if (text) {
          const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
          summaryVal = sentences.length <= 3 ? text.trim() : sentences.slice(0, 3).join("").trim();
        } else {
          summaryVal = "Not Provided";
        }
      } else {
        const sentences = summaryVal.match(/[^.!?]+[.!?]+(\s|$)/g) || [summaryVal];
        if (sentences.length > 4) {
          summaryVal = sentences.slice(0, 4).join("").trim();
        }
      }

      // Calculate Overall Confidence Percentage
      let confidenceVal = "Not Provided";
      if (aiData?.confidence !== undefined && aiData.confidence !== "Not Provided") {
        const confNum = Number(aiData.confidence);
        confidenceVal = confNum <= 1.0 ? `${Math.round(confNum * 100)}%` : `${Math.round(confNum)}%`;
      }

      const extractedData = {
        complaintSource: complaintSourceVal,
        customerName: customerNameVal,
        customerOrganization: customerOrganizationVal,
        customerContact: customerContactVal,
        productName: productNameVal,
        productStrength: productStrengthVal,
        dosageForm: dosageFormVal,
        batchNumber: batchNumberVal,
        mfgDate: mfgDateVal,
        expDate: expDateVal,
        affectedQty: affectedQtyVal,
        complaintCategory: complaintCategoryVal,
        complaintDate: dateVal,
        complaintDescription: aiData?.complaint_description || displayResult.complaint.complaint_text || "",
        requestedAction: requestedActionVal,
        severity: severityVal,
        suggestedAction: "Not Provided",
        initialRisk: "Not Provided",
        aiRiskLevel: aiData?.risk_level || severityVal,
        priority: priorityVal,
        aiComplaintSummary: summaryVal,
        aiConfidence: confidenceVal,
      };

      setInitialData(extractedData);
      setFormValues(extractedData);
      setModifiedFields({});
      setHighlightedFields({});
    } else if (workspaceStatus === "idle") {
      setFormValues({
        complaintSource: "Not Provided",
        customerName: "",
        customerOrganization: "Not Provided",
        customerContact: "Not Provided",
        productName: "",
        productStrength: "Not Provided",
        dosageForm: "Not Provided",
        batchNumber: "",
        mfgDate: "Not Provided",
        expDate: "Not Provided",
        affectedQty: "Not Provided",
        complaintCategory: "Not Provided",
        complaintDate: "Not Provided",
        complaintDescription: "",
        requestedAction: "Not Provided",
        severity: "Medium",
        suggestedAction: "Not Provided",
        initialRisk: "Not Provided",
        aiRiskLevel: "Not Provided",
        priority: "Not Provided",
        aiComplaintSummary: "Not Provided",
        aiConfidence: "Not Provided",
      });
      setInitialData(null);
      setModifiedFields({});
      setHighlightedFields({});
    }
  }, [workspaceStatus, displayResult]);

  // Floating toast triggers
  const triggerToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleFileSelected = (file) => {
    uploadFile(file, triggerToast);
  };

  const handleTextSelected = (text) => {
    uploadText(text, triggerToast);
  };

  // Form value manual editing change handler
  const handleFormFieldChange = (field, value) => {
    setFormValues((prev) => {
      const next = { ...prev, [field]: value };

      if (initialData) {
        const isFieldModified = next[field] !== initialData[field];
        setModifiedFields((prevMod) => {
          const updated = { ...prevMod };
          if (isFieldModified) {
            updated[field] = true;
          } else {
            delete updated[field];
          }

          const hasModifications = Object.keys(updated).length > 0;
          setWorkspaceStatus(hasModifications ? "modified" : "success");
          return updated;
        });
      }
      return next;
    });
  };

  // Chat corrections trigger
  const handleAssistantCorrection = (field, label, value) => {
    handleFormFieldChange(field, value);

    // Briefly flash field input highlights
    setHighlightedFields((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setHighlightedFields((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }, 2000);
  };

  const handleCommitClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleCommitConfirm = async () => {
    setIsConfirmationOpen(false);
    setIsCommitting(true);

    try {
      const complaintId = displayResult?.complaint?.id;
      if (!complaintId) {
        throw new Error("Missing complaint database record ID.");
      }

      // Collect only modified fields mapping back to postgresql table schema
      const payload = {};
      const fieldMap = {
        productName: "product_name",
        batchNumber: "batch_number",
        customerName: "complainant_name",
        complaintDescription: "complaint_text",
        severity: "severity",
        productStrength: "product_strength",
        customerOrganization: "customer_organization",
        customerContact: "customer_contact",
        complaintSource: "complaint_source",
        dosageForm: "dosage_form",
        mfgDate: "manufacturing_date",
        expDate: "expiry_date",
        affectedQty: "quantity_affected",
        complaintCategory: "complaint_category",
        complaintDate: "complaint_date",
        requestedAction: "requested_action",
        aiRiskLevel: "ai_risk_level",
        priority: "priority",
        aiComplaintSummary: "ai_summary",
      };

      Object.keys(modifiedFields).forEach((field) => {
        const backendField = fieldMap[field];
        if (backendField) {
          payload[backendField] = formValues[field];
        }
      });

      // Submit PATCH update request to persist edits
      await complaintApi.updateComplaint(complaintId, payload);

      const displayId = displayResult?.complaint?.complaint_id || "CMP-Record";
      triggerToast(
        `Verification complete! Case ${displayId} successfully committed to QMS Ledger.`,
        "success"
      );
      resetUpload();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || "Failed to commit complaint update to QMS.", "error");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReset = () => {
    resetUpload();
  };

  return (
    <PageContainer
      title="AI Complaint Intake Workspace"
      description="Process and triage adverse events and product quality reports using real-time AI parsing and semantic duplicate validation."
    >
      {/* Two-panel Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-170px)] min-h-[500px]">
        {/* Left Panel: Ingestion Ledger Form */}
        <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
          <WorkspaceForm
            status={workspaceStatus}
            formValues={formValues}
            onChange={handleFormFieldChange}
            modifiedFields={modifiedFields}
            highlightedFields={highlightedFields}
            onCommit={handleCommitClick}
            isCommitting={isCommitting}
            uploadResult={displayResult}
          />
        </div>

        {/* Right Panel: QA AI Copilot Chat & Ingestion Logs */}
        <div className="lg:col-span-4 h-full flex flex-col overflow-hidden">
          <WorkspaceCopilot
            status={workspaceStatus}
            error={error}
            result={displayResult}
            onFileSelected={handleFileSelected}
            onTextSelected={handleTextSelected}
            isProcessing={workspaceStatus === "loading" || isProcessing}
            onCorrection={handleAssistantCorrection}
            onReset={handleReset}
            progress={extractionProgress}
            progressText={extractionText}
            complaintText={formValues.complaintDescription}
          />
        </div>
      </div>

      {/* Commit Confirmation Dialog */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 mx-4">
            <div className="flex items-center gap-3 text-primary mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold text-gray-900">Commit to QMS Ledger?</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              You are about to write this triaged quality record to the persistent compliance database. Once committed, the record is locked in the system audit trail.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4 text-xs space-y-1 font-semibold text-gray-700">
              <div>
                <span className="text-gray-400 font-bold">ID:</span>{" "}
                {displayResult?.complaint?.complaint_id || "Generating..."}
              </div>
              <div>
                <span className="text-gray-400 font-bold">Product:</span> {formValues.productName}
              </div>
              <div>
                <span className="text-gray-400 font-bold">Severity:</span> {formValues.severity}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsConfirmationOpen(false)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitConfirm}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors cursor-pointer"
              >
                Commit
              </button>
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
                : toast.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : toast.type === "warning"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-sky-50 text-sky-855 border-sky-200"
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

export default Complaint;
