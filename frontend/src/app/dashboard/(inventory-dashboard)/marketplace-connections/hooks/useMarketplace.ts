import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMarketplaces, createMarketplace } from "../service/marketplace.api";
import { toast } from "sonner";

export const useMarketplaces = () =>
  useQuery({
    queryKey: ["marketplaces"],
    queryFn: getMarketplaces,
  });

export const useCreateMarketplace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMarketplace,
    onSuccess: () => {
      toast.success("Marketplace added successfully");
      queryClient.invalidateQueries({ queryKey: ["marketplaces"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add marketplace");
    },
  });
};