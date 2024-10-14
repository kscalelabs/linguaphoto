import bookplaceholder from "images/bookplaceholder.png";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type BookProps = {
  id: string;
  title: string;
  description: string;
  featured_image: string;
  is_editable?: boolean;
  onDelete?: (id: string) => void;
};

const Book: React.FC<BookProps> = ({
  id,
  title,
  description,
  featured_image,
  onDelete,
  is_editable,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const toggleOpen = () => setIsOpen(!isOpen);
  const handleOpen = () => {
    navigate(`/collection/${id}`);
  };
  const handleEdit = () => {
    navigate(`/collection/${id}?Action=edit`);
  };
  const handleDelete = () => {
    if (onDelete) onDelete(id);
  };
  return (
    <div
      className="relative group perspective w-48 h-64 relative cursor-pointer shadow-xl"
      onClick={toggleOpen}
    >
      {/* Second page */}
      <div className="absolute top-0 w-full h-full bg-gray-100 shadow-lg rounded-sm">
        <div className="p-4 flex flex-col justify-between items-center text-gray-700 text-center h-full">
          <div>
            <h2 className="text-lg font-bold mb-2">{title}</h2>
            <p className="text-sm line-clamp-5">{description}</p>
          </div>
          {is_editable ? (
            <div className="flex flex-col gap-2">
              <span className="hover:text-blue-700" onClick={handleOpen}>
                Open
              </span>
              <span className="hover:text-blue-700" onClick={handleEdit}>
                Edit
              </span>
              <span className="hover:text-red-700" onClick={handleDelete}>
                Delete
              </span>
            </div>
          ) : (
            <span className="hover:text-blue-700" onClick={handleOpen}>
              Open
            </span>
          )}
        </div>
      </div>
      {/* Book Wrapper */}
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-30 rotate-left rounded-sm ${isOpen ? "rotate-y-90" : ""}`}
      >
        {/* Front Cover */}
        <div className="absolute w-full h-full bg-gray-800 text-white shadow-lg backface-hidden rounded-sm">
          <div className="h-full flex flex-col items-center justify-center relative">
            <img
              src={featured_image || bookplaceholder}
              alt={title}
              className="object-cover w-full h-full rounded-sm"
            />
            <div className="absolute top-4 bg-gray-12/70 mt-7 mx-5 p-2 max-h-52 overflow-hidden">
              <h2 className="text-md text-center">{title}</h2>
            </div>
          </div>
        </div>
        {/* Back Cover */}
        <div className="absolute w-full h-full bg-gray-800 shadow-lg rotate-y-180 backface-hidden"></div>
        {/* Spine of the Book */}
        <div className="absolute h-full w-4 bg-gray-700/30 left-0 top-0 rounded-l-sm shadow-md"></div>
      </div>
    </div>
  );
};

export default Book;
