import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ClipboardList,
  Cpu,
  Layers,
  Activity,
  LayoutDashboard,
  Shield,
  FileCode2,
  Server,
  Database,
  ArrowRight,
} from "lucide-react";
import { ROUTES } from "src/utils/constants/routes";
import Card from "src/components/common/Card";

/**
 * Home component represents the standalone public-facing landing page
 * for PharmacoGuard AI-Powered QMS. It is outside the MainLayout.
 */
const Home = () => {
  const featuresRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      title: "AI Complaint Intake",
      description: "Automatically process complaint emails, PDFs and scanned forms using Groq LLM pipelines.",
      icon: ClipboardList,
      color: "bg-sky-50 text-primary",
    },
    {
      title: "AI Entity Extraction",
      description: "Extract product information, batch codes, complainant names, and text narratives dynamically.",
      icon: Cpu,
      color: "bg-emerald-50 text-emerald-650",
    },
    {
      title: "Duplicate Detection",
      description: "Identify similar historic QA complaints automatically in PostgreSQL database using semantic embedding scores.",
      icon: Layers,
      color: "bg-indigo-50 text-indigo-655",
    },
    {
      title: "Risk Classification",
      description: "AI-generated severity levels and triage priority suggestions mapped instantly to the QMS ingestion ledger.",
      icon: Activity,
      color: "bg-rose-50 text-rose-655",
    },
    {
      title: "Quality Dashboard",
      description: "Real-time complaint analytics, metrics search filters, and status distribution summaries.",
      icon: LayoutDashboard,
      color: "bg-amber-50 text-amber-655",
    },
    {
      title: "Regulatory Compliance",
      description: "Support pharmaceutical QA workflows, verified human sign-offs, and compliance audit trail ledgers.",
      icon: Shield,
      color: "bg-purple-50 text-purple-650",
    },
  ];

  const workflow = [
    { step: "1", title: "Complaint Received", desc: "Customer report uploaded" },
    { step: "2", title: "AI Processing", desc: "Groq LLM parsing pipeline" },
    { step: "3", title: "Information Extraction", desc: "Attributes parsed to QMS form" },
    { step: "4", title: "Duplicate Detection", desc: "Verifies matching histories" },
    { step: "5", title: "QA Review", desc: "Officer reviews triage ledgers" },
    { step: "6", title: "Investigation", desc: "Audit trail record created" },
    { step: "7", title: "Resolution", desc: "Status committed as Reviewed" },
  ];

  const technologies = [
    { name: "React", desc: "Frontend Interface", icon: FileCode2 },
    { name: "FastAPI", desc: "REST backend APIs", icon: Server },
    { name: "LangGraph", desc: "Agent workflow graphs", icon: Cpu },
    { name: "Groq LLM", desc: "Model classification", icon: ShieldCheck },
    { name: "PostgreSQL", desc: "Complaints persistence", icon: Database },
    { name: "TailwindCSS", desc: "Premium styling tokens", icon: FileCode2 },
  ];

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 15% 25%, rgba(59,130,246,0.18), transparent 35%),
          radial-gradient(circle at 85% 20%, rgba(6,182,212,0.12), transparent 30%),
          radial-gradient(circle at 70% 80%, rgba(99,102,241,0.08), transparent 30%),
          linear-gradient(180deg, #ffffff 0%, #f8fbff 45%, #ffffff 100%)
        `,
      }}
    >
      {/* Huge blurred glow behind title */}
      <div className="absolute top-[20%] left-[10%] w-[45%] h-[45%] bg-blue-500/10 rounded-full filter blur-[130px] pointer-events-none z-0 animate-pulse-slow" />

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation Bar */}
      <header className="w-full border-b border-gray-200/50 bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-primary border border-sky-100 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight leading-none sm:text-lg">
              PharmacoGuard
            </h1>
            <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">
              AI-Powered Quality Management
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 w-full relative z-10">
        <div className="lg:col-span-6 space-y-6 text-left relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-primary border border-sky-100">
            <ShieldCheck className="h-3.5 w-3.5" /> PharmacoGuard Compliance
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            AI-Powered Pharmaceutical <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
              Quality Management System
            </span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-xl font-medium">
            Streamline pharmaceutical complaint management using AI-powered document extraction, duplicate detection, risk assessment, and quality investigation workflows.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-sky-600 hover:from-primary-dark hover:to-sky-750 shadow-md hover:shadow-[0_0_20px_rgba(2,132,199,0.4)] rounded-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 gap-2"
            >
              Launch Application <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-gray-650 bg-white/50 backdrop-blur-md border border-gray-200/50 hover:border-primary rounded-xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            >
              View Features
            </button>
          </div>
        </div>

        {/* Hero Illustration - Floating Glass Panels */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4 max-w-lg mx-auto w-full relative z-10">
          <div className="space-y-4 mt-8">
            <div
              className="p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-[6px] transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                transitionDuration: "250ms",
              }}
            >
              <div className="p-2 rounded-lg bg-sky-50 text-primary w-fit">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase mt-1">Complaint Intake</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">PDF/DOCX extraction workflow</p>
            </div>
            <div
              className="p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-[6px] transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                transitionDuration: "250ms",
              }}
            >
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 w-fit">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase mt-1">Duplicate Detection</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Verifies historic database cases</p>
            </div>
            <div
              className="p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-[6px] transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                transitionDuration: "250ms",
              }}
            >
              <div className="p-2 rounded-lg bg-amber-50 text-amber-655 w-fit">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase mt-1">Compliance Dashboard</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">PostgreSQL analytics & triage logs</p>
            </div>
          </div>
          <div className="space-y-4">
            <div
              className="p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-[6px] transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                transitionDuration: "250ms",
              }}
            >
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-650 w-fit">
                <Cpu className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase mt-1">AI Entity Extraction</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Attribute classification ledger</p>
            </div>
            <div
              className="p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-[6px] transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                transitionDuration: "250ms",
              }}
            >
              <div className="p-2 rounded-lg bg-rose-50 text-rose-650 w-fit">
                <Activity className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase mt-1">Risk Assessment</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Critical/High severity priority metrics</p>
            </div>
            <div
              className="p-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-[6px] transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                transitionDuration: "250ms",
              }}
            >
              <div className="p-2 rounded-lg bg-purple-50 text-purple-650 w-fit">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase mt-1">QA Investigation</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Sign-off audit tracking logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white border-t border-gray-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12 w-full">
          <div className="space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Capabilities</span>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">PharmacoGuard Features</h3>
            <p className="text-sm text-gray-500 max-w-xl mx-auto font-semibold leading-relaxed">
              Standardizing pharmaceutical quality operations under an automated and secure review dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="text-left p-6 hover:shadow-md transition-shadow">
                  <div className={`p-3 rounded-xl w-fit ${feat.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{feat.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-semibold">{feat.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-gray-50/50 border-t border-gray-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12 w-full">
          <div className="space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Process</span>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Compliance Intake Workflow</h3>
            <p className="text-sm text-gray-500 max-w-xl mx-auto font-semibold leading-relaxed">
              From ingestion triggers to persistent compliance ledgers, PharmacoGuard automates QA workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 text-left">
            {workflow.map((item) => (
              <div key={item.step} className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-3 relative hover:scale-[1.02] transition-transform duration-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-primary border border-sky-100 text-sm font-black">
                  {item.step}
                </span>
                <div>
                  <h5 className="text-xs font-bold text-gray-800 uppercase tracking-tight leading-none">{item.title}</h5>
                  <p className="text-[10px] text-gray-400 mt-2 font-semibold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white border-t border-gray-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12 w-full">
          <div className="space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Architecture</span>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Modern Technology Stack</h3>
            <p className="text-sm text-gray-500 max-w-xl mx-auto font-semibold leading-relaxed">
              Enterprise-grade tech stack configured for speed, reliability, and security.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.name} className="flex flex-col items-center bg-gray-50 p-6 rounded-xl border border-gray-150 shadow-2xs hover:bg-gray-100/50 transition-colors">
                  <div className="p-3 bg-white rounded-xl text-primary border border-gray-100 shadow-3xs mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-805">{tech.name}</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold text-center leading-tight">{tech.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About / Footer Section */}
      <footer className="bg-gray-950 text-white py-16 border-t border-gray-800 w-full mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-base font-extrabold tracking-tight">PharmacoGuard</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-semibold">
              Enterprise AI-powered Pharmaceutical Quality Management System. Streamlining QA review workflows for pharmaceutical manufacturers.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3 text-xs">
            <h5 className="font-extrabold uppercase text-gray-400 tracking-wider">Resources</h5>
            <ul className="space-y-2 font-semibold">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <span className="text-gray-400 font-bold">Version:</span> 1.0.0
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3 text-xs">
            <h5 className="font-extrabold uppercase text-gray-400 tracking-wider">Contact & Copy</h5>
            <ul className="space-y-2 font-semibold text-gray-400">
              <li>© 2026 PharmacoGuard Systems Inc.</li>
              <li>All Rights Reserved. Compliance operations validated.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
