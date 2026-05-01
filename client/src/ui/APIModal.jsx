import { Check, Copy, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const APIModal = ({ plainTextAPI, showAPIModal }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Extract API key safely
  const apiKey = plainTextAPI?.split("waba_")[1] ?? plainTextAPI;

  const handleCopy = useCallback(async () => {
    if (!apiKey) return;
    
    try {
      await navigator.clipboard.writeText(apiKey);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy API key:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
    }
  }, [apiKey]);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => showAPIModal(false), 200);
  }, [showAPIModal]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        className={`relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-lg">
              <svg 
                className="w-5 h-5 text-amber-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                />
              </svg>
            </div>
            <div>
              <h2 
                id="modal-title" 
                className="text-lg font-semibold text-gray-900"
              >
                Save your API Key
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div 
            id="modal-description" 
            className="flex items-start gap-3 p-4 mb-5 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <svg 
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p className="text-sm text-amber-800 leading-relaxed">
              Make sure to copy and save your API key securely. You won't be able to see it again once you close this dialog!
            </p>
          </div>

          {/* API Key Input */}
          <div className="relative group">
            <label 
              htmlFor="api-key" 
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Your API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type="text"
                value={plainTextAPI}
                readOnly
                className="w-full pr-14 pl-4 py-3 text-sm font-mono text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isCopied
                    ? "bg-green-100 text-green-700 focus:ring-green-500"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:ring-gray-400"
                }`}
                aria-label={isCopied ? "Copied!" : "Copy API key"}
                title={isCopied ? "Copied!" : "Copy to clipboard"}
              >
                {isCopied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {isCopied && (
              <p className="mt-2 text-sm text-green-600 font-medium animate-pulse">
                Copied to clipboard!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:flex-1 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm transition-all active:scale-[0.98]"
          >
            I have saved my API key
          </button>
        </div>
      </div>
    </div>
  );
};

export default APIModal;