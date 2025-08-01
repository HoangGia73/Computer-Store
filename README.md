# Computer Store - Hệ thống Quản lý Cửa hàng Máy tính

Hệ thống quản lý cửa hàng máy tính toàn diện với chức năng build PC tùy chỉnh, được xây dựng bằng Node.js và React.

## 🎯 Tổng quan

Computer Store là một ứng dụng web fullstack cho phép người dùng:

-   Duyệt và mua sắm linh kiện máy tính
-   Build PC tùy chỉnh với các linh kiện có sẵn
-   Quản lý đơn hàng và thanh toán
-   Đánh giá và theo dõi sản phẩm
-   Tư vấn PC qua chatbot AI

## ⚡ Tính năng

### Dành cho Khách hàng

-   **🔐 Xác thực người dùng**: Đăng ký, đăng nhập, quên mật khẩu với OTP
-   **🛍️ Mua sắm**: Duyệt sản phẩm theo danh mục, tìm kiếm, lọc theo giá
-   **🛒 Giỏ hàng**: Thêm/xóa sản phẩm, cập nhật số lượng real-time
-   **💰 Thanh toán**: COD, MOMO, VNPAY
-   **🔧 Build PC**: Xây dựng cấu hình PC tùy chỉnh với kiểm tra tương thích
-   **📱 Responsive**: Tối ưu cho mọi thiết bị
-   **⭐ Đánh giá**: Đánh giá và review sản phẩm
-   **📞 Liên hệ**: Form tư vấn PC và chatbot hỗ trợ

### Dành cho Admin

-   **📊 Dashboard**: Thống kê doanh thu, đơn hàng, sản phẩm bán chạy
-   **🏷️ Quản lý danh mục**: CRUD danh mục sản phẩm
-   **📦 Quản lý sản phẩm**: CRUD sản phẩm với upload nhiều ảnh
-   **📋 Quản lý đơn hàng**: Theo dõi và cập nhật trạng thái đơn hàng
-   **👥 Quản lý người dùng**: Phân quyền admin/user
-   **📝 Quản lý blog**: CRUD bài viết
-   **📞 Quản lý liên hệ**: Xem yêu cầu tư vấn từ khách hàng

## 🛠️ Công nghệ sử dụng

### Backend

-   **Node.js** + **Express.js** - Server framework
-   **Sequelize** - ORM cho MySQL
-   **MySQL** - Cơ sở dữ liệu
-   **JWT** - Xác thực người dùng
-   **Nodemailer** - Gửi email OTP
-   **Multer** - Upload file/ảnh
-   **Google Gemini AI** - Chatbot tư vấn

### Frontend

-   **React.js** - UI Library
-   **Ant Design** - Component library
-   **React Router** - Routing
-   **Axios** - HTTP client
-   **SCSS** - Styling
-   **React Slick** - Carousel
-   **Dayjs** - Date manipulation

### Thanh toán

-   **MOMO API** - Thanh toán điện tử
-   **VNPAY API** - Cổng thanh toán

## 🚀 Cài đặt

### Yêu cầu hệ thống

-   Node.js >= 16.0.0
-   MySQL >= 8.0
-   npm hoặc yarn

### 1. Clone repository

````bash
git clone https://github.com/HoangGia73/Computer-Store.git
cd Computer-Store

### 5. Chạy ứng dụng

**Backend (Terminal 1):**

```bash
cd server
npm run dev
````

**Frontend (Terminal 2):**

```bash
cd client
npm run dev
```

Ứng dụng sẽ chạy tại:

-   Frontend: http://localhost:5173

## 📁 Cấu trúc thư mục

```
Computer-Store/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── Components/         # Shared components
│   │   │   ├── CardBody/       # Product card
│   │   │   ├── Header/         # Navigation
│   │   │   └── Footer/         # Footer
│   │   ├── Pages/             # Page components
│   │   │   ├── Admin/         # Admin dashboard
│   │   │   ├── Cart/          # Shopping cart
│   │   │   ├── Contact/       # Contact form
│   │   │   ├── DetailProduct/ # Product details
│   │   │   ├── BuildPc/       # PC Builder
│   │   │   └── Home/          # Homepage
│   │   ├── config/            # API configurations
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # State management
│   │   └── utils/             # Utility functions
│   └── package.json
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── products.controller.js
│   │   │   └── payments.controller.js
│   │   ├── models/            # Sequelize models
│   │   │   ├── user.model.js
│   │   │   ├── products.model.js
│   │   │   ├── cart.model.js
│   │   │   └── orders.model.js
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── core/              # Core modules
│   │   └── uploads/           # File uploads
│   └── package.json
└── README.md
```

## 🔗 API Documentation

### Authentication

```http
POST /api/auth/register          # Đăng ký tài khoản
POST /api/auth/login            # Đăng nhập
POST /api/auth/forgot-password  # Quên mật khẩu
POST /api/auth/verify-otp       # Xác thực OTP
POST /api/auth/logout           # Đăng xuất
```

### Products

```http
GET    /api/products                    # Lấy danh sách sản phẩm
GET    /api/products/:id               # Lấy chi tiết sản phẩm
GET    /api/products/category/:categoryId  # Lấy sản phẩm theo danh mục
POST   /api/products                   # Tạo sản phẩm (Admin)
PUT    /api/products/:id              # Cập nhật sản phẩm (Admin)
DELETE /api/products/:id              # Xóa sản phẩm (Admin)
```

### Cart & Orders

```http
GET    /api/cart                       # Lấy giỏ hàng
POST   /api/cart                       # Thêm vào giỏ hàng
PUT    /api/cart/quantity              # Cập nhật số lượng
DELETE /api/cart                       # Xóa khỏi giỏ hàng
POST   /api/cart/update-info           # Cập nhật thông tin giao hàng
```

### Build PC

```http
GET    /api/cart/build-pc              # Lấy cấu hình PC
POST   /api/products/build-pc          # Thêm linh kiện vào build PC
PUT    /api/products/build-pc          # Cập nhật số lượng linh kiện
DELETE /api/products/build-pc          # Xóa linh kiện
POST   /api/cart/add-build-pc          # Chuyển build PC vào giỏ hàng
```

### Payments

```http
POST   /api/payments/momo              # Thanh toán MOMO
POST   /api/payments/vnpay             # Thanh toán VNPAY
POST   /api/payments/cod               # Thanh toán COD
```

## 🔧 Tính năng

### 1. PC Builder

-   Chọn linh kiện theo từng danh mục (CPU, RAM, GPU, v.v.)
-   Kiểm tra tương thích giữa các linh kiện
-   Tính toán tổng công suất và giá thành
-   In báo giá PDF

### 2. Giỏ hàng thông minh

-   Cập nhật số lượng và giá tiền real-time
-   Tự động tính discount
-   Kiểm tra tồn kho trước khi thêm

### 3. Thanh toán đa dạng

-   COD (Thanh toán khi nhận hàng)
-   MOMO (Ví điện tử)
-   VNPAY (Thẻ ATM/Credit)

### 4. Chatbot AI

-   Tư vấn cấu hình PC phù hợp
-   Hỗ trợ khách hàng 24/7
-   Tích hợp Google Gemini AI

🚀 **Happy Coding!**
