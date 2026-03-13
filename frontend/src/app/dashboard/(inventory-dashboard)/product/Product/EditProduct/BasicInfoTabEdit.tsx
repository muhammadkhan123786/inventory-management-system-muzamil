import { Input } from "@/components/form/Input";
import { Textarea } from "@/components/form/Textarea";
import { Label } from "@/components/form/Label";
import { Badge } from "@/components/form/Badge";
import { Switch } from "@/components/form/Switch";
import { Button } from "@/components/form/CustomButton";
import { ImageIcon, Upload, Loader2, X, Plus, TagIcon } from "lucide-react";

interface BasicInfoTabProps {
  formData: any;
  updateField: (path: string, value: any) => void;
  isUploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAddTag: () => void;
  onRemoveTag: (index: number) => void;
  fileInputRef: any;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  updateField,
  isUploadingImage,
  onImageUpload,
  onRemoveImage,
  onAddTag,
  onRemoveTag,
  fileInputRef,
}) => {
  return (
    <div className="space-y-4">
      {/* Images */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
        <div className="flex justify-between mb-3">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Product Images ({formData.images?.length || 0})
          </Label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onImageUpload} className="hidden" />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
            {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {isUploadingImage ? "Processing..." : "Upload Images"}
          </Button>
        </div>

        {formData.images?.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {formData.images.map((img: string, index: number) => (
              <div key={index} className="relative group">
                <img src={img} alt="" className="w-full h-24 object-cover rounded-lg border-2" />
                <button onClick={() => onRemoveImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
                {index === 0 && <Badge className="absolute bottom-1 left-1 bg-blue-500 text-white">Primary</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="p-8 text-center bg-white rounded-lg border-2 border-dashed border-purple-300 cursor-pointer">
            <Upload className="h-12 w-12 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-700 font-semibold">Click to upload images</p>
          </div>
        )}
      </div>

      {/* Product Name & SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Product Name *</Label>
          <Input value={formData.productName || ""} onChange={(e) => updateField("productName", e.target.value)} />
        </div>
        <div>
          <Label>SKU *</Label>
          <Input value={formData.sku || ""} onChange={(e) => updateField("sku", e.target.value)} className="font-mono" />
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <Label>Short Description</Label>
        <Textarea value={formData.shortDescription || ""} onChange={(e) => updateField("shortDescription", e.target.value)} rows={2} />
      </div>
      <div>
        <Label>Full Description</Label>
        <Textarea value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={5} />
      </div>

      {/* Keywords */}
      <div>
        <Label>Keywords</Label>
        <Input value={formData.keywords || ""} onChange={(e) => updateField("keywords", e.target.value)} />
      </div>

      {/* Tags */}
      <div>
        <div className="flex justify-between mb-2">
          <Label>Tags</Label>
          <Button variant="outline" size="sm" onClick={onAddTag}>
            <Plus className="h-4 w-4 mr-2" /> Add Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border min-h-[60px]">
          {formData.tags?.map((tag: string, index: number) => (
            <Badge key={index} className="bg-purple-100 text-purple-700 pr-1 flex items-center gap-1">
              <TagIcon className="h-3 w-3" /> {tag}
              <button onClick={() => onRemoveTag(index)} className="ml-1 p-0.5 hover:bg-purple-200 rounded">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {!formData.tags?.length && <p className="text-sm text-gray-500">No tags added</p>}
        </div>
      </div>

      {/* Brand, Manufacturer, Model */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Brand</Label>
          <Input value={formData.brand || ""} onChange={(e) => updateField("brand", e.target.value)} />
        </div>
        <div>
          <Label>Manufacturer</Label>
          <Input value={formData.manufacturer || ""} onChange={(e) => updateField("manufacturer", e.target.value)} />
        </div>
        <div>
          <Label>Model Number</Label>
          <Input value={formData.modelNumber || ""} onChange={(e) => updateField("modelNumber", e.target.value)} />
        </div>
      </div>

      {/* Barcode & Warranty */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Barcode</Label>
          <Input value={formData.barcode || ""} onChange={(e) => updateField("barcode", e.target.value)} className="font-mono" />
        </div>
        <div>
          <Label>Warranty Type</Label>
          <Input value={formData.warrantyType || ""} onChange={(e) => updateField("warrantyType", e.target.value)} />
        </div>
        <div>
          <Label>Warranty Period</Label>
          <Input value={formData.warrantyPeriod || ""} onChange={(e) => updateField("warrantyPeriod", e.target.value)} />
        </div>
      </div>

      {/* Status Toggles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <Label>Featured Product</Label>
            <p className="text-xs text-gray-600">Show prominently on store</p>
          </div>
          <Switch checked={formData.featured || false} onCheckedChange={(c) => updateField("featured", c)} />
        </div>
        <div className="flex justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <Label>Product Status</Label>
            <p className="text-xs text-gray-600">{formData.isActive ? "Active" : "Inactive"}</p>
          </div>
          <Switch checked={formData.isActive || false} onCheckedChange={(c) => updateField("isActive", c)} />
        </div>
      </div>
    </div>
  );
};