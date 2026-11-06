import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./recruiter_candidates_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const company = await db.selectFrom("companyProfiles").select("id").where("userId", "=", String(user.id)).executeTakeFirst();
    if (!company) return json({ error: "Recruiter/company access required." }, 403);
    const body = schema.parse(superjson.parse(await request.text()));
    const candidate = await db.selectFrom("users").select("id").where("id", "=", Number(body.candidateUserId)).executeTakeFirst();
    if (!candidate) return json({ error: "Candidate not found." }, 404);
    await db.insertInto("recruiterSavedCandidates").values({ recruiterUserId: String(user.id), candidateUserId: body.candidateUserId, note: body.note || null, createdAt: new Date() }).onConflict(oc => oc.columns(["recruiterUserId", "candidateUserId"]).doUpdateSet({ note: body.note || null })).execute();
    return json({ ok: true });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the candidate details." }, 400);
    return json({ error: "Could not save candidate. Please try again later." }, 500);
  }
}