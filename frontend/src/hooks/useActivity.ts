// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   activityRecordSchema,
//   ActivityRecordFormData,
// } from "../schema/activityRecordSchema";
// import { getAlls } from "../helper/apiHelper";
// import axios from "axios";
// import { useSearchParams, useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// const getAuthHeader = () => {
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   if (!token) return {};
//   const cleanToken = token.replace(/^"|"$/g, "").trim();
//   return { Authorization: `Bearer ${cleanToken}` };
// };

// const generateJobId = async (): Promise<string> => {
//   try {
//     const baseUrl =
//       process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
//     const token =
//       typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     const cleanToken = token ? token.replace(/^"|"$/g, "").trim() : "";

//     const response = await axios.get(
//       `${baseUrl}/auto-generate-codes/techcian-job-code`,
//       {
//         headers: {
//           Authorization: `Bearer ${cleanToken}`,
//         },
//       },
//     );

//     return response.data.technicianJobCode || `JOB-ERROR-000`;
//   } catch (error) {
//     console.error("Failed to generate job ID from API:", error);
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, "0");
//     const day = date.getDate().toString().padStart(2, "0");
//     const random = Math.random().toString(36).substring(2, 8).toUpperCase();
//     return `JOB-${year}${month}${day}-${random}`;
//   }
// };

// export const useActivityRecordForm = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const editId = searchParams.get("edit");

//   const [isLoading, setIsLoading] = useState(false);
//   const [technicians, setTechnicians] = useState<any[]>([]);
//   const [quotations, setQuotations] = useState<any[]>([]);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [jobId, setJobId] = useState<string>("");
//   const [isGeneratingJobId, setIsGeneratingJobId] = useState(false);

//   const form = useForm<ActivityRecordFormData>({
//     resolver: zodResolver(activityRecordSchema) as any,
//     defaultValues: {
//       jobId: "",
//       ticketId: "",
//       leadingTechnicianId: "",
//       quotationId: "",
//       jobStatusId: "PENDING",
//       adminNotes: "",
//     },
//   });

//   const selectedQuotationId = form.watch("quotationId");
//   useEffect(() => {
//     if (!selectedQuotationId) return;
//     const selectedQuotation = quotations.find(
//       (q) => q._id === selectedQuotationId,
//     );
//     if (selectedQuotation?.ticket?._id) {
//       form.setValue("ticketId", selectedQuotation.ticket._id);
//     }
//   }, [selectedQuotationId, quotations, form]);
//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const [techRes, qRes] = await Promise.all([
//           getAlls("/technicians?filter=all"),
//           getAlls("/technician-ticket-quotation?filter=all"),
//         ]);
//         console.log("Quotations Imran:", qRes);
//         setTechnicians(techRes?.data || []);
//         const approvedQuotations = (qRes?.data || []).filter(
//           (q: any) => q.quotationStatus?.toUpperCase() === "APPROVED",
//         );
//         setQuotations(approvedQuotations);

//         if (editId) {
//           const res: any = await getAlls(`/technician-job-by-admin/${editId}`);
//           const record = res?.data || res;

//           if (record && !Array.isArray(record)) {
//             setEditingId(editId);

//             form.reset({
//               jobId: record.jobId || "",
//               ticketId: record.ticketId?._id || record.ticketId || "",
//               leadingTechnicianId:
//                 record.leadingTechnicianId?._id ||
//                 record.leadingTechnicianId ||
//                 "",
//               quotationId: record.quotationId?._id || record.quotationId || "",
//               jobStatusId: record.jobStatusId || "PENDING",
//               adminNotes: record.adminNotes || "",
//             });

//             setJobId(record.jobId || "");
//           }
//         } else {
//           setIsGeneratingJobId(true);
//           const generatedJobId = await generateJobId();
//           setJobId(generatedJobId);
//           form.setValue("jobId", generatedJobId);
//           setIsGeneratingJobId(false);
//         }
//       } catch (err) {
//         console.error("Data fetch error", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [editId, form]);

//   const handleSubmit = async (data: ActivityRecordFormData) => {
//     try {
//       setIsLoading(true);

//       if (!data.leadingTechnicianId) {
//         toast.error("Please select a leading technician");
//         setIsLoading(false);
//         return;
//       }

//       if (!data.quotationId) {
//         toast.error("Please select a quotation");
//         setIsLoading(false);
//         return;
//       }

//       const userId =
//         localStorage.getItem("userId")?.replace(/^"|"$/g, "") || "";
//       if (!userId) {
//         toast.error("User not found");
//         return;
//       }

//       const baseUrl =
//         process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

//       const payload = {
//         ...data,
//         jobId: jobId,
//         userId,
//       };

//       const apiEndpoint = editingId
//         ? `${baseUrl}/technician-job-by-admin/${editingId}`
//         : `${baseUrl}/technician-job-by-admin`;

//       const res = await axios({
//         method: editingId ? "put" : "post",
//         url: apiEndpoint,
//         data: payload,
//         headers: {
//           ...getAuthHeader(),
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.data?.success !== false) {
//         toast.success(editingId ? "Job Updated!" : "Job Created!");
//         router.push("/dashboard/record-activity/jobs");
//       }
//     } catch (err: any) {
//       console.error("Submission error:", err.response?.data || err);
//       toast.error(err.response?.data?.message || "Submission failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return {
//     form,
//     isLoading,
//     technicians,
//     quotations,
//     handleSubmit,
//     editingId,
//     jobId,
//     isGeneratingJobId,
//   };
// };
