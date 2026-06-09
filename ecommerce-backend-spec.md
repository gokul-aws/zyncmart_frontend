# E-Commerce Backend — Production-Ready API Spec
> Stack: Node.js 20 · AWS Lambda · API Gateway · MongoDB Atlas · Cloudinary · Razorpay · Upstash Redis

---

## Project Overview

Build a fully serverless REST API backend for a multi-category e-commerce store selling **jewellery, toys, and home accessories**. Every Lambda function must be independently deployable, stateless, and production-ready with validation, error handling, and authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (ESM) |
| Deployment | AWS Lambda + API Gateway (REST) |
| Framework | Serverless Framework v3 |
| Database | MongoDB Atlas (Mongoose 8) |
| Image storage | Cloudinary |
| Cache / Sessions | Upstash Redis |
| Payments | Razorpay |
| Auth | JWT (access token 15m + refresh token 7d) |
| Validation | Zod |
| Email | Resend |
| Logging | Winston + AWS CloudWatch |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |

---

## Folder Structure

```
ecommerce-backend/
├── src/
│   ├── functions/              # One file per Lambda handler
│   │   ├── auth/
│   │   │   ├── register.js
│   │   │   ├── login.js
│   │   │   ├── refresh.js
│   │   │   ├── logout.js
│   │   │   └── forgotPassword.js
│   │   ├── users/
│   │   │   ├── getProfile.js
│   │   │   ├── updateProfile.js
│   │   │   └── getAddresses.js
│   │   ├── categories/
│   │   │   ├── createCategory.js
│   │   │   ├── updateCategory.js
│   │   │   ├── deleteCategory.js
│   │   │   └── listCategories.js
│   │   ├── products/
│   │   │   ├── createProduct.js
│   │   │   ├── updateProduct.js
│   │   │   ├── deleteProduct.js
│   │   │   ├── getProduct.js
│   │   │   ├── listProducts.js
│   │   │   └── uploadImages.js
│   │   ├── cart/
│   │   │   ├── getCart.js
│   │   │   ├── addToCart.js
│   │   │   ├── updateCartItem.js
│   │   │   └── removeFromCart.js
│   │   ├── orders/
│   │   │   ├── createOrder.js
│   │   │   ├── getOrder.js
│   │   │   ├── listOrders.js
│   │   │   ├── cancelOrder.js
│   │   │   └── updateOrderStatus.js
│   │   ├── payments/
│   │   │   ├── createPaymentOrder.js
│   │   │   ├── verifyPayment.js
│   │   │   └── webhook.js
│   │   ├── reviews/
│   │   │   ├── createReview.js
│   │   │   ├── listReviews.js
│   │   │   └── deleteReview.js
│   │   └── admin/
│   │       ├── getDashboardStats.js
│   │       └── listAllOrders.js
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── middleware/
│   │   ├── authenticate.js     # JWT verify middleware
│   │   ├── authorize.js        # Role check (admin / user)
│   │   └── errorHandler.js
│   ├── lib/
│   │   ├── db.js               # MongoDB connection with caching
│   │   ├── redis.js            # Upstash Redis client
│   │   ├── cloudinary.js       # Cloudinary config
│   │   ├── razorpay.js         # Razorpay instance
│   │   ├── resend.js           # Email client
│   │   └── response.js         # Standardised API response helpers
│   ├── utils/
│   │   ├── validators/         # Zod schemas per resource
│   │   ├── pagination.js
│   │   └── slugify.js
│   └── emails/                 # HTML email templates
│       ├── orderConfirmation.js
│       ├── orderShipped.js
│       └── passwordReset.js
├── tests/
│   ├── auth.test.js
│   ├── products.test.js
│   ├── cart.test.js
│   ├── orders.test.js
│   └── payments.test.js
├── serverless.yml              # Serverless Framework config
├── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml
└── package.json
```

---

## Environment Variables (.env.example)

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecommerce

# JWT
JWT_ACCESS_SECRET=your_access_secret_32chars
JWT_REFRESH_SECRET=your_refresh_secret_32chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Resend (email)
RESEND_API_KEY=re_xxxx
EMAIL_FROM=orders@yourdomain.com

# App
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

---

## MongoDB Schemas

