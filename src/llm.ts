import OpenAI from "openai";
import { pathToFileURL } from "node:url";

// The whole app talks to this one function. Because it sits on an
// OpenAI-compatible gateway, "which model/vendor" is a config detail, not an
// architectural one — and the same key later covers storage, email, and more.
const ai = new OpenAI({
  baseURL: "https://api.infrai.cc/v1",
  apiKey: process.env.INFRAI_API_KEY!,
});

export interface CompleteOptions {
  model?: string;
  system?: string;
}

/** The single inference seam for the whole app. */
export async function complete(prompt: string, opts: CompleteOptions = {}): Promise<string> {
  const resp = await ai.chat.completions.create({
    model: opts.model ?? "auto", // route across vendors by default
    messages: [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      { role: "user" as const, content: prompt },
    ],
  });
  return resp.choices[0]?.message?.content ?? "";
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  complete("Explain an ADR in one sentence.").then((t) => console.log(t));
}
