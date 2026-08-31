import { z } from "zod";
import type { OperationalFacts } from "./action-center";

const briefSchema = z.object({
  headline: z.string().min(1).max(120),
  summary: z.string().min(1).max(600),
  priorities: z.array(z.object({
    title: z.string().min(1).max(120),
    reason: z.string().min(1).max(300),
    evidence: z.string().min(1).max(240),
  })).max(5),
  uncertainty: z.string().min(1).max(300),
});

export type OperationalBrief = z.infer<typeof briefSchema>;

export function aiGatewayStatus() {
  const configured = Boolean(process.env.AI_PROVIDER_API_KEY && process.env.AI_MODEL);
  return {
    status: configured ? "CONNECTED" as const : "NOT_CONNECTED" as const,
    model: configured ? process.env.AI_MODEL : null,
    mode: "AGGREGATE_OPERATIONAL_FACTS_ONLY" as const,
    clinicalAutonomy: false,
  };
}

export async function generateOperationalBrief(facts: OperationalFacts): Promise<OperationalBrief> {
  const status = aiGatewayStatus();
  if (status.status !== "CONNECTED") throw new Error("AI gateway is not connected");
  const endpoint = `${process.env.AI_PROVIDER_BASE_URL ?? "https://api.openai.com/v1"}/responses`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_PROVIDER_API_KEY}` },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      instructions: "You are an operations assistant for an independent clinic. Use only the supplied aggregate facts. Never diagnose, prescribe, infer patient facts, or invent data. Separate facts from recommendations. Keep the brief short and action-oriented.",
      input: `Create the clinic operations brief for ${facts.date}. Aggregate facts: ${JSON.stringify(facts)}`,
      text: {
        format: {
          type: "json_schema",
          name: "clinic_operational_brief",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              headline: { type: "string" },
              summary: { type: "string" },
              priorities: { type: "array", maxItems: 5, items: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, reason: { type: "string" }, evidence: { type: "string" } }, required: ["title", "reason", "evidence"] } },
              uncertainty: { type: "string" },
            },
            required: ["headline", "summary", "priorities", "uncertainty"],
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const raw = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!raw) throw new Error("AI provider returned no structured output");
  return briefSchema.parse(JSON.parse(raw));
}
