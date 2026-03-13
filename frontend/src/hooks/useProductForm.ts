import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FormData, initialFormData } from '../app/dashboard/add-product/data/productData';
import { CategoryNode, findCategoryById, categoryTree } from '../app/dashboard/add-product/data/categoryTree';


interface UseProductFormProps {
  initialData: FormData;
  onSubmit: (data: any) => void;
}

export function useProductForm({ initialData, onSubmit }: UseProductFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState('');
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState('');

  const getSelectedCategory = useCallback((level: 1 | 2 | 3): CategoryNode | null => {
    if (level === 1 && selectedLevel1) {
      return findCategoryById(categoryTree, selectedLevel1);
    }
    if (level === 2 && selectedLevel2) {
      const level1Cat = findCategoryById(categoryTree, selectedLevel1);
      return level1Cat ? findCategoryById(level1Cat.children || [], selectedLevel2) : null;
    }
    if (level === 3 && selectedLevel3) {
      const level1Cat = findCategoryById(categoryTree, selectedLevel1);
      const level2Cat = level1Cat ? findCategoryById(level1Cat.children || [], selectedLevel2) : null;
      return level2Cat ? findCategoryById(level2Cat.children || [], selectedLevel3) : null;
    }
    return null;
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  const getAllFields = useCallback((): Array<{ name: string; label: string; type: string; options?: string[] }> => {
    const fields: Array<{ name: string; label: string; type: string; options?: string[] }> = [];
    
    const level1Cat = getSelectedCategory(1);
    const level2Cat = getSelectedCategory(2);
    const level3Cat = getSelectedCategory(3);
    
    if (level1Cat?.fields) fields.push(...level1Cat.fields);
    if (level2Cat?.fields) fields.push(...level2Cat.fields);
    if (level3Cat?.fields) fields.push(...level3Cat.fields);
    
    console.log('Dynamic fields loaded:', fields.length, 'fields from categories:', {
      level1: level1Cat?.name,
      level2: level2Cat?.name,
      level3: level3Cat?.name
    });
    
    return fields;
  }, [getSelectedCategory]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDynamicFieldChange = useCallback((fieldName: string, value: any) => {
    setDynamicFields(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const fullFormData = {
      ...formData,
      dynamicFields,
      categories: {
        level1: selectedLevel1,
        level2: selectedLevel2,
        level3: selectedLevel3
      },
      tags,
      images
    };
    
    onSubmit(fullFormData);
    toast.success('Product created successfully!');
  }, [formData, dynamicFields, selectedLevel1, selectedLevel2, selectedLevel3, tags, images, onSubmit]);

  const addTag = useCallback(() => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleImageUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const dummyUrl = `https://images.unsplash.com/photo-${1563206748 + Math.random()}-a084292cbbed?w=300`;
    setImages([...images, dummyUrl]);
  }, [images]);

  const removeImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images]);

  const nextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  return {
    currentStep,
    formData,
    selectedLevel1,
    selectedLevel2,
    selectedLevel3,
    dynamicFields,
    tags,
    images,
    newTag,
    getSelectedCategory,
    getAllFields,
    handleInputChange,
    handleDynamicFieldChange,
    handleSubmit,
    addTag,
    removeTag,
    handleImageUpload,
    removeImage,
    nextStep,
    prevStep,
    setSelectedLevel1,
    setSelectedLevel2,
    setSelectedLevel3,
    setNewTag
  };
}