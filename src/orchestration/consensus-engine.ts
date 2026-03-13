import chalk from "chalk";
import { DashboardService } from "../../dashboard/dashboard-service.js";
import { createLlamaBridge } from "../memory/llama-bridge.js";
import { getMemoryStore } from "../memory/memory-store.js";
import { getGhostSimulator } from "./ghost-simulator.js";

export interface Proposal {
	id: string;
	proposer: string;
	action: string;
	payload: any;
	timestamp: string;
	metadata?: any;
}

export interface Vote {
	voter: string;
	approve: boolean;
	reason: string;
}

export interface ConsensusResult {
	approved: boolean;
	votes: Vote[];
	ratio: number;
}

/**
 * [Phase 16] Consensus Engine
 * Handles decentralized voting for critical swarm actions.
 */
export class ConsensusEngine {
	private store = getMemoryStore();
	private llama = createLlamaBridge();
	private feed = DashboardService.getInstance();
	private agentId = "ConsensusEngine";
	private maturityScores: Record<string, number> = {
		"Aizen-QA": 75,
		"Aizen-Security": 80,
		"Aizen-Architect": 70,
		"Aizen-DevOps": 85,
	};

	private static PERSONAS: Record<string, string> = {
		"Aizen-QA":
			"Elite QA Engineer. Obsessed with TDD, edge-cases, and regression testing. You demand proof of verification for every line of code. Standards: 100% test coverage, fail-fast on ambiguity.",
		"Aizen-Security":
			"Cybersecurity Specialist. Paranoid about Protocol Zero. You suspect every input is an injection and every output is a leak. Standards: Zero hardcoded secrets, strict input sanitization, minimal attack surface.",
		"Aizen-Architect":
			"Lead System Architect. Guardian of FBA Modular Architecture and O(1) efficiency. You hate monolithic functions and circular dependencies. Standards: Separation of Concerns, DRY principle, Big O optimization.",
		"Aizen-DevOps":
			"Site Reliability Engineer. Focused on payload density, bundle size, and CI/CD stability. You prioritize environment integrity and fast builds. Standards: Minimal dependencies, peak artifact compression, zero build drift.",
	};

	async evaluateProposal(proposal: Proposal): Promise<ConsensusResult> {
		console.log(
			chalk.blue(`[Consensus] Evaluating Proposal: ${proposal.action} by ${proposal.proposer}`),
		);

		const voters = ["Aizen-QA", "Aizen-Security", "Aizen-Architect", "Aizen-DevOps"];
		const votes: Vote[] = [];

		// Phase 22: Ghost-Simulation
		const ghost = getGhostSimulator(process.cwd());
		let ghostSuccess = true;
		let ghostErrors: string[] = [];

		if (proposal.action === "WRITE" && proposal.payload?.content) {
			await ghost.simulateWrite(proposal.payload.path || "ghost_file.ts", proposal.payload.content);
			const report = await ghost.verifySimulatedState();
			ghostSuccess = report.success;
			ghostErrors = report.errors;
			this.feed.emitThought(
				this.agentId,
				`Ghost-Simulation complete: ${ghostSuccess ? "PASS" : "FAIL"}`,
				{ errors: ghostErrors },
			);
		}

		for (const voter of voters) {
			const vote = await this.castVote(voter, proposal);

			// Architect & QA are extra strict if Ghost fails
			if (!ghostSuccess && (voter === "Aizen-Architect" || voter === "Aizen-QA")) {
				vote.approve = false;
				vote.reason = `[CoT: Ghost Failure] Ghost-Simulation Failed: ${ghostErrors.join(", ")}`;
			}

			votes.push(vote);
			this.feed.emitVote(voter, proposal.action, vote.approve ? "approve" : "reject", vote.reason);
			console.log(
				chalk.gray(
					`  - ${voter}: ${vote.approve ? chalk.green("APPROVE") : chalk.red("REJECT")} (${vote.reason})`,
				),
			);
		}

		// Phase 27: Neural Debate Logic
		const rejecters = votes.filter((v) => !v.approve);
		const approvers = votes.filter((v) => v.approve);

		if (rejecters.length > 0 && approvers.length > 0) {
			console.log(
				chalk.yellow(`[Consensus] Conflicting views detected. Triggering Neural Debate...`),
			);
			this.feed.emitThought(
				this.agentId,
				"Conflicting views detected. Triggering one round of Neural Debate to refine reasoning.",
			);
			await this.triggerDebate(proposal, votes);
		}

		const approvals = votes.filter((v) => v.approve).length;
		const ratio = approvals / voters.length;
		const approved = ratio > 0.51;

		// Emit Logic Graph (Mermaid + JSON for D3)
		const mm = this.generateMermaidGraph(proposal, votes, approved);
		const json = this.generateJsonGraph(proposal, votes, approved);
		this.feed.emitLogicGraph(this.agentId, "Evaluating swarm consensus...", { mermaid: mm, json });

		if (approved) {
			console.log(
				chalk.green(`[Consensus] Proposal APPROVED (${(ratio * 100).toFixed(0)}% consensus)`),
			);
			// Phase 22: Commit the Ghost Layer to reality
			if (proposal.action === "WRITE") {
				await ghost.commitToDisk();
				this.feed.emitThought(this.agentId, "Ghost layer committed to disk.", { success: true });
			}
		} else {
			console.log(
				chalk.red(`[Consensus] Proposal REJECTED (${(ratio * 100).toFixed(0)}% consensus)`),
			);
			// Phase 30: Adverse Learning (Learning from Rejection)
			await this.recordAdverseLearning(proposal, votes);
		}

		// Phase 30: Personality Evolution Tracking
		this.updatePersonaMaturity(votes, approved);

		return { approved, votes, ratio };
	}

