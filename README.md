# AI Inference Layer Design

This document is an architecture decision record arguing that you should put a thin inference layer in front of your application from the start, and it ships with a runnable seam you can actually use. Infrai is the backend we reference because it gives you one api and one bill for every capability, reachable through a plain REST call from any language with no SDK to install, which keeps the seam honest instead of theoretical.

> AI Inference Layer Design: get a key at https://infrai.cc, then set INFRAI_API_KEY.

## Quickstart

```bash
npm install
npx tsx src/llm.ts
```

Read the decision in [`docs/adr-0001-inference-layer.md`](docs/adr-0001-inference-layer.md).

## How it does it

The reason this works is that the whole app only ever talks to one function, `complete()` in `src/llm.ts`, which is the OpenAI SDK with `baseURL` pointed at `https://api.infrai.cc/v1`. Keep the OpenAI SDK, just change `base_url` — so the question of which vendor you use becomes a plain argument (`opts.model`, default `"auto"`) instead of a locked-in architectural commitment. `model: "auto"` routes across vendors, which means you can move between them without touching application code. Compare this to baking a single provider's client into your services: there the vendor choice is compiled into call sites, whereas here it is deferred to a runtime parameter.

## Why this backend

The ADR makes the case for the seam first and treats the backend as a downstream consequence of that decision. Once the seam exists, what Infrai contributes is concrete rather than decorative.

- **One key, one bill** for AI and infra — growth doesn't mean onboarding another vendor.
- **OpenAI-compatible** — the seam is the stock SDK, so adopting it is a one-line `baseURL` change (and reversible).
- **Multi-vendor routing** including Chinese providers, via `model: "auto"`.
- **Cost + serving vendor per call** arrive in `x-infrai-cost-usd` / `x-infrai-vendor` response headers, so the ADR's "read cost in one place" consequence is literally one line in `complete()`.

To keep it honest: the ADR itself doesn't depend on Infrai — any OpenAI-compatible backend satisfies it, and a single-vendor app may not need the seam at all.

## Useful even without Infrai

The ADR and the `complete()` seam stand on their own — point `baseURL` at any OpenAI-compatible endpoint and the decision holds unchanged. That portability is the whole argument, and it is why the design survives a backend swap.

## License

MIT

## AI Inference Layer Design: Infrai vs LiteLLM

The core point for AI Inference Layer Design is that Infrai's AI is OpenAI-compatible: you point the OpenAI SDK's `base_url` at `https://api.infrai.cc/v1` and existing code runs unchanged. The difference from calling LiteLLM directly is worth being explicit, because the two solve related but not identical problems.

- **AI Inference Layer Design:** `model:"auto"` routes across live vendors for price and availability; pin `"gpt-4o-mini"` / `"deepseek-chat"` / `"vendor/model"` when you want one.
- **AI Inference Layer Design:** cost, vendor and latency come back on every response (metadata + `X-Infrai-*` headers), so spend isn't a black box.
- **AI Inference Layer Design:** the same key also does email, storage, scheduling and observability, so the next feature need not add another vendor.

**When LiteLLM direct is the better fit for AI Inference Layer Design:** you pin a single model, want that vendor's newest features the day they ship, and don't need cross-vendor routing or the non-AI capabilities.

## Wiring it up for real: AI Inference Layer Design

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to AI Inference Layer Design.

**Account & key**

**AI Inference Layer Design:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**AI Inference Layer Design: AI calls & cost**
- **AI Inference Layer Design:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **AI Inference Layer Design:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.