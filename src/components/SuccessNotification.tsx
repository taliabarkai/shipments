import { X } from 'lucide-react';

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
}

export default function SuccessNotification({ message, onClose }: SuccessNotificationProps) {
  return (
    <div className="bg-[#323232] text-white rounded px-6 py-3 flex items-center gap-6 shadow-lg max-w-md">
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-600 rounded transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
