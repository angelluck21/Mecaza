import React from 'react';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaChair } from 'react-icons/fa';
import CarImage from './CarImage';
import { getCarImageUrl, formatFecha } from '../../utils';

/* Estado → badge class */
const BADGE_CLASS = {
  1: 'badge-green',
  2: 'badge-amber',
  3: 'badge-orange',
  4: 'badge-red',
  5: 'badge-gray',
};

const BADGE_LABEL = {
  1: 'Disponible',
  2: 'En viaje',
  3: 'Mantenimiento',
  4: 'Fuera de servicio',
  5: 'Terminado',
};

const CarCard = ({ car, onVerDetalles, userData }) => {
  const estadoId     = parseInt(car.id_estados ?? car.estado ?? car.Estado ?? 0);
  const badgeClass   = BADGE_CLASS[estadoId]  || 'badge-gray';
  const badgeLabel   = BADGE_LABEL[estadoId]  || 'Desconocido';
  const enViaje      = estadoId === 2;

  const asientosDisp     = car.asientos_disponibles ?? car.asientos;
  const asientosOcupados = (car.asientos || 0) - asientosDisp;
  const hayOcupados      = car.asientos_disponibles !== undefined && asientosOcupados > 0;
  const sinAsientos      = asientosDisp === 0;

  /* Seats color class */
  const seatsClass    = sinAsientos ? 'none' : hayOcupados ? 'mid' : 'ok';
  const pct           = car.asientos ? ((asientosOcupados / car.asientos) * 100) : 0;

  /* Ruta text */
  const rutaText = car.precioviaje
    ? `${car.precioviaje.origen} → ${car.precioviaje.destino}`
    : 'Ruta no especificada';

  return (
    <div className="car-card">
      {/* Amber top line */}
      <div className="car-card-topline" />

      {/* Image */}
      <div className="car-card-img">
        <CarImage
          imageUrl={getCarImageUrl(car.imagencarro)}
          conductorName={car.conductor}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full flex items-center justify-center"
        />
        <div className="car-card-img-overlay" />

        {/* Estado badge */}
        <span className={`car-card-badge ${badgeClass}`}>{badgeLabel}</span>

        {/* Sin asientos */}
        {sinAsientos && <div className="car-card-full">COMPLETO</div>}
      </div>

      {/* Body */}
      <div className="car-card-body">
        <h3 className="car-card-driver">{car.conductor || 'Conductor'}</h3>
        <span className="car-card-plate">{car.placa || '—'}</span>

        <div className="car-card-info">
          <div className="car-card-row">
            <FaMapMarkerAlt className="car-icon" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {rutaText}
            </span>
          </div>
          <div className="car-card-row">
            <FaClock className="car-icon" />
            <span>{car.horasalida || 'Hora no especificada'}</span>
          </div>
          <div className="car-card-row">
            <FaCalendarAlt className="car-icon" />
            <span>{formatFecha(car.fecha)}</span>
          </div>

          {/* Asientos */}
          <div className="car-card-seats">
            <div className="car-card-seats-row">
              <FaChair className="car-icon" style={{ color: 'var(--amber)', fontSize: '0.7rem' }} />
              <span className={`car-seats-num ${seatsClass}`}>{asientosDisp}</span>
              <span className="car-card-seats-label">de {car.asientos || '—'} asientos</span>
              {hayOcupados && !sinAsientos && (
                <span className="car-seats-tag">
                  {asientosOcupados} ocupado{asientosOcupados !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="car-card-progress">
              <div
                className={`car-card-progress-fill ${seatsClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="car-card-action">
          {enViaje ? (
            <div className="car-card-btn in-trip">
              <span className="trip-dot" />
              En viaje
            </div>
          ) : (
            <button
              className={`car-card-btn ${sinAsientos ? 'disabled' : 'primary'}`}
              disabled={sinAsientos}
              onClick={() => !sinAsientos && onVerDetalles(car.id_carros)}
            >
              {sinAsientos ? 'Sin lugares disponibles' : userData ? 'Reservar viaje →' : 'Ver detalles →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
