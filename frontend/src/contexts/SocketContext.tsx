import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { ImageType } from "types/model";
import { useAuth } from "./AuthContext";

interface SocketContextProps {
  socket: Socket | null;
  updated_image: ImageType | null;
}

const SERVER_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

// Create the context
const SocketContext = createContext<SocketContextProps>({
  socket: null,
  updated_image: null,
});

// Provider component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { auth } = useAuth();
  const [updated_image, setImage] = useState<ImageType | null>(null);
  useEffect(() => {
    if (auth?.id) {
      const newSocket = io(SERVER_URL);
      newSocket.on("connect", () => {
        console.log("Connected to server");
        newSocket.emit("register_user", auth.id); // Register the user with their ID
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
      });
      // Listen for the 'notification' event from the server
      newSocket.on("notification", (data: ImageType) => {
        console.log(data);
        setImage({ ...data });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect(); // Clean up on unmount
      };
    }
  }, [auth?.id]);

  return (
    <SocketContext.Provider value={{ socket, updated_image }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);