### User
```js
{
  name: String (required),
  email: String (required, unique, lowercase),
  phone: String,
  passwordHash: String (required),
  role: enum ['user', 'admin'] default 'user',
  isVerified: Boolean default false,
  refreshToken: String,
  addresses: [{
    label: String,           // 'home', 'work'
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  createdAt, updatedAt       // timestamps: true
}
```

### Category
```js
{
  name: String (required, unique),
  slug: String (required, unique),
  description: String,
  image: { url: String, publicId: String },
  parent: ObjectId ref 'Category' (nullable),  // supports sub-categories
  isActive: Boolean default true,
  sortOrder: Number default 0,
  createdAt, updatedAt
}
```

### Product
```js
{
  name: String (required),
  slug: String (required, unique),
  description: String (required),
  shortDescription: String,
  category: ObjectId ref 'Category' (required),
  brand: String,
  sku: String (unique),
  price: Number (required),
  comparePrice: Number,        // original price for "discount" display
  costPrice: Number,           // internal — not exposed to public API
  stock: Number default 0,
  lowStockThreshold: Number default 5,
  images: [{ url: String, publicId: String, isPrimary: Boolean }],
  variants: [{
    name: String,              // e.g. 'Size', 'Color', 'Material'
    options: [String]
  }],
  tags: [String],
  weight: Number,              // grams — for shipping calc
  isFeatured: Boolean default false,
  isActive: Boolean default true,
  metaTitle: String,
  metaDescription: String,
  ratings: { average: Number default 0, count: Number default 0 },
  createdAt, updatedAt
}
```

### Order
```js
{
  orderNumber: String (unique, auto-generated: ORD-YYYYMMDD-XXXXX),
  user: ObjectId ref 'User',
  items: [{
    product: ObjectId ref 'Product',
    name: String,              // snapshot at time of order
    image: String,
    price: Number,
    quantity: Number,
    variant: String
  }],
  shippingAddress: {
    name: String, phone: String,
    line1, line2, city, state, pincode: String
  },
  pricing: {
    subtotal: Number,
    discount: Number default 0,
    shipping: Number default 0,
    tax: Number default 0,
    total: Number
  },
  payment: {
    method: enum ['razorpay', 'cod'],
    status: enum ['pending', 'paid', 'failed', 'refunded'],
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date
  },
  status: enum ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
  tracking: { carrier: String, trackingNumber: String, url: String },
  notes: String,
  createdAt, updatedAt
}
```

### Review
```js
{
  product: ObjectId ref 'Product' (required),
  user: ObjectId ref 'User' (required),
  rating: Number (1–5, required),
  title: String,
  body: String,
  images: [String],
  isVerifiedPurchase: Boolean default false,
  createdAt, updatedAt
  // unique index on (product, user) — one review per user per product
}
```

---

## API Reference

### Standard Response Format

All endpoints return:
```json
// Success
{ "success": true, "data": {}, "message": "..." }

// Error
{ "success": false, "error": "...", "details": [] }

// Paginated list
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 }
}
```

---

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns access + refresh token |
| POST | `/auth/refresh` | Public | Rotate access token using refresh token |
| POST | `/auth/logout` | User | Invalidate refresh token |
| POST | `/auth/forgot-password` | Public | Send reset OTP to email |
| POST | `/auth/reset-password` | Public | Reset password with OTP |

**POST /auth/register — Request body:**
```json
{ "name": "Priya Sharma", "email": "priya@gmail.com", "phone": "9876543210", "password": "Min8chars!" }
```

**POST /auth/login — Response:**
```json
{
  "data": {
    "user": { "_id": "...", "name": "Priya", "email": "...", "role": "user" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Users — `/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | User | Get own profile |
| PUT | `/users/me` | User | Update name, phone |
| GET | `/users/me/addresses` | User | List saved addresses |
| POST | `/users/me/addresses` | User | Add new address |
| PUT | `/users/me/addresses/:id` | User | Update address |
| DELETE | `/users/me/addresses/:id` | User | Delete address |

---

### Categories — `/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | List all active categories (tree structure) |
| GET | `/categories/:slug` | Public | Get single category with children |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Soft delete (sets isActive: false) |

**POST /categories — Request body:**
```json
{
  "name": "Jewellery",
  "description": "Gold, silver and fashion jewellery",
  "parentId": null,
  "image": "base64_or_cloudinary_url",
  "sortOrder": 1
}
```

---

