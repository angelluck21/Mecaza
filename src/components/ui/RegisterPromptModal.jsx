import React from 'react';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BENEFITS = [
  'Ver detalles completos del viaje',
  'Información del conductor y vehículo',
  'Precios y rutas disponibles',
  'Reservar asientos específicos',
  'Historial de tus viajes',
];

const RegisterPromptModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-glow" />
          <div className="modal-icon-wrap">
            <FaCar />
          </div>
          <h3 className="modal-title">¡Regístrate para continuar!</h3>
          <p className="modal-sub">Accede a todos los detalles del viaje</p>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="modal-benefits">
            <p className="modal-benefits-label">¿Qué obtienes?</p>
            <div className="modal-benefits-list">
              {BENEFITS.map((b) => (
                <div key={b} className="modal-benefit-item">
                  <div className="modal-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="modal-btn-primary"
              onClick={() => { onClose(); navigate('/registrar'); }}
            >
              Crear cuenta gratis →
            </button>
            <button
              className="modal-btn-secondary"
              onClick={() => { onClose(); navigate('/login'); }}
            >
              Ya tengo cuenta
            </button>
            <button className="modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPromptModal;
