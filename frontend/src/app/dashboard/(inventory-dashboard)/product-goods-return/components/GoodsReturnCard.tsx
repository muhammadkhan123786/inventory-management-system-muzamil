'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Button } from '@/components/form/CustomButton';
import { Badge } from '@/components/form/Badge';
import { GoodsReturnNote } from '../types/goodsReturn';
import { getStatusColor, getStatusIcon } from '../utils/goodsReturnUtils';
import { FileText, Truck, Calendar, User, RotateCcw, Eye, Download } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface GoodsReturnCardProps {
  grtn: any;
  index: number;
  onView: (grtn: GoodsReturnNote) => void;
  onDownload?: (grtn: GoodsReturnNote) => void;
}

export const GoodsReturnCard: React.FC<GoodsReturnCardProps> = ({
  grtn,
  index,
  onView,
  onDownload
}) => {
  const StatusIcon = getStatusIcon(grtn.status);
const totalAmount = grtn.totalAmount || 
    grtn.items.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);

  return (
    <motion.div
      key={grtn._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
        {/* <div className={cn("h-1 bg-gradient-to-r", getStatusColor(grtn.status))}></div> */}
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center shadow-lg",
                `bg-gradient-to-br ${getStatusColor(grtn.status)}`
              )}>
                <StatusIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{grtn.grtnNumber}</h3>
                  <Badge className={cn(
                    "text-white border-0",
                    `bg-gradient-to-r ${getStatusColor(grtn.status)}`
                  )}>
                    {grtn?.status?.split('-').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-[#f97316]" />
                    <span className="font-medium">GRN: {grtn.grnId?.grnNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-purple-500" />
                    <span>{grtn.grnId?.purchaseOrderId?.supplier?.contactInformation?.primaryContactName}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#ea580c]">£{totalAmount}</p>
              <p className="text-xs text-gray-500">Return Value</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span className="text-gray-600">Return Date:</span>
              <span className="font-medium text-gray-900">  {new Date(grtn.returnDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Returned By:</span>
              <span className="font-medium text-gray-900">{grtn.returnedBy}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              <span className="text-gray-600">Items:</span>
              <span className="font-medium text-gray-900">{grtn.items.length} item(s)</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-amber-900">
              <span className="font-semibold">Reason: </span>{grtn.returnReason}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(grtn)}
              className="gap-2 hover:bg-orange-50 hover:border-[#fdba74]"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload?.(grtn)}
              className="gap-2 hover:bg-indigo-50 hover:border-[#c7d2fe]"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};