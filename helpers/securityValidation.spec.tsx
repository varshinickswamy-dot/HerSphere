import { schema as profileSchema } from "../endpoints/profile_POST.schema";
import { schema as registerSchema } from "../endpoints/auth/register_with_password_POST.schema";
import { schema as loginSchema } from "../endpoints/auth/login_with_password_POST.schema";
import { schema as messageSchema } from "../endpoints/messages_POST.schema";
import { schema as resumeSchema } from "../endpoints/resume_POST.schema";
import { schema as communitySchema } from "../endpoints/community_POST.schema";
import { hashOtpCode } from "./otpSecurity";
import { getRequiredSkillsForRole, normalizeCareerSkill } from "./careerSkills";

describe("HerSphere input validation", () => {
  it("rejects oversized profile text and excessive skill arrays", () => {
    expect(profileSchema.safeParse({ college: "x".repeat(201) }).success).toBeFalse();
    expect(profileSchema.safeParse({ skills: Array.from({ length: 101 }, () => "Java") }).success).toBeFalse();
  });
  it("rejects oversized registration values and short passwords", () => {
    expect(registerSchema.safeParse({ email: "a@example.com", password: "123", displayName: "A" }).success).toBeFalse();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "abcdefgh", displayName: "A" }).success).toBeFalse();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A" }).success).toBeTrue();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "x".repeat(101) }).success).toBeFalse();
  });
  it("validates login credentials and all public registration roles", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "Abcdefg1" }).success).toBeFalse();
    expect(loginSchema.safeParse({ email: " a@example.com ", password: "x" }).success).toBeTrue();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A", accountType: "student" }).success).toBeTrue();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A", accountType: "company", companyName: "Example Ltd" }).success).toBeTrue();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A", accountType: "recruiter", companyName: "Example Ltd" }).success).toBeTrue();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A", accountType: "personal" }).success).toBeTrue();
    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A", accountType: "admin" }).success).toBeFalse();
  });
  it("rejects empty, oversized, and malformed message payloads", () => {
    expect(messageSchema.safeParse({ recipientUserId: "2", body: "" }).success).toBeFalse();
    expect(messageSchema.safeParse({ recipientUserId: "2", body: "x".repeat(5001) }).success).toBeFalse();
    expect(messageSchema.safeParse({ recipientUserId: "<script>alert(1)</script>", body: "hello" }).success).toBeFalse();
  });
  it("rejects oversized resume sections", () => {
    expect(resumeSchema.safeParse({ title:"CV",fullName:"A",headline:"",email:"a@example.com",phone:"",location:"",summary:"x".repeat(3001),skills:[],education:[],experience:[],projects:[],certifications:[],links:{} }).success).toBeFalse();
  });
  it("treats markup in community text as text and enforces payload bounds", () => {
    expect(communitySchema.safeParse({ action:"post", content:"<script>alert(1)</script>" }).success).toBeTrue();
    expect(communitySchema.safeParse({ action:"post", content:"x".repeat(3001) }).success).toBeFalse();
    expect(communitySchema.safeParse({ action:"comment", postId:"not-a-number", content:"hello" }).success).toBeFalse();
  });
  it("uses a configured high-entropy server secret for OTP hashes", () => {
    const previous = process.env.JWT_SECRET;
    try {
      process.env.JWT_SECRET = "test-only-secret-with-at-least-32-bytes";
      const first = hashOtpCode(" User@Example.com ", "123456");
      expect(first).toBe(hashOtpCode("user@example.com", "123456"));
      expect(first).not.toBe(hashOtpCode("user@example.com", "654321"));
      process.env.JWT_SECRET = "short";
      expect(() => hashOtpCode("user@example.com", "123456")).toThrowError(/32 bytes/);
      delete process.env.JWT_SECRET;
      expect(() => hashOtpCode("user@example.com", "123456")).toThrowError(/32 bytes/);
    } finally {
      if (previous === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previous;
    }
  });
  it("maps common career role names to the intended skill requirements", () => {
    expect(getRequiredSkillsForRole("Full Stack Developer")).toContain("react");
    expect(getRequiredSkillsForRole("full-stack developer")).toContain("node.js");
    expect(getRequiredSkillsForRole("Machine Learning Engineer")).toContain("tensorflow");
    expect(getRequiredSkillsForRole("Data Analyst")).toContain("statistics");
    expect(normalizeCareerSkill("Node.js")).toBe("node.js");
  });
});
