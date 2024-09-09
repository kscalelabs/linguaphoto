import { Api } from "api/api";
import axios, { AxiosInstance } from "axios";
import { ChangeEvent, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

// Custom styles (you can include these in a separate CSS file or use styled-components)
const customStyles = {
  input: {
    marginBottom: "1rem",
    borderRadius: "5px",
  },
  button: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
  },
  img: {
    maxWidth: "100%",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

const Home = () => {
  console.log(process.env.REACT_APP_BACKEND_URL);
  const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Base URL for all requests
    // baseURL: 'https://api.linguaphoto.com', // Base URL for all requests
    timeout: 10000, // Request timeout (in milliseconds)
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer your_token_here", // Add any default headers you need
    },
  });
  const API = new Api(apiClient);
  const [message, setMessage] = useState("Linguaphoto");
  const [imageURL, setImageURL] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  (async () => {
    const text = await (async () => {
      return await API.test();
    })();
    setMessage(text);
  })();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.handleUpload(formData);
      if (response) setImageURL(response.image_url);
    } catch (error) {
      console.error("Error uploading the file", error);
    }
  };

  return (
    <Container
      className="flex-column pt-5 gap-4 d-flex justify-content-center"
      style={{ display: "flex", minHeight: "90vh" }}
    >
      <Row className="align-items-center">
        <Col lg={4}>
          <h1 className="display-4">{message}</h1>
          <input
            type="file"
            onChange={handleFileChange}
            style={customStyles.input}
          />
          <button onClick={handleUpload} style={customStyles.button}>
            Upload
          </button>
          {imageURL && (
            <div>
              <h2>Uploaded Image</h2>
              <img
                src={imageURL}
                alt="Uploaded file"
                style={customStyles.img}
              />
              <p>
                Image URL:{" "}
                <a
                  href={imageURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={customStyles.link}
                >
                  {imageURL}
                </a>
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
