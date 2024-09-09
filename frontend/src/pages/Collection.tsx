import { Api } from "api/api";
import axios, { AxiosInstance } from "axios";
import ImageComponent from "components/image";
import Modal from "components/modal";
import UploadContent from "components/UploadContent";
import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Collection, Image } from "types/model";

const CollectionPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<Image | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const { auth, is_auth } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<Array<Image> | null>([]);

  const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Base URL for all requests
    timeout: 10000, // Request timeout (in milliseconds)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth?.token}`, // Add any default headers you need
    },
  });
  const apiClient1: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Base URL for all requests
    timeout: 1000000, // Request timeout (in milliseconds)
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${auth?.token}`, // Add any default headers you need
    },
  });
  const API = new Api(apiClient);
  const API_Uploader = new Api(apiClient1);
  // Helper to check if it's an edit action
  const isEditAction = location.search.includes("Action=edit");

  // Get translated images
  let translatedImages: Array<Image> = [];

  // Simulate fetching data for the edit page (mocking API call)
  useEffect(() => {
    if (id && is_auth) {
      startLoading();
      const asyncfunction = async () => {
        const collection = await API.getCollection(id);
        setCollection(collection);
        stopLoading();
      };
      asyncfunction();
    }
  }, [id, is_auth]);

  useEffect(() => {
    // Get translated images
    if (images) translatedImages = images.filter((img) => img.is_translated);
  }, [images]);

  useEffect(() => {
    if (translatedImages.length > 0) {
      setCurrentImage(translatedImages[currentImageIndex]);
    }
  }, [currentImageIndex, translatedImages]);

  useEffect(() => {
    if (collection) {
      const asyncfunction = async () => {
        startLoading();
        const images = await API.getImages(collection.id);
        setImages(images);
        stopLoading();
      };
      asyncfunction();
    }
  }, [collection]);
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    const collection = await API.createCollection({ title, description });
    if (collection != null)
      navigate(`/collection/${collection.id}?Action=edit`);
    stopLoading();
  };
  // Navigate between images
  const handleNext = () => {
    if (currentImageIndex < translatedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Return button handler
  const handleReturn = () => {
    navigate("/collections");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (collection) {
      const asyncfunction = async () => {
        startLoading();
        await API.editCollection(collection);
        stopLoading();
      };
      asyncfunction();
    }
  };
  const handleUpload = async (file: File) => {
    if (collection) {
      startLoading();
      const Image = await API_Uploader.uploadImage(file, collection?.id);
      stopLoading();
      if (Image) {
        const new_images: Array<Image> | null = images;
        new_images?.push(Image);
        if (new_images != undefined) setImages(new_images);
      }
    }
  };
  // Custom Return Button (fixed top-left with border)
  const ReturnButton = () => (
    <button
      className="fixed top-16 left-4 p-2 border-2 border-gray-400 rounded-sm dark:bg-gray-800 shadow-sm"
      onClick={handleReturn}
    >
      <ArrowLeft size={24} />
    </button>
  );

  // Rendering New Collection Page
  if (!id) {
    return (
      <div className="flex flex-col items-center pt-20 gap-8">
        <h1>New Collection</h1>
        <form
          className="flex flex-col items-end gap-4 w-96"
          onSubmit={handleCreate}
        >
          <input
            className="border p-2 w-full"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="border p-2 w-full h-32"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button
            className="bg-blue-500 w-32 text-white p-2 rounded hover:bg-blue-600"
            type="submit"
          >
            Create
          </button>
        </form>
        <ReturnButton />
      </div>
    );
  }

  // Rendering Edit Collection Page
  if (id && isEditAction && collection) {
    return (
      <div className="flex flex-col items-center pt-20 gap-4">
        <h1>Edit Collection </h1>
        <form
          className="flex flex-col items-center gap-4 w-full"
          onSubmit={handleSave}
        >
          <div className="mt-4 w-full">
            <input
              className="border p-2 w-full"
              type="text"
              placeholder="Title"
              value={collection.title}
              onChange={(e) =>
                setCollection({ ...collection, title: e.target.value })
              }
              required
            />
          </div>
          <div className="mt-4 w-full">
            <textarea
              className="border p-2 h-32 w-full"
              placeholder="Description"
              value={collection.description}
              onChange={(e) =>
                setCollection({ ...collection, description: e.target.value })
              }
              required
            />
          </div>
          <div className="mt-4 flex justify-content-end w-full gap-2">
            <button
              className="bg-blue-500 text-white w-30 p-2 rounded hover:bg-blue-600"
              type="submit"
            >
              Save Changes
            </button>
          </div>
        </form>
        <button
          className="bg-blue-500 text-white w-30 p-2 rounded hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Add Images
        </button>
        {/* Upload Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <UploadContent onUpload={handleUpload} />
          <div className="mt-5 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </Modal>
        <Row className="align-items-center w-full">
          {images ? (
            images.map((image) => {
              return (
                <Col lg={4} md={6} sm={12} key={image.id} className="p-0">
                  <ImageComponent {...image} />
                </Col>
              );
            })
          ) : (
            <></>
          )}
        </Row>
        <ReturnButton key={id} />
      </div>
    );
  }

  // Rendering Collection Detail Page
  if (id && !isEditAction && collection) {
    return (
      <div className="flex flex-col items-center pt-20 gap-4">
        <h1 className="text-xl font-bold mb-4">{collection.title}</h1>
        <p className="text-md mb-4">{collection.description}</p>
        {currentImage ? (
          <div className="flex flex-col align-items-center">
            <img
              src={currentImage.image_url}
              alt="Collection Image"
              className="max-h-96 h-auto mx-auto mb-4"
            />
            <p className="mt-2">{currentImage.transcript}</p>
            <audio controls className="mt-4 w-full">
              <source src={currentImage.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 w-40">
              <button
                className={`px-3 py-1 rounded ${
                  currentImageIndex === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                onClick={handlePrev}
                disabled={currentImageIndex === 0}
              >
                Prev
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  currentImageIndex === translatedImages.length - 1
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                onClick={handleNext}
                disabled={currentImageIndex === translatedImages.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div>No translated images available.</div>
        )}
        <ReturnButton />
      </div>
    );
  }
  return <></>;
};

export default CollectionPage;
