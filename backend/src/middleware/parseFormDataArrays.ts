// middleware/parseFormDataArrays.js
export const parseFormDataArrays = (req, res, next) => {
  // Parse stringified arrays/objects from FormData
  const parseField = (field) => {
    if (!field || typeof field !== "string") return field;
    try {
      return JSON.parse(field);
    } catch (err) {
      // If it's not valid JSON, return the original value
      return field;
    }
  };

  if (req.body.services && typeof req.body.services === "string") {
    req.body.services = parseField(req.body.services);
  }

  if (req.body.parts && typeof req.body.parts === "string") {
    req.body.parts = parseField(req.body.parts);
  }

  if (req.body.inspections && typeof req.body.inspections === "string") {
    req.body.inspections = parseField(req.body.inspections);
  }

  if (req.body.jobNotes && typeof req.body.jobNotes === "string") {
    req.body.jobNotes = parseField(req.body.jobNotes);
  }

  next();
};
