// frontend/src/components/Button.jsx
import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '', ...props }) => {
  const baseStyles = 'font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 transition ease-in-out duration-150';

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-500 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent focus:ring-blue-500',
    ghost: 'bg-transparent hover:bg-gray-200 text-gray-700 focus:ring-gray-500',
  };

  const selectedVariantStyles = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${selectedVariantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
