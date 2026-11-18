const normalizeSkill = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]/g, "");

const roleSkills: Record<string, string[]> = {
  fullstackdeveloper: ["java", "javascript", "react", "node.js", "sql", "git", "html", "css"],
  softwaredeveloper: ["java", "python", "javascript", "sql", "git", "data structures", "algorithms"],
  dataanalyst: ["python", "sql", "excel", "statistics", "power bi", "tableau"],
  machinelearningengineer: ["python", "machine learning", "statistics", "numpy", "pandas", "scikit-learn", "tensorflow"],
  frontenddeveloper: ["javascript", "react", "html", "css", "git", "typescript"],
  backenddeveloper: ["java", "python", "node.js", "sql", "apis", "git", "databases"],
};

/** Return a role-specific skill map, with a sensible baseline for unlisted roles. */
export function getRequiredSkillsForRole(role: string): string[] {
  return roleSkills[normalizeSkill(role)] ?? ["communication", "problem solving", "domain fundamentals", "sql", "git"];
}

export function normalizeCareerSkill(value: string): string {
  return normalizeSkill(value);
}
