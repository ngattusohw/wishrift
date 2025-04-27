import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains as a simple example
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Wish List schema
export const wishLists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  shareId: text("share_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wish List Items schema
export const wishListItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishListId: integer("wishlist_id").references(() => wishLists.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  currentPrice: integer("current_price").notNull(), // Stored in cents
  originalPrice: integer("original_price"), // Stored in cents
  imageUrl: text("image_url"),
  productUrl: text("product_url").notNull(),
  store: text("store").notNull(),
  category: text("category").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Price History schema
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => wishListItems.id).notNull(),
  price: integer("price").notNull(), // Stored in cents
  date: timestamp("date").defaultNow().notNull(),
});

// Price Alerts schema
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => wishListItems.id).notNull(),
  targetPrice: integer("target_price").notNull(), // Stored in cents
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shared List Access schema
export const sharedAccess = pgTable("shared_access", {
  id: serial("id").primaryKey(),
  wishListId: integer("wishlist_id").references(() => wishLists.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWishListSchema = createInsertSchema(wishLists)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertWishListItemSchema = createInsertSchema(wishListItems)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertPriceHistorySchema = createInsertSchema(priceHistory)
  .omit({ id: true });

export const insertPriceAlertSchema = createInsertSchema(priceAlerts)
  .omit({ id: true, createdAt: true });

export const insertSharedAccessSchema = createInsertSchema(sharedAccess)
  .omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWishList = z.infer<typeof insertWishListSchema>;
export type WishList = typeof wishLists.$inferSelect;

export type InsertWishListItem = z.infer<typeof insertWishListItemSchema>;
export type WishListItem = typeof wishListItems.$inferSelect;

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

export type InsertSharedAccess = z.infer<typeof insertSharedAccessSchema>;
export type SharedAccess = typeof sharedAccess.$inferSelect;
