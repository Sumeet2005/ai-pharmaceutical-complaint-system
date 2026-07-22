import React, { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

/**
 * UploadZone component handles file drag-and-drop and local browser file picking.
 * Provides client-side active drag-state highlights.
 */
const UploadZone = ({ onFileSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all ${
        dragActive
          ? "border-primary bg-sky-50/50 scale-[1.01]"
          : "border-gray-300 bg-white hover:border-gray-400"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.msg"
        onChange={handleChange}
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          className={`p-4 rounded-full ${
            dragActive ? "bg-sky-100 text-primary" : "bg-gray-50 text-gray-400"
          } transition-colors`}
        >
          <UploadCloud className="h-10 w-10" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700">
            Drag and drop your complaint document here, or{" "}
            <button
              type="button"
              onClick={onButtonClick}
              className="text-primary hover:text-primary-dark font-medium underline focus:outline-none cursor-pointer"
              disabled={isProcessing}
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports PDF, DOCX, and MSG files (Max size: 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