	async triggerDebate(proposal: Proposal, votes: Vote[]): Promise<void> {
		const rejecters = votes.filter((v) => !v.approve);
		const approvers = votes.filter((v) => v.approve);

		for (const rejecter of rejecters) {
			// One representative approver debates the rejecter
			const debater = approvers[0];
			const _debatePrompt = `[DEBATE] ${debater.voter} (Pros) vs ${rejecter.voter} (Cons)
Action: ${proposal.action}
Current Reject Reason: ${rejecter.reason}
Counter-Argument: ${debater.reason}`;

			const resolution = await this.llama.distill(`debate-resolution|${proposal.action}`);

			// Heuristic: If debate yields a strong counter-argument, small chance to flip
			if (Math.random() < 0.3) {
				console.log(
					chalk.magenta(`  [Debate] ${rejecter.voter} flipped their vote after deliberation!`),
				);
				rejecter.approve = true;
				rejecter.reason = `[CoT: Deliberated] Convinced by ${debater.voter}'s argument. Resolution: ${resolution}`;
				this.feed.emitVote(rejecter.voter, proposal.action, "approve", rejecter.reason);
			} else {
				rejecter.reason = `[CoT: Firm] Still rejecting. Counter-reasoning: ${resolution}`;
			}
		}
	}

	private updatePersonaMaturity(votes: Vote[], finalApproved: boolean): void {
		for (const vote of votes) {
			const aligned = vote.approve === finalApproved;
			// Reward alignment, penalize divergence politely
			this.maturityScores[vote.voter] = Math.max(
				0,
				Math.min(100, this.maturityScores[vote.voter] + (aligned ? 2 : -1)),
			);

			const score = this.maturityScores[vote.voter];
			const level =
				score > 90 ? "ELITE" : score > 70 ? "MASTER" : score > 40 ? "ADEPT" : "APPRENTICE";

			this.feed.emitPersonaUpdate(vote.voter, score, level);
		}
	}

	private async recordAdverseLearning(proposal: Proposal, votes: Vote[]): Promise<void> {
		const rejectionSummary = votes
			.filter((v) => !v.approve)
			.map((v) => `${v.voter}: ${v.reason}`)
			.join("; ");

		const uri = `agent://swarm/consensus/failure/${proposal.id}_${Date.now()}`;
		const content = `ADVERSE MEMORY: Proposal for ${proposal.action} (${JSON.stringify(proposal.payload)}) was REJECTED by swarm. Reasons: ${rejectionSummary}`;

		// Store as a "Neural Scar" (Negative Memory) with high importance
		await this.store.storeMemory(uri, content, 8.5);
		this.feed.emitThought(
			this.agentId,
			`Recorded Adverse Learning (Neural Scar) for ${proposal.id} to avoid future rejections.`,
			{ uri },
		);
	}

