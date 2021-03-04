import React from 'react';

interface ObserverProps {
  threshold?: number;
  enabled?: boolean;
  rootMargin?: string;
  root?: React.MutableRefObject<HTMLDivElement | null>;
  target: React.MutableRefObject<Element | null | undefined>;
  onIntersect: () => void;
}

export default function useIntersectionObserver({
  root,
  target,
  onIntersect,
  threshold = 0,
  rootMargin = '0px',
  enabled = true,
}: ObserverProps) {
  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => entry.isIntersecting && onIntersect()),
      {
        root: root && root.current,
        rootMargin,
        threshold,
      }
    );

    const el = target && target.current;

    if (!el) {
      return;
    }

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [target?.current, enabled]);
}
