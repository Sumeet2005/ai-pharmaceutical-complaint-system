import { useState } from "react";
import { uploadApi } from "../api/uploadApi";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".msg"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const useUpload = () => {
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'duplicate' | 'rejected' | 'error'
  const [error, setError] = useState(null); // { type: string, message: string }
  const [result, setResult] = useState(null); // success payload or duplicate/rejection payload

  const validateFile = (file) => {
    if (!file) {
      return { isValid: false, message: "No file selected." };
    }

    if (file.size === 0) {
      return { isValid: false, message: "Selected file is empty." };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { isValid: false, message: "File size exceeds 10MB limit." };
    }

    const extension = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        message: "Unsupported file type. Only PDF, DOCX, and MSG files are allowed.",
      };
    }

    return { isValid: true };
  };

  const uploadFile = async (file, onToast) => {
    setStatus("loading");
    setError(null);
    setResult(null);

    // 1. Client-side validation
    const validation = validateFile(file);
    if (!validation.isValid) {
      const errPayload = { type: "validation", message: validation.message };
      setError(errPayload);
      setStatus("error");
      if (onToast) onToast(validation.message, "error");
      return false;
    }

    try {
      if (onToast) onToast("Uploading and processing document...", "info");
      const data = await uploadApi.processDocument(file);

      // 2. Handle API success response (where business rules might specify failures)
      if (data.success) {
        setStatus("success");
        setResult(data);
        if (onToast) onToast("Complaint registered successfully!", "success");
        return true;
      } else {
        // Categorize business-level failures (duplicates and non-complaints)
        if (data.message && data.message.includes("Duplicate")) {
          setStatus("duplicate");
          setResult({
            similarity: data.similarity_score,
            existing: data.existing_complaint,
            complaint: data.complaint,
            ai_extracted_data: data.ai_extracted_data,
          });
          if (onToast) onToast("Duplicate complaint detected.", "warning");
        } else if (data.message && data.message.includes("not a pharmaceutical complaint")) {
          setStatus("rejected");
          setResult({
            reason: data.reason || "The uploaded document is not a pharmaceutical product complaint.",
          });
          if (onToast) onToast("Document classified as not a complaint.", "error");
        } else {
          setStatus("error");
          const msg = data.message || "Could not process document.";
          setError({ type: "server", message: msg });
          if (onToast) onToast(msg, "error");
        }
        return false;
      }
    } catch (err) {
      // 3. Handle network, server, and timeout errors
      let errType = "server";
      let errMsg = "An unexpected error occurred during upload.";

      if (err.status === 400 || err.status === 500) {
        errType = "server";
        errMsg = err.data?.detail || err.message || "The server failed to process the document.";
      } else if (err.message && err.message.includes("timeout")) {
        errType = "timeout";
        errMsg = "The processing request timed out. AI extraction may be busy. Please try again.";
      } else if (!err.status && err.message) {
        errType = "network";
        errMsg = "Cannot connect to server. Please check your network connection and try again.";
      }

      setError({ type: errType, message: errMsg });
      setStatus("error");
      if (onToast) onToast(errMsg, "error");
      return false;
    }
  };

  const uploadText = async (text, onToast) => {
    setStatus("loading");
    setError(null);
    setResult(null);

    if (!text || !text.trim()) {
      const errPayload = { type: "validation", message: "Pasted text payload is empty." };
      setError(errPayload);
      setStatus("error");
      if (onToast) onToast("Pasted text payload is empty.", "error");
      return false;
    }

    try {
      if (onToast) onToast("Ingesting and processing text...", "info");
      const data = await uploadApi.processText(text);

      if (data.success) {
        setStatus("success");
        setResult(data);
        if (onToast) onToast("Complaint registered successfully!", "success");
        return true;
      } else {
        if (data.message && data.message.includes("Duplicate")) {
          setStatus("duplicate");
          setResult({
            similarity: data.similarity_score,
            existing: data.existing_complaint,
            complaint: data.complaint,
            ai_extracted_data: data.ai_extracted_data,
          });
          if (onToast) onToast("Duplicate complaint detected.", "warning");
        } else if (data.message && (data.message.includes("not a pharmaceutical complaint") || data.message.includes("not a complaint"))) {
          setStatus("rejected");
          setResult({
            reason: data.reason || "The pasted text is not a pharmaceutical product complaint.",
          });
          if (onToast) onToast("Text classified as not a complaint.", "error");
        } else {
          setStatus("error");
          const msg = data.message || "Could not process text.";
          setError({ type: "server", message: msg });
          if (onToast) onToast(msg, "error");
        }
        return false;
      }
    } catch (err) {
      let errType = "server";
      let errMsg = "An unexpected error occurred during text ingestion.";

      if (err.status === 400 || err.status === 500) {
        errType = "server";
        errMsg = err.data?.detail || err.message || "The server failed to process the text.";
      } else if (err.message && err.message.includes("timeout")) {
        errType = "timeout";
        errMsg = "The processing request timed out. AI extraction may be busy. Please try again.";
      } else if (!err.status && err.message) {
        errType = "network";
        errMsg = "Cannot connect to server. Please check your network connection and try again.";
      }

      setError({ type: errType, message: errMsg });
      setStatus("error");
      if (onToast) onToast(errMsg, "error");
      return false;
    }
  };

  const resetUpload = () => {
    setStatus("idle");
    setError(null);
    setResult(null);
  };

  return {
    status,
    error,
    result,
    uploadFile,
    uploadText,
    resetUpload,
    isProcessing: status === "loading",
  };
};
