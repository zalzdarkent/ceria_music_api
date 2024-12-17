const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExistence = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true }); 
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const featureFolder = req.featureFolder || 'general'; 
        const folder = path.join('uploads', featureFolder);
        ensureDirectoryExistence(folder); 
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (jpeg, jpg, png) yang diperbolehkan'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = (featureFolder) => (req, res, next) => {
    req.featureFolder = featureFolder; 
    upload.single('photo')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: `Error Multer: ${err.message}`
            });
        } else if (err) {
            // Handle error lainnya
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        if (req.file) {
            req.file.path = req.file.path.replace(/\\/g, '/'); 
        }
        // console.log('File uploaded:', req.file); 
        // console.log('File path:', req.file.path);
        next();
    });
};
