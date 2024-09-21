import React from "react";

const SubscriptionCancelPage: React.FC = () => {
  return (
    <div className="flex flex-column gap-8 justify-center items-center min-h-screen">
      <h1 className="text-3xl">
        This page is on developing. will be updated soon
      </h1>
      <div className="w-full max-w-md p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Current Plan Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Plan
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            You have been subscribed to the{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              Premium Plan
            </span>
            .
          </p>
          <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md w-full">
            Cancel Subscription
          </button>
        </div>

        {/* Billing Cycle Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Billing Cycle
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            2023.05.05 - 2023.06.05
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;