import React, { useState } from "react";

import { Pagination, Button, Row, Col, Table, Image } from "react-bootstrap";
import { usePagination, useImages, useFilters } from "./logic";
import useFetch from "../../utils/useFetch";

import "./Products.css";
import config from "../../common/config.json";

export default function Products() {
  const [store, setStore] = useState(
    config.stores.find((el) => el.name === "sephora.fr")
  );

  const { data: db, error } = useFetch(store?.products);
  const { data: categories } = useFetch(store?.categories);
  const [data, updateData] = useState([]);
  const [loadImages, setImageToLoad, onClickImage] = useImages();

  const [paginations, updatePage, setPagination] = usePagination(
    setImageToLoad,
    data,
    config.elementPerPage
  );

  const [
    brands,
    liveSearch,
    runFilter,
    statuFilter,
    setStatuFilter,
    setBrandFilter,
    categoryFilter,
    setCatFilter,
  ] = useFilters(
    config.minLengthToTriggerFilter,
    config.defaultStatuFilter,
    updateData,
    db
  );
 
  return (
    <div className="inner-products">
      {!db.length ? (
        <h1>{error || "Loading ..."}</h1>
      ) : (
        <>
          {" "}
          <Row>
            <Col className="col-2">
              <h5> store filter : </h5>
            </Col>
            <Col>
              <select
                onChange={(e) =>
                  setStore(
                    config.stores.find((el) => el.name === e.target.value)
                  )
                }
              >
                {config.stores.map((l) => (
                  <option value={l.name} key={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Col>
          </Row>
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
                {Array.from(new Set(categories))
                  .sort()
                  .map((l) => (
                    <option
                      key={"categorie-" + l}
                      value={l.replace("https://www.sephora.fr", "")}
                    >
                      [&#10004;] - {l.replace("https://www.sephora.fr/", "")}
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
                            el.listUrl.join(" ").includes(categoryFilter) &&
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
              <h5>
                {" "}
                total products with that filter {data.length} (note:{" "}
                {paginations.perpage} elements listed per page)
              </h5>
            </Col>
          </Row>
          <Row>
            <Pagination
              size="md"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Pagination.Item
                key={"previous"}
                active={false}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page - 1 > 0 ? prev.page - 1 : 0,
                  }))
                }
              >
                Previous
              </Pagination.Item>
              <Pagination.Item key={"page"} active={true}>
                <input
                  type="text"
                  style={{ width: "40px", height: "20px", padding: "0px" }}
                  value={paginations.page + 1}
                  onChange={updatePage}
                />
                /{paginations.total}
              </Pagination.Item>
              <Pagination.Item
                key={"next"}
                active={false}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page:
                      prev.page + 1 < prev.total ? prev.page + 1 : prev.page,
                  }))
                }
              >
                Next
              </Pagination.Item>
            </Pagination>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>
                    <Button onClick={runFilter}>Filter</Button>
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder={"filter here..."}
                      onChange={liveSearch("id")}
                    />
                  </th>
                  <th>
                    
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={liveSearch("name")}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={liveSearch("brand")}
                    />
                  </th>
                  <th></th>
                  <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={liveSearch("updated_at")}
                    />
                  </th>
                  {/* <th>
                    <input
                      type="text"
                      placeholder="filter here..."
                      onChange={(e) => liveSearch(e.target.value, "created_at")}
                    />
                  </th> */}
                  <th></th>
                </tr>
                <tr>
                  <th>#</th>
                  <th>id</th>
                  <th>image</th>
                  <th>name</th>
                  <th>brand</th>
                  <th>price</th>
                  <th>updated_at</th>
                  {/* <th>created_at</th> */}
                  <th>Source List</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .slice(
                    paginations.page * paginations.perpage,
                    paginations.perpage * (paginations.page + 1)
                  )
                  .map((l, i) => (
                    <tr key={`product-${l.id}`}>
                      <td>{i + 1}</td>
                      <td>{l.id}</td>
                      <td className="p-0">
                        <Image
                          src={loadImages ? l.image : l.image}
                          height={50}
                          loading={"lazy"}
                          onClick={onClickImage}
                        ></Image>
                      </td>
                      <td>
                        {l.name} -{" "}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={store.prefix + l.url}
                        >
                          click
                        </a>
                      </td>

                      <td>{l.brand}</td>
                      <td>{l.price}</td>
                      <td className="text-nowrap">{l.updated_at}</td>
                      {/* <td className="text-nowrap">{l.created_at}</td> */}

                      <td>
                        {l.listUrl.map((url, i) => (
                          <div key={url + "<=>" + i}>
                            {" "}
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={store.prefix + url}
                            >
                              click
                            </a>{" "}
                            |{" "}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Row>
        </>
      )}
    </div>
  );
}
