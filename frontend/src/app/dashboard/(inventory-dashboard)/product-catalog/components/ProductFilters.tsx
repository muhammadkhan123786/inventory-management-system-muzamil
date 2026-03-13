import { Card, CardContent } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import { Button } from '@/components/form/CustomButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/form/Select';
import { Search, Filter, Grid3x3, List } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  statusFilter: string;
  stockFilter: string;
  viewMode: 'grid' | 'table';
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onStockFilterChange: (value: string) => void;
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  statusFilter,
  stockFilter,
  viewMode,
  filteredCount,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onStockFilterChange,
  onViewModeChange
}) => {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products by name, SKU, description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={onStockFilterChange}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 bg-indigo-50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={viewMode === 'grid' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'text-gray-600'
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className={viewMode === 'table' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'text-gray-600'
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing <span className="font-semibold text-indigo-600">{filteredCount}</span> of {totalCount} products
          </span>
        </div>
      </CardContent>
    </Card>
  );
};