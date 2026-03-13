import { CityModel } from "../models/city.models";
import { Country } from "../models/country.models";
import { NextFunction, Request, Response } from "express";

export const resolveBusinessAddressRefs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("[resolveBusinessAddressRefs] Starting...");
    console.log(
      "[resolveBusinessAddressRefs] req.body keys:",
      Object.keys(req.body),
    );

    // Handle FormData case where JSON is in req.body.data
    let bodyData = req.body;

    if (req.body.data && typeof req.body.data === "string") {
      try {
        console.log(
          "[resolveBusinessAddressRefs] Parsing JSON from 'data' field",
        );
        bodyData = JSON.parse(req.body.data);
        console.log(
          "[resolveBusinessAddressRefs] Parsed data keys:",
          Object.keys(bodyData),
        );
      } catch (parseError) {
        console.error(
          "[resolveBusinessAddressRefs] Error parsing 'data' field:",
          parseError,
        );
        return res.status(400).json({
          success: false,
          message: "Invalid JSON in 'data' field",
        });
      }
    }

    // Check if businessAddress exists
    if (!bodyData.businessAddress) {
      console.log(
        "[resolveBusinessAddressRefs] No businessAddress found, skipping...",
      );
      return next();
    }

    const { businessAddress } = bodyData;
    console.log(
      "[resolveBusinessAddressRefs] businessAddress:",
      businessAddress,
    );

    // Get userId from bodyData (not req.body directly)
    const userId = bodyData.userId;

    // Country
    if (typeof businessAddress.country === "string") {
      console.log(
        `[resolveBusinessAddressRefs] Looking up country: ${businessAddress.country}`,
      );
      let country = await Country.findOne({
        countryName: businessAddress.country,
      });

      if (!country) {
        console.log(
          `[resolveBusinessAddressRefs] Creating new country: ${businessAddress.country}`,
        );
        country = await Country.create({
          countryName: businessAddress.country,
          userId: userId,
        });
      }

      businessAddress.country = country._id;
      console.log(
        `[resolveBusinessAddressRefs] Country resolved to ID: ${businessAddress.country}`,
      );
    }

    // City
    if (typeof businessAddress.city === "string") {
      console.log(
        `[resolveBusinessAddressRefs] Looking up city: ${businessAddress.city}`,
      );
      let city = await CityModel.findOne({
        cityName: businessAddress.city,
      });

      if (!city) {
        console.log(
          `[resolveBusinessAddressRefs] Creating new city: ${businessAddress.city}`,
        );
        city = await CityModel.create({
          cityName: businessAddress.city,
          countryId: businessAddress.country, // This should now be the ObjectId from country lookup
          userId: userId,
        });
      }

      businessAddress.city = city._id;
      console.log(
        `[resolveBusinessAddressRefs] City resolved to ID: ${businessAddress.city}`,
      );
    }

    // Update the request body with resolved IDs
    // If we parsed from req.body.data, we need to update the parsed object
    // and convert it back to string for the controller
    if (req.body.data && typeof req.body.data === "string") {
      req.body.data = JSON.stringify(bodyData);
    } else {
      // If it was regular JSON, update req.body directly
      req.body.businessAddress = businessAddress;
    }

    console.log("[resolveBusinessAddressRefs] Completed successfully");
    next();
  } catch (error) {
    console.error("[resolveBusinessAddressRefs] Error:", error);
    next(error);
  }
};
