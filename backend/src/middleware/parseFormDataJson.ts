// backend/src/middleware/parseNestedFormData.ts
import { Request, Response, NextFunction } from "express";

export const parseNestedFormData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("[parseNestedFormData] Starting...");
    console.log("[parseNestedFormData] Original body:", req.body);

    // Create a deep copy to avoid reference issues
    const parsedBody: any = {};

    // Process all body fields
    Object.keys(req.body).forEach((key) => {
      let value = req.body[key];

      // Handle string booleans
      if (value === "true" || value === "false") {
        value = value === "true";
      }

      // Check if key contains bracket notation (nested structure)
      if (key.includes("[") && key.includes("]")) {
        // Parse nested structure like "supplierIdentification[legalBusinessName]"
        const matches = key.match(/^([^[]+)\[([^]]+)\](.*)$/);
        if (matches) {
          const parentKey = matches[1];
          const childKey = matches[2];
          const rest = matches[3];

          if (!parsedBody[parentKey]) {
            parsedBody[parentKey] = {};
          }

          // Handle nested arrays
          if (rest && rest.includes("[")) {
            // More nesting, handle recursively
            const innerKey = childKey + rest;
            parsedBody[parentKey][childKey] = { [innerKey]: value };
          } else {
            parsedBody[parentKey][childKey] = value;
          }
        }
      } else {
        // Simple field
        parsedBody[key] = value;
      }
    });

    // Deep convert all string booleans to actual booleans
    const convertValues = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string") {
          if (obj[key].toLowerCase() === "true") {
            obj[key] = true;
          } else if (obj[key].toLowerCase() === "false") {
            obj[key] = false;
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          convertValues(obj[key]);
        }
      });
    };

    convertValues(parsedBody);

    // Update req.body
    req.body = parsedBody;

    console.log("[parseNestedFormData] Parsed body:");
    console.log(JSON.stringify(parsedBody, null, 2));

    // Check boolean fields specifically
    console.log("[parseNestedFormData] Checking boolean fields:");
    console.log(
      "isDeleted type:",
      typeof req.body.isDeleted,
      "value:",
      req.body.isDeleted,
    );
    if (req.body.financialInformation) {
      console.log(
        "vatRegistered type:",
        typeof req.body.financialInformation.vatRegistered,
        "value:",
        req.body.financialInformation.vatRegistered,
      );
    }
    if (req.body.complianceDocumentation) {
      console.log(
        "healthAndSafetyCompliance type:",
        typeof req.body.complianceDocumentation.healthAndSafetyCompliance,
        "value:",
        req.body.complianceDocumentation.healthAndSafetyCompliance,
      );
    }

    next();
  } catch (error) {
    console.error("[parseNestedFormData] Error:", error);
    next(error);
  }
};
