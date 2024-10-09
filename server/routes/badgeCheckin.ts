import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from '@hono/zod-validator'

import { db } from "../db"
import { registrations as registrationTable } from "../db/schema/registrations"
import { eq, desc } from "drizzle-orm";
import { which } from "bun";

export const badgeCheckinRoute = new Hono()
  .post("/", async (c) => {
    const formData = await c.req.formData();
    const secret = formData.get("secret");
    const nfcTagCode = formData.get("nfcTagCode");

    console.log(formData, nfcTagCode);

    const realSecret = process.env.BADGE_CHECKIN_SECRET;

    if (!secret || realSecret !== secret) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!nfcTagCode) {
      return c.json({ error: "Missing form parameter: nfcTagCode" }, 400);
    }

    const users = await db
      .select()
      .from(registrationTable)
      .where(eq(registrationTable.nfcTagCode, nfcTagCode))
      .limit(1);

    if (!users.length) {
      return c.json({ error: "User not found" }, 404);
    }

    const userId = users[0].userId;

    const result = await db.update(registrationTable).set({ checkedin: true }).where(eq(registrationTable.userId, userId)).returning()

    if (!result) {
      return c.json({ error: "Failed to update user" }, 500);
    }

    console.log(`user ${userId} is checked in via badge checkin!`)

    // Respond with a success message
    return c.json({ message: "Badge check-in successful" }, 200);
  });
