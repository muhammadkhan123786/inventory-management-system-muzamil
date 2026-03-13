import { getAll } from "./apiHelper";

interface DropdownOption {
  value: string;
  label: string;
  isActive?: true | false  
}
// Color dropdown needs colorCode
export interface ColorDropdownOption extends DropdownOption {
  colorCode: string;
}

// Icon dropdown needs icon array
export interface IconDropdownOption extends DropdownOption {
  icon: string;
}

export interface DropdownData {
  categories: DropdownOption[];
  brands: DropdownOption[];
  taxes: DropdownOption[];
  currencies: DropdownOption[];
  vendors: DropdownOption[];
  channels: DropdownOption[];
  sizes: DropdownOption[];
  colors: DropdownOption[];
  status: DropdownOption[];
  units: DropdownOption[];
  fetchWherehouesStatus: DropdownOption[];
  fetchWherehoues: DropdownOption[];
  fetchColors: ColorDropdownOption[];
  fetchIcons: IconDropdownOption[];
}

export class DropdownService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  static async fetchAll(): Promise<DropdownData> {
    try {
      const [
        categories,
        brands,
        taxes,
        currencies,
        vendors,
        channels,
        sizes,
        colors,
        status,
        units,
        warehouses,
        warehouseStatus,
      ] = await Promise.all([
        this.fetchCategories(),
        this.fetchBrands(),
        this.fetchTaxes(),
        this.fetchCurrencies(),
        this.fetchVendors(),
        this.fetchChannels(),
        this.fetchSizes(),
        this.fetchColors(),
        this.fetchStatus(),
        this.fetchUnits(),
        this.fetchWherehoues(),
        this.fetchWherehouesStatus(),
        this.fetchColors(),
        this.fetchIcons(),
      ]);

      return {
        categories,
        brands,
        taxes,
        currencies,
        vendors,
        channels,
        sizes,
        colors,
        status,
        units,
        fetchWherehoues: warehouses,
        fetchWherehouesStatus: warehouseStatus,
        fetchColors: colors,
        fetchIcons: [], 
      };
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      throw error;
    }
  }

  private static async fetchCategories(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; categoryName: string }>(
        "/categories",
        { limit: 100 }
      );
      console.log("categories", response);
      return response.data.map((item) => ({
        value: item._id,
        label: item.categoryName,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  private static async fetchBrands(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; brandName: string }>(
        "/vehiclebrand", // Adjust endpoint as needed
        { limit: 100 }
      );
      return response.data.map((item) => ({
        value: item._id,
        label: item.brandName,
      }));
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  }

  private static async fetchTaxes(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{
        _id: string;
        taxName: string;
        percentage: number;
        isActive: boolean
      }>("/tax", { limit: 100 });
      // return response.data.map((item) => ({
      //   value: item._id,
      //   label: `${item.taxName} (${item.percentage}%)`,
      //   rate: item.percentage,
      // }));
       return response.data
      .filter((item) => item.isActive === true) 
      .map((item) => ({
       value: item._id,
        label: `${item.taxName} (${item.percentage}%)`,
        rate: item.percentage,
      }));
    } catch (error) {
      console.error("Error fetching taxes:", error);
      return [];
    }
  }

  private static async fetchCurrencies(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{
        _id: string;
        currencyName: string;
        currencySymbol: string;
      }>("/currencies", { limit: 100 });


      return response.data.map((item) => ({
        value: item._id,
        label: `${item.currencyName} - ${item.currencySymbol}`,
        // code: item.code,
      }));
    } catch (error) {
      console.error("Error fetching currencies:", error);
      return [];
    }
  }

  private static async fetchVendors(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{
        _id: string;
        lastName: string;
        personId: { lastName: string };
      }>("/venders", { limit: 100 });

      return response.data.map((item) => ({
        value: item._id,
        label: item?.personId?.lastName,
      }));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return [];
    }
  }

  private static async fetchChannels(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; channelName: string }>(
        "/product-channels",
        { limit: 100 }
      );

      return response.data.map((item) => ({
        value: item._id,
        label: item.channelName,
      }));
    } catch (error) {
      console.error("Error fetching channels:", error);
      return [];
    }
  }

  private static async fetchColors(): Promise<ColorDropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; colorName: string, colorCode: string }>(
        "/colors",
        { limit: 100 }
      );

      return response.data.map((item) => ({
        value: item._id,
        label: item.colorName,
        colorCode: item.colorCode,
      }));
    } catch (error) {
      console.error("Error fetching colors:", error);
      return [];
    }
  }

  private static async fetchSizes(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; size: string }>("/sizes", {
        limit: 100,
      });

      return response.data.map((item) => ({
        value: item._id,
        label: item.size,
      }));
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

  private static async fetchStatus(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; orderStatus: string; isActive: boolean }>(
        "/order-status",
        { limit: 100 }
      );

      // return response.data.map((item) => ({
      //   value: item._id,
      //   label: item.orderStatus,
      // }));
       return response.data
      .filter((item) => item.isActive === true) 
      .map((item) => ({
        value: item._id,
        label: item.orderStatus,
      }));
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

  //   private static async fetchStatus(): Promise<DropdownOption[]> {
  //   try {
  //     console.log("Starting fetchStatus...");

  //     const response = await getAll<{ _id: string; orderStatus: string }>(
  //       "/order-status",
  //       { limit: 100 }
  //     );

  //     console.log("Raw API response:", response);
  //     console.log("Response data:", response.data);
  //     console.log("First item:", response.data[0]);
  //     console.log("First item orderStatus:", response.data[0]?.orderStatus);

  //     // Make sure we have data
  //     if (!response.data || !Array.isArray(response.data)) {
  //       console.error("Invalid response data format:", response.data);
  //       return [];
  //     }

  //     // Map the data
  //     const options = response.data.map(item => {
  //       // Validate each item
  //       if (!item._id || !item.orderStatus) {
  //         console.warn("Invalid item found:", item);
  //         return null;
  //       }
  //       return {
  //         value: item._id,
  //         label: item.orderStatus,
  //       };
  //     }).filter(Boolean); // Remove null items

  //     console.log("Mapped options:", options);

  //     return options;

  //   } catch (error) {
  //     console.error("Error in fetchStatus:", error);
  //     return []; // Always return array even on error
  //   }
  // }

  private static async fetchUnits(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; unitName: string }>(
        "/units",
        { limit: 100 }
      );

      return response.data.map((item) => ({
        value: item._id,
        label: item.unitName,
      }));
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

  private static async fetchWherehoues(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{
        _id: string;
        addressId: { address: string };
      }>("/warehouses", { limit: 100 });

      return response.data.map((item) => ({
        value: item._id,
        label: item?.addressId?.address,
      }));
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

  private static async fetchWherehouesStatus(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; wareHouseStatus: string; isActive: boolean; }>(
        "/warehouse-status",
        { limit: 100 }
      );
      return response.data
      .filter((item) => item.isActive === true) 
      .map((item) => ({
        value: item._id,
        label: item.wareHouseStatus,
      }));
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

  private static async fetchConditions(): Promise<DropdownOption[]> {
    try {
      const response = await getAll<{ _id: string; itemConditionName: string; isActive: boolean }>(
        "/items-conditions",
        { limit: 100 }
      );      
       return response.data
      .filter((item) => item.isActive === true) 
      .map((item) => ({
        value: item._id,
        label: item.itemConditionName,
      }));
    } catch (error) {
      console.error("Error fetching sizes:", error);
      return [];
    }
  }

private static async fetchIcons(): Promise<IconDropdownOption[]> {
  try {
    const response = await getAll<{
      _id: string;
      icon: string;
      iconName: string;
    }>("/icons", { limit: 100 });
      return response.data.map((item) => ({
        value: item._id,
        label: item.iconName,
         icon: item.icon, 
      }));
  } catch (error) {
    console.error("Error fetching icons:", error);
    return [];
  }
}



  // DO NOT create a new class
// ADD this method inside existing DropdownService class

static async fetchOnlyTaxAndCurrency() {
  try {
    const [taxes, currencies] =
      await Promise.all([
        this.fetchTaxes(),
        this.fetchCurrencies(),       
      ]);
    return {
      taxes,
      currencies,     
    };
  } catch (error) {
    console.error("Error fetching only four dropdowns", error);
    throw error;
  }
}

static async fetchOnlyWarehouse() {
  try {
    const warehouses = await this.fetchWherehoues();
    const warehouseStatus = await this.fetchWherehouesStatus();
    const productStatus = await this.fetchStatus();
    const conditions = await this.fetchConditions();
    return {
      warehouses,
      warehouseStatus,
      productStatus,
      conditions
    };
  } catch (error) {
    console.error("Error fetching only warehouse dropdowns", error);
    throw error;
  }
}

static async fetchColorsAndIcons() {
  try {
   ;
    const colors = await this.fetchColors();
    const icons = await this.fetchIcons();
    return {
      colors,
      icons,
    };
  } catch (error) {
    console.error("Error fetching only colors and icons dropdowns", error);
    throw error;
  }
}
}