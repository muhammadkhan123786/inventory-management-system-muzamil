import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAll, deleteItem, updateItem, createItem, marketplaceAPIHelper } from "@/helper/apiHelper";
import { toast } from "react-hot-toast"; // Naya Import

import { useCurrencyStore } from "@/stores/currency.store";
const getUserId = () => {
  if (typeof window === "undefined") return "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id || "";
};
console.log(getUserId())
// T generic type hai jo aapke interface (e.g., IBusinessTypes) ko represent karega
export const useFormActions = <T extends { _id: string }>(
  endpoint: string, // API endpoint e.g., "/business-types"
  queryKey: string, // Unique key for caching e.g., "businessTypes"
  moduleName: string, // Naya parameter: e.g., "Business Type"
  page: number = 1,
  search: string = "",
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();

  // 1. DATA FETCHING (Read)
  const query = useQuery({
    queryKey: [queryKey, page, search],
    queryFn: () => getAll<T>(endpoint, {
      userId: getUserId(),
      page: String(page),
      limit: "12",
      search: search.trim()
    }),
    placeholderData: (previousData) => previousData, // Smooth transition between pages
    enabled,
  });

  // 2. DELETE MUTATION (Delete)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(endpoint, id),
    onSuccess: () => {
      // Isse page reload nahi hoga, sirf data refresh hoga smoothly
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${moduleName} deleted successfully!`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || `Failed to delete ${moduleName}.`);
    }
  });

  // 3. STATUS UPDATE / EDIT MUTATION (Update)
  // const updateMutation = useMutation({
  //   mutationFn: ({ id, payload }: { id: string; payload: any }) =>
  //     updateItem(endpoint, id, payload),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [queryKey] });
  //     toast.success(`${moduleName} updated successfully!`);
  //   },
  //   onError: (err: any) => {
  //     toast.error(err.response?.data?.message || `Failed to update ${moduleName}`);
  //   }
  // });
  const updateMutation = useMutation({
  mutationFn: ({ id, payload }: { id: string; payload: any }) =>
    updateItem(endpoint, id, payload),

  onSuccess: async () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });

    // Only refresh currency store if endpoint is currencies
    if (endpoint === "/currencies") {
      const { fetchCurrency } = useCurrencyStore.getState();
      await fetchCurrency();
    }

    toast.success(`${moduleName} updated successfully!`);
  },
});

  // 4. CREATE MUTATION (Create)
  // const createMutation = useMutation({
  //   mutationFn: (payload: any) => createItem(endpoint, payload),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [queryKey] });
  //     toast.success(`${moduleName} created successfully!`);
  //   },
  //   onError: (err: any) => {
  //     toast.error(err.response?.data?.message || `Failed to create ${moduleName}`);
  //   }
  // });

  const createMutation = useMutation({
  mutationFn: (payload: any) => createItem(endpoint, payload),

  onSuccess: async () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });

    if (endpoint === "/currencies") {
      const { fetchCurrency } = useCurrencyStore.getState();
      await fetchCurrency();
    }

    toast.success(`${moduleName} created successfully!`);
  },
});


  // 5. Test Connection Mutation

  const testConnectionMutation = useMutation({
    mutationFn: (id: any) => marketplaceAPIHelper(endpoint, id, 'test'),
    onSuccess: () => {
      // Isse page reload nahi hoga, sirf data refresh hoga smoothly
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${moduleName} connection successfully!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || `Failed to Test Connection ${moduleName}.`);

    }
  });

  // 6. Sync Marketplace
  const syncData = useMutation({
    mutationFn: (id: any) => marketplaceAPIHelper(endpoint, id, 'sync'),
    onSuccess: () => {
      // Isse page reload nahi hoga, sirf data refresh hoga smoothly
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${moduleName} Sync successfully!`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || `Failed to Sync Data ${moduleName}.`);
    }
  });


  return {
    data: query.data?.data || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    deleteItem: deleteMutation.mutate,
    updateItem: updateMutation.mutate,
    createItem: createMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
    ConnectionItem: testConnectionMutation.mutate,
    SynData: syncData.mutate,
  };
};