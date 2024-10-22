import { Api } from "api/api";
import axios, { AxiosInstance } from "axios";
import Book from "components/Book";
import ImageComponent from "components/image";
import Modal from "components/modal";
import UploadContent from "components/UploadContent";
import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useSocket } from "contexts/SocketContext";
import { useAlertQueue } from "hooks/alerts";
import { useEffect, useMemo, useState } from "react";
import { ListManager } from "react-beautiful-dnd-grid";
import { Collection, ImageType } from "types/model";
type CollectionEditProps = {
  collection: Collection | undefined;
  setCollection: React.Dispatch<React.SetStateAction<Collection | undefined>>;
};
const skeletons = Array(5).fill(null);
const CollectionEdit: React.FC<CollectionEditProps> = ({
  collection,
  setCollection,
}) => {
  const [featured_image, setFeaturedImage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { auth, client } = useAuth();
  const { updated_image } = useSocket();
  const { startLoading, stopLoading } = useLoading();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [images, setImages] = useState<Array<ImageType> | undefined>([]);
  const [is_loading, setIsLoading] = useState<boolean>(true);
  const [reorderImageIds, setReorderImageIds] = useState<Array<string> | null>(
    [],
  );
  const { addAlert } = useAlertQueue();
  const [deleteImageId, setDeleteImageId] = useState<string>("");
  useEffect(() => {
    if (collection) {
      setTitle(collection.title);
      setDescription(collection.description);
      setFeaturedImage(collection.featured_image);
      setReorderImageIds([...collection.images]);
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
  useEffect(() => {
    if (updated_image && images) {
      const img = images?.find((image) => image.id == updated_image.id);
      if (img) img.is_translated = true;
      setImages([...images]);
    }
  }, [updated_image]);
  const apiClient1: AxiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: process.env.REACT_APP_BACKEND_URL,
        timeout: 1000000,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth?.token}`,
        },
      }),
    [auth?.token],
  );
  const API_Uploader = useMemo(() => new Api(apiClient1), [apiClient1]);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use e.nativeEvent to access the native event
    const target = e.nativeEvent as SubmitEvent;
    const submitButton = target.submitter as HTMLButtonElement;
    // Check if the submitButton exists and get its value
    const action = submitButton ? submitButton.value : "";
    switch (action) {
      case "save":
        if (collection && reorderImageIds) {
          const asyncfunction = async () => {
            startLoading();
            collection.images = reorderImageIds;
            const { error } = await client.POST("/edit_collection", {
              body: { ...collection, featured_image, title, description },
            });
            if (error) addAlert(error.detail?.toString(), "error");
            else {
              setCollection({
                ...collection,
                featured_image,
                title,
                description,
              });
              addAlert(
                "The collection has been updated successfully!",
                "success",
              );
            }
            stopLoading();
          };
          asyncfunction();
        }
        break;
      case "publish":
        if (collection) {
          const { error } = await client.POST("/publish_collection", {
            body: { id: collection.id, flag: !collection.publish_flag },
          });
          if (error) addAlert(error.detail?.toString(), "error");
          else {
            setCollection({
              ...collection,
              publish_flag: !collection.publish_flag,
            });
            addAlert(
              "The collection has been updated successfully!",
              "success",
            );
          }
        }
        break;
    }
  };
  const onShowDeleteImageModal = (id: string) => {
    setDeleteImageId(id);
    setShowDeleteImageModal(true);
  };
  const handleUpload = async (file: File) => {
    if (collection) {
      startLoading();
      const new_image = await API_Uploader.uploadImage(file, collection?.id);
      stopLoading();
      if (new_image) {
        const first_image = new_image.image_url;
        if (collection.images.length == 0 || images == undefined) {
          // no images
          setImages([new_image]);
          client.POST("/set_featured_image", {
            body: { image_url: first_image, collection_id: collection.id },
          });
          // set the first image as featured one
          setFeaturedImage(first_image);
        } else {
          // images exist
          images.push(new_image);
          setImages([...images]);
        }
        collection.images.push(new_image.id);
        setReorderImageIds([...collection.images]);
        setCollection({ ...collection });
      }
    }
  };
  const handleTranslateOneImage = async (image_id: string) => {
    if (images) {
      startLoading();
      addAlert(
        "The image is being tranlated. Please wait a moment.",
        "primary",
      );
      await client.POST("/translate", { body: { image_id } });
      stopLoading();
    }
  };
  const onDeleteImage = async () => {
    if (deleteImageId && collection) {
      startLoading();
      const { error } = await client.GET("/delete_image", {
        params: { query: { id: deleteImageId } },
      });
      if (error) addAlert(error.detail?.toString(), "error");
      else if (images) {
        const new_images_ID = collection?.images.filter(
          (image) => image !== deleteImageId,
        );
        collection.images = new_images_ID;
        const new_images = images.filter((image) => image.id !== deleteImageId);
        setImages(new_images);
        setReorderImageIds([...collection.images]);
        setCollection({ ...collection });
        addAlert("The image has been deleted!", "success");
      }
      setShowDeleteImageModal(false);
      stopLoading();
    }
  };
  // Inside your CollectionPage component
  /* eslint-disable */
  const handleDragEnd = (sourceIndex: number, destinationIndex: number) => {
    /* eslint-enable */
    if (!reorderImageIds) return;
    const [removed] = reorderImageIds.splice(sourceIndex, 1);
    reorderImageIds.splice(destinationIndex, 0, removed);
    setReorderImageIds([...reorderImageIds]);
    //featured image
    const image = images?.find((img) => img.id == reorderImageIds[0]);
    if (image) {
      setFeaturedImage(image?.image_url);
    }
    // Optionally, you can save the new order to your backend here
  };
  return (
    <div className="flex flex-col rounded-md min-h-full bg-gray-3 p-24 gap-8">
      <h1 className="text-3xl text-gray-900">Edit Collection </h1>
      <form
        className="flex flex-col items-center gap-4 w-full"
        onSubmit={handleSave}
      >
        <div className="flex flex-wrap w-full gap-4">
          <div className="flex flex-col flex-1 gap-3 h-64">
            <input
              className="border p-2 w-full"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="flex-1 border p-2 w-full"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          {collection &&
            <Book
              title={title}
              description={description}
              id={collection.id}
              featured_image={featured_image}
            />}
        </div>
        {
          collection &&
          <div className="flex justify-content-end w-full gap-2">
            <button
              className="bg-blue-500 text-white w-35 p-2 rounded hover:bg-blue-600"
              onClick={() => setShowUploadModal(true)}
            >
              Add Images
            </button>
            <button
              className="bg-blue-500 text-white w-30 p-2 rounded hover:bg-blue-600"
              disabled={
                collection.images.join() == reorderImageIds?.join() &&
                collection.title == title &&
                collection.description == description
              }
              type="submit"
              name="action"
              value="save"
            >
              Save Changes
            </button>
            <button
              className="bg-blue-500 text-white w-30 p-2 rounded hover:bg-blue-600"
              type="submit"
              name="action"
              value="publish"
            >
              {collection.publish_flag ? "Unpublish" : "Publish"}
            </button>
          </div>
        }
      </form>
      {/* <div className="flex gap-4">
          <button
            className="bg-blue-500 text-white w-35 p-2 rounded hover:bg-blue-600 disabled:bg-gray-600"
            onClick={(e) => handleSave(e)}
            disabled={reorderImageIds?.join() === collection.images.join()}
            value="save"
          >
            Order Save
          </button>
        </div> */}
      {/* skeleton part */}
      <div className="flex flex-wrap justify-start w-full">
        {is_loading &&
          skeletons.map((__, index) => (
            <div
              className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
              key={index}
            >
              <div className="bg-gray-5 w-60 h-64 rounded-lg animate-pulse p-8">
                <div className="bg-gray-8 w-full h-4 rounded-lg animate-pulse" />
                <div className="bg-gray-8 w-full h-4 rounded-lg animate-pulse mt-12" />
              </div>
            </div>
          ))}
        {/* reordering part */}
        {reorderImageIds && images && (
          <ListManager
            items={reorderImageIds}
            direction="horizontal"
            maxItems={1}
            onDragEnd={handleDragEnd}
            render={(id) => {
              const image = images.find((item) => item.id === id);
              return (
                <div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5">
                  {image && (
                    <ImageComponent
                      {...image}
                      handleTranslateOneImage={handleTranslateOneImage}
                      showDeleteModal={onShowDeleteImageModal}
                    />
                  )}
                </div>
              );
            }}
          />
        )}
      </div>
      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <UploadContent onUpload={handleUpload} />
        <div className="mt-5 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setShowUploadModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
      >
        <div className="mt-5 flex justify-end space-x-2 gap-4 items-center">
          <span>Are you sure you want to delete the collection?</span>
          <button
            className="px-4 py-2 bg-red-700 text-gray-300 rounded hover:bg-red-800"
            onClick={onDeleteImage}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setShowDeleteImageModal(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default CollectionEdit;
