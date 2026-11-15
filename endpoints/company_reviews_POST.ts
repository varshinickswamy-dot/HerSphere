import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./company_reviews_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    const company = await db.selectFrom("companyProfiles").select("id").where("id", "=", body.companyId).executeTakeFirst();
    if (!company) return json({ error: "Company not found." }, 404);
    const review = await db.insertInto("companyReviews").values({ companyId: body.companyId, userId: String(user.id), rating: body.rating, title: body.title || null, body: body.body || null }).returningAll().executeTakeFirstOrThrow();
    return json({ review });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the company review details." }, 400);
    return json({ error: "Could not submit review. Please try again later." }, 500);
  }
}