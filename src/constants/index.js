export const ESTADOS_CARRO = {
  1: { label: 'Esperando pasajeros', color: 'bg-green-100 text-green-800' },
  2: { label: 'En viaje',            color: 'bg-yellow-100 text-yellow-800' },
  3: { label: 'En mantenimiento',    color: 'bg-orange-100 text-orange-800' },
  4: { label: 'Fuera de servicio',   color: 'bg-red-100 text-red-800' },
  5: { label: 'Viaje terminado',     color: 'bg-gray-100 text-gray-600' },
};

export const ROLES = {
  ADMIN: 'admin',
  CONDUCTOR: 'conductor',
  USUARIO: 'usuario',
};

// Los íconos del carousel se definen en el componente Carousel.jsx
// usando React Icons para evitar emojis
export const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: 'Viajes Seguros y Confiables',
    subtitle: 'Conductores verificados para tu tranquilidad',
    iconKey: 'shield',
  },
  {
    id: 2,
    title: 'Destinos Increíbles',
    subtitle: 'Explora nuevos lugares con comodidad',
    iconKey: 'map',
  },
  {
    id: 3,
    title: 'Precios Justos',
    subtitle: 'Tarifas transparentes sin sorpresas',
    iconKey: 'tag',
  },
];
