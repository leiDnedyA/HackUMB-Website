import { pgTable, text, serial, index, timestamp, boolean } from "drizzle-orm/pg-core";

export const registrations = pgTable(
  "registrations", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    track: text("track").notNull(),
    semester: text("semester").notNull(),
    team: text("team").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    checkedin: boolean("checkedin").default(false).notNull(),
    nfcTagCode: text("nfc_tag_code").default("")
  },
  (registrations) => {
    return {
      userIdIndex: index("user_id_idx").on(registrations.userId),
    };
  }
);
