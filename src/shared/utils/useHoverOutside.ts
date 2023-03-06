import { useEffect } from "react";

export function useHoverOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mouseover", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mouseover", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
