import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser, FaMapMarkerAlt, FaClock, FaCalendar,
  FaPhone, FaCheck, FaTimes,
} from 'react-icons/fa';

import PageBg            from '../components/ui/PageBg';
import InnerNavbar       from '../components/layout/InnerNavbar';
import SectionCard       from '../components/ui/SectionCard';
import LoadingScreen     from '../components/ui/LoadingScreen';
import FormInput         from '../components/ui/FormInput';
import CarImage          from '../components/ui/CarImage';
import ToastNotification from '../components/ui/ToastNotification';
import { useToast }      from '../hooks/useToast';
import { crearReservaApi } from '../services/api';
import { getCarImageUrl, getEstadoInfo, formatFecha } from '../utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api-mecaza.geekcorplab.com/api';

const VerDetalles = () => {
  const [userData,         setUserData]         = useState(null);
  const [isLoading,        setIsLoading]        = useState(true);
  const [carDetails,       setCarDetails]       = useState(null);
  const [selectedSeat,     setSelectedSeat]     = useState(null);
  const [seatInput,        setSeatInput]        = useState('');
  const [pickupLocation,   setPickupLocation]   = useState('');
  const [nombre,           setNombre]           = useState('');
  const [telefono,         setTelefono]         = useState('');
  const [precios,          setPrecios]          = useState(null);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isReserving,      setIsReserving]      = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const { carId } = useParams();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }

    try {
      const user = JSON.parse(stored);
      if (user.rol === 'conductor') { navigate('/conductor', { replace: true }); return; }
      setUserData(user);
      setNombre(user.Nombre || user.nombre || user.name || '');
      setTelefono(user.Telefono || user.telefono || user.tel || '');
    } catch {
      navigate('/login');
      return;
    }

    const loadAll = async () => {
      try {
        const [carrosResp, preciosResp, reservasResp] = await Promise.all([
          fetch(`${API_BASE}/listarcarro`),
          fetch(`${API_BASE}/listarprecios`),
          fetch(`${API_BASE}/listarreserva`),
        ]);

        const carrosData  = await carrosResp.json();
        const carrosArray = Array.isArray(carrosData) ? carrosData : (carrosData?.data ?? []);
        const car = carrosArray.find(c => (c.id_carros || c.id || c.ID) == carId);
        if (!car) { setIsLoading(false); return; }

        if (preciosResp.ok) {
          const pd = await preciosResp.json();
          const pa = Array.isArray(pd) ? pd : (pd?.data ?? []);
          if (pa.length > 0) {
            setPrecios({
              zaraMede:  pa[0]['zara-mede']  ?? 120000,
              zaraCauca: pa[0]['zara-cauca'] ?? 30000,
              caucaMede: pa[0]['cauca-mede'] ?? 100000,
            });
          }
        }

        if (reservasResp.ok) {
          const rd = await reservasResp.json();
          const ra = Array.isArray(rd) ? rd : (rd?.data ?? []);
          const ocupados = ra
            .filter(r => r.id_carros == carId && r.estado !== 'cancelada' && r.estado !== 'rechazada')
            .map(r => parseInt(r.Asiento || r.asiento || 0))
            .filter(n => n > 0);
          setAsientosOcupados(ocupados);
        }

        setCarDetails({
          id_carros:  car.id_carros || car.id,
          conductor:  car.conductor  || car.Conductor,
          placa:      car.placa      || car.Placa,
          asientos:   parseInt(car.asientos || car.Asientos) || 4,
          destino:    car.destino    || car.Destino,
          horasalida: car.horasalida || car.Horasalida,
          fecha:      car.fecha      || car.Fecha,
          imagencarro: car.imagencarro || car.Imagencarro,
          telefono:   car.telefono   || car.Telefono || 'No disponible',
          id_estados: car.id_estados || car.estado   || car.Estado,
        });
      } catch {
        // silencioso
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [carId, navigate]);

  const handleSeatClick = (seat) => {
    if (asientosOcupados.includes(seat)) {
      showToast(`El asiento ${seat} ya está ocupado.`, 'error');
      return;
    }
    setSelectedSeat(seat);
    setSeatInput(String(seat));
  };

  const handleSeatInput = (e) => {
    const val = e.target.value;
    setSeatInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && carDetails && num <= carDetails.asientos) {
      setSelectedSeat(num);
    } else {
      setSelectedSeat(null);
    }
  };

  const handleConfirm = () => {
    if (!userData) { navigate('/login'); return; }
    if (!selectedSeat)                              { showToast('Selecciona o escribe un número de asiento.', 'error'); return; }
    if (asientosOcupados.includes(selectedSeat))    { showToast('Ese asiento está ocupado. Elige otro.', 'error'); return; }
    if (!pickupLocation.trim())                     { showToast('Ingresa tu ubicación de recogida.', 'error'); return; }
    if (!nombre.trim())                             { showToast('Ingresa tu nombre.', 'error'); return; }
    if (!telefono.trim())                           { showToast('Ingresa tu teléfono.', 'error'); return; }
    if (carDetails.asientos - asientosOcupados.length <= 0) { showToast('No hay asientos disponibles.', 'error'); return; }
    const userId = userData.id || userData.id_users || userData.ID || userData.user_id || userData.userId;
    if (!userId) { showToast('Error de sesión. Inicia sesión nuevamente.', 'error'); navigate('/login'); return; }
    setShowConfirmation(true);
  };

  const handleReserve = async () => {
    setIsReserving(true);
    const carroId = carDetails.id_carros || carId;
    try {
      await crearReservaApi({
        Nombre:    nombre.trim(),
        Ubicacion: pickupLocation.trim(),
        Asiento:   selectedSeat,
        id_carros: carroId,
        Telefono:  telefono.trim(),
      });
      setShowConfirmation(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/indexLogin'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al reservar. Inténtalo de nuevo.';
      showToast(msg, 'error');
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando detalles del viaje..." />;

  if (!userData || !carDetails) return (
    <PageBg centered>
      <div className="text-center text-white space-y-3">
        <p className="text-lg font-semibold">{!userData ? 'Error de autenticación' : 'No se encontró el viaje'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm"
        >
          Volver
        </button>
      </div>
    </PageBg>
  );

  const totalAsientos  = carDetails.asientos;
  const disponibles    = totalAsientos - asientosOcupados.length;
  const estadoInfo     = getEstadoInfo(carDetails.id_estados);
  const seatOcupado    = selectedSeat && asientosOcupados.includes(selectedSeat);
  const isFormComplete = selectedSeat && !seatOcupado && pickupLocation.trim() && nombre.trim() && telefono.trim() && disponibles > 0;

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Detalles del viaje" />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{carDetails.destino}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{carDetails.conductor} · {carDetails.placa}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${estadoInfo.color}`}>
              {estadoInfo.label}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${disponibles > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {disponibles > 0 ? `${disponibles} asiento${disponibles !== 1 ? 's' : ''} libre${disponibles !== 1 ? 's' : ''}` : 'Sin asientos'}
            </span>
          </div>
        </div>

        {/* Cuerpo en dos columnas */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Columna izquierda: información ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Imagen */}
            <div className="rounded-2xl overflow-hidden shadow-xl bg-white/5">
              <CarImage
                imageUrl={getCarImageUrl(carDetails.imagencarro)}
                conductorName={carDetails.conductor}
                className="w-full h-56 object-cover"
                fallbackClassName="w-full h-56 bg-gradient-to-br from-blue-800/60 to-violet-800/60 flex items-center justify-center"
                fallbackIconSize="text-7xl"
              />
            </div>

            {/* Conductor */}
            <SectionCard title="Conductor" icon={<FaUser className="text-xs" />} accent="blue">
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Nombre</p>
                  <p className="font-semibold text-gray-800">{carDetails.conductor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Placa</p>
                  <p className="font-semibold text-gray-800">{carDetails.placa}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <FaPhone className="text-blue-500 text-xs shrink-0" />
                    {carDetails.telefono}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Detalles del viaje */}
            <SectionCard title="Detalles del viaje" icon={<FaMapMarkerAlt className="text-xs" />} accent="green">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Destino</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-green-500 text-xs shrink-0" /> {carDetails.destino}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Fecha</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <FaCalendar className="text-green-500 text-xs shrink-0" /> {formatFecha(carDetails.fecha)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Hora de salida</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <FaClock className="text-green-500 text-xs shrink-0" /> {carDetails.horasalida}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Asientos disponibles</p>
                  <p className="font-semibold text-gray-800">
                    {disponibles} de {totalAsientos}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Precios */}
            <SectionCard title="Precios por ruta" accent="orange">
              <div className="divide-y divide-gray-50">
                {[
                  { ruta: 'Zaragoza → Medellín', precio: precios?.zaraMede  ?? 120000 },
                  { ruta: 'Zaragoza → Caucasia', precio: precios?.zaraCauca ?? 30000  },
                  { ruta: 'Caucasia → Medellín', precio: precios?.caucaMede ?? 100000 },
                ].map(({ ruta, precio }) => (
                  <div key={ruta} className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-gray-600">{ruta}</span>
                    <span className="text-sm font-bold text-green-600">${precio.toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Columna derecha: reserva ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Selección de asiento */}
            <SectionCard title="Selecciona tu asiento" accent="violet">
              {/* Grid dinámico de asientos */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Array.from({ length: totalAsientos }, (_, i) => i + 1).map(seat => {
                  const ocupado      = asientosOcupados.includes(seat);
                  const seleccionado = selectedSeat === seat;
                  return (
                    <button
                      key={seat}
                      onClick={() => handleSeatClick(seat)}
                      disabled={ocupado}
                      title={ocupado ? `Asiento ${seat} ocupado` : `Seleccionar asiento ${seat}`}
                      className={[
                        'h-10 rounded-xl text-sm font-bold transition-all active:scale-95',
                        ocupado
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : seleccionado
                            ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-200 scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 hover:scale-105',
                      ].join(' ')}
                    >
                      {ocupado ? '✗' : seat}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Libre
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-br from-violet-400 to-blue-400 inline-block" /> Tuyo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-200 inline-block" /> Ocupado
                </span>
              </div>

              {/* Input numérico manual */}
              <FormInput
                label="O escribe el número de asiento"
                type="number"
                min="1"
                max={totalAsientos}
                value={seatInput}
                onChange={handleSeatInput}
                placeholder={`1 – ${totalAsientos}`}
                hint={
                  seatOcupado
                    ? `Asiento ${selectedSeat} ocupado — elige otro`
                    : selectedSeat
                      ? `Asiento ${selectedSeat} seleccionado`
                      : `Entre 1 y ${totalAsientos}`
                }
              />
            </SectionCard>

            {/* Datos del pasajero + confirmar */}
            <SectionCard title="Tus datos" icon={<FaUser className="text-xs" />} accent="blue">
              <div className="space-y-4">
                <FormInput
                  label="Nombre"
                  icon={<FaUser className="text-xs" />}
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
                <FormInput
                  label="Teléfono"
                  icon={<FaPhone className="text-xs" />}
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="+57 300 000 0000"
                  required
                />
                <FormInput
                  label="Ubicación de recogida"
                  icon={<FaMapMarkerAlt className="text-xs" />}
                  type="text"
                  value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}
                  placeholder="Tu dirección de recogida"
                  required
                />

                <button
                  onClick={handleConfirm}
                  disabled={!isFormComplete}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-violet-300/50 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <FaCheck />
                  {disponibles <= 0 ? 'Sin asientos disponibles' : 'Confirmar Reserva'}
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,5,30,0.80)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setShowConfirmation(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-violet-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Confirmar Reserva</h2>
              <button onClick={() => setShowConfirmation(false)} className="text-white/60 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 divide-y divide-gray-50">
              {[
                ['Conductor',  carDetails.conductor],
                ['Destino',    carDetails.destino],
                ['Fecha',      formatFecha(carDetails.fecha)],
                ['Hora',       carDetails.horasalida],
                ['Asiento',    `#${selectedSeat}`],
                ['Pasajero',   nombre],
                ['Teléfono',   telefono],
                ['Recogida',   pickupLocation],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2.5 text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800">{val}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isReserving}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaTimes /> Cancelar
              </button>
              <button
                onClick={handleReserve}
                disabled={isReserving}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isReserving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Reservando...
                  </>
                ) : (
                  <><FaCheck /> Confirmar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,5,30,0.80)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Reserva creada!</h3>
            <p className="text-gray-500 text-sm mb-4">
              Tu reserva está pendiente de confirmación por el conductor. Te notificaremos cuando sea aprobada.
            </p>
            <p className="text-xs text-gray-400">Redirigiendo en unos segundos...</p>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default VerDetalles;
