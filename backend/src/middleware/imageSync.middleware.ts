export const syncImageFilenames = (req: any, res: any, next: any) => {
    // 1. Check if Multer actually uploaded anything
    if (!req.files) return next();

    const files = req.files as Express.Multer.File[];

    // 2. Extract the ACTUAL filenames (the ones with the timestamps)
    const images = files
        .filter(f => f.fieldname === 'images')
        .map(f => f.filename); // This grabs "177064...png"

    const featuredImage = files.find(f => f.fieldname === 'featuredImage')?.filename;
    const thumbnail = files.find(f => f.fieldname === 'thumbnail')?.filename;

    // 3. CRITICAL: Overwrite the body so the Generic Controller saves these names
    if (images.length > 0) req.body.images = images;
    if (featuredImage) req.body.featuredImage = featuredImage;
    if (thumbnail) req.body.thumbnail = thumbnail;

    console.log("DEBUG: Data being sent to DB:", req.body);
    next();
};