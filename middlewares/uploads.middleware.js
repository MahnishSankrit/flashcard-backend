import multer from "multer";
import path from "path";

const uploadPath = path.join(process.cwd(), "uploads");



const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath), // folder location
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname);

        cb(null, uniqueSuffix + ext);
    }
})

// using  file filter only for the pdf 
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true)
    } else {
        cb(new Error("Only PDF files are allowed"), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15mb limit
    },
    // fields: [
    //     { name: "file", maxCount: 1 }
    // ]
})

export default upload

