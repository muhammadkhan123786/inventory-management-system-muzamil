import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import { NextFunction, Request, Response } from "express";

export const vehicleVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file) => {
    return {
      folder: "vehicle_repair_videos", // folder in Cloudinary
      resource_type: "video", // very important for videos
      format: "mp4", // optional, can convert to mp4
      public_id: `vehicle_${Date.now()}`, // optional custom ID
    };
  },
});

export const uploadVehicleVideo = multer({
  storage: vehicleVideoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const handleVehicleVideoUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploader = uploadVehicleVideo.single(fieldName);

    uploader(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.error("[VIDEO UPLOAD] MulterError:", err.message);
        return res.status(400).json({ message: err.message });
      } else if (err) {
        console.error("[VIDEO UPLOAD] Error:", err);
        // Don't fail the request if video upload fails - it's optional
        console.log(
          "[VIDEO UPLOAD] Video upload optional, continuing without video"
        );
        return next();
      }

      // If file exists, add URL to req.body
      if (req.file) {
        console.log(
          "[VIDEO UPLOAD] Video uploaded successfully:",
          (req.file as any).path
        );
        (req.body as any).vehicleRepairVideoURL = (req.file as any).path;
      } else {
        console.log("[VIDEO UPLOAD] No video file provided");
      }

      next();
    });
  };
};
