import React, { ReactNode, useEffect, useRef, useState } from "react";

interface DraggableWrapperProps {
  children: ReactNode;
  handleSelector: string; // Selector for the draggable handle
}

const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  children,
  handleSelector,
}) => {
  const [position, setPosition] = useState({ x: 50, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const handleElement = (e.target as HTMLElement).closest(handleSelector);

    if (handleElement) {
      const element = ref.current;

      if (element) {
        const rect = element.getBoundingClientRect();
        // Calculate the offset between the cursor and the element's top-left corner
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsDragging(true);
      }
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging && animationFrameRef.current === null) {
      // Throttle with requestAnimationFrame for better performance
      animationFrameRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        animationFrameRef.current = null;
      });
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, offset]);

  return (
    <div
      ref={ref}
      className="fixed shadow-xl"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
};

export default DraggableWrapper;
