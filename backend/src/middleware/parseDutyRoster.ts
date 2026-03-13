import { Request, Response, NextFunction } from "express";

export const parseDutyRosterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // dutyRoster may come as JSON string
    if (req.body.dutyRoster && typeof req.body.dutyRoster === "string") {
      req.body.dutyRoster = JSON.parse(req.body.dutyRoster);
    }

    // additionalInformation may come as object fields in FormData
    if (
      req.body.additionalInformation &&
      typeof req.body.additionalInformation === "string"
    ) {
      req.body.additionalInformation = JSON.parse(
        req.body.additionalInformation,
      );
    } else {
      // Build additionalInformation from flat FormData fields
      const infoFields = [
        "emergencyContactName",
        "emergencyContactNumber",
        "healthInsuranceDetails",
        "additionalNotes",
      ];
      req.body.additionalInformation = req.body.additionalInformation || {};
      infoFields.forEach((field) => {
        const key = `additionalInformation[${field}]`;
        if (req.body[key]) {
          req.body.additionalInformation[field] = req.body[key];
          delete req.body[key]; // remove flat field
        }
      });
    }

    next();
  } catch (err) {
    console.error("Failed to parse dutyRoster/additionalInformation:", err);
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON format" });
  }
};
