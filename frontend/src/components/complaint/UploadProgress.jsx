import React from "react";
import Loader from "../common/Loader";

/**
 * UploadProgress component displays a loading spinner and generic text
 * during AI document processing.
 */
const UploadProgress = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
      <div className="mb-4">
        <Loader size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Processing complaint...</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mt-2 leading-relaxed">
        Our AI pipeline is parsing the document text, classifying its contents, extracting product metrics, and analyzing potential duplicates. This may take up to 30 seconds.
      </p>
    </div>
  );
};

export default UploadProgress;
