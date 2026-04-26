import React from 'react';

type StatusDialogProps = {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

const StatusDialog: React.FC<StatusDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  buttonText = 'حسناً',
  onClose,
}) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="status-dialog-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isSuccess ? '✓' : '!'}
          </div>
          <h2 id="status-dialog-title" className="text-lg font-black text-gray-800">
            {title}
          </h2>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusDialog;
