import { useEffect, useState } from "react";

export function usePagination(data, perpage) {
  const [paginations, setPagination] = useState({
    page: 0,
    perpage,
    total: 0,
  });

  function updatePage(e) {
    const page = parseInt(e.target.value);

    if (page && !isNaN(page) && page - 1 < paginations.total && page - 1 > 0) {
      setPagination((prev) => ({
        ...prev,
        page: page - 1,
      }));
    }
  }
  useEffect(() => {
   
    setPagination((prev) => ({
      page: 0,
      perpage: prev.perpage,
      total: Math.ceil(data.length / paginations.perpage),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

 

  return [paginations, updatePage, setPagination];
}
