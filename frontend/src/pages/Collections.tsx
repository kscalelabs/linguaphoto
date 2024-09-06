import { api } from "api/API";
import axios, { AxiosInstance } from "axios";
import CardItem from "components/card";
import NewCardItem from "components/new_card";
import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Collection } from "types/model";

const Collections = () => {
  const [collections, setCollection] = useState<Array<Collection> | null>(null);
  const { is_auth, auth } = useAuth();
  const { startLoading, stopLoading } = useLoading();
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

  const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Base URL for all requests
    timeout: 10000, // Request timeout (in milliseconds)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth?.token}`, // Add any default headers you need
    },
  });
  const API = new api(apiClient);

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
              <CardItem {...collection} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default Collections;
