import { useAuth } from "contexts/AuthContext";
import { useAlertQueue } from "hooks/alerts";
import React, { useEffect, useState } from "react";

const ApiKeyManager: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { client, auth } = useAuth();
  const { addAlert } = useAlertQueue();
  // Simulate API call to generate or regenerate a new API key
  useEffect(() => {
    if (auth?.api_key) setApiKey(auth.api_key);
  }, [auth]);
  const generateApiKey = async () => {
    setIsLoading(true);
    setCopied(false); // Reset copy state
    try {
      // Replace this with your actual API call
      const { data, error } = await client.GET("/api-key/generate");
      if (error) addAlert(error.detail?.toString(), "error");
      else setApiKey(data.api_key);
    } catch (error) {
      console.error("Error generating API key:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Copy the API key to the clipboard
  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  // Mask part of the API key for security
  const getMaskedApiKey = (key: string) => {
    if (key.length <= 8) return key; // Return as-is if too short to mask
    return `${key.slice(0, 14)}..........${key.slice(-4)}`;
  };

  return (
    <div className="flex-column rounded-md min-h-full items-center bg-gray-3 p-3">
      <div className="flex flex-col rounded-md items-start p-24 gap-6">
        <h1 className="text-3xl text-gray-900">API Key</h1>
        <p className="text-gray-11 text-lg">
          Please retain the API key, as it&apos;s essential for enabling image
          uploads via our browser extension.
        </p>
        {apiKey ? (
          <div className="w-full flex">
            <p className="flex-1 text-gray-900 bg-gray-4 p-2 px-4 rounded-lg">
              {getMaskedApiKey(apiKey)}
            </p>
            <button
              className={`ml-4 text-sm hover:bg-blue-700 w-16 px-1 ${
                copied ? "bg-green-600 hover:bg-green-700" : ""
              }`}
              onClick={copyToClipboard}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              className={`ml-4 text-sm hover:bg-blue-700 ${
                isLoading ? "cursor-not-allowed" : ""
              }`}
              onClick={generateApiKey}
              disabled={isLoading}
            >
              {isLoading
                ? "Generating..."
                : apiKey
                  ? "Regenerate API Key"
                  : "Generate API Key"}
            </button>
          </div>
        ) : (
          <>
            <button
              className={`text-sm hover:bg-blue-700 ${
                isLoading ? "cursor-not-allowed" : ""
              }`}
              onClick={generateApiKey}
              disabled={isLoading}
            >
              {isLoading
                ? "Generating..."
                : apiKey
                  ? "Regenerate API Key"
                  : "Generate API Key"}
            </button>
            <p className="text-gray-11">No API key generated yet.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;
