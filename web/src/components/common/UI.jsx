// Basic button component
export const Button = ({ children, onClick, type = 'button', className = '', disabled = false, variant = 'primary' }) => {
    const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center";
    const variants = {
        primary: "bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-black shadow-lg shadow-primary/20",
        secondary: "bg-surface text-white hover:bg-zinc-700 border border-white/10",
        outline: "border-2 border-primary text-primary hover:bg-primary/10"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

// Input component
export const Input = ({ label, type = 'text', value, onChange, placeholder, error, className = '' }) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && <label className="text-gray-400 text-sm font-medium">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`bg-surface border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-gray-600`}
            />
            {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
    );
};
