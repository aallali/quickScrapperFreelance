import React, { useEffect, useState } from "react";
import "./Products.css";
import { Button, Card, Row, Col } from "react-bootstrap";
import db from "./products.json";
export default function Products() {
  const [filter, setFilter] = useState("new");
  const [originalData] = useState([...db])
  const [data, updateData] = useState(originalData.filter((l) => l.statu === filter));

  useEffect(() => {
    updateData(originalData.filter((l) => l.statu === filter));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="inner-products">
      <Row>
        <Col>
          <h3> Select Filter  : </h3>
          <h3> total products with that filter {data.length}</h3>
        </Col>
        <Col>
          <select   onChange={(e) => setFilter(e.target.value)}>
          <option value="new">new</option>

            <option value="changed">Changed</option>
     
            <option value="deleted">deleted</option>
          </select>
        </Col>
      </Row>
      <Row>
        {data.map((l) => (
          <Card style={{ width: "15rem" }} key={l.id}>
            <Card.Img variant="top" src={l.image} />
            <Card.Body>
              <Card.Title>{l.name}</Card.Title>
              <Card.Text>
                Price : {l.price.price}
                <br />
                Date : {l.price.date}
                <br />
                Statu : {l.statu}
                <br />
                Index in list : {l.index}
              </Card.Text>
              
              <Button href={l.url} target="_blank" variant="primary" size="sm">View Product</Button>
              <Button href={l.sourceCaregoryUrl} target="_blank" variant="primary" size="sm">Souce list</Button>
            </Card.Body>
          </Card>
        ))}
      </Row>
    </div>
  );
}
