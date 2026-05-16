import React from 'react';

/**
 * Input de formulario con ícono a la izquierda.
 *
 * Props:
 *   icon       – nodo React (ícono)
 *   label      – texto del label
 *   hint       – texto de ayuda debajo del input
 *   disabled   – deshabilita el campo
 *   right      – nodo React en el lado derecho (ej: toggle contraseña)
 *   ...rest    – se pasan directo al <input>
 */
const FormInput = ({ icon, label, hint, disabled = false, right, className = '', ...rest }) => (
  <div className={className}>
    {label && (
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        disabled={disabled}
        className={[
          'w-full py-2.5 border rounded-xl text-sm transition-all',
          icon  ? 'pl-10' : 'pl-4',
          right ? 'pr-10' : 'pr-4',
          disabled
            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-800 border-gray-200 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent',
        ].join(' ')}
        {...rest}
      />
      {right && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {right}
        </span>
      )}
    </div>
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

export default FormInput;
