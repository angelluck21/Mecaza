import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileInvoice, FaDownload, FaEye, FaTimes,
  FaCalendarAlt, FaMoneyBillWave, FaCheckCircle,
  FaMapMarkerAlt, FaArrowRight,
} from 'react-icons/fa';

import Navbar            from '../../components/layout/Navbar';
import Footer            from '../../components/layout/Footer';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import { obtenerMisFacturasApi, descargarFacturaApi } from '../../services/api';
import DarkPagination from '../../components/ui/DarkPagination';

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  void:       '#080B12',
  surface:    '#0E1422',
  surface2:   '#141D30',
  border:     'rgba(255,255,255,0.07)',
  amber:      '#FFBE00',
  amberGlow:  'rgba(255,190,0,0.12)',
  amberBorder:'rgba(255,190,0,0.25)',
  white:      '#EEF0FA',
  fog:        '#6B728F',
  muted:      '#3A4060',
};

const fmt = (ts) =>
  ts ? new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtCOP = (n) =>
  n != null ? `$${Number(n).toLocaleString('es-CO')}` : '$0';

// ── FacturaCard ───────────────────────────────────────────────────────────────
const FacturaCard = ({ factura, idx, onVer, onDescargar, isDownloading }) => {
  const [hoverVer,  setHoverVer]  = useState(false);
  const [hoverDesc, setHoverDesc] = useState(false);

  const ruta = factura.origen
    ? `${factura.origen}  →  ${factura.destino || '—'}`
    : (factura.destino || '—');

  return (
    <div style={{
      background:   T.surface,
      border:       `1px solid ${T.border}`,
      borderRadius: 16,
      overflow:     'hidden',
      animation:    `fadeUp 0.35s ease both`,
      animationDelay: `${idx * 60}ms`,
    }}>
      {/* Amber top strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, #C8960C, #FFBE00, #FFD84D)` }} />

      <div style={{ padding: '16px 20px' }}>

        {/* Row 1: número + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: T.amberGlow,
              border: `1px solid ${T.amberBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FaFileInvoice style={{ color: T.amber, fontSize: '0.9rem' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: T.white, marginBottom: 1 }}>
                {factura.numero_factura}
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FaCalendarAlt style={{ fontSize: '0.6rem' }} />
                {fmt(factura.fecha_emision || factura.created_at)}
              </p>
            </div>
          </div>

          {/* Badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            color: '#22c55e',
            fontSize: '0.65rem', fontWeight: 700,
            fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em',
          }}>
            <FaCheckCircle style={{ fontSize: '0.6rem' }} /> CONFIRMADA
          </span>
        </div>

        {/* Row 2: Ruta + Total */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 12, marginBottom: 16, alignItems: 'center',
        }}>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              Ruta
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.white, fontWeight: 500 }}>
              {ruta}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              Total
            </p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: T.amber }}>
              {fmtCOP(factura.total)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.border, marginBottom: 14 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onVer(factura)}
            onMouseEnter={() => setHoverVer(true)}
            onMouseLeave={() => setHoverVer(false)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 10,
              background: hoverVer ? T.surface2 : 'transparent',
              border: `1px solid ${hoverVer ? 'rgba(255,255,255,0.12)' : T.border}`,
              color: hoverVer ? T.white : T.fog,
              fontSize: '0.78rem', fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <FaEye style={{ fontSize: '0.72rem' }} /> Ver detalles
          </button>
          <button
            onClick={() => onDescargar(factura)}
            onMouseEnter={() => setHoverDesc(true)}
            onMouseLeave={() => setHoverDesc(false)}
            disabled={isDownloading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 10,
              background: hoverDesc ? 'rgba(255,190,0,0.18)' : T.amberGlow,
              border: `1px solid ${hoverDesc ? 'rgba(255,190,0,0.45)' : T.amberBorder}`,
              color: T.amber,
              fontSize: '0.78rem', fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            <FaDownload style={{ fontSize: '0.72rem' }} />
            {isDownloading ? 'Descargando…' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ navigate }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20,
    padding: '4rem 2rem', textAlign: 'center',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: 18,
      background: T.amberGlow, border: `1px solid ${T.amberBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 1.25rem',
    }}>
      <FaFileInvoice style={{ color: T.amber, fontSize: '1.75rem' }} />
    </div>
    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: T.white, marginBottom: 8 }}>
      No tienes facturas aún
    </p>
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog, marginBottom: '1.5rem' }}>
      Las facturas se generan cuando tus reservas son confirmadas.
    </p>
    <button
      onClick={() => navigate('/mis-reservas')}
      style={{
        padding: '10px 24px', borderRadius: 10,
        background: `linear-gradient(135deg, #C8960C, #FFBE00)`,
        color: '#080B12', fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: '0.82rem', border: 'none', cursor: 'pointer',
      }}
    >
      Ver Mis Reservas
    </button>
  </div>
);

// ── DetailRow helper ──────────────────────────────────────────────────────────
const DetailRow = ({ label, value, valueStyle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog }}>{label}</span>
    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: T.white, ...valueStyle }}>{value}</span>
  </div>
);

