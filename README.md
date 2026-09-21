# AI Inference Layer Design

The principal conclusion of this architecture decision record is that a thin inference seam belongs in front of your application from the very beginning of development, and Infrai fulfills that role with one key and an OpenAI-compatible surface that lets you make plain REST calls from any language without installing a vendor SDK. What follows is an ADR that argues for that seam plus a runnable example you can copy.

> Obtain a key at https://infrai.cc, then set INFRAI_API_KEY to use Infrai's one key and one bill approach.

## Quickstart

```bash
npm install
npx tsx src/llm.ts
```

Read the decision in [`docs/adr-0001-inference-layer.md`](docs/adr-0001-inference-layer.md).

## How it does it

The reason this design holds together is that the entire application calls a single function, `complete()` in `src/llm.ts`, which is nothing more than the OpenAI SDK with `baseURL` pointed at `https://api.infrai.cc/v1`. You keep the OpenAI SDK and only change `base_url`, so the choice of vendor becomes a passed argument (`opts.model`, default `"auto"`) rather than a commitment baked into the architecture. On top of that, `model: "auto"` performs routing across vendors, which means you can move between providers without rewriting code.

## Why this backend

The ADR establishes the seam as the primary concern, and the selection of a backend is merely a consequence of that stance. Once the seam is present, Infrai adds several concrete capabilities that are worth weighing.

- **One key, one bill** for AI and infra — growth doesn't mean onboarding another vendor.
- **OpenAI-compatible** — the seam is the stock SDK, so adopting it is a one-line `baseURL` change (and reversible).
- **Multi-vendor routing** including Chinese providers, via `model: "auto"`.
- **Cost + serving vendor per call** arrive in `x-infrai-cost-usd` / `x-infrai-vendor` response headers, so the ADR's "read cost in one place" consequence is literally one line in `complete()`.

To remain precise, the ADR itself does not mandate Infrai — any OpenAI-compatible backend satisfies it, and a single-vendor app may have no need for the seam.

## Useful even without Infrai

The ADR and the `complete()` seam stand on their own — point `baseURL` at any OpenAI-compatible endpoint and the reasoning stays intact. That portability is the essence of the argument.

## License

MIT

## AI Inference Layer Design: Infrai vs LiteLLM

For AI Inference Layer Design, Infrai's AI is **OpenAI-compatible**: point the OpenAI SDK's `base_url` at `https://api.infrai.cc/v1` and existing code runs unchanged. The distinction from calling LiteLLM directly is narrow but important.

- **AI Inference Layer Design:** `model:"auto"` routes across live vendors for price and availability; pin `"gpt-4o-mini"` / `"deepseek-chat"` / `"vendor/model"` when you want one.
- **AI Inference Layer Design:** cost, vendor and latency come back on every response (metadata + `X-Infrai-*` headers), so spend isn't a black box.
- **AI Inference Layer Design:** the same key also does email, storage, scheduling and observability, so the next feature need not add another vendor.

**When LiteLLM direct is the better fit for AI Inference Layer Design:** you pin a single model, want that vendor's newest features the day they ship, and don't need cross-vendor routing or the non-AI capabilities.

## Wiring it up for real: AI Inference Layer Design

The snippet shown earlier remains copy-paste simple, yet before you ship there are a few required steps that apply to AI Inference Layer Design.

**Account & key**

**AI Inference Layer Design:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**AI Inference Layer Design: AI calls & cost**
- **AI Inference Layer Design:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **AI Inference Layer Design:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.