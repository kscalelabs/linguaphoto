// src/components/LoadingMask.tsx
import React from 'react';
import { useLoading } from 'contexts/LoadingContext';

const LoadingMask: React.FC = () => {
    const { loading } = useLoading();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="spinner-border text-white" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default LoadingMask;
