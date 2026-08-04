---
layout: post
title: "Shipping a Custom GPT: Eight Real Failures From Making 'Toddler Classes Near Fishtown' Work"
comments: true
author: brandon
image: assets/images/gpt-editor-configure.png
categories: [development, ai, gpt, llm, api]
featured: true
excerpt: We ship a custom ChatGPT GPT for our Philly family-activities site. One of its own suggested prompts returned results 20 miles away. Here's every failure we found fixing it — provable from our request logs — and why the fix almost always belongs in the API, not the prompt.
---

We run [tinyjawns](https://tinyjawns.com?utm_source=blog&utm_medium=post&utm_campaign=gpt_lessons), a family-activities site for Philadelphia — events, kids classes, camps, and birthday party venues, curated and freshness-checked. Alongside the site we ship a custom ChatGPT GPT, **TinyJawns — Philly Kid Planner**, backed by a small GPT Actions API. One of its own suggested conversation starters is *"Toddler classes near Fishtown."*

Last week I typed that exact prompt into our own GPT. It answered with a gymnastics class in **King of Prussia** — a suburb twenty miles from Fishtown — and treated the whole exchange as one-shot Q&A: four results, no mention that anything else existed, no way to narrow, conversation over.

This post is the story of fixing that. Every failure below is real, and most of them we could prove from our own request logs. The unifying lesson up front: **a custom GPT is a distributed system where one component — the model — only sometimes follows the spec.** Everything you can move out of the prompt and into the API, you should.

![The GPT editor Configure tab, with the conversation starter we were failing]({{ site.baseurl }}/assets/images/gpt-editor-configure.png)

## Failure 1: Our neighborhood resolution had been silently broken. Forever.

The API resolves free text like "fishtown" to a neighborhood ID via Postgres functions. Two of them joined a `neighborhood_aliases` table that... didn't exist anymore. Every call errored. And the calling code did this:

```ts
const { data: exactMatch } = await supabase.rpc('resolve_neighborhood', {...});
// error silently discarded — data is just null
```

So every neighborhood-filtered search on the entire site had been quietly degrading to metro-wide. No exceptions, no failing tests — just "near Fishtown" returning the suburbs, forever.

**Lesson:** destructure the `error`, always. A silently-null RPC result is indistinguishable from "no match," and "no match" always has a plausible cover story.

## Failure 2: The model follows your retry instructions... sometimes

Our GPT instructions said: *when a neighborhood search comes up empty and you broaden, pass `area=philly` so you don't surface suburbs.* Reasonable. Did the model comply? Our request log for two near-identical sessions, minutes apart:

```
18:47:48  {type: class, neighborhood: null, area: "philly"}   ← complied
19:07:23  {type: class, neighborhood: null, area: null}       ← King of Prussia
```

Same instructions, coin-flip compliance. You cannot ship a coin flip.

**The fix:** we moved the broadening server-side. When a matched neighborhood has nothing good, the *API* re-runs the search pinned to the neighborhood's side of the city line and returns those results with a `notice` field plus `location.broadened: true`. One round trip, zero prompt-compliance risk. The instructions now just say: relay the notice.

**Lesson:** prompt rules are suggestions; response payloads are law. Any policy the endpoint has enough context to enforce, enforce in the endpoint.

## Failure 3: Relative relevance ranking collapses on small pools

Our relevance tiering marked results "on-theme" when they scored within a delta of the *top* result — a relative cliff that works great on a city-wide candidate pool. Then we searched **"swim lessons near Fishtown."** The only classes near Fishtown are four pottery classes. Guess what came back marked on-theme?

All four. They were the top-scoring cluster because they were the *only* cluster.

**The fix:** constrained pools need an absolute bar too. Before trusting a neighborhood's results, at least one has to clear the score floor that a genuinely relevant match clears easily. Below that, broaden. We also log the winning pool's top score on every request now, so the bar is tunable from data instead of vibes.

## Failure 4: "Results" aren't results if they're all the same provider

Fixed Fishtown, searched again — got four results! ...which were four class listings from one pottery studio. The root cause was a data-shape gap: most class listings have no vendor attached. Their provider is the **venue that hosts them**, and our search SQL didn't return it — the venue column was literally `NULL::text`.

**The fix:** return the provider identity, then fill the page diversity-first — max two results per provider, backfilling from the overflow only when nothing else exists. And when a neighborhood pool is all one provider, top it up with the closest on-theme options from elsewhere in the city, locals first, with an honest note:

> "Only 3 options in or next to Fishtown — the rest are the closest from other city neighborhoods."

**Lesson:** the model can only present the variety your API hands it. Dedup and diversity are retrieval concerns, not prompting concerns.

## Failure 5: The model narrated our implementation details

Once adjacency-aware search shipped, the GPT started saying things like:

> "They're all in nearby Olde Kensington, which the search treats as adjacent to Fishtown."

Technically true! Also, nobody talks like that. Two rules fixed it. First: user-facing strings in API responses (like `notice`) contain **zero directives to the model** — they get relayed verbatim, so they must read like finished copy. Second: the instructions now demand neighbor-style phrasing ("just over in Olde Kensington") and ban any mention of adjacency, radius, or matching. The parent asked where to take their kid, not how the tool thinks.

## Failure 6: A single-prompt workflow, because we gave the model nothing to guide with

This was the failure that motivated the final round: the GPT showed 3–4 results and stopped dead. No "there are 35 more," no "want just the free ones?", no paging.

Of course it did. Our response envelope was:

```json
{ "results": [...], "result_count": 5 }
```

The model cannot say "there's more" when the API doesn't tell it more exists. OpenAI's Actions guidance says to return raw data and let the model narrate — but raw data has to include *navigation state*. Now the envelope carries:

```json
{
  "results": ["...5 items..."],
  "total_matched": 40,
  "more_available": 35,
  "refine": {
    "neighborhoods": { "Fishtown": 3, "Media": 4, "Queen Village": 4 },
    "price_range": [14, 185],
    "free_count": 6
  }
}
```

That `refine` block is computed from the actual unshown pool — so when the GPT offers "want me to cap the price, or just the free ones?", those cuts are real, not hallucinated. A new `offset` parameter handles "show me more" (with a note in the spec that ranking is live, so pages can shift slightly — the model dedupes by name).

## Failure 7: Behavioral advice gets ignored; format contracts get followed

With the metadata in place we wrote a nice instructions section: *"every reply that shows results ends with one concrete next step..."* Our eval suite — which simulates the GPT against the real API and has a judge model grade the replies — failed it immediately:

> judge: The assistant did not mention that more options exist... only provided a vague offer to help.

The rewrite that passed reframed the same rule as a **required reply element**:

> REQUIRED closing line: every reply that shows search results MUST end with a "next step" line built from the response metadata. This is part of the reply format, same as images and links — a reply without it is incomplete. ... A bare "let me know if you'd like more options" NEVER satisfies this — the line must contain the real number and at least one specific filter.

**Lesson:** models treat output-format requirements as contracts and behavioral prose as mood lighting. If you need a behavior every time, make it a format element — and write an eval scenario that fails without it.

## Failure 8: The GPT builder is a deploy target, and ours had drifted

While grabbing screenshots for this post we found one more gap, live in production: the builder's Actions panel showed only three operations. Our picks endpoint — added weeks ago, and referenced by the live instructions — **wasn't in the imported schema at all.** The instructions were telling the model to lead with a tool it didn't have.

![The Actions panel in the GPT editor — three operations, one missing]({{ site.baseurl }}/assets/images/gpt-editor-actions.png)

The builder's Instructions box and Actions schema are manual pastes and imports. They do not sync from your repo. Ours had drifted in both directions: instructions newer than the schema, schema older than the API.

**Lesson:** treat the builder like a deploy target with a release checklist — re-paste instructions AND re-import the schema on anything that touches either — and keep the source of truth in the repo (a versioned instructions doc plus a served `openapi.json`).

![The expanded Instructions modal — the "before" instructions we've since replaced]({{ site.baseurl }}/assets/images/gpt-editor-instructions.png)

## What I'd tell you to steal

1. **Log every Action request server-side, with the model's chosen params.** Half these diagnoses came from our request log showing what the model *actually* sent, not what we assumed.
2. **Server-side policy beats prompt policy** wherever the API has enough context: broadening, geographic scoping, diversity, pagination.
3. **Put navigation state in the envelope** — totals, more-available counts, real facets. A GPT can't guide a conversation about data it can't see.
4. **User-facing strings in responses must be finished copy** — the model relays them verbatim.
5. **Format contracts over behavioral advice** in instructions, with eval scenarios that fail when the behavior is missing.
6. **A/B your prompt evals against the old prompt on the same data.** Judge-model flakiness is real; only trust a failure that reproduces.
7. **The builder drifts.** Checklist it.

The end state: "Toddler classes near Fishtown" now answers with the classes that actually exist next door, honestly labeled, from more than one provider, with "there are N more — want just the free ones?" at the bottom. Which is all the parent ever wanted.

---

*If you're a Philly-area parent (or you know one): this all exists so you don't have to do the research. [tinyjawns.com](https://tinyjawns.com?utm_source=blog&utm_medium=post&utm_campaign=gpt_lessons) has hundreds of curated, freshness-checked things to do with kids around Philadelphia — searchable by neighborhood, age, and price — from free storytimes to birthday party venues that actually answer. The **TinyJawns — Philly Kid Planner** GPT puts all of it inside ChatGPT: ask it what's happening this weekend and it'll even check the weather first. Go find your kid's new favorite thing.*
