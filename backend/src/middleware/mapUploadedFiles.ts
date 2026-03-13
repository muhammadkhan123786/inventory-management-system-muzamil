import { Request, Response, NextFunction } from "express";

export const mapUploadedFilesToBody = (
  basePath = "/uploads",
  aliases: Record<string, string> = {},
  singleFields: string[] = [],
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.files) return next();

    const filesArray = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();

    const filesByField: Record<string, string[]> = {};

    filesArray.forEach((file) => {
      const targetField = aliases[file.fieldname] ?? file.fieldname;

      if (!filesByField[targetField]) {
        filesByField[targetField] = [];
      }

      filesByField[targetField].push(`${basePath}/${file.filename}`);
    });

    Object.entries(filesByField).forEach(([field, paths]) => {
      const isSingle = singleFields.includes(field);

      // Handle nested fields like "complianceDocumentation.businessRegistrationCertificates"
      const fieldParts = field.split(".");

      if (fieldParts.length > 1) {
        // Nested field case
        const parentField = fieldParts[0];
        const childField = fieldParts[1];

        // Ensure parent object exists
        if (!req.body[parentField]) {
          req.body[parentField] = {};
        }

        let existing: any = req.body[parentField][childField];

        if (existing) {
          if (!isSingle) {
            if (typeof existing === "string") {
              try {
                const parsed = JSON.parse(existing);
                existing = Array.isArray(parsed) ? parsed : [existing];
              } catch {
                existing = [existing];
              }
            } else if (!Array.isArray(existing)) {
              existing = [existing];
            }
            req.body[parentField][childField] = [...existing, ...paths];
          } else {
            req.body[parentField][childField] = paths[0] || existing;
          }
        } else {
          req.body[parentField][childField] = isSingle ? paths[0] : paths;
        }
      } else {
        // Root level field case
        let existing: any = req.body[field];

        if (existing) {
          if (!isSingle) {
            if (typeof existing === "string") {
              try {
                const parsed = JSON.parse(existing);
                existing = Array.isArray(parsed) ? parsed : [existing];
              } catch {
                existing = [existing];
              }
            } else if (!Array.isArray(existing)) {
              existing = [existing];
            }
            req.body[field] = [...existing, ...paths];
          } else {
            req.body[field] = paths[0] || existing;
          }
        } else {
          req.body[field] = isSingle ? paths[0] : paths;
        }
      }
    });

    next();
  };
};
