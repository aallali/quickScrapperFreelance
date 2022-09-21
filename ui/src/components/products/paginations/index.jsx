import { Pagination } from "react-bootstrap";

export default function PaginationBar({ paginations, setPagination }) {
  return (
    <>
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
          Page {paginations.page + 1} sur {paginations.total || 1}
        </Pagination.Item>
        {paginations.page + 1 < paginations.total ? (
          <Pagination.Item
            key={"next"}
            active={false}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page + 1 < prev.total ? prev.page + 1 : prev.page,
              }))
            }
          >
            &gt;
          </Pagination.Item>
        ) : null}
      </Pagination>
    </>
  );
}
