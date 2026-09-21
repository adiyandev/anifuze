import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    violet: "bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-sm",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
    ghost: "hover:bg-slate-800/60 text-slate-300 hover:text-white"
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-[#10172A] border border-[#26324A] rounded-xl p-5 shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    error: "bg-red-500/10 text-red-400 border-red-500/30",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/30"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
      <input 
        className={`bg-[#0B1020] border border-[#26324A] rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
      <select 
        className={`bg-[#0B1020] border border-[#26324A] rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors ${className}`}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10172A] border border-[#26324A] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26324A]">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
