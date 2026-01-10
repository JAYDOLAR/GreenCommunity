import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME = ['application/pdf','image/png','image/jpeg','image/jpg'];

function fileFilter(req, file, cb){
  if(ALLOWED_MIME.includes(file.mimetype)) return cb(null,true);
  cb(new Error('Unsupported file type'));
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});
