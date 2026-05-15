import React from 'react';
import CarImage from './CarImage';
import { getCarImageUrl, getEstadoInfo, formatFecha } from '../../utils';

const CarCard = ({ car, onVerDetalles, userData }) => {
  const estadoInfo       = getEstadoInfo(car.estado || car.Estado || car.id_estados || car.id_estado);
  const asientosDisp     = car.asientos_disponibles ?? car.asientos;
  const asientosOcupados = (car.asientos || 0) - asientosDisp;
  const hayOcupados      = car.asientos_disponibles !== undefined && asientosOcupados > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <CarImage imageUrl={getCarImageUrl(car.imagencarro)} conductorName={car.conductor} />

      <div className="text-center w-full">
        <div className="text-blue-900 font-bold text-lg mb-2">{car.conductor || 'Conductor'}</div>

        <div className="text-gray-600 mb-2">
          <span className="font-semibold">Placa:</span> {car.placa || 'No especificada'}
        </div>

        <div className="text-gray-600 mb-2">
          <span className="font-semibold">Asientos:</span>{' '}
          <span className={hayOcupados ? 'text-orange-600 font-semibold' : 'text-gray-900'}>{asientosDisp}</span>
          <span className="text-gray-500 text-sm ml-1">de {car.asientos || '—'}</span>
          {hayOcupados && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {asientosOcupados} ocupado{asientosOcupados !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="text-gray-600 mb-2">
          <span className="font-semibold">Estado:</span>{' '}
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
            {estadoInfo.label}
          </span>
        </div>

        <div className="text-gray-600 mb-2"><span className="font-semibold">Destino:</span> {car.destino || 'No especificado'}</div>
        <div className="text-gray-600 mb-2"><span className="font-semibold">Hora:</span> {car.horasalida || 'No especificada'}</div>
        <div className="text-gray-600 mb-2"><span className="font-semibold">Fecha:</span> {formatFecha(car.fecha)}</div>
      </div>

      <button
        onClick={() => onVerDetalles(car.id_carros)}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {userData ? 'Reservar Viaje' : 'Ver Detalles'}
      </button>
    </div>
  );
};

export default CarCard;
