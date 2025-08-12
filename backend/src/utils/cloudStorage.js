import { initializeApp } from "firebase/app";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: process.env.firebase_apiKey,
  authDomain: process.env.firebase_authDomain,
  projectId: process.env.firebase_projectId,
  storageBucket: process.env.firebase_storageBucket,
  messagingSenderId: process.env.firebase_messagingSenderId,
  appId: process.env.firebase_appId,
  measurementId: process.env.firebase_measurementId
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Helper function to delete temp file
const deleteTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Temp file deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting temp file: ${filePath}`, error);
  }
};

// Upload image to Firebase Storage (handles both disk and memory storage)
const uploadImageToFirebase = async (file, folder = "images") => {
  let tempFilePath = null;
  
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Generate unique filename
    const fileName = `${uuidv4()}_${file.originalname}`;
    const firebasePath = `${folder}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, firebasePath);
    
    let fileBuffer;
    
    // Check if file is stored on disk (has 'path' property) or in memory (has 'buffer')
    if (file.path) {
      // File is stored on disk (multer disk storage)
      tempFilePath = file.path;
      fileBuffer = fs.readFileSync(file.path);
    } else if (file.buffer) {
      // File is in memory (multer memory storage)
      fileBuffer = file.buffer;
    } else {
      throw new Error("Invalid file object - no path or buffer found");
    }
    
    // Upload file to Firebase
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: file.mimetype,
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Delete temp file if it exists
    if (tempFilePath) {
      deleteTempFile(tempFilePath);
    }
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      path: firebasePath,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    // Clean up temp file in case of error
    if (tempFilePath) {
      deleteTempFile(tempFilePath);
    }
    
    console.error("Error uploading image to Firebase:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Delete image from Firebase Storage
const deleteImageFromFirebase = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("No file path provided");
    }

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    
    return {
      success: true,
      message: "Image deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting image from Firebase:", error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = "images") => {
  const tempFilePaths = [];
  
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    // Collect temp file paths for cleanup
    files.forEach(file => {
      if (file.path) {
        tempFilePaths.push(file.path);
      }
    });

    const uploadPromises = files.map(file => uploadImageToFirebase(file, folder));
    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      images: results,
      count: results.length
    };
  } catch (error) {
    // Clean up temp files in case of error
    tempFilePaths.forEach(filePath => deleteTempFile(filePath));
    
    console.error("Error uploading multiple images:", error);
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

// Clean up old temp files (utility function)
const cleanupOldTempFiles = () => {
  const tempDir = path.join(process.cwd(), 'public', 'temp');
  
  try {
    if (!fs.existsSync(tempDir)) return;
    
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      // Delete files older than 1 hour
      if (stats.mtime.getTime() < oneHourAgo) {
        deleteTempFile(filePath);
      }
    });
  } catch (error) {
    console.error("Error cleaning up temp files:", error);
  }
};

export { 
  storage,
  uploadImageToFirebase, 
  deleteImageFromFirebase, 
  uploadMultipleImages,
  cleanupOldTempFiles
};