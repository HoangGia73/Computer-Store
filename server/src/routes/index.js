const userRoutes = require('./users.routes');
const productRoutes = require('./products.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const paymentsRoutes = require('./payments.routes');
const productPreviewRoutes = require('./productPreview.routes');
const blogsRoutes = require('./blogs.routes');
const contactRoutes = require('./contact.routes');
const multer = require('multer');
const path = require('path');
const SERVER_URL = process.env.SERVER_URL || 'http://13.251.105.137';
// --- Cấu hình multer upload ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

function routes(app) {
    // Mount routers once; each router already includes '/api/...' in its paths
    app.use(userRoutes);
    app.use(productRoutes);
    app.use(categoryRoutes);
    app.use(cartRoutes);
    app.use(paymentsRoutes);
    app.use(productPreviewRoutes);
    app.use(blogsRoutes);
    app.use(contactRoutes);

    // --- Upload 1 ảnh ---
    app.post('/api/upload', upload.single('image'), (req, res) => {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            message: 'Uploaded successfully',
            image: `${SERVER_URL}/uploads/images/${file.filename}`,
        });
    });

    // --- Upload nhiều ảnh ---
    app.post('/api/uploads', upload.array('images'), (req, res) => {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const images = files.map((file) => `${SERVER_URL}/uploads/images/${file.filename}`);

        res.json({
            message: 'Uploaded successfully',
            images,
        });
    });
}

module.exports = routes;
