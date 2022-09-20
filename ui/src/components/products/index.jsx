import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";

import "./Products.css";


import { usePagination, useImages, useFilters } from "./logic";
import useFetch from "../../utils/useFetch";
import config from "../../common/config.json";
// Components
import { ProdsTable } from "./table";
import StoreFilter from "./filters/store.filter";
import StatuFilter from "./filters/statu.filter";
import CategoryFilter from "./filters/category.filter";
import BrandFilter from "./filters/brand.filter";
import PaginationBar from "./paginations";

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
          <StoreFilter
            stores={config.stores}
            store={store}
            setStore={setStore}
          />
          <StatuFilter setStatuFilter={setStatuFilter} />
          <CategoryFilter
            categories={categories}
            store={store}
            setCatFilter={setCatFilter}
          />
          <BrandFilter
            brands={brands}
            setBrandFilter={setBrandFilter}
            data={data}
            statuFilter={statuFilter}
            categoriesFilter={categoriesFilter}
          />
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
            <ProdsTable
              liveSearch={liveSearch}
              data={data}
              paginations={paginations}
              onClickImage={onClickImage}
              store={store}
            />

            <PaginationBar
              paginations={paginations}
              setPagination={setPagination}
            />
          </Row>
        </>
      )}
    </div>
  );
}
