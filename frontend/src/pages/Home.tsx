import { Col, Container, Row } from "react-bootstrap";

import avatar from "assets/avatar.png";

const Home = () => {
  return (
    <Container className="flex-column pt-20 gap-4 d-flex justify-content-center">
      <Row className="align-items-center">
        <Col lg={4} md={8} sm={12}>
          <h1 className="display-4">LinguaPhoto</h1>
          <p className="lead">Visual language learning for everyone!</p>
          <Row className="mt-3">{/* <GoogleAuthComponent /> */}</Row>
        </Col>
        <Col lg={8} md={8} sm={12}>
          <img src={avatar} alt="Avatar" className="img-fluid" />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
