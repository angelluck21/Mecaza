import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileInvoice, FaDownload, FaEye, FaTimes,
  FaCalendarAlt, FaMoneyBillWave, FaCheckCircle,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import SectionCard       from '../../components/ui/SectionCard';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import { obtenerMisFacturasApi, descargarFacturaApi } from '../../services/api';

const MisFacturas = () => {
  const [userData,      setUserData]      = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [facturas,      setFacturas]      = useState([]);
  const [showModal,        setShowModal]        = useState(false);
  const [selectedFactura,  setSelectedFactura]  = useState(null);
  const [isDownloading,    setIsDownloading]    = useState(false);

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
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${factura.numero_factura}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('No se pudo descargar la factura.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando facturas..." />;
  if (!userData) return null;

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Mis Facturas" />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white shadow">
              <FaFileInvoice />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Mis Facturas</h1>
              <p className="text-blue-200 text-sm">{facturas.length} factura{facturas.length !== 1 ? 's' : ''} registrada{facturas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Sin facturas */}
        {facturas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-scale-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                <FaFileInvoice className="text-violet-400 text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes facturas aún</h3>
            <p className="text-gray-500 text-sm mb-6">Las facturas se generan cuando tus reservas son confirmadas.</p>
            <button
              onClick={() => navigate('/mis-reservas')}
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Ver Mis Reservas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {facturas.map((factura, idx) => (
              <div
                key={factura.id_factura}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-fade-in-up hover:shadow-lg transition-all"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600" />

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                        <FaFileInvoice className="text-violet-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{factura.numero_factura}</p>
                        <p className="text-xs text-gray-400">
                          {factura.created_at
                            ? new Date(factura.created_at).toLocaleDateString('es-ES')
                            : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      <FaCheckCircle className="text-xs" /> Confirmada
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Destino</p>
                      <p className="font-medium text-gray-700">{factura.destino || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Fecha Emisión</p>
                      <p className="font-medium text-gray-700">
                        {factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString('es-ES') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total</p>
                      <p className="font-bold text-violet-600 text-lg">
                        ${factura.total?.toLocaleString('es-CO') || '0'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedFactura(factura);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-xl border border-blue-200 hover:bg-blue-100 transition-all active:scale-95"
                    >
                      <FaEye className="text-xs" /> Ver detalles
                    </button>
                    <button
                      onClick={() => handleDescargar(factura)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 text-sm font-semibold rounded-xl border border-green-200 hover:bg-green-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <FaDownload className="text-xs" /> Descargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal ver detalles */}
      {showModal && selectedFactura && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Detalles de Factura</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-all"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold uppercase">Número de Factura</p>
                <p className="font-mono font-bold text-gray-800">{selectedFactura.numero_factura}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Subtotal</p>
                  <p className="font-bold text-gray-800">${selectedFactura.subtotal?.toLocaleString('es-CO') || '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">IVA (19%)</p>
                  <p className="font-bold text-gray-800">${selectedFactura.impuesto?.toLocaleString('es-CO') || '0'}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-violet-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaMoneyBillWave className="text-violet-600" /> Total a pagar
                  </span>
                  <p className="text-2xl font-bold text-violet-600">
                    ${selectedFactura.total?.toLocaleString('es-CO') || '0'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Destino</p>
                <p className="font-medium text-gray-700">{selectedFactura.destino || '—'}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDescargar(selectedFactura)}
                  disabled={isDownloading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
                >
                  {isDownloading ? 'Descargando...' : 'Descargar PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default MisFacturas;
