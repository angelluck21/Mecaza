import React from 'react';
import { useCarousel } from '../../hooks/useCarousel';
import { CAROUSEL_SLIDES } from '../../constants';

const Carousel = () => {
  const { current, goTo, next, prev } = useCarousel(CAROUSEL_SLIDES);

  return (
    <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-800 to-blue-600">
      <div className="flex h-full">
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative"
            style={{ transform: `translateX(-${current * 100}%)`, transition: 'transform 0.5s ease-in-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-blue-700/40 z-10" />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <div className="text-8xl mb-6 drop-shadow-lg">{slide.icon}</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{slide.title}</h1>
                <p className="text-xl md:text-2xl text-blue-100 drop-shadow-lg">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones prev / next */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-full transition-all">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-full transition-all">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-blue-400' : 'bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
