import { Badge } from "@/components/form/Badge";
import { Card, CardContent } from "@/components/form/Card";
import { Button } from "@/components/form/CustomButton";
import { Input } from "@/components/form/Input";
import { Label } from "@/components/form/Label";
import {
  Layers,
  Tag,
  Edit2,
  Save,
  X,
  ChevronRight,
  CheckCircle2,
  Search,
  FolderTree,
} from "lucide-react";
import { useState, useMemo } from "react";

interface VariantsTabProps {
  formData: any;
  categories?: any[];
  attributeOptions?: any[];
  updateField: (path: string, value: any) => void;
}

export const VariantsTab: React.FC<VariantsTabProps> = ({
  formData,
  categories = [],
  attributeOptions = [],
  updateField,
}) => {
  const [editingVariant, setEditingVariant] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [catSearch, setCatSearch] = useState("");
  const [showCatPicker, setShowCatPicker] = useState(false);

  // ── Resolve category ID → name ──
  const getCategoryName = (catId: any): string => {
    const id = typeof catId === "string" ? catId : catId?.id || catId?._id || "";
    if (!id) return "Unknown";
    const found = categories.find((c) => c._id === id || c.id === id);
    return found?.categoryName || found?.name || found?.title || id;
  };

  // ── Resolve attribute key ID → readable name ──
  const getAttributeName = (keyId: string): string => {
    if (!keyId) return keyId;
    const isObjectId = /^[a-f\d]{24}$/i.test(keyId);
    if (!isObjectId) return keyId; // already readable

    const found = attributeOptions.find((a) => a._id === keyId || a.id === keyId);
    if (!found) return keyId; // still not found — return ID

    // Try every possible name field your API might use
    return (
      found.attributeName ||
      found.name ||
      found.label ||
      found.title ||
      found.attribute_name ||
      found.attrName ||
      found.displayName ||
      found.display_name ||
      keyId
    );
  };

  // ── Build breadcrumb from current categoryPath ──
  const categoryBreadcrumb = useMemo(
    () =>
      (formData.categoryPath || []).map((catId: any, i: number) => {
        const id =
          typeof catId === "string" ? catId : catId?.id || catId?._id || `unknown-${i}`;
        return { id: id || `cat-${i}`, name: getCategoryName(id) };
      }),
    [formData.categoryPath, categories]
  );

  // ── Build category tree for picker ──
  // Each category may have parentId or parentCategoryId
  const buildTree = useMemo(() => {
    // Get root categories (no parent)
    const roots = categories.filter(
      (c) => !c.parentId && !c.parentCategoryId && !c.parent
    );
    // Build path string for each category for easy search
    const withPath = categories.map((c) => {
      const id = c._id || c.id;
      const name = c.categoryName || c.name || c.title || id;
      return { ...c, _resolvedName: name, _id: id };
    });
    return withPath;
  }, [categories]);

  // ── Filtered categories for search ──
  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return buildTree.slice(0, 50); // show first 50 by default
    const q = catSearch.toLowerCase();
    return buildTree.filter((c) =>
      (c._resolvedName || "").toLowerCase().includes(q)
    ).slice(0, 50);
  }, [buildTree, catSearch]);

  // ── When user selects a category from picker ──
  const handleSelectCategory = (cat: any) => {
    const id = cat._id || cat.id;
    const name = cat._resolvedName || cat.categoryName || cat.name || "";

    // Build the full path up to this category
    const buildPath = (targetId: string): string[] => {
      const target = categories.find((c) => (c._id || c.id) === targetId);
      if (!target) return [targetId];
      const parentId = target.parentId || target.parentCategoryId || target.parent;
      if (!parentId) return [targetId];
      return [...buildPath(parentId), targetId];
    };

    const path = buildPath(id);

    updateField("categoryId", id);
    updateField("categoryPath", path);
    setCatSearch("");
    setShowCatPicker(false);
  };

  // ── Get parent path display for a category ──
  const getCategoryPath = (cat: any): string => {
    const parentId = cat.parentId || cat.parentCategoryId || cat.parent;
    if (!parentId) return "";
    const parent = categories.find((c) => (c._id || c.id) === parentId);
    if (!parent) return "";
    const grandParentPath = getCategoryPath(parent);
    const parentName = parent.categoryName || parent.name || "";
    return grandParentPath ? `${grandParentPath} › ${parentName}` : parentName;
  };

  const handleEditVariant = (index: number) => {
    setEditingVariant(index);
    setEditForm({
      sku: formData.attributes[index].sku,
      attributes: { ...formData.attributes[index].attributes },
    });
  };

  const handleSaveVariant = (index: number) => {
    if (!editForm) return;
    if (editForm.sku !== formData.attributes[index].sku) {
      updateField(`attributes.${index}.sku`, editForm.sku);
    }
    Object.keys(formData.attributes[index].attributes || {}).forEach((key) => {
      const newValue = editForm.attributes[key];
      if (newValue !== undefined) {
        updateField(`attributes.${index}.attributes.${key}`, newValue);
      }
    });
    setEditingVariant(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-5">

      {/* ── Category Section ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

        {/* Purple header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Category</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCatPicker(!showCatPicker)}
            className="text-white hover:bg-white/20 h-7 px-3 text-xs"
          >
            {showCatPicker ? "Close" : "Change Category"}
          </Button>
        </div>

        {/* Current breadcrumb */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          {categoryBreadcrumb.length > 0 ? (
            <div className="flex items-center gap-1 text-sm text-gray-700 flex-wrap">
              {categoryBreadcrumb.map((cat: any, i: number) => (
                <span key={`${cat.id}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
                  <span className="text-gray-800">{cat.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">No category selected</span>
          )}
        </div>

        {/* Green selected path badges */}
        {categoryBreadcrumb.length > 0 && !showCatPicker && (
          <div className="px-4 py-3 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-green-700">
                Selected Category Path:
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categoryBreadcrumb.map((cat: any, i: number) => (
                <span key={`badge-${cat.id}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
                  <Badge
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      i === 0
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : i === categoryBreadcrumb.length - 1
                        ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                  >
                    {cat.name}
                  </Badge>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Category Picker ── */}
        {showCatPicker && (
          <div className="border-t border-gray-100">
            {/* Search input */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {categories.length} categories loaded — type to search
              </p>
            </div>

            {/* Category list */}
            <div className="max-h-52 overflow-y-auto px-4 pb-3 space-y-1">
              {filteredCategories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {catSearch ? "No categories found" : "Loading categories..."}
                </p>
              ) : (
                filteredCategories.map((cat) => {
                  const id = cat._id || cat.id;
                  const name = cat._resolvedName || "";
                  const parentPath = getCategoryPath(cat);
                  const isSelected =
                    formData.categoryId === id ||
                    (formData.categoryPath || []).includes(id);

                  return (
                    <button
                      key={id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-start gap-2 ${
                        isSelected
                          ? "bg-purple-50 border border-purple-200 text-purple-700"
                          : "hover:bg-gray-50 border border-transparent text-gray-700"
                      }`}
                    >
                      <FolderTree className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{name}</p>
                        {parentPath && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {parentPath}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-purple-600 ml-auto flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Product Variants ── */}
      <div className="rounded-xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <Layers className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-indigo-900 text-sm">Product Variants</span>
          <Badge className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-1">
            {formData.attributes?.length || 0}
          </Badge>
        </div>

        <div className="p-4 space-y-3">
          {(!formData.attributes || formData.attributes.length === 0) && (
            <p className="text-center py-8 text-gray-400 text-sm">No variants found</p>
          )}

          {formData.attributes?.map((variant: any, index: number) => {
            const isEditing = editingVariant === index;
            const attrEntries = Object.entries(variant.attributes || {});

            return (
              <Card
                key={variant._id || index}
                className={`border transition-all ${
                  isEditing ? "border-indigo-300 shadow-md" : "border-gray-100 hover:border-indigo-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-gray-800">
                            Variant #{index + 1}
                          </span>
                          {index === 0 && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0 rounded-full">
                              Primary
                            </Badge>
                          )}
                        </div>
                        {!isEditing && (
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            SKU: {variant.sku}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariant(index)}
                        className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 h-8 px-3"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveVariant(index)}
                          className="text-green-600 hover:bg-green-50 h-8 px-3"
                        >
                          <Save className="h-3.5 w-3.5 mr-1" /> Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingVariant(null); setEditForm(null); }}
                          className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing && editForm ? (
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">SKU</Label>
                        <Input
                          value={editForm.sku}
                          onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                          className="font-mono text-sm h-9"
                        />
                      </div>
                      {attrEntries.length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-600 mb-2">Attributes</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {attrEntries.map(([key]) => (
                              <div key={key}>
                                <Label className="text-xs text-gray-500 mb-1">
                                  {/* ✅ Show resolved name */}
                                  {getAttributeName(key)}
                                </Label>
                                <Input
                                  value={editForm.attributes[key] || ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      attributes: { ...editForm.attributes, [key]: e.target.value },
                                    })
                                  }
                                  className="text-sm h-9"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    attrEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                        {attrEntries.map(([key, value]) => (
                          <Badge
                            key={key}
                            className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                          >
                            {/* ✅ Resolved name shown, not raw ID */}
                            <span className="text-gray-500 mr-1">{getAttributeName(key)}:</span>
                            {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};