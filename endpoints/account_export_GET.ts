// floot:external — downloaded directly from the Privacy & Security settings link.
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const jsonError = (message: string, status: number) => new Response(JSON.stringify({ error: message }), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const userId = String(user.id);
    const [
      account, studentProfile, companyProfiles, careerGoals, roadmaps, applications,
      recruiterApplications, resumes, skillAssessments, mockInterviews,
      mentorConversations, mentorMessages, mentorFeedback, mentorshipRequests,
      notifications, savedOpportunities, jobAlerts, jobAlertDeliveries,
      eventRegistrations, companyFollows, companyReviews, messages,
      messageBlocks, messageReports, opportunityReports, profileViews,
      recruiterSavedCandidates,
    ] = await Promise.all([
      db.selectFrom("users").select(["id", "displayName", "email", "role", "avatarUrl", "createdAt", "updatedAt"]).where("id", "=", Number(userId)).executeTakeFirst(),
      db.selectFrom("studentProfiles").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("companyProfiles").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("careerGoals").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("careerRoadmaps").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("applications").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("recruiterApplications").selectAll().where("studentUserId", "=", userId).execute(),
      db.selectFrom("resumes").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("skillAssessments").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("mockInterviews").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("mentorConversations").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("mentorMessages").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("mentorFeedback").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("mentorshipRequests").selectAll().where("studentUserId", "=", userId).execute(),
      db.selectFrom("notifications").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("savedOpportunities").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("jobAlerts").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("jobAlertDeliveries").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("eventRegistrations").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("companyFollows").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("companyReviews").selectAll().where("userId", "=", userId).execute(),
      db.selectFrom("messages").selectAll().where((eb) => eb.or([eb("senderUserId", "=", userId), eb("recipientUserId", "=", userId)])).execute(),
      db.selectFrom("messageBlocks").selectAll().where((eb) => eb.or([eb("blockerUserId", "=", userId), eb("blockedUserId", "=", userId)])).execute(),
      db.selectFrom("messageReports").selectAll().where((eb) => eb.or([eb("reporterUserId", "=", userId), eb("reportedUserId", "=", userId)])).execute(),
      db.selectFrom("opportunityReports").selectAll().where("reporterUserId", "=", userId).execute(),
      db.selectFrom("profileViews").selectAll().where((eb) => eb.or([eb("viewerUserId", "=", userId), eb("profileUserId", "=", userId)])).execute(),
      db.selectFrom("recruiterSavedCandidates").selectAll().where((eb) => eb.or([eb("recruiterUserId", "=", userId), eb("candidateUserId", "=", userId)])).execute(),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      format: "HerSphere personal data export",
      account,
      data: {
        studentProfile, companyProfiles, careerGoals, roadmaps, applications,
        recruiterApplications, resumes, skillAssessments, mockInterviews,
        mentorConversations, mentorMessages, mentorFeedback, mentorshipRequests,
        notifications, savedOpportunities, jobAlerts, jobAlertDeliveries,
        eventRegistrations, companyFollows, companyReviews, messages,
        messageBlocks, messageReports, opportunityReports, profileViews,
        recruiterSavedCandidates,
      },
      security: "Password hashes, active sessions, authentication tokens and OTP secrets are excluded.",
    };
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hersphere-personal-data.json"',
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return jsonError("Not authenticated", 401);
    return jsonError("Could not create your personal data export. Please try again.", 500);
  }
}