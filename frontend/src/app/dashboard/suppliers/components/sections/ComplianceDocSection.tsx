import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { ShieldCheck, Upload, Trash2, Plus } from "lucide-react";

interface ComplianceDocSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  documents: any[];
  addDocument: () => void;
  removeDocument: (id: number) => void;
  handleTriggerUpload: (id: number) => void;
  handleFileChange: (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handlePreviewDocument: (doc: any) => void;
  getDocumentDisplay: (doc: any) => string;
  fileInputRefs: any;
}

const ComplianceDocSection: React.FC<ComplianceDocSectionProps> = ({
  formData,
  handleChange,
  documents,
  addDocument,
  removeDocument,
  handleTriggerUpload,
  handleFileChange,
  handlePreviewDocument,
  getDocumentDisplay,
  fileInputRefs,
}) => {
  return (
    <FormSection
      number={8}
      title="Compliance & Documentation"
      icon={ShieldCheck}
      theme="teal"
      headerClassName="bg-linear-to-r from-teal-50 to-green-50"
      iconClassName="text-teal-600"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl border border-slate-200 shadow-sm ${doc.file || doc.existingUrl ? "bg-teal-500 text-white" : "bg-white text-teal-600"}`}
                  >
                    <Upload size={20} />
                  </div>
                  <div>
                    <label className="field-label ml-0!">
                      {index === 0
                        ? "Business Registration Certificate"
                        : `Additional Document ${index + 1}`}
                    </label>
                    <p className="text-[12px] text-slate-500 font-medium truncate max-w-[250px]">
                      {getDocumentDisplay(doc)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    className="hidden"
                    ref={(el) => {
                      fileInputRefs.current[doc.id] = el;
                    }}
                    onChange={(e) => handleFileChange(doc.id, e)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {(doc.file || doc.existingUrl) && (
                    <button
                      type="button"
                      onClick={() => handlePreviewDocument(doc)}
                      className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-100 shadow-sm"
                    >
                      Preview
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload(doc.id)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    {doc.file || doc.existingUrl
                      ? "Change File"
                      : "Choose File"}
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="p-2.5 bg-rose-50 rounded-lg hover:bg-rose-100 text-rose-500 border border-rose-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addDocument}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-teal-600 bg-white rounded-xl hover:bg-teal-50 border border-dashed border-teal-200 w-full justify-center mt-2"
          >
            <Plus size={16} /> Add Another Document Requirement
          </button>
        </div>
        <div className="h-px bg-slate-100 w-full my-4" />
        <FormField
          label="Insurance Details"
          name="insuranceDetails"
          type="textarea"
          value={formData.insuranceDetails}
          onChange={handleChange}
          placeholder="Public Liability,Professional Indemnity, etc."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <FormField
            label="Insurance Expiry Date"
            name="insuranceExpiryDate"
            type="date"
            value={formData.insuranceExpiryDate}
            onChange={handleChange}
          />
          <div className="space-y-3">
            <label className="field-label">Health & Safety Compliance</label>
            <div className="flex items-center gap-8 h-[50px]">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="hsCompliance"
                    value={opt}
                    checked={formData.hsCompliance === opt}
                    onChange={handleChange}
                    className="w-4 h-4 accent-teal-600"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-teal-700 transition-colors">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <FormField
          label="Quality Certifications (ISO, etc.)"
          name="qualityCertifications"
          value={formData.qualityCertifications}
          onChange={handleChange}
        />
      </div>
    </FormSection>
  );
};

export default ComplianceDocSection;
