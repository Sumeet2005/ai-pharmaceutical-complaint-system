import React from "react";
import AppRoutes from "src/routes/AppRoutes";
import ErrorBoundary from "src/components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
