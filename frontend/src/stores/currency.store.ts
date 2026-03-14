import { create } from "zustand";
import { DropdownService } from "@/helper/dropdown.service";

type CurrencyState = {
  currencySymbol: string;
  currencies: { value: string; label: string }[];
  loading: boolean;
  fetchCurrency: () => Promise<void>;
};

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currencySymbol: "",
  currencies: [],
  loading: false,

  fetchCurrency: async () => {
    set({ loading: true });

    try {
      const { currencies } = await DropdownService.fetchOnlyTaxAndCurrency();

      // extract symbol from label "Dollar - $"
      const symbol =
        currencies?.[0]?.label?.split(" - ")[1] ?? "$";

      set({
        currencies,
        currencySymbol: symbol,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching currency", error);
      set({ loading: false });
    }
  },
}));