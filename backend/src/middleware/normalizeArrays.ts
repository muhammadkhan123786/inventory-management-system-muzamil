import { NextFunction, Request, Response } from "express";

export const normalizeArrays = (arrayFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const field of arrayFields) {
      const fieldParts = field.split(".");

      let value: any;
      if (fieldParts.length > 1) {
        value = req.body;
        for (const part of fieldParts) {
          value = value?.[part];
        }
      } else {
        value = req.body[field];
      }

      if (!value) continue;

      if (Array.isArray(value)) continue;

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          value = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          value = [value];
        }
      } else {
        value = [value];
      }

      if (fieldParts.length > 1) {
        const parentField = fieldParts[0];
        const childField = fieldParts[1];
        if (!req.body[parentField]) {
          req.body[parentField] = {};
        }
        req.body[parentField][childField] = value;
      } else {
        req.body[field] = value;
      }
    }
    next();
  };
};
