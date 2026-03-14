# McDonald's Clone - Full Stack E-Commerce Platform

A feature-rich, full-stack web application designed for the HCL Hackathon, mimicking the core functionalities of a modern food delivery and restaurant portal (like McDonald's). It features a polished user-facing storefront, a comprehensive admin/seller dashboard, and a robust mock-payment checkout flow.

## 🌟 Key Features

### For Users
* **Dynamic Menu & Search:** Browse products across categories or use the dedicated "All Menu" view. Search is scoped by category for precision.
* **Real-time Stock Indicators:** Visual badges automatically update to show "Only X left!" for low stock and prevent adding items when "Out of Stock".
* **Interactive Cart & Checkout:** A slide-out cart sidebar allows for quick quantity adjustments before moving to a seamless mock payment flow.
* **Order History:** Detailed view of past orders including items purchased, price at purchase time, date, and status.

### For Admins / Sellers
* **Role-Based Access:** Dedicated `/admin` routes restricted to users holding the 'Admin' role.
* **Admin Dashboard:** High-level metrics showing Total Revenue, Orders, Products, and Low Stock alerts.
* **Product & Category Management:** Full CRUD capabilities for managing the catalog, including image URLs, pricing, and grouping items as "Combos" with selectable "Addons".
* **Stock Management:** Adjust available inventory quickly from the product list table.
* **Order Tracking:** View all platform orders and monitor fulfillment status.

---

## 🏗️ Architecture

This project uses the **MERN** stack (MongoDB, Express, React, Node.js) with standard MVC layered architecture on the backend and component-based UI on the frontend.

### Frontend (`/frontend`)
* **Framework Requirements:** React 18, Vite
* **State Management:** Zustand (Handling Cart state, Auth tokens & user roles)
* **Routing:** React Router v6 (Protected routes via `AdminRoute` wrapper)
* **Styling:** Tailwind CSS + Vanilla CSS (`index.css`) for micro-animations and custom gradients.
* **Icons:** Lucide React

### Backend (`/backend`)
* **Framework:** Express.js (Node.js)
* **Database:** MongoDB via Mongoose ORM
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs for password hashing.
* **Architecture:** 
  * `controllers/`: Request handling and business logic layer.
  * `models/`: Mongoose schemas.
  * `routes/`: API endpoint definitions tying controllers to URLs.
  * `middlewares/`: `protect` (verifies JWT) and `adminOnly` (verifies user role).

---

## 🗄️ Database Schema (MongoDB)

The application revolves around 5 core Mongoose schemas:

1. **User**
   * Stores `name`, `email`, `password` (hashed), and `role` (`'User'` or `'Admin'`).
2. **Category**
   * Groups products. Stores `name`, `description`, and a `logoUrl`.
3. **Product**
   * The core catalog item.
   * Links to a `categoryId`.
   * Stores `title`, `description`, `cost`, `imageUrl`, `stockQuantity`.
   * Advanced fields: `isCombo` (boolean) and `addons` (Array of ObjectIds referencing other Products).
   * Employs a text index for fast fuzzy searching on the home page.
4. **Order**
   * Snapshot of a completed checkout.
   * Links to `userId`.
   * Employs embedded documents for `items` (storing `productId`, `quantity`, and a snapshot of `priceAtPurchase` to prevent historical data corruption if product prices change later).
   * Tracks `totalAmount` and `status` (e.g., `'Paid'`).
5. **StockLedger** (Audit Trail)
   * Tracks history of inventory changes.
   * Stores `productId`, `changeAmount` (positive or negative), `reason`, and `performedBy`.

---

## 🔌 API Endpoints Reference

### Auth
* `POST /api/auth/signup` - Register a new user (can specify role).
* `POST /api/auth/login` - Authenticate and receive JWT.

### Categories
* `GET /api/categories` - Fetch all categories.
* `GET /api/categories/:categoryId/products` - Fetch paginated products for a category.
* `POST /api/categories` - Create new category (*Admin*).
* `PUT /api/categories/:id` - Update category (*Admin*).
* `DELETE /api/categories/:id` - Delete category (*Admin*).

### Products
* `GET /api/products` - Fetch all products (paginated).
* `GET /api/products/search?q={query}&categoryId={id}` - Scoped fuzzy search.
* `GET /api/products/admin/all` - Fetch all products with computed revenue & unit sales data (*Admin*).
* `POST /api/products` - Create product (*Admin*).
* `PUT /api/products/:id` - Update product details (*Admin*).
* `DELETE /api/products/:id` - Delete product (*Admin*).
* `PUT /api/products/:id/stock` - Adjust stock levels (*Admin*).

### Orders
* `POST /api/orders/place` - Checks stock, creates a mock "Paid" order, drops stock quantity (*Protected*).
* `GET /api/orders/history` - Fetch current user's past orders (*Protected*).
* `GET /api/orders/admin/all` - Fetch all user orders (*Admin*).

---

## 🚀 CI / CD & Deployment

* **Deployment:** Pre-configured for deployment on AWS App Runner (Backend) and Netlify (Frontend). Ensure you set the `VITE_API_URL` environment variable appropriately in production.
* **Continuous Integration:** GitHub Actions (`.github/workflows/ci.yml`) runs automatically on pushes and pull requests to the `main` branch to evaluate:
   * Frontend: Dependency installation and Vite build consistency.
   * Backend: Dependency installation and Node syntax checks.

## 💻 Running Locally

1. **Clone the repo**
2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGO_URI, JWT_SECRET, PORT=8080
   npm run dev
   ```
3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Create a .env.local file with VITE_API_URL=http://localhost:8080/api
   npm run dev
   ```
4. Access the app at `http://localhost:5173` (or whichever port Vite allocates).
