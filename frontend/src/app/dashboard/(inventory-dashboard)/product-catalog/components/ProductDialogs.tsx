import { Product } from '../types/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/form/Dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/form/AlertDialog';
import { Input } from '@/components/form/Input';
import { Label } from '@/components/form/Label';
import { Textarea } from '@/components/form/Textarea';
import { Button } from '@/components/form/CustomButton';

interface ViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewDialog: React.FC<ViewDialogProps> = ({
  product,
  open,
  onOpenChange
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>Product Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500 text-sm">SKU</Label>
              <p className="font-medium">{product.sku}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Manufacturer</Label>
              <p className="font-medium">{product.manufacturer}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Price</Label>
              <p className="font-medium text-lg text-indigo-600">£{product.price.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Stock</Label>
              <p className="font-medium">{product.stockQuantity} units</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Weight</Label>
              <p className="font-medium">{product.weight}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Warranty</Label>
              <p className="font-medium">{product.warranty}</p>
            </div>
          </div>
          <div>
            <Label className="text-gray-500 text-sm">Description</Label>
            <p className="text-gray-900 mt-1">{product.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditDialogProps {
  product: Product | null;
  open: boolean;
  formData: Partial<Product>;
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: Partial<Product>) => void;
  onSave: () => void;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  product,
  open,
  formData,
  onOpenChange,
  onFormDataChange,
  onSave
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={formData.sku || ''}
                onChange={(e) => onFormDataChange({ ...formData, sku: e.target.value })}
              />
            </div>
            <div>
              <Label>Price (£)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => onFormDataChange({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stockQuantity || ''}
                onChange={(e) => onFormDataChange({ ...formData, stockQuantity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  product,
  open,
  onOpenChange,
  onConfirm
}) => {
  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{product.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};