### Products — `/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List products with filters + pagination |
| GET | `/products/:slug` | Public | Get product detail |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Soft delete |
| POST | `/products/:id/images` | Admin | Upload images to Cloudinary |
| DELETE | `/products/:id/images/:publicId` | Admin | Remove image |

**GET /products — Query params:**
```
?category=jewellery
&minPrice=100
&maxPrice=5000
&tags=gold,ring
&inStock=true
&isFeatured=true
&search=necklace          ← text search on name + description
&sortBy=price_asc         ← price_asc | price_desc | newest | rating
&page=1
&limit=20
```

**POST /products — Request body:**
```json
{
  "name": "Gold Plated Jhumka",
  "description": "Handcrafted gold plated jhumka earrings...",
  "shortDescription": "Traditional jhumka earrings",
  "categoryId": "64abc...",
  "price": 899,
  "comparePrice": 1299,
  "stock": 50,
  "sku": "JWL-JHM-001",
  "variants": [{ "name": "Color", "options": ["Gold", "Rose Gold"] }],
  "tags": ["earrings", "traditional", "gold"],
  "weight": 25,
  "isFeatured": false,
  "metaTitle": "Gold Plated Jhumka Earrings | YourStore",
  "metaDescription": "Buy handcrafted gold plated jhumka..."
}
```

---

### Cart — `/cart`

Cart is stored in **Upstash Redis** keyed by `cart:{userId}` with 30-day TTL. Guest carts use `cart:guest:{sessionId}`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cart` | User / Guest | Get current cart with product details |
| POST | `/cart/items` | User / Guest | Add item to cart |
| PUT | `/cart/items/:productId` | User / Guest | Update quantity |
| DELETE | `/cart/items/:productId` | User / Guest | Remove item |
| DELETE | `/cart` | User | Clear entire cart |
| POST | `/cart/merge` | User | Merge guest cart on login |

**POST /cart/items — Request body:**
```json
{ "productId": "64abc...", "quantity": 2, "variant": "Gold" }
```

**GET /cart — Response:**
```json
{
  "data": {
    "items": [{
      "product": { "_id": "...", "name": "Gold Plated Jhumka", "price": 899, "stock": 50, "image": "..." },
      "quantity": 2,
      "variant": "Gold",
      "subtotal": 1798
    }],
    "summary": { "itemCount": 2, "subtotal": 1798, "shipping": 0, "total": 1798 }
  }
}
```

---

### Orders — `/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | User | Create order from cart |
| GET | `/orders` | User | List own orders (paginated) |
| GET | `/orders/:id` | User | Get order detail |
| POST | `/orders/:id/cancel` | User | Cancel order (if status = placed/confirmed) |
| GET | `/admin/orders` | Admin | List all orders with filters |
| PUT | `/admin/orders/:id/status` | Admin | Update order status + tracking |

**POST /orders — Request body:**
```json
{
  "shippingAddressId": "64abc...",
  "paymentMethod": "razorpay",
  "notes": "Please gift wrap"
}
```

**Order creation flow:**
1. Validate cart is not empty
2. Verify all products are in stock
3. Deduct stock (atomic MongoDB update)
4. Calculate pricing (subtotal + shipping + tax)
5. Create Order document with status `placed`
6. If `razorpay` → call Razorpay create order API → return `razorpayOrderId` to frontend
7. If `cod` → set payment.status = `pending`, send confirmation email
8. Clear Redis cart

---

### Payments — `/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-order` | User | Create Razorpay order for a placed order |
| POST | `/payments/verify` | User | Verify payment signature after success |
| POST | `/payments/webhook` | Public (HMAC verified) | Razorpay webhook handler |

**POST /payments/verify — Request body:**
```json
{
  "orderId": "64abc...",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "abc123..."
}
```

**Verification logic:**
```js
// Verify HMAC SHA256 signature
const body = razorpayOrderId + "|" + razorpayPaymentId;
const expectedSignature = crypto
  .createHmac("sha256", RAZORPAY_KEY_SECRET)
  .update(body)
  .digest("hex");
if (expectedSignature !== razorpaySignature) throw new Error("Invalid signature");
// Update order payment.status = 'paid', send confirmation email
```

**Webhook handler** — verifies `X-Razorpay-Signature` header, handles:
- `payment.captured` → mark order paid
- `payment.failed` → mark order payment failed, restore stock
- `refund.processed` → mark order refunded

