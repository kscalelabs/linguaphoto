import AudioPlayer from "components/Audio";
import Container from "components/HOC/Container";
import { useAuth } from "contexts/AuthContext";
import { useAlertQueue } from "hooks/alerts";
import { useEffect, useMemo, useState } from "react";
import { Collection, Image } from "types/model";
type CollectionViewProps = {
  collection: Collection;
};
const CollectionView: React.FC<CollectionViewProps> = ({ collection }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTranscriptionIndex, setCurrentTranscriptionIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<Image | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { client } = useAuth();
  const { addAlert } = useAlertQueue();
  const [images, setImages] = useState<Array<Image> | undefined>([]);
  // Get translated images
  const translatedImages = useMemo(() => {
    if (images) {
      // Get translated images
      const filter = images.filter((img) => img.is_translated);
      const final_filter = collection.images
        ?.map((img) => {
          const foundItem = filter.find((item) => item.id == img);
          return foundItem ? foundItem : null; // Return `null` or skip
        })
        .filter(Boolean); // Filters out `null` or `undefined`
      if (final_filter) return final_filter;
    }
    return [];
  }, [images]);

  useEffect(() => {
    if (translatedImages.length > 0) {
      setCurrentImage(translatedImages[currentImageIndex]);
    }
  }, [currentImageIndex, translatedImages]);

  useEffect(() => {
    if (collection) {
      const asyncfunction = async () => {
        const { data: images, error } = await client.GET("/get_images", {
          params: { query: { collection_id: collection.id } },
        });
        if (error) addAlert(error.detail?.toString(), "error");
        else setImages(images);
        setIsLoading(false);
      };
      asyncfunction();
    }
  }, [collection?.id]);

  // Navigate between images
  const handleNext = () => {
    if (currentImageIndex < translatedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setCurrentTranscriptionIndex(0);
      window.scrollTo(0, 0); // This instantly jumps the viewport to the top
    }
  };

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setCurrentTranscriptionIndex(0);
      window.scrollTo(0, 0); // This instantly jumps the viewport to the top
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
    // Calculate the click position relative to the component
    const { clientX, currentTarget } = e;
    const { left, right } = currentTarget.getBoundingClientRect();
    const width = right - left;

    // Determine if the click was on the left or right side
    if (clientX < left + width / 2) {
      handlePrev(); // Clicked on the left side
    } else {
      handleNext(); // Clicked on the right side
    }
  };
  return (
    <div className="flex flex-col rounded-md h-full items-center bg-gray-0 gap-4 w-full">
      {isLoading ? (
        <div className="flex flex-col h-full w-full gap-4">
          <div className="bg-gray-3 w-full rounded-lg h-3/4 animate-pulse" />
          <div className="bg-gray-3 w-full rounded-lg h-1/4 animate-pulse" />
        </div>
      ) : currentImage ? (
        <div className="flex flex-col align-items-center w-full">
          <div className="w-full absolute left-0">
            <img
              draggable="false"
              src={currentImage.image_url}
              alt="Collection Image"
              className="w-full select-none"
              style={{ marginBottom: "230px" }}
              onClick={handlePhotoClick}
            />
          </div>
          <div className="fixed bottom-0 left-0 w-full px-4 py-1 text-center bg-gray-1/30 backdrop-blur-lg">
            <Container>
              {/* transcription */}
              <div className="rounded-md bg-gray-12 p-2">
                <p className="mt-2 px-12">
                  {currentImage.transcriptions.map((transcription, index) => {
                    return (
                      <span
                        key={index}
                        className={
                          index == currentTranscriptionIndex
                            ? ""
                            : "text-gray-400"
                        }
                      >
                        {transcription.text}
                      </span>
                    );
                  })}
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
              </div>
            </Container>
          </div>
        </div>
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
