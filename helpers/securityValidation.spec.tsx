import { schema as profileSchema } from "../endpoints/profile_POST.schema";
import { schema as registerSchema } from "../endpoints/auth/register_with_password_POST.schema";
import { schema as messageSchema } from "../endpoints/messages_POST.schema";
import { schema as resumeSchema } from "../endpoints/resume_POST.schema";
import { schema as communitySchema } from "../endpoints/community_POST.schema";

describe("HerSphere input validation", () => {
  it("rejects oversized profile text and excessive skill arrays", () => {
    expect(profileSchema.safeParse({ college: "x".repeat(201) }).success).toBeFalse();