import React from "react";

interface DocumentPreviewModalProps {
  previewUrl: string;
  previewType: "image" | "pdf";
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  previewUrl,
  previewType,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Document Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          {previewType === "image" ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={previewUrl}
                alt="Document Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <iframe
              src={previewUrl}
              className="w-full h-full rounded-lg"
              title="PDF Preview"
            />
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-slate-200 gap-3">
          <a
            href={previewUrl}
            download
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
