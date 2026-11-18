import superjson from "superjson";

export type RecruiterMatch = {
  job: any;
  matches: Array<any>;
  total: number;
};

export async function getRecruiterMatches(jobId: string, init?: RequestInit): Promise<RecruiterMatch> {
  const response = await fetch("/_api/recruiter_matches?jobId=" + encodeURIComponent(jobId), {
    ...init,
    credentials: "include",
  });
  if (!response.ok) throw new Error("Could not generate candidate matches.");
  return superjson.parse<RecruiterMatch>(await response.text());
}
