import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";

    const rows = await db
      .selectFrom("companyProfiles as c")
      .selectAll("c")
      .orderBy("c.companyName")
      .execute();

    const filtered = rows.filter((company) => {
      const searchableText = [
        company.companyName,
        company.industry,
        company.location,
        company.description,
      ].join(" ").toLowerCase();
      return !query || searchableText.includes(query);
    });

    if (filtered.length === 0) {
      return new Response(superjson.stringify({ companies: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch aggregate counts in two grouped queries instead of issuing two
    // additional database queries for every company (N+1 query pattern).
    const companyIds = filtered.map((company) => company.id);
    const [followCounts, jobCounts] = await Promise.all([
      db
        .selectFrom("companyFollows")
        .select(({ fn }) => ["companyId", fn.countAll<number>().as("count")])
        .where("companyId", "in", companyIds)
        .groupBy("companyId")
        .execute(),
      db
        .selectFrom("recruiterJobs")
        .select(({ fn }) => ["companyId", fn.countAll<number>().as("count")])
        .where("companyId", "in", companyIds)
        .groupBy("companyId")
        .execute(),
    ]);

    const followersByCompany = new Map(
      followCounts.map((row) => [String(row.companyId), Number(row.count)])
    );
    const jobsByCompany = new Map(
      jobCounts.map((row) => [String(row.companyId), Number(row.count)])
    );

    const companies = filtered.map((company) => ({
      ...company,
      id: String(company.id),
      followerCount: followersByCompany.get(String(company.id)) ?? 0,
      jobCount: jobsByCompany.get(String(company.id)) ?? 0,
    }));

    return new Response(superjson.stringify({ companies }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthenticated = error instanceof NotAuthenticatedError;
    return new Response(
      superjson.stringify({
        error: unauthenticated ? "Not authenticated" : "Could not load companies",
      }),
      {
        status: unauthenticated ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
