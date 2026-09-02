export function LoadingSkeleton({ count = 5, type = 'track' }: { count?: number; type?: 'track' | 'card' | 'artist' | 'horizontal' }) {
  if (type === 'horizontal') {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-36 animate-pulse">
            <div className="w-36 h-36 rounded-xl skeleton mb-3" />
            <div className="skeleton h-3.5 rounded w-3/4 mb-2" />
            <div className="skeleton h-3 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-brand-card rounded-xl p-3 animate-pulse border border-white/[0.06]">
            <div className="w-full aspect-square rounded-xl skeleton mb-3" />
            <div className="skeleton h-4 rounded w-3/4 mb-2" />
            <div className="skeleton h-3 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'artist') {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 animate-pulse">
            <div className="w-20 h-20 rounded-full skeleton" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
          <div className="w-11 h-11 rounded-lg skeleton flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 rounded w-3/4 mb-2" />
            <div className="skeleton h-3 rounded w-1/2" />
          </div>
          <div className="skeleton h-4 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}
