// src/components/LoadingMask.tsx
import { useLoading } from "contexts/LoadingContext";
import React from "react";
import { FaFan } from "react-icons/fa"; // Import fan icon

const LoadingMask: React.FC = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/30 z-50">
      <div className="relative flex flex-col items-center">
        {/* Spinning Fan */}
        <div className="animate-spin text-primary-9">
          <FaFan size={60} />
        </div>
        <span className="text-white mt-4">请稍候...</span>{" "}
        {/* "Please wait..." in Chinese */}
      </div>
    </div>
  );
};

export default LoadingMask;
