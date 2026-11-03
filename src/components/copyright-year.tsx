"use client";

import { useEffect, useRef } from "react";

const BUILD_YEAR = 2026;

export function CopyrightYear() {
  const ref = useRef<HTMLSpanElement>(null);

  // Update the DOM directly (not via setState) to keep this in sync with the
  // visitor's clock without triggering a render during prerendering.
  useEffect(() => {
    if (ref.current) ref.current.textContent = String(new Date().getFullYear());
  }, []);

  return <span ref={ref}>{BUILD_YEAR}</span>;
}
