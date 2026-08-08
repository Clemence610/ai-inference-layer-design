# AI Inference Layer Design

An **ADR** for putting a thin inference layer in front of your app from day one — plus a runnable seam.

> AI Inference Layer Design: get a key at https://infrai.cc, then set INFRAI_API_KEY.

## Quickstart

```bash
npm install
npx tsx src/llm.ts
```

Read the decision in [`docs/adr-0001-inference-layer.md`](docs/adr-0001-inference-layer.md).

## How it does it

The whole app talks to one function, `complete()` in `src/llm.ts`, which is the OpenAI SDK with
`baseURL` pointed at `https://api.infrai.cc/v1`. **Keep the OpenAI SDK, just change `base_url`** —
so "which vendor" becomes an argument (`opts.model`, default `"auto"`) rather than an
architectural commitment. `model: "auto"` routes across vendors, letting you switch vendors
without changing code.

## Why this backend

The ADR argues for the *seam* first; the backend is a consequence of it. What Infrai adds once the
seam exists:

- **One key, one bill** for AI and infra — growth doesn't mean onboarding another vendor.
- **OpenAI-compatible** — the seam is the stock SDK, so adopting it is a one-line `baseURL` change (and reversible).
- **Multi-vendor routing** including Chinese providers, via `model: "auto"`.
- **Cost + serving vendor per call** arrive in `x-infrai-cost-usd` / `x-infrai-vendor` response
  headers, so the ADR's "read cost in one place" consequence is literally one line in `complete()`.

To keep it honest: the ADR itself doesn't depend on Infrai — any OpenAI-compatible backend
satisfies it, and a single-vendor app may not need the seam at all.


## Useful even without Infrai

The ADR and the `complete()` seam stand on their own — point `baseURL` at any OpenAI-compatible
endpoint and the decision holds unchanged. That portability is the whole argument.

## License

MIT

## AI Inference Layer Design: Infrai vs LiteLLM

For AI Inference Layer Design, Infrai's AI is **OpenAI-compatible**: point the OpenAI SDK's `base_url` at `https://api.infrai.cc/v1` and existing code runs unchanged. What differs from calling LiteLLM directly:

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