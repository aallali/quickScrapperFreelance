import { useState } from "react";

export  function useImages() {
    const [loadImages, setImageToLoad] = useState(false);
    function onClickImage(e) {
      e.target.height = e.target.height === 500 ? 50 : 500;
    }
  
    return [loadImages, setImageToLoad, onClickImage];
  }