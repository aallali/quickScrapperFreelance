import React, { useEffect, useState } from "react";
import "./Products.css";
import { Row, Col, Table, Image } from "react-bootstrap";
import useFetch from "../../utils/useFetch";

export default function Products() {
  const [statuFilter, setStatuFilter] = useState("new");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCatFilter] = useState("");
  const { data: db } = useFetch(
    "https://automate-web-test-scraplng.s3.amazonaws.com/products.json"
  );
  const { data: categories } = useFetch(
    "https://automate-web-test-scraping.s3.us-east-1.amazonaws.com/categories.json"
  );
  const [data, updateData] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    updateData(
      db.filter(
        (l) =>
          l.statu === statuFilter &&
          l.listUrl.includes(categoryFilter) &&
          (l.brand || "").includes(brandFilter)
      )
    );

    let brandSet = new Set();
    for (let i = 0; i < db.length; i++) {
      const el = db[i];
      if (el.brand) {
        brandSet.add(el.brand);
      }
    }

    setBrands(Array.from(brandSet));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, statuFilter, brandFilter, categoryFilter]);

  function liveSearch(value, column) {
    if (value.length >= 3 || value.length === 0)
      updateData(
        db.filter(
          (l) =>
            l.statu === statuFilter &&
            l.listUrl.includes(categoryFilter) &&
            (l.brand || "").includes(brandFilter) &&
            l[column].toLowerCase().includes(value.toLowerCase())
        )
      );
  }
  // function onClickImage(e) {
  //   e.target.height = e.target.height === 500 ? 50 : 500;
  // }

  return (
    <div className="inner-products">
      {!db.length ? (
        <h1>Loading ...</h1>
      ) : (
        <>
          {" "}
          <Row>
            <Col className="col-2">
              <h5> statu filter : </h5>
            </Col>
            <Col>
              <select onChange={(e) => setStatuFilter(e.target.value)}>
                <option value="new">
                  new ({db.filter((el) => el.statu === "new").length})
                </option>
                <option value="changed">
                  Changed ({db.filter((el) => el.statu === "changed").length})
                </option>
                <option value="stable">
                  Stable ({db.filter((el) => el.statu === "stable").length})
                </option>
                <option value="deleted">
                  deleted ({db.filter((el) => el.statu === "deleted").length})
                </option>
              </select>
            </Col>
          </Row>
          <Row>
            <Col className="col-2">
              <h5> categories filter : </h5>
            </Col>
            <Col>
              <select onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">all</option>
                {categories.sort().map((l) => (
                  <option
                    key={"categorie-" + l}
                    value={l.replace("https://www.sephora.fr", "")}
                  >
                    [X] - {l.replace("https://www.sephora.fr/", "")}
                  </option>
                ))}
              </select>
            </Col>
          </Row>
          <Row>
            <Col className="col-2">
              <h5> brand filter : </h5>
            </Col>
            <Col>
              <select onChange={(e) => setBrandFilter(e.target.value)}>
                <option value="">all</option>
                {brands.sort().map((l, i) => {
                  return (
                    <option key={i} value={l}>
                      {l} (
                      {
                        db.filter(
                          (el) =>
                            el.statu === statuFilter &&
                            el.listUrl.includes(categoryFilter) &&
                            el.brand.includes(l)
                        ).length
                      }
                      )
                    </option>
                  );
                })}
              </select>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4>
                {" "}
                total products with that filter {data.length} (note: only 1000
                elements listed in table)
              </h4>
            </Col>
          </Row>
          <Row>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={(e) => liveSearch(e.target.value, "id")}
                    />
                  </th>
                  {/* <th>image</th> */}
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={(e) => liveSearch(e.target.value, "name")}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={(e) => liveSearch(e.target.value, "brand")}
                    />
                  </th>
                  <th></th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={(e) => liveSearch(e.target.value, "updated_at")}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={(e) => liveSearch(e.target.value, "created_at")}
                    />
                  </th>
                  <th></th>
                </tr>
                <tr>
                  <th>#</th>
                  <th>id</th>
                  {/* <th>image</th> */}
                  <th>name</th>
                  <th>brand</th>
                  <th>price</th>
                  <th>updated_at</th>
                  <th>created_at</th>
                  <th>Source List</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 500).map((l, i) => (
                  <tr key={`product-${l.id}`}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        className="p-0"
                        type="text"
                        value={l.id}
                        onChange={() => null}
                      />
                    </td>
                    {/* <td className="p-0">
                  <Image
                    src={l.image}
                    height={50}
                    onClick={onClickImage}
                  ></Image>
                </td> */}
                    <td>
                      {l.name} -{" "}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={"https://www.sephora.fr" + l.url}
                      >
                        click
                      </a>
                    </td>

                    <td>{l.brand}</td>
                    <td>{l.price}</td>
                    <td className="text-nowrap">{l.updated_at}</td>
                    <td className="text-nowrap">{l.created_at}</td>

                    <td>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={"https://www.sephora.fr" + l.listUrl}
                      >
                        click
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Row>{" "}
        </>
      )}
    </div>
  );
}
