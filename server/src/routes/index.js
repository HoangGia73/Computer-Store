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
    // --- User ---
    app.post('/api/register', userRoutes);
    app.post('/api/login', userRoutes);
    app.get('/api/auth', userRoutes);
    app.get('/api/refresh-token', userRoutes);
    app.get('/api/logout', userRoutes);
    app.post('/api/update-info-user', userRoutes);
    app.get('/api/dashboard', userRoutes);
    app.get('/api/get-users', userRoutes);
    app.post('/api/login-google', userRoutes);
    app.get('/api/admin', userRoutes);
    app.get('/api/get-order-stats', userRoutes);
    app.post('/api/forgot-password', userRoutes);
    app.post('/api/reset-password', userRoutes);
    app.post('/api/update-role-user', userRoutes);
    app.get('/api/users/pie-chart', userRoutes);
    app.delete('/api/delete-user/:id', userRoutes);

    // --- Product ---
    app.post('/api/create-product', productRoutes);
    app.get('/api/get-products', productRoutes);
    app.post('/api/update-product', productRoutes);
    app.delete('/api/delete-product', productRoutes);
    app.get('/api/get-products-by-categories', productRoutes);
    app.get('/api/get-product-by-id', productRoutes);
    app.get('/api/get-product-by-component-type', productRoutes);
    app.post('/api/build-pc-cart', productRoutes);
    app.get('/api/get-cart-build-pc', productRoutes);
    app.post('/api/update-quantity-cart-build-pc', productRoutes);
    app.post('/api/delete-cart-build-pc', productRoutes);
    app.post('/api/create-product-watch', productRoutes);
    app.get('/api/get-product-watch', productRoutes);
    app.get('/api/get-product-by-id-category', productRoutes);
    app.get('/api/get-product-hot-sale', productRoutes);
    app.get('/api/get-product-search', productRoutes);
    app.get('/api/get-product-search-by-category', productRoutes);

    // --- Category ---
    app.post('/api/create-category', categoryRoutes);
    app.get('/api/get-all-category', categoryRoutes);
    app.delete('/api/delete-category', categoryRoutes);
    app.post('/api/update-category', categoryRoutes);
    app.get('/api/get-category-by-component-types', categoryRoutes);
    app.get('/api/get-all-products', categoryRoutes);

    // --- Cart ---
    app.post('/api/add-to-cart', cartRoutes);
    app.get('/api/get-cart', cartRoutes);
    app.post('/api/delete-cart', cartRoutes);
    app.post('/api/update-info-cart', cartRoutes);
    app.post('/api/add-to-cart-build-pc', cartRoutes);
    app.post('/api/update-quantity', cartRoutes);
    app.get('/api/get-cart-build-pc', cartRoutes);
    app.post('/api/delete-all-cart-build-pc', cartRoutes);

    // --- Payments ---
    app.post('/api/payments', paymentsRoutes);
    app.get('/api/check-payment-paypal', paymentsRoutes);
    app.get('/api/check-payment-vnpay', paymentsRoutes);
    app.post('/api/cancel-order', paymentsRoutes);
    app.get('/api/get-payment', paymentsRoutes);
    app.get('/api/get-payments', paymentsRoutes);
    app.get('/api/get-order-admin', paymentsRoutes);
    app.post('/api/update-order-status', paymentsRoutes);

    // --- Product preview ---
    app.post('/api/create-product-preview', productPreviewRoutes);
    app.get('/api/get-product-preview-user', productPreviewRoutes);

    // --- Blogs ---
    app.post('/api/create-blog', blogsRoutes);
    app.get('/api/get-blogs', blogsRoutes);
    app.delete('/api/delete-blog', blogsRoutes);
    app.get('/api/get-blog-by-id', blogsRoutes);

    // --- Contact ---
    app.post('/api/create-contact', contactRoutes);
    app.get('/api/get-contacts', contactRoutes);

    // --- Upload 1 ảnh ---
    app.post('/api/upload', upload.single('image'), (req, res) => {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const host = req.get('host');
        const protocol = req.protocol;

        res.json({
            message: 'Uploaded successfully',
            image: `${protocol}://${host}/uploads/images/${file.filename}`,
        });
    });

    // --- Upload nhiều ảnh ---
    app.post('/api/uploads', upload.array('images'), (req, res) => {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const host = req.get('host');
        const protocol = req.protocol;

        const images = files.map((file) => `${protocol}://${host}/uploads/images/${file.filename}`);

        res.json({
            message: 'Uploaded successfully',
            images,
        });
    });
}

module.exports = routes;
