import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Builds a lab checklist for an educational XSS practice topic.",
  async test(t) {
    await t.send(
      'Use the lab_checklist tool to outline an intermediate lab on reflected XSS for authorized CTF practice.',
    );
    t.succeeded();
    t.calledTool("lab_checklist");
  },
});
