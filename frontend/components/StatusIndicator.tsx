import React from 'react';
import { Clock, Wrench, CheckCircle2, AlertCircle, Search } from 'lucide-react';

interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'Resolved':
    case 'Claimed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-xs font-medium text-amber-800 whitespace-nowrap">
          <Wrench className="w-3.5 h-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 border border-red-200/80 text-xs font-medium text-red-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 border border-red-200/80 text-xs font-medium text-red-700 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Urgent</span>
        </span>
      );
    case 'Important':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-xs font-medium text-blue-700 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Important</span>
        </span>
      );
    case 'Lost':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 border border-red-200/80 text-xs font-medium text-red-700 whitespace-nowrap">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>Lost Item</span>
        </span>
      );
    case 'Found':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-xs font-medium text-blue-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Found Item</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 whitespace-nowrap">
          <span>{status}</span>
        </span>
      );
  }
};
