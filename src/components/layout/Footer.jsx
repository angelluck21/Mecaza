import React from 'react';
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <footer className="relative overflow-hidden mt-16">
    {/* Fondo con gradiente */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950 to-violet-950" />

    {/* Decoración */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />
    <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <FaCar className="text-violet-400 text-3xl" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Mecaza
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-sm">
            Tu plataforma confiable para encontrar viajes seguros y cómodos.
            Conectamos conductores verificados con pasajeros que buscan una experiencia excepcional.
          </p>
          <div className="flex space-x-3">
            {[
              { icon: FaFacebook,  label: 'Facebook' },
              { icon: FaTwitter,   label: 'Twitter' },
              { icon: FaInstagram, label: 'Instagram' },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-200 hover:scale-110"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-4">Contacto</h3>
          <div className="space-y-3">
            {[
              { icon: FaPhone,        text: '+57 3243114965' },
              { icon: FaEnvelope,     text: 'mecaza@gmail.com' },
              { icon: FaMapMarkerAlt, text: 'Medellín, Colombia' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center space-x-3 text-sm text-gray-400 hover:text-gray-200 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-violet-900/40 flex items-center justify-center group-hover:bg-violet-700/40 transition-colors shrink-0">
                  <Icon className="text-violet-400 text-xs" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-xs">© 2024 Mecaza. Todos los derechos reservados.</p>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-500 hover:text-violet-400 text-xs transition-colors">Política de Privacidad</a>
          <a href="#" className="text-gray-500 hover:text-violet-400 text-xs transition-colors">Términos de Servicio</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
