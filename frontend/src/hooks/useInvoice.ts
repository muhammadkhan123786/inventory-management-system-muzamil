"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  invoiceSchema,
  InvoiceFormData,
  InvoicePartFormData,
} from "../schema/invoice.schema";
import { getAlls } from "../helper/apiHelper";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  activeCount?: number;
  inactiveCount?: number;
  page: number;
  limit: number;
  data: T[];
}
const getAuthHeader = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return {};
  const cleanToken = token.replace(/^"|"$/g, "").trim();
  return { Authorization: `Bearer ${cleanToken}` };
};
const generateInvoiceCode = async (): Promise<string> => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const response = await axios.get(
      `${baseUrl}/auto-generate-codes/customer-invoice-code`,
      { headers: getAuthHeader() },
    );
    return response.data.customerInvoiceCode || "INV-ERROR-000";
  } catch (error) {
    console.error("Failed to generate invoice ID from API:", error);
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${year}${month}${day}-${random}`;
  }
};
const fetchDefaultTax = async (): Promise<number> => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const response = await axios.get(`${baseUrl}/default-tax`, {
      headers: getAuthHeader(),
    });
    return response.data?.taxPercentage || 20;
  } catch (error) {
    console.error("Failed to fetch default tax:", error);
    return 20;
  }
};
const fetchInvoiceById = async (id: string): Promise<any> => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const response = await axios.get(`${baseUrl}/customer-invoices/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
};
export const useInvoice = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceIdFromUrl = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(invoiceIdFromUrl);
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(20);
  const [jobs, setJobs] = useState<any[]>([]);
  const [partsInventory, setPartsInventory] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [invoiceCode, setInvoiceCode] = useState<string>("");

  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [isFetchingParts, setIsFetchingParts] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);

  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const isUpdating = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      invoiceId: "",
      jobId: "",
      customerId: "",
      services: [],
      parts: [],
      completionSummary: "",
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      callOutFee: 0,
      discountType: "Percentage",
      isVATEXEMPT: false,
      partsTotal: 0,
      labourTotal: 0,
      subTotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      netTotal: 0,
      invoiceNotes: "",
      termsAndConditions: "",
      paymentLink: "",
      paymentStatus: "PENDING",
      paymentMethod: "PENDING",
      status: "DRAFT",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const loadInvoiceForEditing = async () => {
      if (invoiceIdFromUrl) {
        setIsLoading(true);
        try {
          const invoiceData = await fetchInvoiceById(invoiceIdFromUrl);
          if (invoiceData) {
            console.log("📥 Invoice data loaded:", {
              callOutFee: invoiceData.callOutFee,
              discountType: invoiceData.discountType,
              partsCount: invoiceData.parts?.length,
              parts: invoiceData.parts?.map((p: any) => ({
                partId: p.partId?._id || p.partId,
                quantity: p.quantity,
                unitCost: p.unitCost,
              })),
            });
            setEditData(invoiceData);
            toast.success("Invoice loaded for editing");
          } else {
            toast.error("Invoice not found");
          }
        } catch (error) {
          console.error("Error loading invoice:", error);
          toast.error("Failed to load invoice");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInvoiceForEditing();
  }, [invoiceIdFromUrl]);

  useEffect(() => {
    const loadInvoiceCode = async () => {
      if (!editingId) {
        const code = await generateInvoiceCode();
        setInvoiceCode(code);
        form.setValue("invoiceId", code);
      }
    };
    loadInvoiceCode();
  }, [editingId, form]);

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const {
    fields: partFields,
    append: appendPart,
    remove: removePart,
  } = useFieldArray({
    control: form.control,
    name: "parts",
  });

  const services = form.watch("services");
  const parts = form.watch("parts");
  const callOutFee = form.watch("callOutFee");
  const discountType = form.watch("discountType");
  const discountAmount = form.watch("discountAmount");
  const isVATEXEMPT = form.watch("isVATEXEMPT");

  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    if (isUpdating.current) return;

    const partsTotal = (parts || []).reduce((sum, part) => {
      return (
        sum + (part.totalCost || (part.quantity || 0) * (part.unitCost || 0))
      );
    }, 0);

    const labourTotal = (services || []).reduce((sum, service) => {
      let hours = 0;
      if (service?.duration) {
        if (
          typeof service.duration === "string" &&
          service.duration.includes(":")
        ) {
          const [h, m] = service.duration.split(":").map(Number);
          hours = (h || 0) + (m || 0) / 60;
        } else {
          hours = parseFloat(String(service.duration)) || 0;
        }
      }
      // Ensure minimum 0.0167 hours (1 minute) if there's any time
      if (hours > 0 && hours < 0.0167) {
        hours = 0.0167;
      }
      const rate = service?.rate || 50;
      return sum + hours * rate;
    }, 0);

    const subTotal = partsTotal + labourTotal + (callOutFee || 0);
    let calculatedDiscountAmount = 0;
    if (discountType === "Percentage") {
      calculatedDiscountAmount = (subTotal * (discountAmount || 0)) / 100;
    } else {
      calculatedDiscountAmount = discountAmount || 0;
    }

    const afterDiscount = subTotal - calculatedDiscountAmount;
    const taxAmount = isVATEXEMPT ? 0 : afterDiscount * (defaultTaxRate / 100);
    const netTotal = afterDiscount + taxAmount;

    const currentPartsTotal = form.getValues("partsTotal");
    const currentLabourTotal = form.getValues("labourTotal");
    const currentSubTotal = form.getValues("subTotal");
    const currentTaxAmount = form.getValues("taxAmount");
    const currentNetTotal = form.getValues("netTotal");

    if (
      Math.abs(currentPartsTotal - partsTotal) < 0.01 &&
      Math.abs(currentLabourTotal - labourTotal) < 0.01 &&
      Math.abs(currentSubTotal - subTotal) < 0.01 &&
      Math.abs(currentTaxAmount - taxAmount) < 0.01 &&
      Math.abs(currentNetTotal - netTotal) < 0.01
    ) {
      return;
    }
    isUpdating.current = true;
    updateTimeoutRef.current = setTimeout(() => {
      form.setValue("partsTotal", partsTotal, {
        shouldDirty: false,
        shouldValidate: false,
      });
      form.setValue("labourTotal", labourTotal, {
        shouldDirty: false,
        shouldValidate: false,
      });
      form.setValue("subTotal", subTotal, {
        shouldDirty: false,
        shouldValidate: false,
      });

      form.setValue("taxAmount", taxAmount, {
        shouldDirty: false,
        shouldValidate: false,
      });
      form.setValue("netTotal", netTotal, {
        shouldDirty: false,
        shouldValidate: false,
      });
      setTimeout(() => {
        isUpdating.current = false;
      }, 50);
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [
    services,
    parts,
    callOutFee,
    discountType,
    discountAmount,
    isVATEXEMPT,
    defaultTaxRate,
    form,
  ]);

  useEffect(() => {
    const loadDefaultTax = async () => {
      const taxRate = await fetchDefaultTax();
      setDefaultTaxRate(taxRate);
    };
    loadDefaultTax();
  }, []);

  const fetchJobs = useCallback(async () => {
    setIsFetchingJobs(true);
    try {
      const response = await getAlls<any>(
        "/technician-job-by-admin?filter=all",
      );
      const data = response?.data || [];
      setJobs(
        Array.isArray(data) ? data.filter((j) => j.isActive !== false) : [],
      );
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error("Failed to fetch jobs");
    } finally {
      setIsFetchingJobs(false);
    }
  }, []);

  const fetchPartsInventory = useCallback(async () => {
    setIsFetchingParts(true);
    try {
      const response = await getAlls<any>("/mobility-parts?filter=all");
      const data = response?.data || [];
      setPartsInventory(
        Array.isArray(data) ? data.filter((p) => p.isActive !== false) : [],
      );
    } catch (err) {
      console.error("Error fetching parts:", err);
      toast.error("Failed to fetch parts");
    } finally {
      setIsFetchingParts(false);
    }
  }, []);

  const fetchServiceTypes = useCallback(async () => {
    setIsFetchingServices(true);
    try {
      const response = await getAlls<any>(
        "/technician-service-types?filter=all",
      );
      const data = response?.data || [];
      setServiceTypes(
        Array.isArray(data) ? data.filter((s) => s.isActive !== false) : [],
      );
    } catch (err) {
      console.error("Error fetching service types:", err);
      toast.error("Failed to fetch service types");
    } finally {
      setIsFetchingServices(false);
    }
  }, []);

  const fetchJobById = useCallback(
    async (jobId: string, shouldOverrideForm: boolean = true) => {
      setIsLoading(true);
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

        // Fetch job details
        const jobResponse = await axios.get(
          `${baseUrl}/technician-job-by-admin/${jobId}`,
          {
            headers: getAuthHeader(),
          },
        );

        const jobData = jobResponse.data?.data || jobResponse.data;
        setSelectedJob(jobData);

        // Fetch technician activities for this job
        const activitiesResponse = await axios.get(
          `${baseUrl}/technician-job-activities`,
          {
            headers: getAuthHeader(),
            params: {
              JobAssignedId: jobId,
              limit: "100",
            },
          },
        );

        const activitiesData = activitiesResponse.data?.data || [];

        if (jobData && shouldOverrideForm && !editingId) {
          if (jobData.ticketId?.customerId) {
            const customerId =
              typeof jobData.ticketId.customerId === "object"
                ? jobData.ticketId.customerId._id
                : jobData.ticketId.customerId;
            form.setValue("customerId", customerId);
          }

          // Convert activities to services
          if (activitiesData && activitiesData.length > 0) {
            console.log("Activities data:", activitiesData);

            const servicesFromActivities = activitiesData.map(
              (activity: any) => {
                // Convert totalTimeInSeconds to decimal hours for calculation
                const totalSeconds = activity.totalTimeInSeconds || 0;

                // Calculate hours and minutes for display
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                // For very small durations (< 1 minute), show as 00:01 to indicate time was spent
                const displayMinutes =
                  minutes === 0 && hours === 0 ? 1 : minutes;
                const displayHours = hours;

                // Format as HH:MM for display
                const displayDuration = `${displayHours.toString().padStart(2, "0")}:${displayMinutes.toString().padStart(2, "0")}`;

                // Calculate decimal hours for actual cost calculation
                const decimalHours = totalSeconds / 3600;

                // Ensure minimum 0.0167 hours (1 minute) if there's any time
                const billableHours =
                  decimalHours > 0 && decimalHours < 0.0167
                    ? 0.0167
                    : decimalHours;

                // Get rate from activityType or use default
                const rate = activity.activityType?.rate || 50;

                // Calculate line total
                const lineTotal = billableHours * rate;

                console.log("Activity time conversion:", {
                  totalSeconds,
                  displayDuration,
                  decimalHours,
                  billableHours,
                  rate,
                  lineTotal,
                  activityId: activity.activityType?._id,
                  serviceType: activity.activityType?.technicianServiceType,
                  notes: activity.additionalNotes,
                });

                return {
                  activityId: activity.activityType?._id || "",
                  duration: displayDuration, // This is for display in HH:MM format
                  description:
                    activity.additionalNotes ||
                    `Service activity - ${activity.activityType?.technicianServiceType || ""}`,
                  additionalNotes: activity.additionalNotes || "",
                  source: "JOB",
                  rate: rate,
                };
              },
            );

            console.log("Services from activities:", servicesFromActivities);
            form.setValue("services", servicesFromActivities);

            // Force recalculation of totals
            setTimeout(() => {
              form.trigger();
            }, 100);
          } else {
            console.log("No activities found for job");
            form.setValue("services", []);
          }

          // Set parts from quotationId.partsList
          if (
            jobData.quotationId?.partsList &&
            jobData.quotationId.partsList.length > 0
          ) {
            const partsFromJob: InvoicePartFormData[] =
              jobData.quotationId.partsList.map((part: any) => {
                const partId = part.partId || "";
                const partDetails = partsInventory.find(
                  (p) => p._id === partId,
                );

                return {
                  partId: partId,
                  oldPartConditionDescription:
                    part.oldPartConditionDescription || "",
                  newSerialNumber: part.newSerialNumber || "",
                  quantity: part.quantity || 1,
                  unitCost: part.unitCost || partDetails?.unitCost || 0,
                  totalCost:
                    part.total ||
                    (part.quantity || 1) *
                      (part.unitCost || partDetails?.unitCost || 0),
                  reasonForChange: part.reasonForChange || "",
                  source: "JOB",
                };
              });
            form.setValue("parts", partsFromJob);
          } else {
            form.setValue("parts", []);
          }

          // Set labour total from quotationId (as fallback)
          if (jobData.quotationId?.labourTotalBill) {
            form.setValue(
              "labourTotal",
              jobData.quotationId.labourTotalBill || 0,
            );
          }

          // Set parts total from quotationId
          if (jobData.quotationId?.partTotalBill) {
            form.setValue("partsTotal", jobData.quotationId.partTotalBill || 0);
          }

          // Set subTotal and other totals
          if (jobData.quotationId?.subTotalBill) {
            form.setValue("subTotal", jobData.quotationId.subTotalBill || 0);
          }
          if (jobData.quotationId?.taxAmount) {
            form.setValue("taxAmount", jobData.quotationId.taxAmount || 0);
          }
          if (jobData.quotationId?.netTotal) {
            form.setValue("netTotal", jobData.quotationId.netTotal || 0);
          }
        }

        return jobData;
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to fetch job details");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [form, partsInventory, editingId],
  );

  const handleJobSelect = async (jobId: string) => {
    if (!jobId) return;
    form.setValue("jobId", jobId);

    setIsLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

      // Fetch job details
      const jobResponse = await axios.get(
        `${baseUrl}/technician-job-by-admin/${jobId}`,
        {
          headers: getAuthHeader(),
        },
      );

      const jobData = jobResponse.data?.data || jobResponse.data;
      setSelectedJob(jobData);

      // Fetch technician activities for this job
      const activitiesResponse = await axios.get(
        `${baseUrl}/technician-job-activities`,
        {
          headers: getAuthHeader(),
          params: {
            JobAssignedId: jobId,
            limit: "100",
          },
        },
      );

      const activitiesData = activitiesResponse.data?.data || [];

      if (jobData && !editingId) {
        // Set customer ID from ticketId.customerId
        if (jobData.ticketId?.customerId) {
          const customerId =
            typeof jobData.ticketId.customerId === "object"
              ? jobData.ticketId.customerId._id
              : jobData.ticketId.customerId;
          form.setValue("customerId", customerId);
        }

        // Convert activities to services
        if (activitiesData && activitiesData.length > 0) {
          console.log("Activities data:", activitiesData);

          const servicesFromActivities = activitiesData.map((activity: any) => {
            // Convert totalTimeInSeconds to decimal hours for calculation
            const totalSeconds = activity.totalTimeInSeconds || 0;

            // Calculate hours and minutes for display
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);

            // For very small durations (< 1 minute), show as 00:01 to indicate time was spent
            const displayMinutes = minutes === 0 && hours === 0 ? 1 : minutes;
            const displayHours = hours;

            // Format as HH:MM for display
            const displayDuration = `${displayHours.toString().padStart(2, "0")}:${displayMinutes.toString().padStart(2, "0")}`;

            // Calculate decimal hours for actual cost calculation
            const decimalHours = totalSeconds / 3600;

            // Ensure minimum 0.0167 hours (1 minute) if there's any time
            const billableHours =
              decimalHours > 0 && decimalHours < 0.0167 ? 0.0167 : decimalHours;

            // Get rate from activityType or use default
            const rate = activity.activityType?.rate || 50;

            // Calculate line total
            const lineTotal = billableHours * rate;

            console.log("Activity time conversion:", {
              totalSeconds,
              displayDuration,
              decimalHours,
              billableHours,
              rate,
              lineTotal,
              activityId: activity.activityType?._id,
              serviceType: activity.activityType?.technicianServiceType,
              notes: activity.additionalNotes,
            });

            return {
              activityId: activity.activityType?._id || "",
              duration: displayDuration, // This is for display in HH:MM format
              description:
                activity.additionalNotes ||
                `Service activity - ${activity.activityType?.technicianServiceType || ""}`,
              additionalNotes: activity.additionalNotes || "",
              source: "JOB",
              rate: rate,
            };
          });

          console.log("Services from activities:", servicesFromActivities);
          form.setValue("services", servicesFromActivities);

          // Force recalculation of totals
          setTimeout(() => {
            form.trigger();
          }, 100);
        } else {
          console.log("No activities found for job");
          form.setValue("services", []);
        }

        // Set parts from quotationId.partsList
        if (
          jobData.quotationId?.partsList &&
          jobData.quotationId.partsList.length > 0
        ) {
          const partsFromJob: InvoicePartFormData[] =
            jobData.quotationId.partsList.map((part: any) => {
              const partId = part.partId || "";
              const partDetails = partsInventory.find((p) => p._id === partId);

              return {
                partId: partId,
                oldPartConditionDescription:
                  part.oldPartConditionDescription || "",
                newSerialNumber: part.newSerialNumber || "",
                quantity: part.quantity || 1,
                unitCost: part.unitCost || partDetails?.unitCost || 0,
                totalCost:
                  part.total ||
                  (part.quantity || 1) *
                    (part.unitCost || partDetails?.unitCost || 0),
                reasonForChange: part.reasonForChange || "",
                source: "JOB",
              };
            });
          form.setValue("parts", partsFromJob);
        } else {
          form.setValue("parts", []);
        }

        // Set labour total from quotationId if available (as fallback)
        if (jobData.quotationId?.labourTotalBill) {
          form.setValue(
            "labourTotal",
            jobData.quotationId.labourTotalBill || 0,
          );
        }

        // Set parts total from quotationId if available
        if (jobData.quotationId?.partTotalBill) {
          form.setValue("partsTotal", jobData.quotationId.partTotalBill || 0);
        }

        // Set subTotal and other totals if needed
        if (jobData.quotationId?.subTotalBill) {
          form.setValue("subTotal", jobData.quotationId.subTotalBill || 0);
        }
        if (jobData.quotationId?.taxAmount) {
          form.setValue("taxAmount", jobData.quotationId.taxAmount || 0);
        }
        if (jobData.quotationId?.netTotal) {
          form.setValue("netTotal", jobData.quotationId.netTotal || 0);
        }
      }

      return jobData;
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to fetch job details");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const setEditData = useCallback(
    (invoice: any) => {
      if (!invoice) return;

      const id = invoice._id || invoice.id;
      setEditingId(id);
      setInvoiceCode(invoice.invoiceId || "");

      const processedServices = Array.isArray(invoice.services)
        ? invoice.services.map((service: any) => ({
            activityId: service.activityId?._id || service.activityId || "",
            duration: String(service.duration || "1:00"),
            description: service.description || "",
            additionalNotes: service.additionalNotes || "",
            source: service.source || "INVOICE",
            rate: service.rate || 50,
          }))
        : [];

      const processedParts = Array.isArray(invoice.parts)
        ? invoice.parts.map((part: any) => {
            let partId = part.partId;
            let partDetails = null;

            if (typeof partId === "object" && partId !== null) {
              partDetails = partId;
              partId = partId._id;
            } else if (typeof partId === "string") {
              partDetails = partsInventory.find((p) => p._id === partId);
            }

            return {
              partId: partId || "",
              partName: partDetails?.partName || part.partName || "",
              partNumber: partDetails?.partNumber || part.partNumber || "",
              oldPartConditionDescription:
                part.oldPartConditionDescription || "",
              newSerialNumber: part.newSerialNumber || "",
              quantity: part.quantity || 1,
              unitCost: part.unitCost || partDetails?.unitCost || 0,
              totalCost:
                part.totalCost !== undefined
                  ? part.totalCost
                  : (part.quantity || 1) *
                    (part.unitCost || partDetails?.unitCost || 0),
              reasonForChange: part.reasonForChange || "",
              source: part.source || "INVOICE",
            };
          })
        : [];

      let formDiscountValue = 0;

      if (invoice.discountType === "Percentage" && invoice.subTotal > 0) {
        if (invoice.discountAmount > invoice.subTotal) {
          console.warn("⚠️ Invalid discount amount detected, using 0");
          formDiscountValue = 0;
        } else {
          const rawPercentage =
            (invoice.discountAmount / invoice.subTotal) * 100;
          formDiscountValue = Math.round(rawPercentage * 10) / 10;
        }
      } else {
        formDiscountValue = invoice.discountAmount || 0;
      }

      console.log("📋 Processing invoice data:", {
        callOutFee: invoice.callOutFee,
        discountType: invoice.discountType,
        originalDiscountAmount: invoice.discountAmount,
        calculatedPercentage: formDiscountValue,
        subTotal: invoice.subTotal,
      });

      form.reset({
        invoiceId: invoice.invoiceId || "",
        jobId: invoice.jobId?._id || invoice.jobId || "",
        customerId: invoice.customerId?._id || invoice.customerId || "",
        services: processedServices,
        parts: processedParts,
        completionSummary: invoice.completionSummary || "",
        invoiceDate: invoice.invoiceDate
          ? new Date(invoice.invoiceDate)
          : new Date(),
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate)
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        callOutFee: Number(invoice.callOutFee) || 0,
        discountType: invoice.discountType || "Percentage",
        discountAmount: formDiscountValue,
        isVATEXEMPT: invoice.isVATEXEMPT || false,
        partsTotal: invoice.partsTotal || 0,
        labourTotal: invoice.labourTotal || 0,
        subTotal: invoice.subTotal || 0,
        taxAmount: invoice.taxAmount || 0,
        netTotal: invoice.netTotal || 0,
        invoiceNotes: invoice.invoiceNotes || "",
        termsAndConditions: invoice.termsAndConditions || "",
        paymentLink: invoice.paymentLink || "",
        paymentMethod: invoice.paymentMethod || "PENDING",
        paymentStatus: invoice.paymentStatus || "PENDING",
        status: invoice.status || "DRAFT",
      });

      if (invoice.jobId?._id || invoice.jobId) {
        const jobId = invoice.jobId._id || invoice.jobId;
        form.setValue("jobId", jobId);
        fetchJobById(jobId, false).catch(console.error);
      }
    },
    [form, fetchJobById, partsInventory],
  );

  const clearEdit = () => {
    setEditingId(null);
    setSelectedJob(null);
    router.push("/dashboard/customer-invoice");
    form.reset();
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      console.log("🔵 onSubmit called with data:", data);
      console.log("🔵 editingId:", editingId);

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      if (!data.jobId?.trim()) {
        toast.error("Job is required");
        setIsSubmitting(false);
        return;
      }

      if (!data.customerId?.trim()) {
        toast.error("Customer is required");
        setIsSubmitting(false);
        return;
      }

      if (!data.dueDate || data.dueDate <= data.invoiceDate) {
        toast.error("Due date must be after invoice date");
        setIsSubmitting(false);
        return;
      }
      const invalidJobParts = (data.parts || []).filter(
        (part) => part.source === "JOB" && !part.partId?.trim(),
      );

      if (invalidJobParts.length > 0) {
        toast.error(
          `Please select a part from inventory for job parts. ${invalidJobParts.length} part(s) need to be selected.`,
        );
        setIsSubmitting(false);
        return;
      }

      const userId = localStorage.getItem("userId") || "";
      if (!userId) {
        toast.error("User ID not found. Please login again.");
        setIsSubmitting(false);
        return;
      }

      const partsTotal = (data.parts || []).reduce((sum, part) => {
        const totalCost =
          part.totalCost !== undefined
            ? part.totalCost
            : (part.quantity || 0) * (part.unitCost || 0);
        return sum + totalCost;
      }, 0);

      const labourTotal = (data.services || []).reduce((sum, service) => {
        let hours = 0;
        if (service?.duration) {
          if (
            typeof service.duration === "string" &&
            service.duration.includes(":")
          ) {
            const [h, m] = service.duration.split(":").map(Number);
            hours = (h || 0) + (m || 0) / 60;
          } else {
            hours = parseFloat(String(service.duration)) || 0;
          }
        }
        // Ensure minimum 0.0167 hours (1 minute) if there's any time
        if (hours > 0 && hours < 0.0167) {
          hours = 0.0167;
        }
        const rate = service?.rate || 50;
        return sum + hours * rate;
      }, 0);

      const subTotal = partsTotal + labourTotal + (data.callOutFee || 0);
      const roundedDiscountAmount =
        data.discountType === "Percentage"
          ? Math.round((data.discountAmount || 0) * 10) / 10
          : data.discountAmount || 0;

      const discountAmount =
        data.discountType === "Percentage"
          ? (subTotal * roundedDiscountAmount) / 100
          : data.discountAmount || 0;

      const afterDiscount = subTotal - discountAmount;
      const taxAmount = data.isVATEXEMPT
        ? 0
        : afterDiscount * (defaultTaxRate / 100);
      const netTotal = afterDiscount + taxAmount;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

      const cleanedParts = [];

      for (const part of data.parts || []) {
        let partId = part.partId;

        if (part.source === "INVOICE" && !partId) {
          const createPartRes = await axios.post(
            `${baseUrl}/mobility-parts`,
            {
              partName: part.partName,
              partNumber: part.partNumber,
              unitCost: part.unitCost,
              userId,
            },
            { headers: getAuthHeader() },
          );

          partId = createPartRes.data?.data?._id;
        }

        cleanedParts.push({
          partId,
          oldPartConditionDescription: part.oldPartConditionDescription || "",
          newSerialNumber: part.newSerialNumber || "",
          quantity: part.quantity || 0,
          unitCost: part.unitCost || 0,
          totalCost:
            part.totalCost !== undefined
              ? part.totalCost
              : (part.quantity || 0) * (part.unitCost || 0),
          reasonForChange: part.reasonForChange || "",
          source: part.source,
          userId,
        });
      }

      const payload: any = {
        jobId: data.jobId,
        customerId: data.customerId,
        services: (data.services || []).map((service) => ({
          activityId: service.activityId,
          duration: String(service.duration || "1:00"),
          description: service.description || "",
          additionalNotes: service.additionalNotes || "",
          source: service.source,
          userId,
        })),
        parts: cleanedParts,
        completionSummary: data.completionSummary || "",
        invoiceDate: new Date(data.invoiceDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
        callOutFee: data.callOutFee || 0,
        discountType: data.discountType,
        isVATEXEMPT: data.isVATEXEMPT,
        partsTotal,
        labourTotal,
        subTotal,
        discountAmount,
        taxAmount,
        netTotal,
        invoiceNotes: data.invoiceNotes || "",
        termsAndConditions: data.termsAndConditions || "",
        paymentLink: data.paymentLink || "",
        paymentMethod: data.paymentMethod || "PENDING",
        paymentStatus: data.paymentStatus,
        status: data.status,
        userId,
      };

      if (editingId) payload.invoiceId = data.invoiceId;

      console.log("📦 Cleaned Payload:", JSON.stringify(payload, null, 2));

      const apiEndpoint = editingId
        ? `${baseUrl}/customer-invoices/${editingId}`
        : `${baseUrl}/customer-invoices`;

      const res = await axios({
        method: editingId ? "put" : "post",
        url: apiEndpoint,
        data: payload,
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      });

      if (res.data?.success || res.data?.data) {
        clearEdit();
        toast.success(
          editingId
            ? "Invoice updated successfully!"
            : "Invoice created successfully!",
        );
        setSuccess(
          editingId
            ? "Invoice updated successfully!"
            : "Invoice created successfully!",
        );
        router.push("/dashboard/invoice-management");
        return res.data;
      } else {
        const errorMsg = res.data?.message || "Submission failed";
        toast.error(errorMsg);
        setError(errorMsg);
        return res.data;
      }
    } catch (err: any) {
      console.error("❌ Error submitting invoice:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Submission failed. Check console.";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addService = () => {
    appendService({
      activityId: "",
      duration: "1:00",
      rate: 50,
      description: "",
      additionalNotes: "",
      source: "INVOICE",
    });
  };

  const addPart = () => {
    appendPart({
      partId: "",
      oldPartConditionDescription: "",
      newSerialNumber: "",
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      reasonForChange: "",
      source: "INVOICE",
    });
  };

  useEffect(() => {
    fetchJobs();
    fetchPartsInventory();
    fetchServiceTypes();
  }, [fetchJobs, fetchPartsInventory, fetchServiceTypes]);

  return {
    form,
    isLoading,
    isSubmitting,
    isFetchingJobs,
    isFetchingParts,
    isFetchingServices,
    jobs,
    partsInventory,
    serviceTypes,
    selectedJob,
    defaultTaxRate,
    serviceFields,
    partFields,
    invoiceCode,

    error,
    success,
    editingId,

    fetchJobs,
    fetchPartsInventory,
    fetchServiceTypes,
    fetchJobById,
    handleJobSelect,
    addService,
    removeService,
    addPart,
    removePart,
    setEditData,
    clearEdit,
    onSubmit,
    setError,
    setSuccess,
  };
};
