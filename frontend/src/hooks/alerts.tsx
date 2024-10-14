import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

const DELAY = 5000;
const MAX_ERRORS = 10;

type AlertType = "error" | "success" | "primary" | "info";

const alertTypeToBg = (kind: AlertType) => {
  switch (kind) {
    case "error":
      return "bg-red-500 text-white"; // Tailwind-style classes
    case "success":
      return "bg-green-500 text-white";
    case "primary":
      return "bg-blue-500 text-white";
    case "info":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

interface AlertQueueContextProps {
  alerts: Map<string, [string | ReactNode, AlertType]>;
  removeAlert: (alertId: string) => void;
  addAlert: (alert: string | ReactNode, kind: AlertType) => void;
}

const AlertQueueContext = createContext<AlertQueueContextProps | undefined>(
  undefined,
);

interface AlertQueueProviderProps {
  children: React.ReactNode;
}

export const AlertQueueProvider = (props: AlertQueueProviderProps) => {
  const { children } = props;

  const [alerts, setAlerts] = useState<
    Map<string, [string | ReactNode, AlertType]>
  >(new Map());

  const generateAlertId = useCallback(() => {
    return Math.random().toString(36).substring(2);
  }, []);

  const addAlert = useCallback(
    (alert: string | ReactNode, kind: AlertType) => {
      const alertId = generateAlertId();
      setAlerts((prev) => {
        const newAlerts = new Map(prev);
        newAlerts.set(alertId, [alert, kind]);

        // Ensure the map doesn't exceed MAX_ERRORS
        while (newAlerts.size > MAX_ERRORS) {
          const firstKey = Array.from(newAlerts.keys())[0];
          newAlerts.delete(firstKey);
        }

        return newAlerts;
      });
      // Automatically remove the alert after DELAY
      setTimeout(() => {
        removeAlert(alertId);
      }, DELAY);
    },
    [generateAlertId],
  );

  const removeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => {
      const newAlerts = new Map(prev);
      newAlerts.delete(alertId);
      return newAlerts;
    });
  }, []);

  return (
    <AlertQueueContext.Provider
      value={{
        alerts,
        removeAlert,
        addAlert,
      }}
    >
      {children}
    </AlertQueueContext.Provider>
  );
};

export const useAlertQueue = () => {
  const context = useContext(AlertQueueContext);
  if (context === undefined) {
    throw new Error("useAlertQueue must be used within an AlertQueueProvider");
  }
  return context;
};

interface AlertQueueProps {
  children: ReactNode;
}

export const AlertQueue = (props: AlertQueueProps) => {
  const { children } = props;
  const { alerts, removeAlert } = useAlertQueue();

  return (
    <>
      {children}
      <div
        className="fixed bottom-0 left-0 right-0 flex flex-col items-center space-y-2 p-4"
        style={{ zIndex: 1000 }}
      >
        {Array.from(alerts).map(([alertId, [alert, kind]]) => (
          <div
            key={alertId}
            className={`w-full max-w-xs p-4 rounded shadow-lg ${alertTypeToBg(
              kind,
            )}`}
            style={{ animation: "fadeIn 0.5s ease-in-out" }}
          >
            <div className="flex justify-between items-center">
              <strong className="capitalize">{kind}</strong>
              <div
                onClick={() => removeAlert(alertId)}
                className="ml-2 text-white hover:text-gray-200 cursor-pointer"
              >
                &times;
              </div>
            </div>
            <div className="mt-2">{alert}</div>
          </div>
        ))}
      </div>

      {/* Remove the jsx attribute */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
