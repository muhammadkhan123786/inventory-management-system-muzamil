// "use client";

// import axios from "axios";
// import { MarketplaceTemplate } from "@/app/dashboard/(system-setup)/marketplace-setup/data/marketplaceTemplates";

// const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace-templates`;

// const getAuthConfig = () => {
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;

//   return {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };
// };

// const getUserId = () => {
//   if (typeof window === "undefined") return "";
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   return user.id || user._id;
// };

// /* ---------------- FETCH ---------------- */
// export const fetchMarketplaceTemplates = async (): Promise<MarketplaceTemplate[]> => {
//   const res = await axios.get(API_URL, {
//     ...getAuthConfig(),
//     params: {
//       userId: getUserId(),
//     },
//   });
// console.log("res", res);
//  return res.data.data || res.data;
// };

// /* ---------------- CREATE ---------------- */
// export const createMarketplaceTemplate = async (
//   payload: Partial<MarketplaceTemplate>
// ): Promise<{ success: boolean; data?: MarketplaceTemplate; message: string }> => {
//   try {
//     const userId = getUserId();
//     if (!userId) {
//       return {
//         success: false,
//         message: "User not authenticated. Please login again.",
//       };
//     }

//     // Prepare the data with proper formatting
//     const requestData = {
//       ...payload,
//       userId: userId,
//       isActive: payload.isActive ?? true,
//       isDefault: payload.isDefault ?? false,
//     };

//     console.log("Sending create request:", JSON.stringify(requestData, null, 2));

//     const res = await axios.post(API_URL, requestData, getAuthConfig());

//     console.log("Create response:", res.data);

//     // Handle different response formats
//     if (res.data.success !== undefined) {
//       return {
//         success: res.data.success,
//         data: res.data.data,
//         message: res.data.message || "Template created successfully",
//       };
//     }

//     return {
//       success: true,
//       data: res.data,
//       message: "Template created successfully",
//     };
    
//   } catch (error: any) {
//     console.error("Create API Error:", error);

//     // Extract meaningful error message
//     let errorMessage = "Failed to create template";
    
//     if (error.response) {
//       console.error("Response data:", error.response.data);
//       console.error("Response status:", error.response.status);
      
//       if (error.response.data && error.response.data.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response.data && error.response.data.errors) {
//         // Handle validation errors
//         const errors = error.response.data.errors;
//         errorMessage = Object.entries(errors)
//           .map(([field, message]) => `${field}: ${message}`)
//           .join(", ");
//       } else if (error.response.data) {
//         errorMessage = JSON.stringify(error.response.data);
//       }
//     } else if (error.request) {
//       errorMessage = "No response from server. Please check your connection.";
//     } else {
//       errorMessage = error.message || "An unknown error occurred";
//     }

//     return {
//       success: false,
//       message: errorMessage,
//     };
//   }
// };

// // Bulk Update
// export const bulkUpdateMarketplaceTemplates = async (
//   ids: string[],
//   updates: any
// ): Promise<{ success: boolean; data?: any; message: string }> => {
//   try {
//     const res = await axios.patch(
//       `${API_URL}/bulk-update`,
//       { ids, updates },
//       getAuthConfig()
//     );

//     return {
//       success: true,
//       data: res.data.data,
//       message: res.data.message || "Templates updated successfully",
//     };
//   } catch (error: any) {
//     console.error("Bulk update error:", error);
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to update templates",
//     };
//   }
// };

// // Toggle Active Status
// export const toggleMarketplaceTemplateActive = async (
//   id: string
// ): Promise<{ success: boolean; data?: any; message: string }> => {
//   try {
//     const res = await axios.patch(
//       `${API_URL}/${id}/toggle-active`,
//       {},
//       getAuthConfig()
//     );

//     return {
//       success: true,
//       data: res.data.data,
//       message: res.data.message || "Status updated successfully",
//     };
//   } catch (error: any) {
//     console.error("Toggle active error:", error);
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to update status",
//     };
//   }
// };

// // Set as Default
// export const setMarketplaceTemplateDefault = async (
//   id: string
// ): Promise<{ success: boolean; data?: any; message: string }> => {
//   try {
//     const res = await axios.patch(
//       `${API_URL}/${id}/set-default`,
//       {},
//       getAuthConfig()
//     );

//     return {
//       success: true,
//       data: res.data.data,
//       message: res.data.message || "Set as default successfully",
//     };
//   } catch (error: any) {
//     console.error("Set default error:", error);
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to set as default",
//     };
//   }
// };

// /* ---------------- UPDATE ---------------- */
// export const updateMarketplaceTemplate = async (
//   id: string,
//   payload: Partial<MarketplaceTemplate>
// ): Promise<MarketplaceTemplate> => {
//   const res = await axios.put(
//     `${API_URL}/${id}`,
    
//     payload,
//     getAuthConfig()
//   );

//   return res.data;
// };


// /* ---------------- DELETE ---------------- */
// export const deleteMarketplaceTemplate = async (id: string) => {
//   try {
//     const res = await axios.delete(
//       `${API_URL}/${id}`,
//       getAuthConfig()
//     );

//     console.log("Delete response:", res);

//     // Check if the response indicates success
//     if (res.data && res.data.success === true) {
//       return {
//         success: true,
//         data: res.data.data,
//         message: res.data.message || "Deleted successfully"
//       };
//     }
    
//     // If success is false in response
//     if (res.data && res.data.success === false) {
//       throw new Error(res.data.message || "Delete failed");
//     }

//     // If response doesn't have success field, assume it's ok
//     return {
//       success: true,
//       data: res.data,
//       message: "Deleted successfully"
//     };
    
//   } catch (error: any) {
//     console.error("Delete error:", error);
    
//     // Handle 500 error specifically
//     if (error.response && error.response.status === 500) {
//       return {
//         success: false,
//         data: null,
//         message: "Server error occurred. Please try again later.",
//         error: error.response.data
//       };
//     }
    
//     // Handle other errors
//     if (error.response && error.response.data && error.response.data.message) {
//       return {
//         success: false,
//         data: null,
//         message: error.response.data.message
//       };
//     } 
    
//     if (error.response && error.response.data) {
//       return {
//         success: false,
//         data: null,
//         message: error.response.data || "Request failed"
//       };
//     }
    
//     if (error.request) {
//       return {
//         success: false,
//         data: null,
//         message: "No response from server. Please check your connection."
//       };
//     }
    
//     return {
//       success: false,
//       data: null,
//       message: error.message || "Failed to delete marketplace template"
//     };
//   }
// };
