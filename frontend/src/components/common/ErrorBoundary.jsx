import React, { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "src/components/common/Button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Global tracking or metrics integrations can hook in here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-3 bg-red-50 rounded-full text-red-500 inline-flex mb-4">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              An unexpected error occurred in the application rendering. Please reload the page or return to the main dashboard.
            </p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={this.handleReset}>
                Return to Complaint Intake
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
