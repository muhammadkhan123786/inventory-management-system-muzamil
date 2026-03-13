import { motion } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/form/Dialog';
import { Button } from '@/components/form/CustomButton';
import { Marketplace } from '../data/marketplaceData';
import Image from 'next/image';


interface DeleteDialogProps {
  isOpen: boolean;
  marketplace: Marketplace | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ isOpen, marketplace, onClose, onConfirm }: DeleteDialogProps) {
  if (!marketplace) return null;
  const iconSrc = marketplace?.name?.icon?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Delete Marketplace
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this marketplace connection?
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              <img
                src={iconSrc}
                alt={marketplace?.type}
                className="w-10 h-10 object-contain rounded-md bg-white p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{marketplace.type}</p>
              {/* <p className="text-sm text-gray-600">{marketplace.type.toUpperCase()}</p> */}
            </div>
          </div>
        </motion.div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-900 font-medium">
              This action cannot be undone. All connection settings will be permanently removed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Marketplace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}