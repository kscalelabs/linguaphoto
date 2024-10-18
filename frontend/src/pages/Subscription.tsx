import React from "react";

const SubscriptionCancelPage: React.FC = () => {
  return (
    <div className="flex flex-col rounded-md h-full items-center justify-center bg-gray-3 p-24 gap-12">
      <h1 className="text-3xl text-gray-900">
        This page is on developing. will be updated soon
      </h1>
      <div className="w-full max-w-md p-6 border border-gray-300 bg-white rounded-lg shadow ">
        {/* Current Plan Section */}
        <div className="mb-6">
          <h2 className="text-gray-700 text-lg font-semibold">Current Plan</h2>
          <p className="mt-2 text-gray-700 ">
            You have been subscribed to the{" "}
            <span className="font-semibold text-green-700">Premium Plan</span>.
          </p>
          <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md w-full text-gray-700 ">
            Cancel Subscription
          </button>
        </div>

        {/* Billing Cycle Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 ">
            Current Billing Cycle
          </h2>
          <p className="text-gray-700 mt-2">2023.05.05 - 2023.06.05</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;
