'use client';

import { VscChromeClose } from 'react-icons/vsc';

const Modal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900 opacity-80" />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-2/3 bg-slate-800 border-2 border-slate-600 py-4 px-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{title}</span>
            <button className="text-gray-500 hover:text-red-500" onClick={onClose}>
              <VscChromeClose />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
