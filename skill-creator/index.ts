import fs from "node:fs";
import path from "node:path";
import { mapCodebase } from "./src/map-codebase.js";
import { scrapeUrl } from "./src/scraper.js";
import { generateSkillPrompt } from "./src/skill-generator.js";
import { detectAgentsFromStack, detectStack } from "./src/tech-detector.js";

/**
 * Aizen-Gate Skill Creator Entry Point (v2.0)
 */
export async function runSkillCreator(projectRoot: string, links: string[]): Promise<void> {
	const skillsDir = path.join(projectRoot, "aizen-gate", "skills", "custom");
	await fs.promises.mkdir(skillsDir, { recursive: true });

	for (const url of links) {
		console.log(`[SkillCreator] Processing knowledge from: ${url}`);
		const scrapedData = await scrapeUrl(url);
		if (!scrapedData || !scrapedData.title) continue;

		const skillId = scrapedData.title.toLowerCase().replace(/\s+/g, "-");
		const skillPath = path.join(skillsDir, `${skillId}.md`);
		const _prompt = generateSkillPrompt(scrapedData);

		// In local mode, we save the "Instruction" block as the skill
		// In production Aizen, it would call an LLM to refine this into a SKILL.md
		const skillDoc = `# Skill: ${scrapedData.title}\n\n## Source\n${url}\n\n## Patterns & Best Practices\n${scrapedData.text.slice(0, 1000)}...\n\n[AZ] This skill was auto-generated from documentation. Refer to sources for details.`;

		fs.writeFileSync(skillPath, skillDoc);
		console.log(`[SkillCreator] ✔ Generated skill profile: ${skillPath}`);
	}
}

export async function autoGenerateSkills(projectRoot: string): Promise<void> {
	console.log("[AZ] Scanning project dependencies for skill opportunities...");
	const stack = await detectStack(projectRoot);
	const dependencies = stack.libraries || [];

	// Extended library mapping with 50+ popular libraries
	const libraryDocs: Record<string, string[]> = {
		// JavaScript/TypeScript Frameworks
		express: ["https://expressjs.com/"],
		nestjs: ["https://docs.nestjs.com/"],
		fastify: ["https://fastify.dev/"],
		koa: ["https://koajs.com/"],
		hapi: ["https://hapi.dev/"],
		adonisjs: ["https://docs.adonisjs.com/"],

		// React Ecosystem
		react: ["https://react.dev/"],
		"react-dom": ["https://react.dev/"],
		next: ["https://nextjs.org/docs"],
		nuxt: ["https://nuxt.com/docs"],
		gatsby: ["https://www.gatsbyjs.com/docs/"],
		"@remix-run/react": ["https://remix.run/docs/en/main"],
		vue: ["https://vuejs.org/guide/"],
		"@sveltejs/kit": ["https://kit.svelte.dev/docs"],
		angular: ["https://angular.io/docs"],

		// State Management
		redux: ["https://redux.js.org/"],
		"@reduxjs/toolkit": ["https://redux-toolkit.js.org/"],
		zustand: ["https://docs.pmnd.rs/zustand"],
		mobx: ["https://mobx.js.org/"],
		jotai: ["https://jotai.org/docs/"],
		valtio: ["https://valtio.pmnd.rs/"],

		// Backend/Server
		"@apollo/server": ["https://www.apollographql.com/docs/apollo-server/"],
		graphql: ["https://graphql.org/learn/"],
		"@prisma/client": ["https://www.prisma.io/docs/"],
		prisma: ["https://www.prisma.io/docs/"],
		mongoose: ["https://mongoosejs.com/docs/"],
		typeorm: ["https://typeorm.io/"],
		sequelize: ["https://sequelize.org/docs/v7/"],
		knex: ["https://knexjs.org/"],

		// UI Libraries
		"@mui/material": ["https://mui.com/material-ui/getting-started/"],
		"chakra-ui": ["https://chakra-ui.com/docs/"],
		tailwindcss: ["https://tailwindcss.com/docs/"],
		"@radix-ui/react": ["https://www.radix-ui.com/docs/primitives"],
		shadcn: ["https://ui.shadcn.com/docs"],
		antd: ["https://ant.design/docs/react/introduce"],
		bootstrap: ["https://getbootstrap.com/docs/5.3/"],

		// Testing
		jest: ["https://jestjs.io/docs/getting-started"],
		vitest: ["https://vitest.dev/guide/"],
		playwright: ["https://playwright.dev/docs/intro"],
		cypress: ["https://docs.cypress.io/"],
		mocha: ["https://mochajs.org/"],
		jasmine: ["https://jasmine.github.io/pages/docs"],

		// DevOps/Cloud
		docker: ["https://docs.docker.com/"],
		kubernetes: ["https://kubernetes.io/docs/home/"],
		terraform: ["https://www.terraform.io/docs"],
		ansible: ["https://docs.ansible.com/"],
		"@aws-sdk/client-s3": ["https://docs.aws.amazon.com/sdk-for-javascript/"],

		// Authentication
		passport: ["http://www.passportjs.org/docs/"],
		clerk: ["https://clerk.com/docs"],
		supabase: ["https://supabase.com/docs"],
		firebase: ["https://firebase.google.com/docs"],
		"@auth0/auth0-react": ["https://auth0.com/docs/libraries/auth0-react"],

		// Utilities
		lodash: ["https://lodash.com/docs/"],
		"date-fns": ["https://date-fns.org/docs/"],
		axios: ["https://axios-http.com/docs/intro"],
		"@tanstack/react-query": ["https://tanstack.com/query/latest/docs"],
		swr: ["https://swr.vercel.app/docs"],
		zod: ["https://zod.dev/"],
		yup: ["https://github.com/jquense/yup"],
		"@hookform/resolvers": ["https://www.react-hook-form.com/docs/"],

		// Python Frameworks (for requirements.txt)
		django: ["https://docs.djangoproject.com/en/"],
		flask: ["https://flask.palletsprojects.com/en/"],
		fastapi: ["https://fastapi.tiangolo.com/"],
		sanic: ["https://sanic.dev/"],
		tornado: ["https://www.tornadoweb.org/"],

		// Python Libraries
		sqlalchemy: ["https://docs.sqlalchemy.org/"],
		psycopg2: ["https://www.psycopg.org/docs/"],
		redis: ["https://redis.io/docs/"],
		celery: ["https://docs.celeryproject.org/"],
		pandas: ["https://pandas.pydata.org/docs/"],
		numpy: ["https://numpy.org/doc/"],
		scikit: ["https://scikit-learn.org/stable/"],
		tensorflow: ["https://www.tensorflow.org/guide"],
		pytorch: ["https://pytorch.org/docs/"],
	};

	// Filter dependencies that have documentation links
	const shortlist = dependencies.filter((d: string) => libraryDocs[d.toLowerCase()]);

	for (const dep of shortlist) {
		const depLower = dep.toLowerCase();
		if (libraryDocs[depLower]) {
			console.log(`[AZ] Auto-generating skill for: ${dep}`);
			await runSkillCreator(projectRoot, libraryDocs[depLower]);
		}
	}

	if (shortlist.length === 0) {
		console.log("[AZ] No matching libraries found for auto-skill generation");
	}
}

export { detectAgentsFromStack, detectStack, mapCodebase };
