'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col p-0 z-10 overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.2)]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-panel-border flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 flex-1 pr-4 truncate">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-warning transition-colors focus:outline-none p-1"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-panel-border bg-slate-900/50 flex justify-end">
          <button onClick={onClose} className="btn-primary px-6">
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
