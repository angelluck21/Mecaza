import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser, FaMapMarkerAlt, FaClock, FaCalendar,
  FaPhone, FaCheck, FaTimes, FaLocationArrow, FaSpinner,
  FaStar, FaRegStar, FaRoad,
} from 'react-icons/fa';

import PageBg            from '../components/ui/PageBg';
import InnerNavbar       from '../components/layout/InnerNavbar';
import SectionCard       from '../components/ui/SectionCard';
import LoadingScreen     from '../components/ui/LoadingScreen';
import FormInput         from '../components/ui/FormInput';
import CarImage          from '../components/ui/CarImage';
import UserAvatar        from '../components/ui/UserAvatar';
import ToastNotification from '../components/ui/ToastNotification';
import { useToast }      from '../hooks/useToast';
import { crearReservaApi, listarCarrosApi, listarPreciosApi, listarReservasApi, getConductorPerfilApi } from '../services/api';
import { getCarImageUrl, getEstadoInfo, formatFecha } from '../utils';

const MAX_SEATS = 5;

// ── Fila de estrellas ────────────────────────────────────────────────────────
const StarRow = ({ value, size = 'text-sm', emptyClass = 'text-gray-300' }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) =>
      n <= Math.round(value ?? 0)
        ? <FaStar key={n} className={`${size} text-amber-400`} />
        : <FaRegStar key={n} className={`${size} ${emptyClass}`} />
    )}
  </span>
);

