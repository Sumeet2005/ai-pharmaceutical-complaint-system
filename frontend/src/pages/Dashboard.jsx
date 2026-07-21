import React from "react";
import { Search, Filter, ClipboardList } from "lucide-react";
import PageContainer from "src/components/common/PageContainer";
import Card from "src/components/common/Card";
import EmptyState from "src/components/common/EmptyState";

const Dashboard = () => {
  return (
    <PageContainer
      title="Dashboard Overview"
      description="Monitor and track all registered complaints, quality issues, and regulatory reports."
    >
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints by ID, product, batch..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              >
                <option>All Severities</option>
                <option>Critical</option>
                <option>Major</option>
                <option>Minor</option>
              </select>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            >
              <option>All Statuses</option>
              <option>Intake</option>
              <option>Under Review</option>
              <option>Pending Action</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Complaints Log" subtitle="Real-time list of all complaints requiring investigation.">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Complaint ID</th>
                <th className="px-6 py-3">Product Info</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white" />
          </table>
          
          <div className="py-12 border-t border-gray-100">
            <EmptyState
              icon={ClipboardList}
              title="No complaints registered"
              description="There are currently no active pharmaceutical complaints in the system. Use the Intake page to register a new case."
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Dashboard;
