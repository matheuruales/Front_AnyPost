import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isLoading = false, 
  children, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed btn-animate';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg',
    secondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white focus:ring-gray-500',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800/50 focus:ring-gray-500'
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="loader"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
