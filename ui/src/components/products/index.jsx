import React, { useEffect, useState } from "react";

import { Pagination, Row, Col, Table, Image } from "react-bootstrap";
import { usePagination, useImages, useFilters } from "./logic";
import useFetch from "../../utils/useFetch";
import MultiSelectDropdown from "../MultiSelectDropdown";
import "./Products.css";
import config from "../../common/config.json";

function countSuffix(count) {
  return count ? `(${count})` : null;
}

function isCategoryIncluded(cat, cats) {
 
  for (let i = 0; i < cats.length; i++) {
      if (cat.includes(cats[i]))
        return true
  }
  return false
}
export default function Products() {
  const [store, setStore] = useState(
    config.stores.find((el) => el.name === "sephora.fr")
  );
  const [isFirstFetch, setFirstFetch] = useState(true);
  const { data: db, error, setData: updateDB } = useFetch(store?.products);
  const [categories, setCategories] = useState([]);
  const [data, updateData] = useState([]);
  const [onClickImage] = useImages();

  const [paginations, setPagination] = usePagination(
    data,
    config.elementPerPage
  );

  const [
    brands,
    liveSearch,
    
    statuFilter,
    setStatuFilter,
    setBrandFilter,
    categoriesFilter,
    setCatFilter,
  ] = useFilters(
    config.minLengthToTriggerFilter,
    config.defaultStatuFilter,
    updateData,
    db
  );
  useEffect(() => {
    if (isFirstFetch && db.length) {
      let allCats = [];
      let tmpData = [...db];
      tmpData = tmpData.filter((l) => !["deleted", "stable"].includes(l.statu));

      for (let i = 0; i < tmpData.length; i++) {
        let el = tmpData[i];
        allCats.push(...[].concat(el.categoryUrl));
      }

      tmpData.sort((a, b) => {
        let fa = a.brand.toLowerCase(),
          fb = b.brand.toLowerCase();

        if (fa < fb) {
          return -1;
        }
        if (fa > fb) {
          return 1;
        }
        return 0;
      });

      setFirstFetch(false);
      updateDB(tmpData);
      setCategories(allCats);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  useEffect(() => {
    setFirstFetch(true);
  }, [store]);
  return (
    <div className="inner-products">
      {isFirstFetch && !db.length ? (
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
                defaultValue={store.name}
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
              <h5> state filter : </h5>
            </Col>
            <Col>
              <select onChange={(e) => setStatuFilter(e.target.value)}>
                <option value="new">new</option>
                <option value="changed">Changed</option>
              </select>
            </Col>
          </Row>
          <Row>
            <Col className="col-2">
              <h5> categories filter : </h5>
            </Col>
            <Col>
              <MultiSelectDropdown
                allOptions={[...Array.from(new Set(categories)).map((l) => ({
                  label: l
                    .replace(store.prefix, "")
                    .split("/")
                    .at(-2)
                    .split("-")
                    .join(" ")
                    .replace(/ [^ ]+$/, ""),
                  value: l.replace(store.prefix, ""),
                }))]}
                onChangeCategories={setCatFilter}
              />
              {/* <select onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">all</option>
                {Array.from(new Set(categories))
                  .sort()
                  .map((l) => (
                    <option
                      key={"categorie-" + l}
                      value={l.replace(store.prefix, "")}
                    >
                      [&#10004;] -{" "}
                      {l
                        .replace(store.prefix, "")
                        .split("/")
                        .at(-2)
                        .split("-")
                        .join(" ")
                        .replace(/ [^ ]+$/, "")}
                    </option>
                  ))}
              </select> */}
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
                      {l}{" "}
                      {countSuffix(
                        data.filter(
                          (el) =>
                            el.statu === statuFilter &&
                            isCategoryIncluded(el.listUrl.join(" "), categoriesFilter) &&
                             
                            el.brand.includes(l)
                        ).length
                      )}
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
            <Table striped bordered hover>
              <thead>
                <tr>
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
                      onChange={liveSearch("name")}
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
                </tr>
                <tr>
                  <th>brand</th>
                  <th>image</th>
                  <th>name</th>
                  <th>price </th>
                  <th>updated_at</th>
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
                      <td>{l.brand}</td>
                      <td className="p-0">
                        <Image
                          src={l.image}
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
                      <td>{l.price} € </td>
                      <td className="text-nowrap">
                        {l.updated_at.split(" ")[0]}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            <Pagination
              size="md"
              style={{ display: "flex", justifyContent: "center" }}
            >
              {paginations.page > 0 ? (
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
                  &lt;
                </Pagination.Item>
              ) : null}
              <Pagination.Item key={"page"} active={true}>
                Page {paginations.page + 1} sur {paginations.total}
              </Pagination.Item>
              {paginations.page + 1 < paginations.total ? (
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
                  &gt;
                </Pagination.Item>
              ) : null}
            </Pagination>
          </Row>
        </>
      )}
    </div>
  );
}
