/**
 * Skills Module - Barrel Export
 * Phase 6: Auto-Skill Trigger System
 */

export type { DetectionResult, Skill } from "./skill-registry.js";
export * from "./skill-registry.js";
export {
	detectAndActivateSkills,
	initializeSkillRegistry,
	SkillRegistry,
	skillRegistry,
} from "./skill-registry.js";
