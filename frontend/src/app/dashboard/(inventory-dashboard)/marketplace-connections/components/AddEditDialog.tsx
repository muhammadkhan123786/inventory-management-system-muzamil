import { motion } from 'framer-motion';
import { Shield, Sparkles, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/form/Dialog';
import { Button } from '@/components/form/CustomButton';
import { Input } from '@/components/form/Input';
import { Label } from '@/components/form/Label';
import { Textarea } from '@/components/form/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/form/Select';
import { FormData, MarketplaceTemplate } from '../data/marketplaceData';
import { useFormActions } from '@/hooks/useFormActions';
import Image from 'next/image';

interface AddEditDialogProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: FormData;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (data: FormData) => void;
}

export function AddEditDialog({
  isOpen,
  isEdit,
  formData,
  onClose,
  onSubmit,
  onFormChange
}: AddEditDialogProps) {
  // 1. Fetching real marketplace templates from backend
  const { data: templates, isLoading } =
    useFormActions<MarketplaceTemplate>(
      "/marketplace-templates",
      "marketplaceTemplates",
      "MarketplaceTemplates"
    );
  const selectedTemplate = templates?.find((t: any) => t._id === formData.type);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Marketplace' : 'Add New Marketplace'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update marketplace connection details'
              : 'Connect a new e-commerce marketplace to sync your inventory and orders'
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-gray-500">Fetching templates...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Marketplace Selection */}
            <div>
              <Label className="text-base font-semibold">Select Marketplace Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => onFormChange({ ...formData, type: value })}
                disabled={isEdit}
              >
                <SelectTrigger className="border-2 focus:border-indigo-500">
                  <SelectValue placeholder="Choose a platform" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template: any) => {
                    const iconSrc = template?.icon?.icon;

                    return (
                      <SelectItem key={template._id} value={template._id}>
                        <div className="flex items-center gap-2">
                          {iconSrc ? (
                            <Image
                              src={iconSrc}
                              alt={template.name}
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              width={50}
                              height={50}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {template.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}

                </SelectContent>
              </Select>
            </div>

            {/* General Details */}
            <div>
              <Label className="text-base font-semibold">Connection Name</Label>
              <Input
                placeholder="e.g., My eBay Store"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                className="border-2 focus:border-indigo-500"
              />
            </div>
            {/* Description */}

            <div>

              <Label className="text-base font-semibold">Description</Label>

              <Textarea

                placeholder="Brief description of this marketplace..."

                value={formData.description}

                onChange={(e) => onFormChange({ ...formData, description: e.target.value })}

                rows={2}

                className="border-2 focus:border-indigo-500"

              />

            </div>

            <div>
              <Label className="text-base font-semibold">Environment</Label>
              <Select
                value={formData.environment || 'sandbox'}
                onValueChange={(value: string) => 
                  onFormChange({ ...formData, environment: value as 'sandbox' | 'production' })
                }
              >
                <SelectTrigger className="border-2 focus:border-indigo-500">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Sandbox (Test)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Production (Live)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.environment === 'sandbox' 
                  ? 'Use sandbox for testing and development' 
                  : 'Use production for live transactions'}
              </p>
            </div>
            {/* Dynamic Fields Section */}
            {selectedTemplate && (
              <div className="border-t-2 pt-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border-2 border-purple-200">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <Label className="text-lg font-bold text-purple-900">
                    {selectedTemplate?.name} Credentials
                  </Label>
                </div>

                <div className="grid gap-4">
                  {selectedTemplate?.fields.map((fieldName: any) => (
                    <div key={fieldName}>
                      <Label className="text-sm font-semibold capitalize">
                        {fieldName.replace(/([A-Z])/g, ' $1')} {/* Formats shopUrl to Shop Url */}
                      </Label>
                      <Input
                        type="password" // As per your requirement
                        placeholder={`Enter ${fieldName}...`}
                        value={formData.credentials?.[fieldName] || ''}
                        onChange={(e) =>
                          onFormChange({
                            ...formData,
                            credentials: {
                              ...formData.credentials,
                              [fieldName]: e.target.value,
                            },
                          })
                        }
                        className="border-2 focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text Contextual to Selection */}
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex gap-3">
                <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-1 text-base">Security Note</p>
                  <p className="text-blue-800">
                    Your {selectedTemplate?.name || 'marketplace'} credentials are encrypted before storage.
                    Visit the developer portal to manage your keys.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-2">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            disabled={!formData.name}
          >
            <Check className="h-4 w-4" />
            {isEdit ? 'Update' : 'Add'} Marketplace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}