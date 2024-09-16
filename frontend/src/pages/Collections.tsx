import { Api } from "api/api";
import axios, { AxiosInstance } from "axios";
import CardItem from "components/card";
import Modal from "components/modal";
import NewCardItem from "components/new_card";
import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useAlertQueue } from "hooks/alerts";
import { useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Collection } from "types/model";

const Collections = () => {
  const [collections, setCollection] = useState<Array<Collection> | []>([]);
  const { is_auth, auth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const [delete_ID, setDeleteID] = useState(String);
  const { addAlert } = useAlertQueue();

  const onDeleteModalShow = (id: string) => {
    setDeleteID(id);
    setShowModal(true);
  };
  const onDelete = async () => {
    if (delete_ID) {
      startLoading();
      await API.deleteCollection(delete_ID);
      const filter = collections?.filter(
        (collection) => collection.id != delete_ID,
      );
      setShowModal(false);
      setCollection(filter);
      addAlert("The Collection has been deleted.", "success");
      stopLoading();
    }
  };

  useEffect(() => {
    if (is_auth) {
      const asyncfunction = async () => {
        startLoading();
        const collections = await API.getAllCollections();
        setCollection(collections);
        stopLoading();
      };
      asyncfunction();
    }
  }, [is_auth]);

  const apiClient: AxiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: process.env.REACT_APP_BACKEND_URL, // Base URL for all requests
        timeout: 10000, // Request timeout (in milliseconds)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`, // Add any default headers you need
        },
      }),
    [auth?.token],
  );
  const API = useMemo(() => new Api(apiClient), [apiClient]);

  return (
    <div className="flex-column pt-20 gap-4 d-flex justify-content-center">
      <h1>My Collections</h1>
      <Row className="align-items-center">
        <Col lg={3} md={4} sm={12}>
          <NewCardItem />
        </Col>
        {collections?.map((collection) => {
          return (
            <Col lg={3} md={4} sm={12} key={collection.id}>
              <CardItem {...collection} onDelete={onDeleteModalShow} />
            </Col>
          );
        })}
      </Row>
      {/* Delete Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="mt-5 flex justify-end space-x-2 gap-4 items-center">
          <span>Are you sure you want to delete the collection?</span>
          <button
            className="px-4 py-2 bg-red-700 text-gray-300 rounded hover:bg-red-800"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Collections;
