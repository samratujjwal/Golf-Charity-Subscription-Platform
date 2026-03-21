export default function InputField({ as = 'input', className = '', ...props }) {
  if (as === 'textarea') {
    return <textarea {...props} className={`app-textarea ${className}`.trim()} />;
  }

  if (as === 'select') {
    return <select {...props} className={`app-select ${className}`.trim()} />;
  }

  return <input {...props} className={`app-input ${className}`.trim()} />;
}
