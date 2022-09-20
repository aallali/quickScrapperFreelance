import { Row, Col } from "react-bootstrap";

export  default function StatuFilter({ setStatuFilter }) {
  return (
    <>
      <Row>
        <Col className="col-2">
          <h5> state filter : </h5>
        </Col>
        <Col>
          <select onChange={(e) => setStatuFilter(e.target.value)}>
            <option value="new">new</option>
            <option value="changed">Changed</option>
          </select>
        </Col>
      </Row>
    </>
  );
}