---

### Reviews — `/reviews`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products/:slug/reviews` | Public | List reviews for product |
| POST | `/products/:slug/reviews` | User | Create review (verified purchase check) |
| DELETE | `/reviews/:id` | User / Admin | Delete review |

After create/delete, recalculate `product.ratings.average` and `product.ratings.count`.

---

### Admin — `/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Stats: revenue, orders, users, low stock |
| GET | `/admin/orders` | Admin | All orders with status filter + date range |
| PUT | `/admin/orders/:id/status` | Admin | Update status + tracking info |
| GET | `/admin/products/low-stock` | Admin | Products below lowStockThreshold |

**GET /admin/dashboard — Response:**
```json
{
  "data": {
    "today": { "orders": 12, "revenue": 15400 },
    "thisMonth": { "orders": 340, "revenue": 428000 },
    "totalUsers": 1240,
    "lowStockProducts": 5,
    "recentOrders": []
  }
}
```

---

## Core Implementation Requirements

### 1. MongoDB Connection Caching (CRITICAL for Lambda)
```js
// src/lib/db.js
let cachedConnection = null;
export async function connectDB() {
  if (cachedConnection) return cachedConnection;
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  return cachedConnection;
}
```

### 2. Lambda Handler Pattern (every function follows this)
```js
// src/functions/products/listProducts.js
import { connectDB } from '../../lib/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { success, error } from '../../lib/response.js';

export const handler = async (event) => {
  try {
    await connectDB();
    const { category, minPrice, maxPrice, search, page = 1, limit = 20 } = event.queryStringParameters || {};

    const query = { isActive: true };
    if (category) query.category = await Category.findOne({ slug: category });
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (search) query.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .select('-costPrice')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    return success({ products, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return error(err.message);
  }
};
```

### 3. Authentication Middleware
```js
// src/middleware/authenticate.js
import jwt from 'jsonwebtoken';
export const authenticate = (event) => {
  const token = event.headers?.Authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

export const requireAdmin = (user) => {
  if (user.role !== 'admin') throw new Error('Admin access required');
};
```

### 4. Standardised Response Helper
```js
// src/lib/response.js
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
  'Access-Control-Allow-Credentials': true,
};

export const success = (data, message = 'Success', statusCode = 200) => ({
  statusCode,
  headers,
  body: JSON.stringify({ success: true, data, message }),
});

export const error = (message, statusCode = 500, details = []) => ({
  statusCode,
  headers,
  body: JSON.stringify({ success: false, error: message, details }),
});
```

### 5. Image Upload to Cloudinary
```js
// src/functions/products/uploadImages.js
import cloudinary from '../../lib/cloudinary.js';

export const handler = async (event) => {
  const { images } = JSON.parse(event.body); // array of base64 strings
  const uploads = await Promise.all(
    images.map(img =>
      cloudinary.uploader.upload(img, {
        folder: 'ecommerce/products',
        transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
      })
    )
  );
  return success(uploads.map(u => ({ url: u.secure_url, publicId: u.public_id })));
};
```

---

## serverless.yml

