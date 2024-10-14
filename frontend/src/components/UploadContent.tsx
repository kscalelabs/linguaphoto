import { useAlertQueue } from "hooks/alerts";
import { FC, useState } from "react";
import { XCircleFill } from "react-bootstrap-icons";
import ImageUploading, { ImageListType } from "react-images-uploading";
interface UploadContentProps {
  onUpload: (file: File) => Promise<void>; // Updated to handle a single file
}

const UploadContent: FC<UploadContentProps> = ({ onUpload }) => {
  const [images, setImages] = useState<ImageListType>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const { addAlert } = useAlertQueue();

  const maxNumber = 10; // Set the maximum number of files allowed

  const handleUpload = async () => {
    if (images.length === 0) return;

    setUploading(true);
    for (let i = 0; i < images.length; i++) {
      const file = images[i].file as File;
      try {
        await onUpload(file); // Upload each file one by one
        if (i == images.length - 1)
          addAlert(`${i + 1} images has been uploaded!`, "success");
      } catch (error) {
        addAlert(`${file.name} has been failed to upload. ${error}`, "error");
        break;
        // Optionally, handle failure feedback here
      }
    }
    setImages([]); // Clear images after uploading
    setUploading(false);
  };

  const onChange = (imageList: ImageListType) => {
    setImages(imageList);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div className="upload__image-wrapper">
            {/* Dropzone Area */}
            <div
              className={`border-2 border-dashed p-5 rounded-lg flex flex-col items-center justify-center h-64 transition-colors duration-300 ${
                isDragging
                  ? "border-green-500 bg-green-100 dark:border-green-600 dark:bg-green-900"
                  : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
              onClick={onImageUpload} // Click to upload images
              {...dragProps} // Drag-n-Drop props
            >
              <p className="text-gray-500 dark:text-gray-400">
                Drag & drop images here, or click to select files
              </p>
            </div>

            {/* Display uploaded images below the dropzone */}
            <div className="mt-5 grid grid-cols-3 gap-4 w-full">
              {imageList.length > 0 ? (
                imageList.map((image, index) => (
                  <div key={index} className="relative text-center">
                    <img
                      src={image["data_url"]}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                    />
                    <span
                      className="absolute top-2 right-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 cursor-pointer"
                      onClick={() => onImageRemove(index)}
                    >
                      <XCircleFill size={24} />
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No images uploaded yet.
                </p>
              )}
            </div>

            {/* Optional: Remove all button */}
            {imageList.length > 0 && (
              <div className="flex gap-4">
                {/* Upload Button */}
                <button
                  className={`mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 ${
                    uploading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={handleUpload}
                  disabled={uploading || images.length === 0}
                >
                  {uploading ? "Uploading..." : "Upload Images"}
                </button>
                <button
                  className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 transition-colors duration-200"
                  onClick={onImageRemoveAll}
                >
                  Remove All Images
                </button>
              </div>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
};

export default UploadContent;
