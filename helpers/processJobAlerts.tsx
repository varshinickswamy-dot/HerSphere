import { db } from "./db";
import { publish } from "@floot/realtime";
import { channels } from "./realtimeChannels";

export async function processJobAlerts() {
  const alerts = await db.selectFrom("jobAlerts").selectAll().where("isActive", "=", true).execute();
  if (!alerts.length) return;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
   10	  const [jobs, internships, recruiterJobs] = await Promise.all([
   11	    db.selectFrom("jobs").selectAll().where("createdAt", ">", since).execute(),
   12	    db.selectFrom("internships").selectAll().where("createdAt", ">", since).execute(),
   13	    db.selectFrom("recruiterJobs").selectAll().where("createdAt", ">", since).execute(),
   14	  ]);
   15	
   16	  const norm = (v: unknown) => String(v ?? "").toLowerCase();
   17	  const matches = (alert: typeof alerts[number], item: any) => {
   18	    const hay = [item.title, item.role, item.companyName, item.location, item.description, item.experience, item.workMode, item.employmentType, ...(item.skills ?? [])].map(norm).join(" ");
   19	    const terms = norm(alert.keywords).split(/[,\s]+/).filter(Boolean);
   20	    if (terms.length && !terms.some((t) => hay.includes(t))) return false;
   21	    if (alert.location && !norm(item.location).includes(norm(alert.location))) return false;
   22	    if (alert.workMode && alert.workMode !== "any" && norm(item.workMode) !== norm(alert.workMode)) return false;
   23	    if (alert.experience && alert.experience !== "any" && !norm(item.experience).includes(norm(alert.experience))) return false;
   24	    if (alert.employmentType && alert.employmentType !== "any" && !norm(item.employmentType).includes(norm(alert.employmentType))) return false;
   25	    return true;
   26	  };
   27	
   28	  for (const alert of alerts) {
   29	    const candidates = [
   30	      ...jobs.map((item) => ({ type: "job", item })),
   31	      ...internships.map((item) => ({ type: "internship", item })),
   32	      ...recruiterJobs.map((item) => ({ type: "recruiter_job", item })),
   33	    ].filter((x) => matches(alert, x.item));
   34	
   35	    for (const hit of candidates.slice(0, 10)) {
   36	      const exists = await db.selectFrom("jobAlertDeliveries").select("id")
   37	        .where("alertId", "=", alert.id)
   38	        .where("opportunityType", "=", hit.type)
   39	        .where("opportunityId", "=", hit.item.id)
   40	        .executeTakeFirst();
   41	      if (exists) continue;
   42	
   43	      await db.insertInto("jobAlertDeliveries").values({
   44	        alertId: alert.id,
   45	        userId: alert.userId,
   46	        opportunityType: hit.type,
   47	        opportunityId: hit.item.id,
   48	      }).execute();
   49	
   50	      const title = "title" in hit.item ? hit.item.title : hit.item.role;
   51	      await db.insertInto("notifications").values({
   52	        userId: alert.userId,
   53	        title: "New opportunity matches your alert",
   54	        message: title + " is a match for “" + alert.name + "”.",
   55	        type: "job_alert",
   56	        link: "/opportunities",
   57	        isRead: false,
   58	      }).execute();
   59	
   60	      await publish(channels.user(String(alert.userId)), {
   61	        type: "job-alert.created",
   62	        alertId: alert.id,
   63	        opportunityType: hit.type,
   64	        opportunityId: hit.item.id,
   65	        title,
   66	      });
   67	    }
   68	
   69	    await db.updateTable("jobAlerts").set({ lastNotifiedAt: new Date(), updatedAt: new Date() })
   70	      .where("id", "=", alert.id).execute();
   71	  }
   72	}
   73