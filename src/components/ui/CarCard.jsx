import React from 'react';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaChair } from 'react-icons/fa';
import CarImage from './CarImage';
import { getCarImageUrl, getEstadoInfo, formatFecha } from '../../utils';

const CarCard = ({ car, onVerDetalles, userData }) => {
  const estadoInfo       = getEstadoInfo(car.estado || car.Estado || car.id_estados || car.id_estado);
  const asientosDisp     = car.asientos_disponibles ?? car.asientos;
  const asientosOcupados = (car.asientos || 0) - asientosDisp;
  const hayOcupados      = car.asientos_disponibles !== undefined && asientosOcupados > 0;
  const sinAsientos      = asientosDisp === 0;
  const enViaje          = parseInt(car.id_estados ?? car.estado ?? car.Estado ?? 0) === 2;

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl hover:shadow-violet-200/50 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1">

      {/* Borde gradiente superior */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600 transition-all duration-300 group-hover:h-1.5" />

      {/* Imagen */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-violet-50 h-44">
        <CarImage
          imageUrl={getCarImageUrl(car.imagencarro)}
          conductorName={car.conductor}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full flex items-center justify-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${estadoInfo.color}`}>
            {estadoInfo.label}
          </span>
        </div>

        {/* Badge sin asientos */}
        {sinAsientos && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wide">COMPLETO</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">

        {/* Conductor */}
        <h3 className="text-blue-900 font-bold text-base mb-3 group-hover:text-violet-800 transition-colors duration-200 truncate">
          {car.conductor || 'Conductor'}
        </h3>

        {/* Info */}
        <div className="space-y-1.5 text-sm text-gray-600 flex-1">

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold tracking-wider">
              {car.placa || '—'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-violet-500 shrink-0 text-xs" />
            <span className="truncate">
              {car.precioviaje
                ? `${car.precioviaje.origen} → ${car.precioviaje.destino}`
                : 'Ruta no especificada'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaClock className="text-violet-500 shrink-0 text-xs" />
            <span>{car.horasalida || 'Hora no especificada'}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-violet-500 shrink-0 text-xs" />
            <span>{formatFecha(car.fecha)}</span>
          </div>

          {/* Asientos */}
          <div className="flex items-center gap-2 pt-1">
            <FaChair className="text-violet-500 shrink-0 text-xs" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-semibold ${sinAsientos ? 'text-red-600' : hayOcupados ? 'text-orange-600' : 'text-green-700'}`}>
                {asientosDisp}
              </span>
              <span className="text-gray-400 text-xs">de {car.asientos || '—'} asientos</span>
              {hayOcupados && !sinAsientos && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  {asientosOcupados} ocupado{asientosOcupados !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Barra de ocupación */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sinAsientos ? 'bg-red-500' : hayOcupados ? 'bg-orange-400' : 'bg-green-500'
              }`}
              style={{ width: `${car.asientos ? ((asientosOcupados / car.asientos) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Botón */}
        {enViaje ? (
          <div className="mt-4 w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-center bg-yellow-50 text-yellow-600 border border-yellow-200 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            En viaje
          </div>
        ) : (
          <button
            onClick={() => onVerDetalles(car.id_carros)}
            disabled={sinAsientos}
            className={`mt-4 w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
              sinAsientos
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-700 to-violet-600 text-white hover:from-blue-800 hover:to-violet-700 shadow-md hover:shadow-violet-300/50 hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {sinAsientos ? 'Sin lugares disponibles' : userData ? 'Reservar Viaje' : 'Ver Detalles'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CarCard;
