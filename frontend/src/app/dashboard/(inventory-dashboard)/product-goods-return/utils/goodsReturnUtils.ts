import { GoodsReturnNote } from '../types/goodsReturn';
import { AlertTriangle, CheckCircle2, Truck, FileText, XCircle, LucideIcon } from 'lucide-react';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'from-yellow-500 to-amber-500';
    case 'approved': return 'from-blue-500 to-indigo-500';
    case 'in-transit': return 'from-purple-500 to-pink-500';
    case 'completed': return 'from-green-500 to-emerald-500';
    case 'rejected': return 'from-red-500 to-rose-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

export const getStatusIcon = (status: string): LucideIcon => {
  switch (status) {
    case 'pending': return AlertTriangle;
    case 'approved': return CheckCircle2;
    case 'in-transit': return Truck;
    case 'completed': return CheckCircle2;
    case 'rejected': return XCircle;
    default: return FileText;
  }
};

export const getReturnReasonColor = (reason: string) => {
  switch (reason) {
    case 'damaged': return 'bg-red-100 text-red-700 border-red-200';
    case 'defective': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'wrong-item': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'excess': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'quality-issue': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'other': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};