```yaml
service: ecommerce-backend
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  stage: ${opt:stage, 'dev'}
  region: ap-south-1          # Mumbai — lowest latency for India
  memorySize: 256
  timeout: 10
  environment:
    MONGODB_URI: ${env:MONGODB_URI}
    JWT_ACCESS_SECRET: ${env:JWT_ACCESS_SECRET}
    JWT_REFRESH_SECRET: ${env:JWT_REFRESH_SECRET}
    CLOUDINARY_CLOUD_NAME: ${env:CLOUDINARY_CLOUD_NAME}
    CLOUDINARY_API_KEY: ${env:CLOUDINARY_API_KEY}
    CLOUDINARY_API_SECRET: ${env:CLOUDINARY_API_SECRET}
    UPSTASH_REDIS_REST_URL: ${env:UPSTASH_REDIS_REST_URL}
    UPSTASH_REDIS_REST_TOKEN: ${env:UPSTASH_REDIS_REST_TOKEN}
    RAZORPAY_KEY_ID: ${env:RAZORPAY_KEY_ID}
    RAZORPAY_KEY_SECRET: ${env:RAZORPAY_KEY_SECRET}
    RAZORPAY_WEBHOOK_SECRET: ${env:RAZORPAY_WEBHOOK_SECRET}
    RESEND_API_KEY: ${env:RESEND_API_KEY}
    FRONTEND_URL: ${env:FRONTEND_URL}

functions:
  # Auth
  register:
    handler: src/functions/auth/register.handler
    events: [{ http: { path: /auth/register, method: post, cors: true } }]
  login:
    handler: src/functions/auth/login.handler
    events: [{ http: { path: /auth/login, method: post, cors: true } }]
  refresh:
    handler: src/functions/auth/refresh.handler
    events: [{ http: { path: /auth/refresh, method: post, cors: true } }]

  # Products
  listProducts:
    handler: src/functions/products/listProducts.handler
    events: [{ http: { path: /products, method: get, cors: true } }]
  getProduct:
    handler: src/functions/products/getProduct.handler
    events: [{ http: { path: /products/{slug}, method: get, cors: true } }]
  createProduct:
    handler: src/functions/products/createProduct.handler
    events: [{ http: { path: /products, method: post, cors: true, authorizer: jwtAuthorizer } }]
  updateProduct:
    handler: src/functions/products/updateProduct.handler
    events: [{ http: { path: /products/{id}, method: put, cors: true, authorizer: jwtAuthorizer } }]

  # Cart
  getCart:
    handler: src/functions/cart/getCart.handler
    events: [{ http: { path: /cart, method: get, cors: true } }]
  addToCart:
    handler: src/functions/cart/addToCart.handler
    events: [{ http: { path: /cart/items, method: post, cors: true } }]

  # Orders
  createOrder:
    handler: src/functions/orders/createOrder.handler
    provisionedConcurrency: 2   # keep warm — critical path
    events: [{ http: { path: /orders, method: post, cors: true, authorizer: jwtAuthorizer } }]
  getOrder:
    handler: src/functions/orders/getOrder.handler
    events: [{ http: { path: /orders/{id}, method: get, cors: true, authorizer: jwtAuthorizer } }]

  # Payments
  createPaymentOrder:
    handler: src/functions/payments/createPaymentOrder.handler
    provisionedConcurrency: 2   # keep warm — critical path
    events: [{ http: { path: /payments/create-order, method: post, cors: true, authorizer: jwtAuthorizer } }]
  verifyPayment:
    handler: src/functions/payments/verifyPayment.handler
    provisionedConcurrency: 2
    events: [{ http: { path: /payments/verify, method: post, cors: true, authorizer: jwtAuthorizer } }]
  paymentWebhook:
    handler: src/functions/payments/webhook.handler
    events: [{ http: { path: /payments/webhook, method: post, cors: false } }]

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

custom:
  serverless-offline:
    httpPort: 4000
```

---

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS Lambda

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - name: Deploy
        run: npx serverless deploy --stage production
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET }}
          JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET }}
          RAZORPAY_KEY_ID: ${{ secrets.RAZORPAY_KEY_ID }}
          RAZORPAY_KEY_SECRET: ${{ secrets.RAZORPAY_KEY_SECRET }}
          RAZORPAY_WEBHOOK_SECRET: ${{ secrets.RAZORPAY_WEBHOOK_SECRET }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
          UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
          UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
```

---

## MongoDB Indexes (add in db.js after connect)

```js
// Run once on first deploy
await Product.collection.createIndex({ name: 'text', description: 'text', tags: 'text' });
await Product.collection.createIndex({ category: 1, isActive: 1, price: 1 });
await Product.collection.createIndex({ slug: 1 }, { unique: true });
await Order.collection.createIndex({ user: 1, createdAt: -1 });
await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
await Review.collection.createIndex({ product: 1, user: 1 }, { unique: true });
```

---

## Security Checklist

- [ ] All admin routes verify `role === 'admin'` inside the handler
- [ ] Razorpay webhook verifies HMAC signature before processing
- [ ] Passwords hashed with `bcrypt` (saltRounds: 12)
- [ ] Rate limiting on `/auth/login` via Upstash Redis (max 5 attempts / 15 min)
- [ ] `costPrice` field never returned in public product API
- [ ] MongoDB URI not logged anywhere
- [ ] CORS restricted to `FRONTEND_URL` only
- [ ] Input validated with Zod on every POST/PUT
- [ ] Stock deduction uses atomic `$inc: { stock: -quantity }` with `stock: { $gte: quantity }` condition

---


