import { FC, ReactNode } from "react";
import { X } from "react-bootstrap-icons"; // Using react-bootstrap-icons for the close button

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-80">
      {/* Modal container */}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full relative border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        {/* Close button in the top right corner */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
          onClick={onClose}
          aria-label="Close Modal"
        >
          <X size={28} /> {/* Close icon from react-bootstrap-icons */}
        </button>

        {/* Modal content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
