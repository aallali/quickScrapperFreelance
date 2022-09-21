import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading("loading...");
    setData([]);
    setError(null);
    const source = axios.CancelToken.source();
    if (url)
      setTimeout(() => {
        axios
          .get(url, { cancelToken: source.token })
          .then((res) => {
            setLoading(false);
            if((res.data).length > 0) res.data && setData(res.data);
			else setError("there is no data for this store today, please refresh the page and try again.");
          })
          .catch((err) => {
            setLoading(false);
            setError("An error occured. Awkward..");
          });
      }, 1000);
    return () => {
      source.cancel();
    };
  }, [url]);

  return { data, loading, error, setData };
};

export default useFetch;
