export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const variantClass = {
    primary: 'app-button app-button-primary',
    secondary: 'app-button app-button-secondary',
    danger: 'app-button app-button-danger',
  }[variant] || 'app-button app-button-primary';

  return (
    <button {...props} className={`${variantClass} ${className}`.trim()}>
      {children}
    </button>
  );
}
