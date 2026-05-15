import React from 'react';
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-gray-900 text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <FaCar className="text-blue-400 text-3xl" />
            <span className="text-2xl font-bold text-blue-400">Mecaza</span>
          </div>
          <p className="text-gray-300 mb-4">
            Tu plataforma confiable para encontrar viajes seguros y cómodos.
            Conectamos conductores verificados con pasajeros que buscan una experiencia excepcional.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><FaFacebook className="text-xl" /></a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><FaTwitter  className="text-xl" /></a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><FaInstagram className="text-xl" /></a>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-400">Contacto</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3"><FaPhone       className="text-blue-400" /><span className="text-gray-300">+57 3243114965</span></div>
            <div className="flex items-center space-x-3"><FaEnvelope    className="text-blue-400" /><span className="text-gray-300">mecaza@gmail.com</span></div>
            <div className="flex items-center space-x-3"><FaMapMarkerAlt className="text-blue-400" /><span className="text-gray-300">Medellin, Colombia</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">© 2024 Mecaza. Todos los derechos reservados.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Política de Privacidad</a>
          <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Términos de Servicio</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
