import AudioPlayer from "components/Audio";
import Container from "components/HOC/Container";
import { useAuth } from "contexts/AuthContext";
import { useAlertQueue } from "hooks/alerts";
import { useEffect, useMemo, useState } from "react";
import { Collection, ImageType } from "types/model";

type CollectionViewProps = {
  collection: Collection | undefined;
};

const CollectionView: React.FC<CollectionViewProps> = ({ collection }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTranscriptionIndex, setCurrentTranscriptionIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<ImageType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true); // New state, default to true
  const { client } = useAuth();
  const { addAlert } = useAlertQueue();
  const [images, setImages] = useState<Array<ImageType> | undefined>([]);

  // Get translated images
  const translatedImages = useMemo(() => {
    if (images && collection) {
      const filter = images.filter((img) => img.is_translated);
      const final_filter = collection.images
        ?.map((img) => {
          const foundItem = filter.find((item) => item.id == img);
          return foundItem ? foundItem : null;
        })
        .filter(Boolean);
      if (final_filter) return final_filter;
    }
    return [];
  }, [images, collection]);

  // Preload images one by one
  const preloadImage = (src: string) => {
    return new Promise<void>((resolve) => {
      setIsImageLoading(true); // Start loading indicator
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsImageLoading(false); // Stop loading indicator
        resolve();
      };
    });
  };

  useEffect(() => {
    if (collection) {
      const fetchImages = async () => {
        const { data: images, error } = await client.GET("/image/get_all", {
          params: { query: { collection_id: collection.id } },
        });
        if (error) addAlert(error.detail?.toString(), "error");
        else setImages(images);
        setIsLoading(false);
      };
      fetchImages();
    }
  }, [collection?.id]);

  useEffect(() => {
    const loadImagesSequentially = async () => {
      if (translatedImages.length > 0 && translatedImages[0]?.image_url) {
        // Set current image index to 0, so the first image loads first
        setCurrentImage(translatedImages[0]);
        await preloadImage(translatedImages[0].image_url);

        // Preload rest of the images isn the background
        for (let i = 1; i < translatedImages.length; i++) {
          const image = translatedImages[i];
          if (image?.image_url) {
            preloadImage(image.image_url);
          }
        }
      }
    };

    loadImagesSequentially();
  }, [translatedImages]);

  // Handle Next Image
  const handleNext = async () => {
    if (currentImageIndex < translatedImages.length - 1) {
      setCurrentTranscriptionIndex(0);
      const nextImage = translatedImages[currentImageIndex + 1];
      if (nextImage?.image_url) {
        setCurrentImage(nextImage);
        await preloadImage(nextImage.image_url);
        window.scrollTo(0, 0);
      }
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Handle Previous Image
  const handlePrev = async () => {
    if (currentImageIndex > 0) {
      setCurrentTranscriptionIndex(0);
      const prevImage = translatedImages[currentImageIndex - 1];
      if (prevImage?.image_url) {
        setCurrentImage(prevImage);
        await preloadImage(prevImage.image_url);
        window.scrollTo(0, 0);
      }
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Navigate transcriptions
  const handleTranscriptionNext = () => {
    if (
      currentImage?.transcriptions &&
      currentTranscriptionIndex < currentImage?.transcriptions.length - 1
    ) {
      setCurrentTranscriptionIndex(currentTranscriptionIndex + 1);
    }
  };

  const handleTranscriptionPrev = () => {
    if (currentTranscriptionIndex > 0) {
      setCurrentTranscriptionIndex(currentTranscriptionIndex - 1);
    }
  };

  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left, right } = currentTarget.getBoundingClientRect();
    const width = right - left;
    if (clientX < left + width / 2) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleKey = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        handlePrev();
        break;
      case "ArrowRight":
        handleNext();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKey]);

  const FantasyLoading = () => {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-12 transition-opacity duration-1000 opacity-100">
          <div className="relative w-36 h-36">
            <div className="absolute inset-0 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
            <div className="absolute inset-1 border-4 border-transparent border-t-red-500 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-4 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col rounded-md h-full items-center bg-gray-0 gap-4 w-full">
      {isLoading ? (
        <FantasyLoading />
      ) : translatedImages.length > 0 ? (
        currentImage && (
          <div className="flex flex-col align-items-center w-full">
            <div className="w-full absolute left-0">
              {isImageLoading && <FantasyLoading />} {/* Show image loading */}
              <img
                draggable="false"
                src={currentImage.image_url}
                alt="Collection Image"
                className="w-full select-none"
                style={
                  currentImage.transcriptions.length !== 0
                    ? { marginBottom: "230px" }
                    : {}
                }
                onClick={handlePhotoClick}
              />
            </div>
            <span className="fixed left-1/2 transform -translate-x-1/2 top-20 bg-gray-12/90 px-3 py-1 rounded-3xl">
              page: {currentImageIndex + 1}/{translatedImages.length}
            </span>
            <div className="fixed bottom-0 left-0 w-full px-4 py-1 text-center bg-gray-1/30 backdrop-blur-lg">
              <Container>
                <div className="rounded-md bg-gray-12 p-2">
                  {currentImage.transcriptions.length !== 0 ? (
                    <>
                      <p className="mt-2 px-12">
                        {currentImage.transcriptions.map(
                          (transcription, index) => (
                            <span
                              key={index}
                              className={
                                index === currentTranscriptionIndex
                                  ? ""
                                  : "text-gray-400"
                              }
                            >
                              {transcription.text}
                            </span>
                          ),
                        )}
                      </p>
                      <p className="mt-2">
                        {
                          currentImage.transcriptions[currentTranscriptionIndex]
                            .pinyin
                        }
                      </p>
                      <p className="mt-2">
                        {
                          currentImage.transcriptions[currentTranscriptionIndex]
                            .translation
                        }
                      </p>
                      <AudioPlayer
                        currentImage={currentImage}
                        index={currentTranscriptionIndex}
                        handleTranscriptionNext={handleTranscriptionNext}
                        handleTranscriptionPrev={handleTranscriptionPrev}
                      />
                    </>
                  ) : (
                    <div className="h-8 flex flex-col items-center justify-center text-md">
                      <span>No transcript</span>
                    </div>
                  )}
                </div>
              </Container>
            </div>
          </div>
        )
      ) : (
        <div className="p-24 flex h-full items-center">
          <h1 className="text-3xl text-gray-900">
            No translated images available.
          </h1>
        </div>
      )}
    </div>
  );
};

export default CollectionView;
