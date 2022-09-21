import { Row, Col } from "react-bootstrap";
function countSuffix(count) {
  return count ? `(${count})` : null;
}

function isCategoryIncluded(cat, cats) {
  for (let i = 0; i < cats.length; i++) {
    if (cat.includes(cats[i])) return true;
  }
  return false;
}

export default function BrandFilter({brands, setBrandFilter, data, statuFilter, categoriesFilter}) {
  return (
    <>
      <Row>
        <Col className="col-2">
          <h5> brand filter : </h5>
        </Col>
        <Col  >
          <select onChange={(e) => setBrandFilter(e.target.value)} className="col-md-6">
            <option value="">all</option>
            {brands.sort().map((l, i) => {
              return (
                <option key={i} value={l}>
                  {l}{" "}
                  {countSuffix(
                    data.filter(
                      (el) =>
                        el.statu === statuFilter &&
                        isCategoryIncluded(
                          el.listUrl.join(" "),
                          categoriesFilter
                        ) &&
                        el.brand.includes(l)
                    ).length
                  )}
                </option>
              );
            })}
          </select>
        </Col>
      </Row>
    </>
  );
}
