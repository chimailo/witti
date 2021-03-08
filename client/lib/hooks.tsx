import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../rootReducer";

const { user: auth } = useSelector((state: RootState) => state.auth);

export const useOnScreen = (
  ref: React.MutableRefObject<null>,
  // loading: boolean,
  options = {}
) => {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  // const [page, setPage] = useState(1);

  const scrollObserver = useCallback((node) => {
    console.log(node);
    // if (loading) return;
    new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        console.log(entry.target);
        if (entry.isIntersecting) {
          setIntersecting(true);
          // setPage((prevPage) => prevPage + 1);
          observer.unobserve(entry.target);
        }
      });
    }, options).observe(node);
  }, []);

  useEffect(() => {
    if (ref.current) {
      scrollObserver(ref.current);
    }
  }, [scrollObserver]);

  return isIntersecting;
};
