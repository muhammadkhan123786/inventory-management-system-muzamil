import React from "react";

interface FormActionsProps {
  onBack: () => void;
  isSubmitting: boolean;
  editData: any;
}

const FormActions: React.FC<FormActionsProps> = ({
  onBack,
  isSubmitting,
  editData,
}) => {
  return (
    <div className="self-stretch h-20 pr-6 pt-6 bg-white rounded-2xl shadow-lg shadow-black/5 flex justify-end items-start gap-4 mt-8 pb-10">
      <button
        type="button"
        onClick={onBack}
        className="w-20 h-9 px-4 py-2 bg-slate-50 rounded-[10px] outline-1 outline-indigo-600/10 hover:bg-[#10b981] hover:text-white transition-all text-center text-indigo-950 text-sm font-medium font-sans leading-5"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-w-28 h-9 px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 rounded-[10px] hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98] flex justify-center items-center gap-2 shadow-md shadow-indigo-200"
      >
        <span className="text-center text-white text-sm font-normal font-sans leading-5">
          {isSubmitting
            ? "Processing..."
            : editData
              ? "Update Supplier"
              : "Add Supplier"}
        </span>
      </button>
    </div>
  );
};

export default FormActions;
