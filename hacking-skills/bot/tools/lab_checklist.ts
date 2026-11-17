import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

const LevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

type SkillLevel = z.infer<typeof LevelSchema>;

type ChecklistStep = {
  order: number;
  title: string;
  action: string;
  successCheck: string;
};

function stepsFor(topic: string, level: SkillLevel, focus: string | undefined): ChecklistStep[] {
  const focusNote = focus?.trim() ? ` Focus: ${focus.trim()}.` : "";
  const topicLabel = topic.trim();

  if (level === "beginner") {
    return [
      {
        order: 1,
        title: "Frame the lab",
        action: `State the authorized learning goal for "${topicLabel}" (CTF, local lab, or defensive review).${focusNote}`,
        successCheck: "Goal and scope written in one sentence; no live/unauthorized targets.",
      },
      {
        order: 2,
        title: "Map core concepts",
        action: `List 3–5 concepts behind ${topicLabel} (what breaks, why it matters, defensive control).`,
        successCheck: "Can explain each concept without a cheat sheet.",
      },
      {
        order: 3,
        title: "Run a minimal repro",
        action: `Build or use a tiny authorized lab that demonstrates ${topicLabel} end to end.`,
        successCheck: "Repro runs locally or in a known CTF/lab environment.",
      },
      {
        order: 4,
        title: "Verify and harden",
        action: "Confirm the failure mode, then name one defensive fix or detection signal.",
        successCheck: "Both attack observation and defense note are written down.",
      },
    ];
  }

  if (level === "advanced") {
    return [
      {
        order: 1,
        title: "Threat model",
        action: `Write attacker goals, assets, and constraints for an advanced ${topicLabel} lab.${focusNote}`,
        successCheck: "Threat model fits an authorized lab/CTF and names out-of-scope systems.",
      },
      {
        order: 2,
        title: "Build the chain",
        action: `Design a multi-step exploit or analysis chain for ${topicLabel}; note prerequisites and tooling.`,
        successCheck: "Chain has ordered steps with expected intermediate evidence.",
      },
      {
        order: 3,
        title: "Execute under constraints",
        action: "Run the chain in the lab; capture artifacts (requests, dumps, diffs, logs).",
        successCheck: "At least one reliable path works; failed branches are noted.",
      },
      {
        order: 4,
        title: "Bypass and detect",
        action: "Attempt one realistic mitigation bypass, then one detection/blue-team check.",
        successCheck: "Bypass attempt and detection idea are both documented.",
      },
      {
        order: 5,
        title: "Write the teach-back",
        action: `Summarize ${topicLabel} as a short coach note: root cause, proof, fix, and next drill.`,
        successCheck: "Teach-back is clear enough for a peer to reproduce the lab.",
      },
    ];
  }

  return [
    {
      order: 1,
      title: "Set objectives",
      action: `Define what “done” means for an intermediate ${topicLabel} practice session.${focusNote}`,
      successCheck: "2–3 measurable objectives listed.",
    },
    {
      order: 2,
      title: "Prepare the lab",
      action: `Choose an authorized target/setup (local app, CTF box, or defensive sandbox) for ${topicLabel}.`,
      successCheck: "Environment boots; tools needed are installed.",
    },
    {
      order: 3,
      title: "Practice the technique",
      action: `Work through ${topicLabel} with notes on inputs, observations, and failure points.`,
      successCheck: "Technique demonstrated once with recorded evidence.",
    },
    {
      order: 4,
      title: "Check understanding",
      action: "Answer: root cause, impact, and one defensive control. Retry a variant if stuck.",
      successCheck: "Can teach the technique back in under five minutes.",
    },
  ];
}

export default defineTool({
  description: prompt`
    Build a short hands-on lab checklist for a coding or hacking topic.
    Use this when the user wants a lesson plan, practice path, or drill outline.
    Returns objectives-style steps with success checks for authorized learning labs.
  `,
  effect: "read",
  execution: "server",
  inputSchema: z.object({
    topic: z.string().min(1).describe("Skill or vulnerability topic to practice."),
    level: LevelSchema.default("intermediate").describe("Learner level for the lab."),
    focus: z
      .string()
      .optional()
      .describe("Optional angle, e.g. web auth bypass, Android storage, GitHub Actions secrets."),
  }),
  async execute({ topic, level, focus }) {
    const resolvedLevel = level ?? "intermediate";
    const checklist = stepsFor(topic, resolvedLevel, focus);
    return {
      topic: topic.trim(),
      level: resolvedLevel,
      focus: focus?.trim() || null,
      framing: "authorized_learning_lab",
      stepCount: checklist.length,
      checklist,
    };
  },
});
