import { useEffect } from "react";

export function useHoverOutside(ref: any, handler: any) {
  useEffect(() => {
    const listener = (event: any) => {
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
