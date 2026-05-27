import React from 'react';
import { FaShieldAlt, FaMapMarkedAlt, FaTag } from 'react-icons/fa';
import { useCarousel } from '../../hooks/useCarousel';
import { CAROUSEL_SLIDES } from '../../constants';

const SLIDE_ICONS = {
  shield: <FaShieldAlt />,
  map:    <FaMapMarkedAlt />,
  tag:    <FaTag />,
};

const SLIDE_TITLES = {
  shield: ['Viajes', 'Seguros'],
  map:    ['Destinos', 'Increíbles'],
  tag:    ['Precios', 'Justos'],
};

const Carousel = () => {
  const { current, goTo, next, prev } = useCarousel(CAROUSEL_SLIDES);

  return (
    <div className="hero-carousel">

      {/* Track */}
      <div
        className="hero-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {CAROUSEL_SLIDES.map((slide, index) => {
          const [word1, word2] = SLIDE_TITLES[slide.iconKey] ?? [slide.title, ''];
          const isActive = index === current;
          return (
            <div key={slide.id} className="hero-slide">
              <div className="hero-slide-inner">

                {/* Icon */}
                <div className="hero-icon-wrap" style={{ animationPlayState: isActive ? 'running' : 'paused' }}>
                  {SLIDE_ICONS[slide.iconKey]}
                </div>

                {/* Title */}
                <h1 className="hero-title">
                  {word1}&nbsp;<em>{word2}</em>
                </h1>

                {/* Subtitle */}
                <p className="hero-sub">{slide.subtitle}</p>

                {/* Accent line */}
                <div className={`hero-accent-line ${isActive ? 'visible' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev arrow */}
      <button onClick={prev} className="hero-arrow prev" aria-label="Anterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next arrow */}
      <button onClick={next} className="hero-arrow next" aria-label="Siguiente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
