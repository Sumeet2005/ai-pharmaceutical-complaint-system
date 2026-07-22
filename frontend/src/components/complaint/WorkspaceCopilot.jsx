import React, { useState, useEffect, useRef } from "react";
import { Bot, Cpu, Paperclip, ArrowUp, RefreshCw } from "lucide-react";
import Loader from "../common/Loader";
import { parseNaturalLanguageCorrection } from "../../utils/conversationalParser";
import { uploadApi } from "../../api/uploadApi";

/**
 * WorkspaceCopilot renders the Right Panel of the AI Complaint intake workspace.
 * Uses a single modern input bar for file attachments, pasted text, and Q&A chat.
 */
const WorkspaceCopilot = ({
  status,
  error,
  result,
  onFileSelected,
  onTextSelected,
  isProcessing,
  onCorrection,
  onReset,
  progress = 0,
  progressText = "",
  complaintText = "",
}) => {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isAiThinking]);

  // Synchronize backend pipeline status with the chat log when transitioning
  useEffect(() => {
    if (status === "success" && result) {
      setChatLog([
        {
          id: `welcome`,
          sender: "ai",
          text: `Welcome to QA AI Copilot. I've successfully completed extraction for product '${
            result?.complaint?.product_name || "Unknown Product"
          }' (Batch: ${
            result?.complaint?.batch_number || "Unknown Batch"
          }). All QMS fields are loaded on the left. You can ask me questions about this complaint or enter corrections.`,
          type: "success",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else if (status === "duplicate" && result) {
      const matchId = result?.existing?.complaint_id || "Unknown ID";
      const similarityPercent = Math.round((result?.similarity || 0) * 100);
      setChatLog([
        {
          id: `welcome-dup`,
          sender: "ai",
          text: `⚠️ Potential Duplicate Complaint

Matched Complaint:
${matchId}

Similarity:
${similarityPercent}%

Matched Because:
✓ Same Product
✓ Same Batch
✓ Similar Complaint Category
✓ Description Similarity

The extracted complaint has already been populated into the ledger.
Please review the information before committing.`,
          type: "warning",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else if (status === "rejected" && result) {
      setChatLog([
        {
          id: `welcome-reject`,
          sender: "ai",
          text: `❌ Document Rejected. AI QA Classifier classified the document as NOT a pharmaceutical complaint. Reason: ${result?.reason || "Not provided"}. Click Reset to ingest a new file.`,
          type: "error",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else if (status === "error" && error) {
      setChatLog([
        {
          id: `welcome-error`,
          sender: "ai",
          text: `🚨 System Failure. Pipeline failed during execution. Reason: ${error?.message || "Internal error"}. Click Reset to try again.`,
          type: "error",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else if (status === "idle") {
      setChatLog([]);
    }
  }, [status, error, result]);

  // Click file picker helper
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  const isLongText = (text) => {
    // Detect complete complaint paste (long text or contains newlines)
    return text.length > 120 || text.split("\n").length > 1;
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const input = inputText;
    setInputText("");

    // A. Idle state: Ingestion check
    if (status === "idle") {
      if (isLongText(input)) {
        // Mode B: Paste Complaint Ingestion
        setChatLog([
          {
            id: `sys-pasted-${Date.now()}`,
            sender: "ai",
            text: "Pasted text detected. Initializing AI Ingestion and structured mapping...",
            type: "info",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        if (onTextSelected) {
          onTextSelected(input);
        }
      } else {
        // Short text in idle state
        setChatLog([
          {
            id: `user-err-${Date.now()}`,
            sender: "user",
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          {
            id: `ai-err-${Date.now()}`,
            sender: "ai",
            text: "Please attach a document (PDF, DOCX, TXT, EML) using the paperclip icon or paste the full complaint narrative text to begin QMS ingestion.",
            type: "error",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
      return;
    }

    // B. Chat Active state: standard corrections or Q&A
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatLog((prev) => [...prev, userMsg]);

    // Mode C1: Check if input matches correction patterns
    const correction = parseNaturalLanguageCorrection(input);

    if (correction) {
      if (onCorrection) {
        onCorrection(correction.field, correction.label, correction.value);
      }
      const confirmationText = correction.value
        ? `✓ ${correction.label} updated to ${correction.value}.`
        : `✓ ${correction.label} updated.`;

      setChatLog((prev) => [
        ...prev,
        {
          id: `ai-correction-${Date.now()}`,
          sender: "ai",
          text: confirmationText,
          type: "success",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      // Mode C2: Conversational QA mode
      setIsAiThinking(true);
      try {
        const payload = complaintText || "No complaint text provided.";
        const chatRes = await uploadApi.chatAssistant(payload, input);

        setChatLog((prev) => [
          ...prev,
          {
            id: `ai-reply-${Date.now()}`,
            sender: "ai",
            text: chatRes.answer || "No response received.",
            type: "info",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } catch (err) {
        setChatLog((prev) => [
          ...prev,
          {
            id: `ai-error-${Date.now()}`,
            sender: "ai",
            text: `Failed to retrieve answer: ${err.message || "Server error occurred."}`,
            type: "error",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  const isIdle = status === "idle";
  const isLoading = status === "loading";
  const isChatActive =
    status === "success" ||
    status === "duplicate" ||
    status === "modified" ||
    status === "rejected" ||
    status === "error";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-55">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 text-primary rounded-lg border border-sky-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">QA AI Copilot</h3>
            <p className="text-xs text-gray-500 font-medium">Conversational quality assistant and ingestion logs.</p>
          </div>
        </div>
        {isChatActive && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-650 hover:text-primary hover:bg-sky-50 border border-gray-250 hover:border-sky-200 rounded-lg transition-all cursor-pointer focus:outline-none bg-white shadow-2xs"
          >
            <RefreshCw className="h-3 w-3 shrink-0" /> Reset Chat
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/40 flex flex-col">
        {/* 1. LOADING VIEW: Extraction Progress Bar */}
        {isLoading && (
          <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full space-y-6 animate-fade-in">
            <div className="w-full text-center space-y-3">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Extraction Progress</h4>

              {/* Progress track */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-150 shadow-2xs">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold px-1 uppercase tracking-wider">
                <span>{progressText}</span>
                <span className="text-primary font-black">{progress}%</span>
              </div>
            </div>

            {/* Checklist status items */}
            <div className="w-full bg-white p-5 rounded-xl border border-gray-150 shadow-xs text-xs font-bold text-gray-400 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${progress >= 45 ? "bg-emerald-500" : "bg-gray-250"} shrink-0`} />
                <span className={progress >= 45 ? "text-gray-800" : ""}>Analyzing document...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${progress >= 65 ? "bg-emerald-500" : "bg-gray-250"} shrink-0`} />
                <span className={progress >= 65 ? "text-gray-800" : ""}>Extracting Customer Information...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${progress >= 80 ? "bg-emerald-500" : "bg-gray-250"} shrink-0`} />
                <span className={progress >= 80 ? "text-gray-800" : ""}>Extracting Product Details...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${progress >= 92 ? "bg-emerald-500" : "bg-gray-250"} shrink-0`} />
                <span className={progress >= 92 ? "text-gray-800" : ""}>Generating AI Summary...</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. IDLE WELCOME VIEW */}
        {isIdle && chatLog.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 pb-20 space-y-4 max-w-sm mx-auto animate-fade-in">
            <div className="h-16 w-16 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-primary shadow-sm mb-2 animate-bounce-slow">
              <Bot className="h-8 w-8" />
            </div>
            <h4 className="text-base font-black text-gray-800 uppercase tracking-wider">QA Ingestion Copilot</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Attach a complaint document (PDF, DOCX, TXT, EML) using the paperclip icon, or paste the narrative text directly below to begin automated QMS ingestion.
            </p>
          </div>
        )}

        {/* 3. CONVERSATION LOGS (Rendered when chat is active or user interacts in idle) */}
        {!isLoading && (chatLog.length > 0 || isChatActive) && (
          <div className="flex-1 space-y-3 pr-1">
            {chatLog.map((msg) => {
              const isAI = msg.sender === "ai";
              return (
                <div key={msg.id} className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"} animate-fade-in`}>
                  <div
                    className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      isAI ? "bg-sky-100 text-primary border border-sky-200" : "bg-gray-250 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {isAI ? <Cpu className="h-4 w-4" /> : "QA"}
                  </div>
                  <div
                    className={`max-w-[80%] py-2 px-3.5 rounded-xl border text-sm shadow-sm leading-relaxed ${
                      isAI
                        ? msg.type === "success"
                          ? "bg-emerald-50/80 border-emerald-150 text-emerald-950 font-medium"
                          : msg.type === "warning"
                          ? "bg-amber-50/85 border-amber-150 text-amber-950 font-medium"
                          : msg.type === "error"
                          ? "bg-rose-50/80 border-rose-155 text-rose-955 font-medium"
                          : "bg-white border-gray-200 text-gray-800 font-medium"
                        : "bg-primary text-white border-primary font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right font-black uppercase tracking-wider ${
                        isAI ? "text-gray-400" : "text-sky-150"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isAiThinking && (
              <div className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-sky-100 text-primary border border-sky-200">
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="py-2 px-3.5 rounded-xl border border-gray-250 bg-white text-sm shadow-sm flex items-center gap-2 text-gray-500 font-bold">
                  <Loader size="xs" /> QA AI Copilot is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ChatGPT-style Single Input bar */}
      <form onSubmit={handleSendText} className="p-6 pt-2 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl px-3 h-14 bg-gray-50/30 transition-all">
          {/* File Picker attachment button */}
          <button
            type="button"
            onClick={onButtonClick}
            disabled={isProcessing || isAiThinking}
            className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:text-gray-650 focus:outline-none cursor-pointer disabled:opacity-50 hover:bg-gray-100/70 transition-colors shrink-0"
            title="Attach document (PDF, DOCX, TXT, EML)"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.msg,.txt,.eml"
            onChange={handleFileChange}
            disabled={isProcessing || isAiThinking}
          />

          {/* Prompt inputs */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or paste a complaint..."
            className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-sm disabled:opacity-50 font-semibold h-full py-0 text-gray-700"
            disabled={isProcessing || isAiThinking}
          />

          {/* Send buttons */}
          <button
            type="submit"
            disabled={isProcessing || isAiThinking || !inputText.trim()}
            className="flex items-center justify-center h-9 w-9 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceCopilot;
