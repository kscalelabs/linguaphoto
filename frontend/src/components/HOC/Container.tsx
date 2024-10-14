import React, { ReactNode } from "react";
interface ContainerProps {
  children: ReactNode;
}
const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="mx-4 sm:mx-6 md:mx-10 xl:mx-16 relative">{children}</div>
  );
};
export default Container;
