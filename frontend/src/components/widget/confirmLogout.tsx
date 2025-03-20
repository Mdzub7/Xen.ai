import React from "react";

interface ConfirmLogoutProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmLogout: React.FC<ConfirmLogoutProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black p-6 rounded-lg shadow-lg w-96 border border-gray-700 text-white">
        <h2 className="text-lg font-semibold text-gray-200">{message}</h2>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCancel}
            className="mr-2 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogout;
