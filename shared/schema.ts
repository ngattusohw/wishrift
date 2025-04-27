import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  uniqueIndex, 
  varchar, 
  jsonb, 
  index 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User schema for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wish List schema
export const wishLists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
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

// Product Listings schema (for scraped data)
export const productListings = pgTable("product_listings", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => wishListItems.id).notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Stored in cents
  imageUrl: text("image_url"),
  productUrl: text("product_url").notNull(),
  store: text("store").notNull(),
  isAvailable: boolean("is_available").default(true),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

// Shared List Access schema
export const sharedAccess = pgTable("shared_access", {
  id: serial("id").primaryKey(),
  wishListId: integer("wishlist_id").references(() => wishLists.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas

export const insertWishListSchema = createInsertSchema(wishLists)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertWishListItemSchema = createInsertSchema(wishListItems)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertPriceHistorySchema = createInsertSchema(priceHistory)
  .omit({ id: true });

export const insertPriceAlertSchema = createInsertSchema(priceAlerts)
  .omit({ id: true, createdAt: true });

export const insertProductListingSchema = createInsertSchema(productListings)
  .omit({ id: true, scrapedAt: true });

export const insertSharedAccessSchema = createInsertSchema(sharedAccess)
  .omit({ id: true, createdAt: true });

// For Replit Auth
export const upsertUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWishList = z.infer<typeof insertWishListSchema>;
export type WishList = typeof wishLists.$inferSelect;

export type InsertWishListItem = z.infer<typeof insertWishListItemSchema>;
export type WishListItem = typeof wishListItems.$inferSelect;

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

export type InsertProductListing = z.infer<typeof insertProductListingSchema>;
export type ProductListing = typeof productListings.$inferSelect;

export type InsertSharedAccess = z.infer<typeof insertSharedAccessSchema>;
export type SharedAccess = typeof sharedAccess.$inferSelect;
