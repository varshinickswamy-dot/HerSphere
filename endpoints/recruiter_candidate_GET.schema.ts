import superjson from "superjson";
export type OutputType = { candidate: any; profile: any; resume: any; applications: any[]; hasAppliedToCompany: boolean; savedCandidate: { id: string; note: string | null } | null };
export async function getRecruiterCandidate(candidateUserId: string, init?: RequestInit): Promise<OutputType> {
  const r = await fetch("/_api/recruiter_candidate?candidateUserId=" + encodeURIComponent(candidateUserId), { ...init, credentials: "include" });
  if (!r.ok) throw new Error("Could not load candidate profile");
  return superjson.parse<OutputType>(await r.text());
}