// ── MisFacturas ───────────────────────────────────────────────────────────────
const MisFacturas = () => {
  const [userData,       setUserData]       = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [facturas,       setFacturas]       = useState([]);
  const [showModal,      setShowModal]      = useState(false);
  const [selectedFactura,setSelectedFactura]= useState(null);
  const [isDownloading,  setIsDownloading]  = useState(false);

  // Paginación client-side
  const PER_PAGE = 6;
  const [pageF, setPageF] = useState(1);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      setUserData(user);
      fetchFacturas();
    } catch { navigate('/login'); }
  }, [navigate]);

  const fetchFacturas = async () => {
    try {
      const { data } = await obtenerMisFacturasApi();
      setFacturas(Array.isArray(data.data) ? data.data : []);
    } catch {
      showToast('Error al cargar facturas.', 'error');
      setFacturas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescargar = async (factura) => {
    setIsDownloading(true);
    try {
      const { data } = await descargarFacturaApi(factura.id_factura);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${factura.numero_factura}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      showToast('No se pudo descargar la factura.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando facturas…" />;
  if (!userData)  return null;

  const ruta = (f) => f.origen ? `${f.origen} → ${f.destino || '—'}` : (f.destino || '—');
  const descuento = selectedFactura
    ? (selectedFactura.subtotal > 0
        ? `${Math.round((selectedFactura.impuesto / selectedFactura.subtotal) * 100)}%`
        : '—')
    : '—';

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div style={{ minHeight: '100vh', background: T.void, display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '2.5rem 1.25rem' }}>

          {/* ── Page header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '2rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: T.amberGlow,
              border: `1px solid ${T.amberBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaFileInvoice style={{ color: T.amber, fontSize: '1.1rem' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: T.white, margin: 0 }}>
                Mis Facturas
              </h1>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: T.fog, margin: 0 }}>
                {facturas.length} factura{facturas.length !== 1 ? 's' : ''} registrada{facturas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* ── List / empty ── */}
          {facturas.length === 0 ? (
            <EmptyState navigate={navigate} />
          ) : (() => {
            const lastPage    = Math.ceil(facturas.length / PER_PAGE);
            const facturasPage = facturas.slice((pageF - 1) * PER_PAGE, pageF * PER_PAGE);
            return (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {facturasPage.map((f, idx) => (
                    <FacturaCard
                      key={f.id_factura}
                      factura={f}
                      idx={idx}
                      onVer={(fac) => { setSelectedFactura(fac); setShowModal(true); }}
                      onDescargar={handleDescargar}
                      isDownloading={isDownloading}
                    />
                  ))}
                </div>
                <DarkPagination
                  currentPage={pageF}
                  lastPage={lastPage}
                  onPageChange={(p) => { setPageF(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  total={facturas.length}
                  label="facturas"
                />
              </>
            );
          })()}
        </main>

        <Footer />
      </div>

      {/* ── Modal detalle ── */}
      {showModal && selectedFactura && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(8,11,18,0.80)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 20, width: '100%', maxWidth: 440,
            overflow: 'hidden',
            animation: 'scaleIn 0.25s cubic-bezier(.22,1,.36,1) both',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(200,150,12,0.15) 0%, rgba(255,190,0,0.05) 100%)',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaFileInvoice style={{ color: T.amber, fontSize: '1rem' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: T.white }}>
                  Detalle de Factura
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.fog, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.fog;   e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <FaTimes style={{ fontSize: '0.75rem' }} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 20px 24px' }}>
              {/* Número */}
              <div style={{
                background: T.surface2, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog }}>Número de factura</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: T.amber }}>
                  {selectedFactura.numero_factura}
                </span>
              </div>

              {/* Detail rows */}
              <DetailRow label="Ruta" value={ruta(selectedFactura)} />
              <DetailRow label="Fecha de emisión"  value={fmt(selectedFactura.fecha_emision || selectedFactura.created_at)} />
              <DetailRow label="Precio base"       value={fmtCOP(selectedFactura.subtotal)} />
              <DetailRow
                label={`Descuento ${descuento !== '—' ? `(${descuento})` : ''}`}
                value={`- ${fmtCOP(selectedFactura.impuesto)}`}
                valueStyle={{ color: '#22c55e' }}
              />

              {/* Total box */}
              <div style={{
                marginTop: 14,
                background: T.amberGlow,
                border: `1px solid ${T.amberBorder}`,
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: T.white }}>
                  <FaMoneyBillWave style={{ color: T.amber }} /> Total a pagar
                </span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: T.amber }}>
                  {fmtCOP(selectedFactura.total)}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    background: T.surface2, border: `1px solid ${T.border}`,
                    color: T.fog, fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.fog;   e.currentTarget.style.borderColor = T.border; }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDescargar(selectedFactura)}
                  disabled={isDownloading}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    background: `linear-gradient(135deg, #C8960C, #FFBE00)`,
                    border: 'none', color: '#080B12',
                    fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    opacity: isDownloading ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <FaDownload style={{ fontSize: '0.75rem' }} />
                  {isDownloading ? 'Descargando…' : 'Descargar PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MisFacturas;
