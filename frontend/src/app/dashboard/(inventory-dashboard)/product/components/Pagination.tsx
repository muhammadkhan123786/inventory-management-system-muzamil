
"use client";

import { Card, CardContent } from "@/components/form/Card";
import { Button } from "@/components/form/CustomButton";

interface PaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}


const PaginationButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled: boolean;
}> = ({ label, onClick, disabled }) => (
  <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
    {label}
  </Button>
);

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {startItem} to {endItem} of {pagination.total} products
            </p>
            <select
              value={pagination.limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <PaginationButton
              label="First"
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
            />
            <PaginationButton
              label="Previous"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            />
            <span className="px-4 py-2 text-sm">
              Page {pagination.page} of {totalPages}
            </span>
            <PaginationButton
              label="Next"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            />
            <PaginationButton
              label="Last"
              onClick={() => onPageChange(totalPages)}
              disabled={pagination.page >= totalPages}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};