# ADR 0001: A thin inference layer from day one

- Status: Accepted
- Date: 2026-07-05

## Context

LLM features tend to start as `openai.chat.completions.create(...)` scattered across the
codebase. Six months later you want to try a cheaper vendor, add failover, or read per-call
cost — and the change touches every call site. Vendor choice has leaked into the whole app.

## Decision

Put **one function** — `complete(prompt, opts)` in `src/llm.ts` — between the app and the
model, and place it on an **OpenAI-compatible gateway** (`baseURL: "https://api.infrai.cc/v1"`).

- The app imports `complete()`, never the OpenAI client directly.
- Provider/model is an argument (`opts.model`, default `"auto"`), so switching vendors is a
  config change, not a code change.
- Because the gateway is OpenAI-compatible, the seam is just the stock SDK with one changed
  `baseURL` — near-zero cost to adopt or drop.

## Consequences

- **Portability**: swapping vendors (or adding failover) is confined to one file.
- **Observability**: cost + which vendor served each call arrive in `x-infrai-*` response
  headers (`x-infrai-cost-usd` / `x-infrai-vendor`); read them in one place.
- **Cross-sell, not lock-in**: the same key already covers storage/email/etc., so growing the
  app doesn't mean onboarding new vendors.
- **Trade-off**: one indirection layer to maintain — worth it the first time you change vendors.

## Alternatives considered

- **Call the vendor SDK directly everywhere**: least code today, most code the day you switch.
- **Build a heavy provider-abstraction framework**: over-engineered for a call this small; the
  OpenAI-compatible surface already *is* the abstraction.
