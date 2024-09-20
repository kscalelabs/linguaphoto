import avatar from "assets/avatar.png";
import { Col, Container, Row } from "react-bootstrap";

const Home = () => {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center min-vh-100"
    >
      <Row className="align-items-center w-100">
        {/* Text Section */}
        <Col
          lg={4}
          md={8}
          sm={12}
          className="text-center text-md-start d-flex flex-column justify-content-center"
        >
          <h1 className="display-4">LinguaPhoto</h1>
          <p className="lead">Visual language learning for everyone!</p>
          <Row className="mt-3">{/* GoogleAuthComponent placeholder */}</Row>
        </Col>

        {/* Image Section */}
        <Col
          lg={8}
          md={8}
          sm={12}
          className="d-flex justify-content-center align-items-center"
        >
          <img
            src={avatar}
            alt="Avatar"
            className="img-fluid"
            style={{
              maxHeight: "80vh", // Keeps image height responsive
              maxWidth: "100%",
              objectFit: "contain", // Prevents overflow
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
