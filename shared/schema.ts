import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkId: varchar("clerk_id").unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePictureUrl: text("profile_picture_url"),
  credits: integer("credits").notNull().default(100),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profilePictureUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Modules table (AI agents)
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  imageUrl: text("image_url"),
  provider: text("provider").notNull().default("openai"),
  model: text("model").notNull().default("gpt-4o-mini"),
  recommendedModel: text("recommended_model"),
  conversationStarters: jsonb("conversation_starters"),
  capabilities: jsonb("capabilities"),
  knowledge: jsonb("knowledge"),
  actions: jsonb("actions"),
  apiSchema: jsonb("api_schema"),
  customFields: jsonb("custom_fields"),
  isPublic: boolean("is_public").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  favoriteCount: integer("favorite_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertModuleSchema = createInsertSchema(modules)
  .omit({ id: true, creatorId: true, usageCount: true, favoriteCount: true, createdAt: true, updatedAt: true });

export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// Module Documents (files uploaded to modules for knowledge)
export const moduleDocuments = pgTable("module_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileContent: text("file_content").notNull(),
  isProcessed: boolean("is_processed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  moduleIdIdx: index("module_documents_module_id_idx").on(table.moduleId),
}));

export const insertModuleDocumentSchema = createInsertSchema(moduleDocuments).pick({
  moduleId: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  fileContent: true,
});

export type InsertModuleDocument = z.infer<typeof insertModuleDocumentSchema>;
export type ModuleDocument = typeof moduleDocuments.$inferSelect;

// Document Chunks (text chunks from documents for RAG)
export const documentChunks = pgTable("document_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id")
    .notNull()
    .references(() => moduleDocuments.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  moduleIdIdx: index("document_chunks_module_id_idx").on(table.moduleId),
  documentIdIdx: index("document_chunks_document_id_idx").on(table.documentId),
}));

export const insertDocumentChunkSchema = createInsertSchema(documentChunks).omit({ id: true, createdAt: true });

export type InsertDocumentChunk = z.infer<typeof insertDocumentChunkSchema>;
export type DocumentChunk = typeof documentChunks.$inferSelect;

// Embeddings (stored as JSONB for compatibility)
export const embeddings = pgTable("embeddings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chunkId: varchar("chunk_id")
    .notNull()
    .references(() => documentChunks.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  embeddingData: jsonb("embedding_data"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  moduleIdIdx: index("embeddings_module_id_idx").on(table.moduleId),
  chunkIdIdx: index("embeddings_chunk_id_idx").on(table.chunkId),
}));

export const insertEmbeddingSchema = createInsertSchema(embeddings).omit({ id: true, createdAt: true });

export type InsertEmbedding = z.infer<typeof insertEmbeddingSchema>;
export type Embedding = typeof embeddings.$inferSelect;

// Conversations table (per user per module)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Conversation"),
  totalTokensUsed: integer("total_tokens_used").notNull().default(0),
  creditsCost: integer("credits_cost").notNull().default(0),
  contextSummary: text("context_summary"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  userIdIdx: index("conversations_user_id_idx").on(table.userId),
  moduleIdIdx: index("conversations_module_id_idx").on(table.moduleId),
}));

export const insertConversationSchema = createInsertSchema(conversations)
  .omit({ id: true, userId: true, totalTokensUsed: true, creditsCost: true, createdAt: true, updatedAt: true });

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table (proper history management)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  conversationIdIdx: index("messages_conversation_id_idx").on(table.conversationId),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Test Sessions (creator testing their modules)
export const testSessions = pgTable("test_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messages: jsonb("messages").notNull().default(sql`'[]'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  totalTokensUsed: integer("total_tokens_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  moduleIdIdx: index("test_sessions_module_id_idx").on(table.moduleId),
  creatorIdIdx: index("test_sessions_creator_id_idx").on(table.creatorId),
}));

export const insertTestSessionSchema = createInsertSchema(testSessions)
  .omit({ id: true, messages: true, totalTokensUsed: true, createdAt: true, updatedAt: true });

export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type TestSession = typeof testSessions.$inferSelect;

// Favorites table
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertFavoriteSchema = createInsertSchema(favorites)
  .omit({ id: true, createdAt: true });

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  fromUserId: varchar("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, read: true, createdAt: true });

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Credit transactions table
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  conversationId: varchar("conversation_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions)
  .omit({ id: true, userId: true, createdAt: true });

export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
