 

export  function useImages() {
  
    function onClickImage(e) {
      e.target.height = e.target.height === 500 ? 50 : 500;
    }
  
    return [onClickImage];
  }