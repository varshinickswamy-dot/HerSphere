import { schema as profileSchema } from "../endpoints/profile_POST.schema";
import { schema as registerSchema } from "../endpoints/auth/register_with_password_POST.schema";
import { schema as messageSchema } from "../endpoints/messages_POST.schema";
import { schema as resumeSchema } from "../endpoints/resume_POST.schema";
import { schema as communitySchema } from "../endpoints/community_POST.schema";

describe("HerSphere input validation", () => {
  it("rejects oversized profile text and excessive skill arrays", () => {
    expect(profileSchema.safeParse({ college: "x".repeat(201) }).success).toBeFalse();
   10	    expect(profileSchema.safeParse({ skills: Array.from({ length: 101 }, () => "Java") }).success).toBeFalse();
   11	  });
   12	  it("rejects oversized registration values and short passwords", () => {
   13	    expect(registerSchema.safeParse({ email: "a@example.com", password: "123", displayName: "A" }).success).toBeFalse();
   14	    expect(registerSchema.safeParse({ email: "a@example.com", password: "abcdefgh", displayName: "A" }).success).toBeFalse();
   15	    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "A" }).success).toBeTrue();
   16	    expect(registerSchema.safeParse({ email: "a@example.com", password: "Abcdefg1", displayName: "x".repeat(101) }).success).toBeFalse();
   17	  });
   18	  it("rejects empty, oversized, and malformed message payloads", () => {
   19	    expect(messageSchema.safeParse({ recipientUserId: "2", body: "" }).success).toBeFalse();
   20	    expect(messageSchema.safeParse({ recipientUserId: "2", body: "x".repeat(5001) }).success).toBeFalse();
   21	    expect(messageSchema.safeParse({ recipientUserId: "<script>alert(1)</script>", body: "hello" }).success).toBeFalse();
   22	  });
   23	  it("rejects oversized resume sections", () => {
   24	    expect(resumeSchema.safeParse({ title:"CV",fullName:"A",headline:"",email:"a@example.com",phone:"",location:"",summary:"x".repeat(3001),skills:[],education:[],experience:[],projects:[],certifications:[],links:{} }).success).toBeFalse();
   25	  });
   26	  it("treats markup in community text as text and enforces payload bounds", () => {
   27	    expect(communitySchema.safeParse({ action:"post", content:"<script>alert(1)</script>" }).success).toBeTrue();
   28	    expect(communitySchema.safeParse({ action:"post", content:"x".repeat(3001) }).success).toBeFalse();
   29	    expect(communitySchema.safeParse({ action:"comment", postId:"not-a-number", content:"hello" }).success).toBeFalse();
   30	  });
   31	});