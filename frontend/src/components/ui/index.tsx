import React, { forwardRef } from 'react';

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-sm shadow-teal-600/10 hover:shadow-md transition-all',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-teal-500 border border-slate-200/80 transition-all',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-teal-500',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm shadow-rose-600/10 hover:shadow-md transition-all',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm shadow-emerald-600/10 hover:shadow-md transition-all',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ==========================================
// CARD COMPONENTS
// ==========================================
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`p-6 border-b border-slate-50 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h3 className={`text-base font-bold leading-none tracking-tight text-slate-800 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
  <p className={`text-xs text-slate-500 font-medium ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`p-6 border-t border-slate-50 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

// ==========================================
// BADGE COMPONENT
// ==========================================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className = '', variant = 'neutral', children, ...props }) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold select-none border uppercase tracking-wider';
  
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// ==========================================
// ALERT COMPONENT
// ==========================================
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'danger' | 'success';
}

export const Alert: React.FC<AlertProps> = ({ className = '', variant = 'info', children, ...props }) => {
  const baseStyle = 'p-5 rounded-2xl border flex space-x-3 text-sm font-medium';
  
  const variants = {
    info: 'bg-sky-50 text-sky-800 border-sky-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    danger: 'bg-rose-50 text-rose-800 border-rose-100',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} role="alert" {...props}>
      {children}
    </div>
  );
};

// ==========================================
// INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', id, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          className={`px-4 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// SELECT COMPONENT
// ==========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`px-4 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
