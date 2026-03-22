export default function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-card min-w-0 rounded-2xl ${className}`.trim()} />;
}
