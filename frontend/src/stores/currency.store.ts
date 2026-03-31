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
    const { currencies } =
      await DropdownService.fetchOnlyTaxAndCurrency();

       // find default currency
    const defaultCurrency = currencies?.find(
      (currency: any) => currency.isDefault === true
    );

    if (!defaultCurrency) {
      console.warn(
        "No default currency found. Please set a default currency."
      );

      set({
        currencies: [],
        currencySymbol: "",
        loading: false,
      });

      return;
    }

    const symbol =
      defaultCurrency?.label?.split(" - ")[1] ?? "$";

    set({
      currencies: [defaultCurrency], // only default currency
      currencySymbol: symbol,
      loading: false,
    });

  } catch (error) {
    console.error("Error fetching currency", error);
    set({ loading: false });
  }
},
}));