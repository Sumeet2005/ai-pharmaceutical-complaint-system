import React from "react";
import { XCircle, AlertCircle, WifiOff, Hourglass, ShieldAlert } from "lucide-react";
import Button from "../common/Button";

/**
 * ErrorCard displays user-friendly layout for different pipeline error categories,
 * including classification rejection, validation failure, timeouts, and network/server errors.
 */
const ErrorCard = ({ error, status, result, onReset }) => {
  // Check if it's a classification rejection (i.e. processed correctly, but marked as non-complaint)
  const isClassificationRejection = status === "rejected";

  const getErrorDetails = () => {
    if (isClassificationRejection) {
      return {
        title: "Document Rejected by AI QA Classifier",
        subtitle:
          "The uploaded file does not contain a valid pharmaceutical product complaint or adverse event.",
        message:
          result?.reason || "This document was classified as not related to product quality complaints.",
        icon: ShieldAlert,
        color: "bg-rose-50 border-rose-200 text-rose-800",
        iconColor: "text-rose-600 bg-rose-100",
      };
    }

    const { type, message } = error || { type: "server", message: "An unexpected error occurred." };

    switch (type) {
      case "validation":
        return {
          title: "File Validation Failed",
          subtitle: "The selected file did not meet the intake requirements.",
          message,
          icon: AlertCircle,
          color: "bg-rose-50 border-rose-200 text-rose-800",
          iconColor: "text-rose-600 bg-rose-100",
        };
      case "timeout":
        return {
          title: "Request Timed Out",
          subtitle: "The server took too long to complete the AI processing pipeline.",
          message,
          icon: Hourglass,
          color: "bg-amber-50 border-amber-200 text-amber-800",
          iconColor: "text-amber-600 bg-amber-100",
        };
      case "network":
        return {
          title: "Network Connection Error",
          subtitle: "Cannot establish a connection to the backend service.",
          message,
          icon: WifiOff,
          color: "bg-amber-50 border-amber-200 text-amber-800",
          iconColor: "text-amber-600 bg-amber-100",
        };
      default:
        return {
          title: "Processing Failure",
          subtitle: "The backend server encountered an error during document extraction.",
          message,
          icon: XCircle,
          color: "bg-rose-50 border-rose-200 text-rose-800",
          iconColor: "text-rose-600 bg-rose-100",
        };
    }
  };

  const details = getErrorDetails();
  const Icon = details.icon;

  return (
    <div
      className={`p-6 rounded-xl border ${details.color} flex flex-col md:flex-row items-start gap-4 shadow-sm`}
    >
      <div className={`p-3 rounded-full ${details.iconColor} shrink-0`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 space-y-2">
        <h3 className="text-base font-bold">{details.title}</h3>
        <p className="text-sm font-medium opacity-90">{details.subtitle}</p>
        <div className="bg-white/80 p-3 rounded-lg border border-black/5 mt-2">
          <p className="text-xs font-semibold text-gray-700 leading-relaxed font-mono">
            {details.message}
          </p>
        </div>
        <div className="pt-3 flex justify-start">
          <Button onClick={onReset} size="sm" variant="primary" className="cursor-pointer">
            Try Uploading Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
