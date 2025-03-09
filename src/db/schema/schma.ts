import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  unique, 
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

// =========== Users Table ============
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("customer"), // customer, admin, seller
    phoneNumber: varchar("phone_number", { length: 15 }), // Optional field
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIndex: unique("users_email_unique").on(table.email),
      createdAtIndex: index("users_created_at_idx").on(table.createdAt),
    };
  }
);


// ============ Categories Table ==============
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      categoryNameIndex: unique("categories_name_unique").on(table.name),
    };
  }
);

// =========== Products Table ============
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      productCategoryIndex: index("products_category_idx").on(table.categoryId),
    };
  }
);

// ========= Orders Table ========
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, shipped, delivered, cancelled
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userOrderIndex: index("orders_user_idx").on(table.userId),
    };
  }
);

// ======== Order Items Table ===========
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      orderItemIndex: index("order_items_order_idx").on(table.orderId),
      productItemIndex: index("order_items_product_idx").on(table.productId),
    };
  }
);

// ============ Payments Table ===========
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // e.g., credit card, PayPal
    paymentStatus: varchar("payment_status", { length: 50 })
      .notNull()
      .default("pending"), // pending, completed, failed
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      orderPaymentIndex: index("payments_order_idx").on(table.orderId),
    };
  }
);
