import React, { ReactNode } from "react";
interface ContentProps {
  children: ReactNode;
}
const Content: React.FC<ContentProps> = ({ children }) => {
  return (
    <div
      className="h-screen mx-4 sm:mx-6 md:mx-10 xl:mx-16 pb-4"
      style={{ paddingTop: "68px" }}
    >
      {children}
    </div>
  );
};
export default Content;
