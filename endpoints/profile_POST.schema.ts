import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({
  phone:z.string().max(30).optional(), location:z.string().max(160).optional(), college:z.string().max(200).optional(),
  degree:z.string().max(100).optional(), branch:z.string().max(120).optional(), graduationYear:z.coerce.number().int().min(2020).max(2100).optional(),
  semester:z.coerce.number().int().min(1).max(12).optional(), languages:z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  cgpa:z.coerce.number().min(0).max(10).optional(), skills:z.array(z.string().max(80)).max(100).default([]),
  interests:z.array(z.string().max(120)).max(100).default([]), careerGoal:z.string().max(1000).optional(), preferredRole:z.string().max(160).optional(),
  preferredLocation:z.string().max(160).optional(), experienceLevel:z.enum(["student","entry","mid","senior"]).default("student"),