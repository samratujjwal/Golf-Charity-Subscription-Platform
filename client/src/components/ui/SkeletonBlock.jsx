export default function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-card rounded-2xl ${className}`.trim()} />;
}