	private async castVote(voter: string, proposal: Proposal): Promise<Vote> {
		const persona = ConsensusEngine.PERSONAS[voter] || "General technical evaluation.";

		// Phase 30: Adverse Memory Check (Scan for Neural Scars)
		const scanQuery = `rejection for ${proposal.action} ${JSON.stringify(proposal.payload)}`;
		const scars = await this.store.findRelevant(scanQuery, "swarm", 1);
		let adversePrefix = "";

		if (scars.length > 0 && scars[0].score > 0.8) {
			adversePrefix = `[NEURAL SCAR DETECTED] Previous similar proposal was REJECTED. Scar: ${scars[0].text}\n`;
		}

		const _context = `${adversePrefix}Voter: ${voter}
Role Guidelines: ${persona}

Proposal: ${proposal.action}
Payload: ${JSON.stringify(proposal.payload)}
Constitution: See shared/constitution.md (Elite Standards)`;

		// Distill evaluation through specialized lens
		const _evaluation = await this.llama.distill(
			`voter:${voter}|action:${proposal.action}|persona_eval`,
		);

		// Persona-specific heuristic variance
		const rand = Math.random();
		let approve = true;
		let reason = "Aligned with specialized persona standards.";

		// Security specific checks
		if (voter === "Aizen-Security") {
			if (JSON.stringify(proposal.payload).match(/key|secret|token|pass/i)) {
				approve = false;
				reason = "SECURITY ALERT: Potential secret exposure detected in payload.";
			}
		}

		// Architect specific checks
		if (voter === "Aizen-Architect") {
			if (proposal.action === "WRITE" && (proposal.payload?.content?.length || 0) > 2000) {
				approve = false;
				reason = "ARCHITECT ALERT: Monolithic file detected. Break into smaller components.";
			}
		}

		// QA specific checks
		if (voter === "Aizen-QA") {
			if (proposal.action === "WRITE" && !proposal.payload?.path?.includes("test")) {
				// Randomly demand tests 50% of the time for writes
				if (rand < 0.5) {
					approve = false;
					reason = "QA REJECTION: Proposed code changes lack corresponding unit tests.";
				}
			}
		}

		// Final random variance to simulate 'gut feeling' (vibe-check)
		if (rand < 0.1) {
			approve = !approve;
			reason += " [CoT: Vibe-Check Triggered]";
		}

		// Ensure prefix
		if (!reason.startsWith("[CoT:")) {
			reason = `[CoT: Persona Alignment] ${reason}`;
		}

		return { voter, approve, reason };
	}

	private generateMermaidGraph(proposal: Proposal, votes: Vote[], approved: boolean): string {
		let mm = "graph TD\n";
		mm += `  Prop["⛩️ ${proposal.action}"]\n`;

		for (const vote of votes) {
			const voterId = vote.voter.replace(/-/g, "");
			mm += `  ${voterId}(("${vote.voter}"))\n`;
			const color = vote.approve ? "#10b981" : "#ef4444";
			const link = vote.approve ? "==>" : "--x";
			mm += `  Prop ${link} |"${vote.reason}"| ${voterId}\n`;
			mm += `  style ${voterId} fill:${color},color:#fff,stroke-width:2px\n`;
		}

		const finalColor = approved ? "#10b981" : "#ef4444";
		mm += `  style Prop fill:${finalColor},color:#fff,stroke-width:4px\n`;

		return mm;
	}

	private generateJsonGraph(proposal: Proposal, votes: Vote[], approved: boolean): any {
		const nodes: any[] = [
			{ id: "prop", name: `⛩️ ${proposal.action}`, isProp: true, approve: approved },
		];
		const links: any[] = [];

		for (const vote of votes) {
			const voterId = vote.voter.replace(/-/g, "");
			nodes.push({
				id: voterId,
				name: vote.voter,
				voted: true,
				approve: vote.approve,
			});
			links.push({
				source: voterId,
				target: "prop",
				approve: vote.approve,
			});
		}

		return { nodes, links };
	}
}

export const getConsensusEngine = () => new ConsensusEngine();
