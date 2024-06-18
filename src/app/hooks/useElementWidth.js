import { useEffect, useState } from "react";

export const useElementWidth = (ref) => {
  // get the width of the ref by getting the clientRect
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (ref && ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
    }
  }, [ref]);

  return width;
};
