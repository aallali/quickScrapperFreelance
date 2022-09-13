import { useEffect, useState } from "react";

export function useFilters(minFilterLength, defaultStatu, updateData, db) {
  const [statuFilter, setStatuFilter] = useState(defaultStatu);
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCatFilter] = useState("");
  const [brands, setBrands] = useState([]);
  const [multiFilter, updateMultiFilter] = useState({
    id: "",
    name: "",
    brand: "",
    updated_at: "",
  });

  function liveSearch(column) {
    return (e) => {
      const value = e.target.value;
      if (value.length >= minFilterLength || value.length === 0) {
        updateMultiFilter((prev) => ({
          ...prev,
          [column]: value,
        }));
      }
    };
  }
  function runFilter() {
    updateData(
      db.filter(
        (l) =>
          l.statu === statuFilter &&
          l.listUrl.join(" ").includes(categoryFilter) &&
          (l.brand || "").includes(brandFilter) &&
          !Object.keys(multiFilter)
            .map((f) =>
              l[f].toLowerCase().includes(multiFilter[f].toLowerCase())
            )
            .includes(false)
      )
    );
  }
  useEffect(() => {
    updateData(
      db.filter(
        (l) =>
          l.statu === statuFilter &&
          l.listUrl.join(" ").includes(categoryFilter) &&
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
  return [
    brands,
    liveSearch,
    runFilter,
    statuFilter,
    setStatuFilter,
    setBrandFilter,
    categoryFilter,
    setCatFilter,
  ];
}
