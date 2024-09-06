import React from "react";
import { CheckCircleFill, LockFill, PencilFill } from "react-bootstrap-icons";
import { Image } from "types/model";

const ImageComponent: React.FC<Image> = ({
  // id,
  is_translated,
  image_url,
  // audio_url,
  transcript,
}) => {
  return (
    <div
      className="relative w-full h-80 min-w-80 bg-cover bg-center border-1 border-gray-800 dark:border-gray-50"
      style={{ backgroundImage: `url(${image_url})` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/30">
        {is_translated ? (
          <>
            <div className="absolute top-2 right-2 flex items-center text-white bg-green-600 py-1 px-3 rounded text-xs">
              <CheckCircleFill size={15} className="mr-2" />
              <span>The image has been translated</span>
            </div>
            <div className="absolute bottom-2 text-white bg-gray-800 py-1 px-3 mx-2 rounded">
              <span>{transcript}</span>
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
            <button className="bg-yellow-500 text-white py-1 px-3 rounded flex items-center">
              <PencilFill className="mr-2" />
              Edit
            </button>
          ) : (
            <button className="bg-blue-500 text-white py-1 px-3 rounded">
              Translate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;