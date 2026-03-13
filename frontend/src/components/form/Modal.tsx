"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import { Variants } from "framer-motion";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  desicripation?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const AnimatedModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  desicripation,
  maxWidth = "max-w-lg",
}: AnimatedModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden overflow-y-auto"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} h-[600px] bg-[#F8F9FF] rounded-[2rem] shadow-2xl relative overflow-hidden overflow-y-auto p-5`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon Display */}
                {icon && <div className="">{icon}</div>}
                
                {/* Title */}
                {title && (
                  <h2 className="text-[22px] font-bold text-slate-800">
                    {title}
                  </h2>
                )}
                
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors  rounded-lg p-1.5 mb-6"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {
                  desicripation && (
                     <p className="text-[12px]  text-slate-800 mt-1">
                    {desicripation}
                  </p>
                  )
                }

            {/* Body */}
            <div className="mt-4 bg-[#F8F9FF]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;