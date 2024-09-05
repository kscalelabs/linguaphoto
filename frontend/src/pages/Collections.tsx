import CardItem from "components/card";
import NewCardItem from "components/new_card";
import { Col, Row } from "react-bootstrap";
import { Collection } from "types/model";
const myCollection: Collection = {
  id: "1",
  title: "My First Collection",
  description: "A collection of my favorite images.",
  images: ["image1.jpg", "image2.jpg", "image3.jpg"],
};

const Collections = () => {
  return (
    <div className="flex-column pt-20 gap-4 d-flex justify-content-center">
      <h1>My Collections</h1>
      <Row className="align-items-center">
        <Col lg={3} md={4} sm={12}>
          <NewCardItem />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
        <Col lg={3} md={4} sm={12}>
          <CardItem {...myCollection} />
        </Col>
      </Row>
    </div>
  );
};

export default Collections;
