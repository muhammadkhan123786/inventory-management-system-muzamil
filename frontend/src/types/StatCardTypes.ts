export type StatCardProgress = {
  value: number;
  max?: number;
  trackColor?: string;
  progressColor?: string;
  height?: number;
  borderRadius?: number;

  /**
   * How the label should appear inside StatCard
   */
  labelPosition?: "top-center" | "inside" | "outside";

  /**
   * Custom label text
   */
  labelText?: string;

  showLabel?: boolean;
};
