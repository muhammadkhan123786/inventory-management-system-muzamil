import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ShoppingCart, 
  Package, 
  XCircle,
  LucideIcon 
} from 'lucide-react';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft': return 'from-gray-500 to-gray-600';
    case 'pending': return 'from-yellow-500 to-amber-500';
    case 'approved': return 'from-blue-500 to-cyan-500';
    case 'ordered': return 'from-[#4f46e5] to-[#7c3aed]';
    case 'received': return 'from-green-500 to-emerald-500';
    case 'cancelled': return 'from-red-500 to-rose-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

export const getStatusIcon = (status: string): LucideIcon => {
  switch (status) {
    case 'draft': return FileText;
    case 'pending': return Clock;
    case 'approved': return CheckCircle2;
    case 'ordered': return ShoppingCart;
    case 'received': return Package;
    case 'cancelled': return XCircle;
    default: return FileText;
  }
};