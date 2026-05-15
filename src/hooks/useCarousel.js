import { useState, useEffect } from 'react';

export const useCarousel = (slides, interval = 5000) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  const goTo   = (i) => setCurrent(i);
  const next   = () => setCurrent((p) => (p + 1) % slides.length);
  const prev   = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  return { current, goTo, next, prev };
};
