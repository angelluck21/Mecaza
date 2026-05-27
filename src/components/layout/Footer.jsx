import React from 'react';
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => (
  <footer className="footer-home">
    <div className="footer-amber-line" />
    <div className="footer-compact">

      {/* Logo */}
      <div className="footer-brand-logo">
        <div className="footer-brand-icon"><FaCar /></div>
        <span className="footer-brand-name">Mecaza</span>
      </div>

      <div className="footer-sep" />

      {/* Contacto en línea */}
      <div className="footer-contact-row">
        {[
          { icon: FaPhone,        text: '+57 3243114965' },
          { icon: FaEnvelope,     text: 'mecaza@gmail.com' },
          { icon: FaMapMarkerAlt, text: 'Medellín, Colombia' },
        ].map(({ icon: Icon, text }) => (
          <span key={text} className="footer-contact-chip">
            <Icon className="footer-chip-icon" />
            {text}
          </span>
        ))}
      </div>

      <div className="footer-sep" />

      {/* Sociales */}
      <div className="footer-socials">
        {[
          { icon: FaFacebook,  label: 'Facebook'  },
          { icon: FaTwitter,   label: 'Twitter'   },
          { icon: FaInstagram, label: 'Instagram' },
        ].map(({ icon: Icon, label }) => (
          <a key={label} href="#" aria-label={label} className="footer-social">
            <Icon />
          </a>
        ))}
      </div>

    </div>

    {/* Copyright */}
    <div className="footer-bar">
      <span className="footer-copyright">© 2024 Mecaza. Todos los derechos reservados.</span>
      <div className="footer-links">
        <a href="#" className="footer-link">Privacidad</a>
        <a href="#" className="footer-link">Términos</a>
      </div>
    </div>
  </footer>
);

export default Footer;
