import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";
import { 
  insertWishListSchema, 
  insertWishListItemSchema,
  insertPriceAlertSchema,
  insertPriceHistorySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // WishLists
  app.get("/api/wishlists", async (req, res) => {
    // For MVP we don't have authentication, so we'll use a demo user
    const userId = 1;
    const wishlists = await storage.getWishLists(userId);
    res.json(wishlists);
  });
  
  app.get("/api/wishlists/:id", async (req, res) => {
    const { id } = req.params;
    const wishlist = await storage.getWishList(Number(id));
    
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    
    res.json(wishlist);
  });
  
  app.post("/api/wishlists", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const wishlistData = insertWishListSchema.parse({
        ...req.body,
        userId,
        shareId: nanoid(10), // Generate unique ID for sharing
      });
      
      const newWishlist = await storage.createWishList(wishlistData);
      res.status(201).json(newWishlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create wishlist" });
    }
  });
  
  app.put("/api/wishlists/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const wishlist = await storage.getWishList(Number(id));
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      const updatedData = insertWishListSchema.partial().parse(req.body);
      const updatedWishlist = await storage.updateWishList(Number(id), updatedData);
      
      res.json(updatedWishlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update wishlist" });
    }
  });
  
  app.delete("/api/wishlists/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteWishList(Number(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    
    res.status(204).send();
  });
  
  // WishList Items
  app.get("/api/wishlists/:wishlistId/items", async (req, res) => {
    const { wishlistId } = req.params;
    const items = await storage.getWishListItems(Number(wishlistId));
    res.json(items);
  });
  
  app.get("/api/items/:id", async (req, res) => {
    const { id } = req.params;
    const item = await storage.getWishListItem(Number(id));
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.json(item);
  });
  
  app.post("/api/wishlists/:wishlistId/items", async (req, res) => {
    const { wishlistId } = req.params;
    
    try {
      const wishlist = await storage.getWishList(Number(wishlistId));
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      const itemData = insertWishListItemSchema.parse({
        ...req.body,
        wishListId: Number(wishlistId),
      });
      
      const newItem = await storage.createWishListItem(itemData);
      
      // Add current price to price history
      await storage.addPriceHistory({
        itemId: newItem.id,
        price: newItem.currentPrice,
        date: new Date()
      });
      
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });
  
  app.put("/api/items/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const item = await storage.getWishListItem(Number(id));
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const updatedData = insertWishListItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateWishListItem(Number(id), updatedData);
      
      // If price changed, add to price history
      if (updatedData.currentPrice && updatedData.currentPrice !== item.currentPrice) {
        await storage.addPriceHistory({
          itemId: item.id,
          price: updatedData.currentPrice,
          date: new Date()
        });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });
  
  app.delete("/api/items/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteWishListItem(Number(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(204).send();
  });
  
  // Price History
  app.get("/api/items/:itemId/history", async (req, res) => {
    const { itemId } = req.params;
    const history = await storage.getPriceHistory(Number(itemId));
    res.json(history);
  });
  
  app.post("/api/items/:itemId/history", async (req, res) => {
    const { itemId } = req.params;
    
    try {
      const item = await storage.getWishListItem(Number(itemId));
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const historyData = insertPriceHistorySchema.parse({
        ...req.body,
        itemId: Number(itemId),
      });
      
      const newHistory = await storage.addPriceHistory(historyData);
      res.status(201).json(newHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to add price history" });
    }
  });
  
  // Price Alerts
  app.get("/api/items/:itemId/alerts", async (req, res) => {
    const { itemId } = req.params;
    const alerts = await storage.getPriceAlerts(Number(itemId));
    res.json(alerts);
  });
  
  app.post("/api/items/:itemId/alerts", async (req, res) => {
    const { itemId } = req.params;
    
    try {
      const item = await storage.getWishListItem(Number(itemId));
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const alertData = insertPriceAlertSchema.parse({
        ...req.body,
        itemId: Number(itemId),
      });
      
      const newAlert = await storage.createPriceAlert(alertData);
      res.status(201).json(newAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create price alert" });
    }
  });
  
  app.put("/api/alerts/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const alert = await storage.getPriceAlert(Number(id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const updatedData = insertPriceAlertSchema.partial().parse(req.body);
      const updatedAlert = await storage.updatePriceAlert(Number(id), updatedData);
      
      res.json(updatedAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update alert" });
    }
  });
  
  app.delete("/api/alerts/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deletePriceAlert(Number(id));
    
    if (!deleted) {
      return res.status(404).json({ message: "Alert not found" });
    }
    
    res.status(204).send();
  });
  
  // Shared Lists
  app.get("/api/shared/:shareId", async (req, res) => {
    const { shareId } = req.params;
    const wishlist = await storage.getWishListByShareId(shareId);
    
    if (!wishlist) {
      return res.status(404).json({ message: "Shared list not found" });
    }
    
    const items = await storage.getWishListItems(wishlist.id);
    
    res.json({
      wishlist,
      items
    });
  });
  
  app.get("/api/shared-with-me", async (req, res) => {
    // For MVP, use demo user
    const userId = 1;
    const sharedLists = await storage.getSharedWithMe(userId);
    
    res.json(sharedLists);
  });

  const httpServer = createServer(app);
  return httpServer;
}
