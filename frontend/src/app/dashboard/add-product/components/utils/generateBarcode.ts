import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890", 12);

export const generateBarcode = () => {
  return nanoid();
};