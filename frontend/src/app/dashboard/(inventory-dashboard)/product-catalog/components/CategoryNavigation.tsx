import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { Category } from '../types/products';
import { Layers, ChevronRight } from 'lucide-react';

interface CategoryNavigationProps {
  categories: Category[];
  selectedCategory: string;
  selectedSubcategory: string;
  onCategorySelect: (categoryId: string) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const activeCategory = categories.find(c => c.id === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-center gap-2 text-white">
            <Layers className="h-6 w-6" />
            <h2 className="text-xl font-bold">Product Categories</h2>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => {
                    onCategorySelect(category.id);
                    onSubcategorySelect('all');
                  }}
                  className="cursor-pointer"
                >
                  <Card className={`border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-indigo-500 shadow-xl shadow-indigo-200' 
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <Badge className={`${isActive ? 'bg-indigo-500' : 'bg-gray-200 text-gray-700'}`}>
                          {category.count}
                        </Badge>
                      </div>
                      <h3 className={`font-semibold text-lg ${isActive ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {category.name}
                      </h3>
                      {category.subcategories && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <Layers className="h-3 w-3" />
                          <span>{category.subcategories.length} subcategories</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Subcategories */}
          {activeCategory?.subcategories && activeCategory.id !== 'all' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                {activeCategory.name} Subcategories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div
                  onClick={() => onSubcategorySelect('all')}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSubcategory === 'all'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium">All</p>
                    <p className="text-xs text-gray-500 mt-1">{activeCategory.count} items</p>
                  </div>
                </div>
                {activeCategory.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onSubcategorySelect(sub.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSubcategory === sub.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-sm font-medium">{sub.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{sub.count} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};