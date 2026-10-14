import { db } from "./db";
import { publish } from "@floot/realtime";
import { channels } from "./realtimeChannels";

export async function processJobAlerts() {
  const alerts = await db.selectFrom("jobAlerts").selectAll().where("isActive", "=", true).execute();
  if (!alerts.length) return;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);