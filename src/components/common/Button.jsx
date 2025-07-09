// src/components/common/Button.jsx
import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };
  const disabledStyles = 'disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed';

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}>
      {children}
    </button>
  );
};
