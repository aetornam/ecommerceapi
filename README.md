# Ecommerce API 🚀

This is a robust e-commerce backend API built with **Express.js**, **TypeScript**, and **Drizzle ORM**, using **PostgreSQL** as the database.  

- The **backend is self-deployed** on **Fly.io** (not containerized).  
- It **uses Nginx** for load balancing and **Redis** for caching, both running in Docker.  
- The architecture ensures **high performance, scalability, and security** for handling e-commerce operations.

## 📌 Features
- JWT Authentication (Login, Register, Update, Delete Users)
- Product Management (List, Search, Add to Cart, Remove from Cart)
- Order Processing & Tracking
- Payment Integration (e.g., Stripe)
- Optimized Database Queries using **Drizzle ORM**
- Secure & Scalable **Nginx** Configuration
- CI/CD with **GitHub Actions**
- Logging with **Winston + Morgan**

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/aetornam/ecommerceapi.git
cd ecommerce-api
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory and configure it:

```ini
# Database (Local)
DB_HOST=localhost
DB_PORT=5433
DB_USER=ecommerce_api
DB_PASSWORD=your_password
DB_NAME=ecommerce_api

# JWT Secret
JWT_SECRET=your_jwt_secret

# Logging
LOG_LEVEL=info

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

---
### 1️⃣ Install Fly.io CLI (if not installed)
```sh
curl -L https://fly.io/install.sh | sh
```

### 2️⃣ Login to Fly.io
```sh
flyctl auth login
```

## 🔥 Running the Backend Locally

### 1️⃣ Start Fly.io Database Proxy
If you're running the backend locally, you need to **proxy the Fly.io database**:
```sh
flyctl proxy 5433 -a ecommerce-db-app
```

### 2️⃣ Run Migrations
```sh
npm run db:push
```

### 3️⃣ Start the Server
```sh
npm run dev
```
Your backend will be available at `http://localhost/api`.

---

## 🚀 Deploying to Fly.io

### 1️⃣ Install Fly.io CLI (if not installed)
```sh
curl -L https://fly.io/install.sh | sh
```

### 2️⃣ Login to Fly.io
```sh
flyctl auth login
```

### 3️⃣ Create and Deploy the App
```sh
flyctl launch --name ecommerce-api
flyctl deploy
```

### 4️⃣ Set Environment Variables on Fly.io
```sh
flyctl secrets set \
  DB_HOST=ecommerce-db-app.internal \
  DB_PORT=5432 \
  DB_USER=ecommerce_api \
  DB_PASSWORD=your_password \
  JWT_SECRET=your_jwt_secret
```

### 5️⃣ Scale the App
```sh
flyctl scale count 1
```

---

## 🔗 API Endpoints

### **Auth Routes**
- `POST /api/auth/register` → Register a new user
- `POST /api/auth/login` → Login and get a JWT token

### **Product Routes**
- `GET /api/products` → List all products
- `POST /api/products` → Add a new product (Admin only)

### **Cart & Order Routes**
- `POST /api/cart/add` → Add item to cart
- `POST /api/order/create` → Create an order

---

## 🛠 Technologies Used
- **Node.js** + **Express.js** (Backend)
- **TypeScript** (Static Typing)
- **PostgreSQL** + **Drizzle ORM** (Database)
- **Redis** (Caching)
- **JWT** (Authentication)
- **Nginx** (Load Balancing)
- **Docker** (Containerization)
- **Fly.io** (Deployment)
- **GitHub Actions** (CI/CD)
- **Winston + Morgan** (Logging)

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a **Pull Request**

---

## 📜 License
This project is **open-source** and available under the **MIT License**.

---

## ❓ Need Help?
For issues, create a [GitHub Issue](https://github.com/aetornam/ecommerceapi/issues) or contact me directly.

Happy coding! 🚀

