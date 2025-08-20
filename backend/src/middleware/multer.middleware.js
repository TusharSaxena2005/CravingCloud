import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), 'public', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Memory storage for small files (< 2MB)
const memoryStorage = multer.memoryStorage();

// Disk storage for larger files (>= 2MB)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // Store in public/temp
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// Smart storage selection based on file size
const smartStorage = multer({
  storage: multer.memoryStorage(), // Default to memory
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  }
});

// For larger files that need disk storage
const diskUpload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for disk storage
    files: 10
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed!"), false);
  }
};

// Standard upload (memory storage for most cases)
const upload = smartStorage;

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Middleware for multiple image uploads
const uploadMultipleImages = upload.array('images', 10);

// For large files (use disk storage)
const uploadLargeImage = diskUpload.single('image');

// Middleware for multiple fields with images
const uploadImageFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'menuImages', maxCount: 5 },
  { name: 'restaurantImages', maxCount: 10 }
]);

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, "File size too large. Maximum size is 5MB"));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, "Too many files. Maximum 10 files allowed"));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(400, "Unexpected field name"));
    }
  }
  next(error);
};

export {
  uploadSingleImage,
  uploadMultipleImages,
  uploadLargeImage,
  uploadImageFields,
  handleMulterError
}
