// types/index.ts
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
}

export interface CategoryData {
  label: string;
  value: string | number;
}

export interface DashboardStat {
  title: string;
  value: string | number;
}