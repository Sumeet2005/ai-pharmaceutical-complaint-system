import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, LayoutDashboard } from "lucide-react";
import PageContainer from "src/components/common/PageContainer";
import Card from "src/components/common/Card";
import { ROUTES } from "src/utils/constants/routes";

const Home = () => {
  const navigationItems = [
    {
      title: "Complaint Intake",
      description: "Submit and register new product quality complaints or adverse drug events.",
      path: ROUTES.COMPLAINT_INTAKE,
      icon: ClipboardList,
      color: "bg-sky-50 text-primary",
    },
    {
      title: "Dashboard Overview",
      description: "Analyze, search, and review existing complaint records and audit trails.",
      path: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      color: "bg-emerald-50 text-accent",
    },
  ];

  return (
    <PageContainer
      title="Welcome to PharmacoGuard"
      description="Select a module from the options below to manage pharmaceutical complaints and regulatory reports."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.path} className="hover:border-gray-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <Link
                    to={item.path}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    Go to module &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default Home;
