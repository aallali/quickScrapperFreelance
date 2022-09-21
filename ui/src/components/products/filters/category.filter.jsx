
import { Row, Col } from "react-bootstrap";
import MultiSelectDropdown from "../../MultiSelectDropdown";

export default function CategoryFilter({categories, store, setCatFilter}) {
  return (
    <>
      <Row>
        <Col className="col-2">
          <h5> categories filter : </h5>
        </Col>
        <Col>
          <MultiSelectDropdown
            allOptions={[
              ...Array.from(new Set(categories)).map((l) => ({
                label: l
				.replace(store.prefix, "")
                    .split("/")
                    .at(-2)
                    .split("-")
                    .join(" ")
                    .replace(/ [^ ]+$/, ""),
                  value: l.replace(store.prefix, ""),
              })),
            ]}
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
    </>
  );
}
