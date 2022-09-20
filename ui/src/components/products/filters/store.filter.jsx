import { Row, Col } from "react-bootstrap";

export default function StoreFilter({ stores, store, setStore }) {
  return (
    <>
      <Row>
        <Col className="col-2">
          <h5> store filter : </h5>
        </Col>
        <Col>
          <select
            onChange={(e) =>
              setStore(stores.find((el) => el.name === e.target.value))
            }
            defaultValue={store.name}
            className="col-md-6"
          >
            {stores.map((l) => (
              <option value={l.name} key={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </Col>
      </Row>
    </>
  );
}
