import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Freemium: free users get 5 applications
  plan: mysqlEnum("plan", ["free", "premium"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Uploaded CVs
export const cvs = mysqlTable("cvs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 64 }).notNull(),
  // Parsed text content extracted by LLM
  parsedText: text("parsedText"),
  // Structured JSON summary from LLM
  parsedJson: text("parsedJson"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CV = typeof cvs.$inferSelect;
export type InsertCV = typeof cvs.$inferInsert;

// Job applications
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cvId: int("cvId"),
  // Job details
  jobTitle: varchar("jobTitle", { length: 255 }),
  company: varchar("company", { length: 255 }),
  jobUrl: text("jobUrl"),
  jobDescription: text("jobDescription").notNull(),
  // Generated outputs
  tailoredCv: text("tailoredCv"),
  coverLetter: text("coverLetter"),
  // Tracking
  status: mysqlEnum("status", ["draft", "applied", "interview", "rejected", "offer"])
    .default("draft")
    .notNull(),
  notes: text("notes"),
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;