// ── Icono de asiento individual ──────────────────────────────────────────────
const SeatIcon = ({ number, state, onClick }) => {
  const isClickable = state === 'available' || state === 'selected';

  const headrest = {
    available: 'border-gray-300 bg-gray-200',
    selected:  'border-violet-500 bg-violet-300',
    occupied:  'border-red-300   bg-red-200',
    blocked:   'border-gray-200  bg-gray-100 opacity-50',
    driver:    'border-blue-300  bg-blue-200',
  }[state];

  const body = {
    available: 'border-gray-300 bg-white text-gray-500 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 hover:scale-110 cursor-pointer',
    selected:  'border-violet-500 bg-violet-100 text-violet-700 scale-110 shadow-lg shadow-violet-200/60',
    occupied:  'border-red-300   bg-red-50    text-red-400   cursor-not-allowed',
    blocked:   'border-dashed border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50',
    driver:    'border-blue-300  bg-blue-50   text-blue-400  cursor-not-allowed',
  }[state];

  const label = {
    available: 'text-gray-400',
    selected:  'text-violet-600 font-semibold',
    occupied:  'text-red-300',
    blocked:   'text-gray-300 opacity-50',
    driver:    'text-blue-400',
  }[state];

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className="flex flex-col items-center gap-0.5 group outline-none"
      title={
        state === 'driver'   ? 'Conductor' :
        state === 'occupied' ? `Asiento ${number} — ocupado` :
        state === 'blocked'  ? `Asiento ${number} — no disponible` :
        state === 'selected' ? `Asiento ${number} — seleccionado` :
        `Seleccionar asiento ${number}`
      }
    >
      {/* Cabecero */}
      <div className={`w-7 h-2 rounded-t-full border border-b-0 transition-all duration-150 ${headrest}`} />

      {/* Cuerpo del asiento */}
      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${body}`}>
        {state === 'driver' ? (
          /* Volante */
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="8"  strokeWidth="2"/>
            <circle cx="12" cy="12" r="2.5" strokeWidth="2"/>
            <line x1="12" y1="4"    x2="12" y2="9.5"  strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="4.5" y1="16"  x2="9"  y2="13.2" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="19.5" y1="16" x2="15" y2="13.2" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ) : state === 'occupied' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : state === 'blocked' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/>
            <line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/>
          </svg>
        ) : state === 'selected' ? (
          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <span className="text-sm font-bold">{number}</span>
        )}
      </div>

      {/* Etiqueta */}
      <span className={`text-[10px] mt-0.5 transition-colors ${label}`}>
        {state === 'driver' ? 'Conductor' : `Asiento ${number}`}
      </span>
    </button>
  );
};

// ── Mapa visual del taxi ─────────────────────────────────────────────────────
const TaxiSeatMap = ({ totalAsientos, asientosOcupados, selectedSeats, onToggle, onSelectAll, onOccupied }) => {
  const availableSeats = Array.from({ length: totalAsientos }, (_, i) => i + 1)
    .filter((n) => !asientosOcupados.includes(n));

  const allSelected = availableSeats.length > 0 && availableSeats.every((n) => selectedSeats.includes(n));

  const getSeatState = (n) => {
    if (asientosOcupados.includes(n)) return 'occupied';
    if (n > totalAsientos)            return 'blocked';
    if (selectedSeats.includes(n))    return 'selected';
    return 'available';
  };

  const handleClick = (n) => {
    const s = getSeatState(n);
    if (s === 'occupied') { onOccupied(n); return; }
    if (s === 'blocked')  return;
    onToggle(n);
  };

  const handleSelectAll = () => {
    if (allSelected) onSelectAll([]);
    else             onSelectAll(availableSeats);
  };

  return (
    <div className="space-y-3">

      {/* Botón reservar todos */}
      <button
        type="button"
        onClick={handleSelectAll}
        disabled={availableSeats.length === 0}
        className={[
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 active:scale-95',
          allSelected
            ? 'bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-200/50'
            : availableSeats.length === 0
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
              : 'bg-white border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-500',
        ].join(' ')}
      >
        {allSelected ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Deseleccionar todos
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Reservar todos los asientos disponibles
            {availableSeats.length > 0 && (
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {availableSeats.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Contenedor del vehículo */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 relative select-none">

        {/* Indicador frente */}
        <div className="flex items-center gap-2 mb-5 justify-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">Frente</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Fila delantera: conductor + copiloto (asiento 1) */}
        <div className="flex items-end justify-center gap-8 mb-1">
          <SeatIcon number={0} state="driver"             onClick={() => {}}            />
          <SeatIcon number={1} state={getSeatState(1)}    onClick={() => handleClick(1)}/>
        </div>

        {/* Separador entre filas */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
          </div>
          <div className="flex-1 border-t border-dashed border-gray-300" />
        </div>

        {/* Fila trasera: asientos 2, 3, 4 */}
        <div className="flex items-end justify-center gap-3 mb-1">
          <SeatIcon number={2} state={getSeatState(2)} onClick={() => handleClick(2)}/>
          <SeatIcon number={3} state={getSeatState(3)} onClick={() => handleClick(3)}/>
          <SeatIcon number={4} state={getSeatState(4)} onClick={() => handleClick(4)}/>
        </div>

        {/* Asiento 5 (extra / si aplica) */}
        {MAX_SEATS >= 5 && (
          <>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t border-dashed border-gray-200" />
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <div className="w-1 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1 border-t border-dashed border-gray-200" />
            </div>
            <div className="flex justify-center">
              <SeatIcon number={5} state={getSeatState(5)} onClick={() => handleClick(5)}/>
            </div>
          </>
        )}

        {/* Indicador trasera */}
        <div className="flex items-center gap-2 mt-5 justify-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">Parte trasera</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-gray-300 bg-white inline-block" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-violet-500 bg-violet-100 inline-block" /> Tus asientos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-red-300 bg-red-50 inline-block" /> Ocupado
        </span>
      </div>

      {/* Info asientos seleccionados */}
      {selectedSeats.length > 0 ? (
        <div className="bg-violet-50 border border-violet-200 rounded-xl py-2.5 px-4 animate-fade-in">
          <p className="text-xs text-violet-500 mb-1.5 font-medium text-center">
            {selectedSeats.length === 1 ? '1 asiento seleccionado' : `${selectedSeats.length} asientos seleccionados`}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[...selectedSeats].sort((a, b) => a - b).map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1 bg-violet-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
              >
                Asiento {n}
                <button
                  type="button"
                  onClick={() => onToggle(n)}
                  className="ml-0.5 hover:bg-violet-600 rounded-full w-3.5 h-3.5 flex items-center justify-center transition-colors"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-center">
          <p className="text-xs text-gray-400">Toca un asiento para seleccionarlo — puedes elegir varios</p>
        </div>
      )}
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────

const VerDetalles = () => {
  const [userData,          setUserData]          = useState(null);
  const [isLoading,         setIsLoading]         = useState(true);
  const [carDetails,        setCarDetails]        = useState(null);
  const [selectedSeats,     setSelectedSeats]     = useState([]);
  const [pickupLocation,    setPickupLocation]    = useState('');
  const [nombre,            setNombre]            = useState('');
  const [telefono,          setTelefono]          = useState('');
  const [precios,           setPrecios]           = useState(null);
  const [asientosOcupados,  setAsientosOcupados]  = useState([]);
  const [showConfirmation,  setShowConfirmation]  = useState(false);
  const [isReserving,       setIsReserving]       = useState(false);
  const [showSuccess,       setShowSuccess]       = useState(false);
  const [locLoading,        setLocLoading]        = useState(false);
  const [conductorPerfil,   setConductorPerfil]   = useState(null);
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
        const [carrosData, preciosResp, reservasData] = await Promise.all([
          listarCarrosApi(),
          listarPreciosApi().catch(() => null),
          listarReservasApi(),
        ]);

        const carrosArray = Array.isArray(carrosData) ? carrosData : (carrosData?.data ?? []);
        const car = carrosArray.find(c => (c.id_carros || c.id || c.ID) == carId);
        if (!car) { setIsLoading(false); return; }

        if (preciosResp) {
          const pa = Array.isArray(preciosResp.data) ? preciosResp.data : (preciosResp.data?.data ?? []);
          if (pa.length > 0) {
            setPrecios({
              zaraMede:  pa[0]['zara-mede']  ?? 120000,
              zaraCauca: pa[0]['zara-cauca'] ?? 30000,
              caucaMede: pa[0]['cauca-mede'] ?? 100000,
            });
          }
        }

        const ra = Array.isArray(reservasData) ? reservasData : (reservasData?.data ?? []);
        const ocupados = ra
          .filter(r => r.id_carros == carId && r.estado !== 'cancelada' && r.estado !== 'rechazada')
          .map(r => parseInt(r.Asiento || r.asiento || 0))
          .filter(n => n > 0);
        setAsientosOcupados(ocupados);

        const conductorUserId = car.id_users || car.Userid || car.userid || null;
        setCarDetails({
          id_carros:   car.id_carros  || car.id,
          conductor:   car.conductor  || car.Conductor,
          placa:       car.placa      || car.Placa,
          asientos:    parseInt(car.asientos || car.Asientos) || 4,
          origen:      car.origen     || car.Origen     || '',
          destino:     car.destino    || car.Destino,
          horasalida:  car.horasalida || car.Horasalida,
          fecha:       car.fecha      || car.Fecha,
          imagencarro: car.imagencarro || car.Imagencarro,
          telefono:    car.telefono   || car.Telefono || 'No disponible',
          id_estados:  car.id_estados || car.estado   || car.Estado,
          id_users:    conductorUserId,
        });

        // Cargar perfil del conductor en paralelo (no bloquea la carga principal)
        if (conductorUserId) {
          getConductorPerfilApi(conductorUserId)
            .then(res => { if (res?.data) setConductorPerfil(res.data); })
            .catch(() => {});
        }
      } catch {
        // silencioso
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [carId, navigate]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Tu navegador no soporta geolocalización.', 'error');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=es`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const data = await res.json();
          const addr = data.display_name || `${coords.latitude}, ${coords.longitude}`;
          setPickupLocation(addr);
        } catch {
          // Si falla la geocodificación inversa, usar coordenadas crudas
          setPickupLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        const msgs = {
          1: 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.',
          2: 'No se pudo obtener tu ubicación. Verifica tu GPS.',
          3: 'Tiempo de espera agotado. Inténtalo de nuevo.',
        };
        showToast(msgs[err.code] || 'Error al obtener ubicación.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (!userData) { navigate('/login'); return; }
    if (selectedSeats.length === 0)                 { showToast('Selecciona al menos un asiento.', 'error'); return; }
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
      // Crear una reserva por cada asiento seleccionado
      await Promise.all(
        selectedSeats.map((seat) =>
          crearReservaApi({
            Nombre:    nombre.trim(),
            Ubicacion: pickupLocation.trim(),
            Asiento:   seat,
            id_carros: carroId,
            Telefono:  telefono.trim(),
          })
        )
      );
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
  const isFormComplete = selectedSeats.length > 0 && pickupLocation.trim() && nombre.trim() && telefono.trim() && disponibles > 0;

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
              <div className="flex items-start gap-4">

                {/* Foto del conductor */}
                <div className="shrink-0">
                  <UserAvatar
                    userData={{
                      fotoperfil: conductorPerfil?.fotoperfil ?? null,
                      name: carDetails.conductor,
                    }}
                    size="xl"
                    className="ring-2 ring-blue-200 shadow-md"
                  />
                </div>

                {/* Info conductor */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{carDetails.conductor}</p>
                    <p className="text-xs text-gray-400">{carDetails.placa}</p>
                  </div>

                  {/* Estrellas y viajes */}
                  {conductorPerfil ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <StarRow value={conductorPerfil.promedio_estrellas ?? 0} />
                        {conductorPerfil.promedio_estrellas != null ? (
                          <span className="text-xs font-bold text-amber-600 ml-1">
                            {Number(conductorPerfil.promedio_estrellas).toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 ml-1">Sin calificaciones</span>
                        )}
                        {conductorPerfil.total_calificaciones > 0 && (
                          <span className="text-xs text-gray-400">
                            ({conductorPerfil.total_calificaciones})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FaRoad className="text-blue-400 text-[10px]" />
                        <span className="font-semibold">{conductorPerfil.total_viajes}</span>
                        <span>{conductorPerfil.total_viajes === 1 ? 'viaje' : 'viajes'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(n => <FaRegStar key={n} className="text-gray-200 text-sm" />)}
                      <span className="text-xs text-gray-300 ml-1">Cargando...</span>
                    </div>
                  )}

                  {/* Teléfono + Ver perfil */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <FaPhone className="text-blue-500 text-xs shrink-0" />
                      {carDetails.telefono}
                    </p>
                    {carDetails.id_users && (
                      <button
                        type="button"
                        onClick={() => navigate(`/usuario/${carDetails.id_users}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                      >
                        Ver perfil completo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Detalles del viaje */}
            <SectionCard title="Detalles del viaje" icon={<FaMapMarkerAlt className="text-xs" />} accent="green">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Origen</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-blue-400 text-xs shrink-0" />
                    {carDetails.origen || 'No especificado'}
                  </p>
                </div>
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
              <TaxiSeatMap
                totalAsientos={totalAsientos}
                asientosOcupados={asientosOcupados}
                selectedSeats={selectedSeats}
                onToggle={(seat) =>
                  setSelectedSeats((prev) =>
                    prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
                  )
                }
                onSelectAll={(seats) => setSelectedSeats(seats)}
                onOccupied={(seat) => showToast(`El asiento ${seat} ya está ocupado.`, 'error')}
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
                {/* Ubicación de recogida con botón GPS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ubicación de recogida
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <FaMapMarkerAlt className="text-xs" />
                    </div>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                      placeholder="Tu dirección de recogida"
                      className="w-full pl-8 pr-[7.5rem] py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locLoading}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                      {locLoading
                        ? <><FaSpinner className="animate-spin text-[10px]" /> Buscando...</>
                        : <><FaLocationArrow className="text-[10px]" /> Mi ubicación</>
                      }
                    </button>
                  </div>
                  {pickupLocation && (
                    <p className="text-[10px] text-gray-400 pl-1 truncate" title={pickupLocation}>
                      {pickupLocation}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!isFormComplete}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-violet-300/50 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <FaCheck />
                  {disponibles <= 0
                    ? 'Sin asientos disponibles'
                    : selectedSeats.length > 1
                      ? `Confirmar ${selectedSeats.length} asientos`
                      : 'Confirmar Reserva'}
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
                ['Asiento(s)', [...selectedSeats].sort((a,b)=>a-b).map(n=>`#${n}`).join(', ')],
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
