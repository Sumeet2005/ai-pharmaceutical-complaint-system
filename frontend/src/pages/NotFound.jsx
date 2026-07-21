import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { ROUTES } from "src/utils/constants/routes";
import Button from "src/components/common/Button";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-3 bg-sky-50 text-primary rounded-full inline-flex mb-4">
          <HelpCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          The page you are looking for does not exist or has been moved to another section.
        </p>
        <div className="flex justify-center">
          <Link to={ROUTES.COMPLAINT_INTAKE}>
            <Button variant="primary">
              Go to Complaint Intake
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
