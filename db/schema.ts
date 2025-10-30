import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    tokenIdx: uniqueIndex("sessions_token_unique").on(table.token),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    accountProviderIdx: uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
    userIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  }),
);

export const bookingLinks = pgTable(
  "booking_links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    duration: integer("duration").notNull(), // Duration in minutes
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    slugIdx: uniqueIndex("booking_links_slug_unique").on(table.slug),
    userIdIdx: index("booking_links_user_id_idx").on(table.userId),
  }),
);

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    bookingLinkId: text("booking_link_id")
      .notNull()
      .references(() => bookingLinks.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email").notNull(),
    guestNotes: text("guest_notes"),
    startTime: timestamp("start_time", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endTime: timestamp("end_time", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    meetingLink: text("meeting_link"), // Google Meet or other video link
    calendarEventId: text("calendar_event_id"), // Google Calendar event ID
    status: text("status").default("confirmed").notNull(), // confirmed, cancelled
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    bookingLinkIdx: index("bookings_booking_link_id_idx").on(
      table.bookingLinkId,
    ),
    userIdIdx: index("bookings_user_id_idx").on(table.userId),
    startTimeIdx: index("bookings_start_time_idx").on(table.startTime),
  }),
);

export const availabilitySettings = pgTable(
  "availability_settings",
  {
    id: text("id").primaryKey(),
    bookingLinkId: text("booking_link_id")
      .notNull()
      .references(() => bookingLinks.id, { onDelete: "cascade" }),
    startHour: integer("start_hour").default(9).notNull(), // 0-23
    endHour: integer("end_hour").default(17).notNull(), // 0-23
    daysOfWeek: text("days_of_week").default("[0,1,2,3,4]").notNull(), // JSON array: [0=Sunday, 1=Monday, ..., 6=Saturday]
    timezone: text("timezone").default("UTC").notNull(),
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    bookingLinkIdx: uniqueIndex("availability_settings_booking_link_unique").on(
      table.bookingLinkId,
    ),
  }),
);

export const blockedTimes = pgTable(
  "blocked_times",
  {
    id: text("id").primaryKey(),
    bookingLinkId: text("booking_link_id")
      .notNull()
      .references(() => bookingLinks.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endTime: timestamp("end_time", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    title: text("title"), // Optional title/description for the block
    createdAt: timestampColumn("created_at"),
    updatedAt: timestampColumn("updated_at"),
  },
  (table) => ({
    bookingLinkIdx: index("blocked_times_booking_link_id_idx").on(
      table.bookingLinkId,
    ),
    startTimeIdx: index("blocked_times_start_time_idx").on(table.startTime),
  }),
);

export const drizzleSchema = {
  users,
  sessions,
  accounts,
  verification,
  bookingLinks,
  bookings,
  availabilitySettings,
  blockedTimes,
};

export const authSchema = {
  user: users,
  session: sessions,
  account: accounts,
  verification,
};

export type AuthSchema = typeof authSchema;
