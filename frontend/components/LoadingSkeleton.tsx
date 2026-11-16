import React from 'react';

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="h-28 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="h-3.5 w-24 bg-slate-200 rounded mb-4" />
          <div className="h-7 w-16 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-72 rounded-xl border border-slate-200 bg-white p-6" />
      <div className="h-72 rounded-xl border border-slate-200 bg-white p-6" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse">
    <div className="h-11 bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-6">
      <div className="h-3 w-28 bg-slate-200 rounded" />
      <div className="h-3 w-20 bg-slate-200 rounded" />
      <div className="h-3 w-24 bg-slate-200 rounded" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-14 border-b last:border-b-0 border-slate-100 px-6 flex items-center justify-between"
      >
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </div>
    ))}
  </div>
);
