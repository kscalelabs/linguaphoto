import React from "react";
import { CheckCircleFill, LockFill, TrashFill } from "react-bootstrap-icons";
import { ImageType } from "types/model";
// Extend the existing ImageType interface to include the new function
interface ImageWithFunction extends ImageType {
  handleTranslateOneImage: (image_id: string) => void;
  showDeleteModal: (id: string) => void;
}
const ImageComponent: React.FC<ImageWithFunction> = ({
  id,
  is_translated,
  image_url,
  handleTranslateOneImage,
  showDeleteModal,
}) => {
  return (
    <div
      className="relative w-full h-64 min-w-64 bg-cover bg-center border border-3 border-gray-200 shadow-md bg-white"
      style={{ backgroundImage: `url(${image_url})` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/20">
        {is_translated ? (
          <>
            <div className="absolute top-2 right-2 flex items-center text-white bg-green-600 py-1 px-3 rounded text-xs">
              <CheckCircleFill size={15} className="mr-2" />
              <span>The image has been translated</span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-2 right-2 flex items-center text-white bg-red-600 py-1 px-3 rounded text-xs">
              <LockFill size={13} className="mr-2" />
              <span>It needs to be translated</span>
            </div>
          </>
        )}
        {/* Centered Edit Button */}
        <div className="absolute inset-x-0 bottom-1/2 transform translate-y-1/2 flex items-center justify-center gap-2">
          {is_translated ? (
            <div className="flex gap-2">
              {/* <button className="bg-yellow-500 text-white py-1 px-3 rounded flex items-center">
                <PencilFill className="mr-2" />
                Edit
              </button> */}
              <button
                className="bg-red-500 text-white py-1 px-2 rounded flex items-center"
                onClick={() => {
                  showDeleteModal(id);
                }}
              >
                <TrashFill className="mr-2" />
                Delete
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="bg-blue-500 text-white py-1 px-3 rounded"
                onClick={() => handleTranslateOneImage(id)}
              >
                Translate
              </button>
              <button
                className="bg-red-500 text-white py-1 px-2 rounded flex items-center"
                onClick={() => {
                  showDeleteModal(id);
                }}
              >
                <TrashFill className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
