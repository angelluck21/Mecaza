import React from 'react';
import { FaShieldAlt, FaMapMarkedAlt, FaTag } from 'react-icons/fa';
import { useCarousel } from '../../hooks/useCarousel';
import { CAROUSEL_SLIDES } from '../../constants';

const SLIDE_ICONS = {
  shield: <FaShieldAlt className="text-white drop-shadow-xl" style={{ fontSize: '5rem' }} />,
  map:    <FaMapMarkedAlt className="text-white drop-shadow-xl" style={{ fontSize: '5rem' }} />,
  tag:    <FaTag className="text-white drop-shadow-xl" style={{ fontSize: '5rem' }} />,
};

const Carousel = () => {
  const { current, goTo, next, prev } = useCarousel(CAROUSEL_SLIDES);

  return (
    <div className="relative h-[26rem] overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div key={slide.id} className="w-full flex-shrink-0 relative flex items-center justify-center">
            <div className="text-center text-white px-4 z-10">

              {/* Ícono */}
              <div className={`flex justify-center mb-8 transition-all duration-700 ${index === current ? 'animate-float' : 'opacity-0'}`}>
                <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
                  {SLIDE_ICONS[slide.iconKey]}
                </div>
              </div>

              {/* Título */}
              <h1 className={`text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg transition-all duration-500 ${index === current ? 'animate-fade-in-up' : 'opacity-0'}`}>
                {slide.title}
              </h1>

              {/* Subtítulo */}
              <p className={`text-base md:text-xl text-blue-200 drop-shadow transition-all duration-500 delay-200 ${index === current ? 'animate-fade-in-up' : 'opacity-0'}`}>
                {slide.subtitle}
              </p>

              {/* Línea decorativa */}
              <div className={`mx-auto mt-5 h-0.5 rounded-full bg-gradient-to-r from-violet-400 to-blue-300 transition-all duration-700 ${index === current ? 'w-20 opacity-100' : 'w-0 opacity-0'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Botón prev */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 glass text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Botón next */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 glass text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-violet-400 shadow-lg shadow-violet-400/50' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
