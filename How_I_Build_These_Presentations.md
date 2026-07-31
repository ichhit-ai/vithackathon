# How These Presentations Are Made
### The complete method — philosophy, content system, and rendering engine, in one place

This document explains everything that went into building the Arrays,
DSA, and slidekit presentations: the teaching philosophy that makes the
content actually useful, and the technical system that makes the slides
look clean no matter how much content gets poured into them. It's written
so you (or an app, or a weaker model) could rebuild the whole thing from
scratch, on any subject, from this file alone.

---

## Part 1 — The Philosophy: Teach Thinking, Not Facts

Everything else in this document is in service of one rule:

> **Never state a fact without explaining the problem it solves.**

A slide deck that lists "Two Pointer: use two indices, O(n) time" has
taught nothing — it's a fact a reader will forget in a week, because they
never understood WHY it works or WHEN to reach for it. The entire method
below exists to force every concept through a fixed reasoning chain
before a single slide gets written.

### The 8-step checklist, run for every concept before writing content

1. **WHY does this exist?** What real problem was someone trying to
   solve? (Not "what does it do" — what NEEDED to be solved.)
2. **What would a learner try FIRST** (the naive/obvious approach), and
   specifically **why does that approach fall short** — too slow, too
   much memory, breaks on an edge case, doesn't generalize?
3. **What's the KEY INSIGHT** that fixes the naive approach's specific
   flaw? This is almost always "I was recomputing/rechecking something
   I already had the information to know."
4. **A concrete ANALOGY** from ordinary physical life — mailboxes on a
   street, a pile of plates, a checkout line, a road trip's odometer.
   Good analogies require no explanation of their own; if the analogy
   itself needs footnotes, throw it out and find a simpler one.
5. **RECOGNITION SIGNALS** — the specific words, phrasings, or
   situations that should make a learner think "this is that concept."
   ("sorted array" + "pair summing to target" → Two Pointer.)
6. **COMMON MISTAKES** — specific and mechanistic, never generic.
   "Off-by-one in the boundary condition when the shrink step should be
   a while-loop, not an if" is useful. "Being careless" is not.
7. **COST / COMPLEXITY / TRADE-OFF** — what do you pay for this benefit?
   Time, space, or something non-computational (a plant paying energy
   to build chloroplasts, a greedy algorithm paying "no formal proof of
   correctness" as its risk).
8. **5 QUESTIONS that prove understanding, not memorization.** A good
   test question can't be answered by pattern-matching a keyword — it
   requires walking through the "why" again. Bad: "What is Big-O?"
   Good: "Why does doubling the input roughly quadruple the runtime
   here?"

Skipping steps 2-3 is the single most common way a deck turns into a
boring reference sheet instead of something that builds understanding.
Almost every "aha" moment in the DSA decks came from explicitly writing
out "here's the naive approach, here's exactly what it wastes" before
ever naming the pattern that fixes it.

### Structuring a whole deck from this philosophy

1. Break the subject into **5–15 major sections**, ordered so each one
   only depends on concepts already introduced (never forward-reference
   something not yet covered — e.g. teach Recursion before Trees, Trees
   before Graphs, Sorting before Dynamic Programming).
2. Every section follows the same slide sequence (a template, not a
   rigid law — compress or expand as the concept warrants):
   - **Section divider** — big title + one-sentence tagline
   - **1–2 "why" slides** — why it exists, why brute force fails, the
     core intuition/analogy
   - **A worked example** — a code/pseudocode/ASCII-diagram slide, or a
     table of variations
   - **A callout slide** — recognition signals and/or common mistakes,
     as 2-4 colored boxes, mechanism explained, not just listed
   - **A complexity/takeaway slide** — cost, and a one-line bridge to
     the next section
   - **A checkpoint slide** — exactly 5 conceptual questions
3. Exactly one **title** slide opens the deck, exactly one **closing**
   slide ends it.
4. If the subject has cross-cutting signals that span sections, add a
   late **reference/recognition section**: one big lookup table mapping
   "signal in the problem" → "which concept applies." This ends up being
   the most re-read part of any deck — make it dense and scannable.
5. If there's a practice/next-steps phase, group practice items by
   CONCEPT (not raw difficulty), and give each one a clause explaining
   WHY it belongs there. Never list an item with no reasoning attached.

### Writing style rules that keep it readable

- Plain, direct language. No textbook throat-clearing ("It is important
  to note that...", "In this section we will...").
- Every sentence says something concrete — if a sentence could be
  deleted with no information lost, delete it.
- Bold the ONE most important sentence on a slide, not every sentence.
- Never write a bullet that's just a term with no explanation
  ("Time Complexity: O(n)" alone is not a bullet).
- Analogies come from ordinary physical experience, not from other
  technical domains that need their own explaining.

---

## Part 2 — The Technical System: How the Slides Actually Get Built

The content philosophy above is subject-matter work — it has to happen
regardless of tooling. The technical system below is what turns that
content into a clean, non-overflowing, consistently-styled `.pptx`, and
— critically — is what makes this reproducible by a WEAKER model, not
just by a careful human.

### The core idea: separate content from layout

A model asked to "build a PowerPoint" fails at layout math — text
overflow, inconsistent colors, uneven spacing, cramped tables. A model
asked to "fill in labeled fields with good teaching content, respecting
these character limits" is a much easier and more reliable task. So the
system is split into two halves that never touch each other's job:

```
 topic  --->  [content-generating LLM]  --->  deck JSON  --->  [renderer]  --->  .pptx
                     ^                                              |
                     |                                              v
              content prompt (Part 3)                   validator (catches bad
                                                           JSON before rendering)
```

The renderer is a Node.js script built on `pptxgenjs`. It knows **nine
slide shapes**, and nothing about any specific subject. Content is a
plain JSON file; the renderer iterates over an array of slide objects
and calls one builder function per type.

### The nine slide types

| Type | What it's for |
|---|---|
| `title` | Deck opener — eyebrow, big title, subtitle, description, footnote |
| `section` | Big colored divider slide marking the start of a new topic |
| `bullets` | The workhorse — plain explanation, up to ~6 bullets |
| `twocol` | Two side-by-side bullet lists (comparisons, before/after) |
| `callout` | 2–4 colored boxes (Think Like This / Common Trap / Interview Tip) |
| `table` | Structured reference data — up to ~10 rows before it should split |
| `code` | Monospace box for code, pseudocode, or ASCII diagrams |
| `checkpoint` | Colored recall-quiz slide, exactly 5 questions, closes a topic |
| `closing` | Deck closer — reinforces the core method one last time |

Each type has **soft limits** (bullet count, characters per item, table
rows, code lines) that the content-writer should respect, and the
renderer treats those limits as a *guideline it defends itself against*
rather than a wall — going slightly over triggers automatic font
shrinking rather than visible overflow. Going way over (20 bullets on
one slide) will still look bad; no renderer can rescue a fundamentally
overstuffed slide, so both halves have to do their job.

### Color as a second index, not decoration

Colors are assigned by **role name**, never by raw hex code, inside the
builder functions — `blue`, `purple`, `teal`, `orange`, `navy`, `red`,
each mapped to a `{ main, tint }` pair (a saturated color for headers/
accents, a pale tint for callout-box backgrounds). Roles get assigned
**per topic family**, consistently:

- `blue` — foundational/informational material
- `purple` — core reusable patterns/techniques
- `teal` — structures/algorithms
- `orange` — specialized/narrower techniques
- `navy` — meta/reference material (cheat sheets, recognition guides)
- `red` — almost exclusively used as a callout *tone* for traps/mistakes

This is what lets a 100+ slide deck stay navigable — a reader starts
unconsciously tracking "purple sections are patterns, teal sections are
structures" well before they could articulate the rule, purely from
repeated exposure. Re-skinning an entire deck for a different visual
identity is a one-object edit at the top of the renderer, since every
builder function only ever asks for a color by role.

### Overflow prevention — the actual engineering problem

The single hardest technical problem in this whole system is **text
overflow**: a slide box has a fixed height, but content length is
variable, especially when a weaker model writes it. Three defenses,
layered:

1. **Soft limits communicated to the content-writer** (Part 3) — bullet
   counts, character counts, table row counts, code line counts. This
   is the first and cheapest line of defense: most overflow is prevented
   before generation even happens, just by telling the model what fits.
2. **Validation before rendering** — a separate pass checks the JSON
   against those same limits and returns specific, actionable messages
   ("row 3 has 4 cells but header has 3", "12 bullets, recommended max
   6 — split into two slides"). This catches what the content-writer
   missed, with enough detail to re-prompt the model directly.
3. **Auto-shrinking fonts as a last-resort safety net** inside the
   renderer itself. For code/diagram slides specifically (the highest-
   risk slide type, since ASCII flowcharts run long): font size steps
   down in tiers as line count grows — normal size up to 20 lines,
   smaller from 20-26, smaller still beyond that, with a hard ceiling
   where excess lines are truncated rather than silently overflowing
   off the slide. The same tiered-shrink idea applies to bullets,
   two-column lists, and table rows.

This layered approach came directly out of real failures while building
these decks — an early version of a "master decision tree" ASCII diagram
slide (25 lines at a fixed font size) visibly ran off the bottom of the
slide in a rendered preview. The fix wasn't "write a shorter diagram" (it
needed to be that long to be complete) — it was adding the tiered
auto-shrink logic to the renderer, so long content degrades gracefully
instead of failing visibly. This is the kind of defense you only
discover by actually rendering and visually checking output, which is
why the QA loop below is part of the system, not an optional extra.

### The QA loop (do this every time, not just when something looks wrong)

1. Generate the deck JSON.
2. Run it through the validator — fix any hard errors before proceeding.
3. Render to `.pptx`.
4. Run a structural validator against the `.pptx` file itself (catches
   corrupt XML, broken relationships — things a JSON-level check can't
   see).
5. Convert to PDF, then to page images (`soffice --headless
   --convert-to pdf`, then `pdftoppm`).
6. Actually look at a representative sample of the rendered images —
   at minimum: the title slide, one of every slide type used, and any
   slide with unusually long content (longest code block, densest
   table, most-crowded callout). This step is what catches the overflow
   bugs that no amount of line-counting math fully guarantees, because
   real font-rendering/wrapping behavior has its own quirks.
7. Fix and re-render if anything looks cramped, cut off, or
   inconsistent. Repeat steps 3–6.

Skipping step 6 is the most common way a technically-valid deck still
ships looking sloppy — the validator can confirm the XML is well-formed
without confirming a human would enjoy reading it.

---

## Part 3 — The Content-Generation Prompt

This is the actual prompt to hand a content-generating LLM (including a
noticeably weaker one — it's written to over-specify rather than trust
judgment, since judgment is exactly what a weak model lacks). Pair it
with the slide-type reference from Part 2 and the JSON field names below.

```
You are generating the CONTENT for an educational slide deck. You do not
control layout, fonts, or colors — a separate renderer handles that. Your
only job is to fill in a JSON structure with good teaching content.

═══════════════════════════════════════════════════════════════
THE ONE RULE THAT MATTERS MOST: TEACH THINKING, NOT FACTS
═══════════════════════════════════════════════════════════════
Never state a technique, formula, or rule without first explaining the
problem it solves. A learner who finishes this deck should understand
WHY each idea exists, not just WHAT it says. If you cannot explain why
something is true or useful, do not include it as a bare fact — either
find the reason or leave it out.

For EVERY concept/technique/rule you introduce, work through this checklist
before writing any slide content:
  1. WHY does this exist? What problem was someone trying to solve?
  2. WHAT approach would a learner try FIRST (the naive/obvious one),
     and specifically WHY does that naive approach fall short (too slow,
     too much memory, doesn't generalize, breaks on an edge case)?
  3. What is the KEY INSIGHT that fixes the naive approach's flaw?
  4. What's a concrete ANALOGY from ordinary life that makes the insight
     click? (Not required for every slide, but use one whenever a natural
     fit exists — this is one of the highest-value teaching tools you have.)
  5. What are the RECOGNITION SIGNALS — specific words/phrases/situations
     that should make a learner think "this is that concept"?
  6. What MISTAKES do beginners predictably make with this concept?
     (Not generic mistakes — specific, mechanistic ones: "off-by-one in
     the boundary condition," not "being careless.")
  7. What is the cost/complexity/trade-off of using this concept?
  8. What 5 questions would prove someone actually understands this,
     not just memorized it? (A good test question can't be answered by
     pattern-matching a keyword — it requires reasoning through the "why.")

═══════════════════════════════════════════════════════════════
STRUCTURING THE WHOLE DECK
═══════════════════════════════════════════════════════════════
1. Break the subject into 5-15 major SECTIONS. Order them so each one
   only depends on concepts already covered by earlier sections — never
   forward-reference something not yet introduced.
2. Every section gets this exact slide sequence:
     a. ONE `section` divider slide (title + one-sentence tagline)
     b. ONE OR TWO `bullets` slides covering: why it exists, what breaks
        without it, and the core intuition/analogy
     c. (if relevant) ONE `code` slide showing a concrete worked example,
        OR a `table` slide of variations/sub-cases
     d. ONE `callout` slide (2-4 boxes) covering recognition signals
        and/or common mistakes — do not just list facts, explain the
        mechanism of the mistake
     e. ONE `bullets` slide stating complexity/cost and a "takeaway/
        transition to next topic" line, IF this concept has a
        cost/trade-off worth naming (skip for purely conceptual topics)
     f. ONE `checkpoint` slide with exactly 5 conceptual questions
   This is a TEMPLATE, not a rigid law — simple topics can compress steps
   b-e into fewer slides; rich topics can split step b into two slides.
   Never skip the section divider or the checkpoint.
3. The deck opens with exactly one `title` slide and closes with exactly
   one `closing` slide.
4. If the subject has cross-cutting patterns (recurring signals that span
   multiple sections), add a late section that is a REFERENCE/SUMMARY:
   a big lookup table mapping "signal in the problem" -> "which section's
   concept applies." This is usually the single most re-read part of the
   deck, so make it dense and scannable (table slides, not prose).
5. If there's a natural "practice" or "next steps" phase (problems to
   solve, exercises to do, real-world applications to try), add a final
   section with `table` slides grouping practice items by CONCEPT, not
   by raw difficulty — and for each item, write ONE clause explaining
   WHY it belongs to that concept. Never list an item with no reasoning
   attached.

═══════════════════════════════════════════════════════════════
WRITING STYLE RULES
═══════════════════════════════════════════════════════════════
- Write in plain, direct language. Avoid textbook throat-clearing
  ("It is important to note that...", "In this section we will..").
- Every sentence should say something concrete. Cut any sentence that
  could be deleted without losing information.
- Use analogies from everyday physical experience (roads, mailboxes,
  queues at a store, cooking, sports) — NOT analogies that require
  their own explanation.
- Bold the single most important sentence on a slide, not every sentence.
- Never write a bullet that's just a term with no explanation
  ("Time Complexity: O(n)" alone is not a bullet — explain what that
  means for THIS specific concept).
- Checkpoint questions must require explaining a WHY or a mechanism —
  never a question answerable by recalling a single memorized word.

═══════════════════════════════════════════════════════════════
HARD CONSTRAINTS (violating these breaks the renderer or the layout)
═══════════════════════════════════════════════════════════════
- Output ONLY valid JSON matching the schema. No markdown fences, no
  commentary, no trailing commas.
- Respect the soft limits (bullet counts, char counts, table rows, code
  lines — see Part 4) — going over degrades the slide, it does not
  crash the renderer, but staying within limits is what makes the deck
  "beautiful to read" rather than "technically valid."
- Assign a `color` role to every content slide, consistently per section.
- checkpoint slides: exactly 5 questions.
- table rows: every row must have the same number of cells as `headers`.

Subject: {{SUBJECT}}
Audience level: {{AUDIENCE}}
Target slide count: {{TARGET_COUNT}}

Output the full deck JSON now.
```

### Extra techniques for weak models specifically

- **Chunk large decks.** If the target slide count is large (60+), don't
  ask for the whole deck in one completion — quality degrades and JSON
  gets truncated. Instead: (1) ask for just a section list first (titles,
  taglines, color roles), (2) then one separate completion PER SECTION,
  giving it the full section list as context so it doesn't repeat
  earlier material. Merge the arrays yourself, add one `title` and one
  `closing`.
- **Validate immediately, per section**, not at the end. Regenerate just
  the flagged section on a hard error — never the whole deck.
- **A cheap self-critique pass catches most quality failures.** After a
  section is generated, ask the same model: "Review your slides above.
  Any bullet that states a rule without explaining why it's true? Any
  checkpoint question answerable with a single memorized word? Fix those,
  output the corrected JSON for this section only." This one extra round
  catches most "textbook facts dump" failures even in small models.
- **Watch for JSON escaping failures.** Code lines containing quotes or
  backslashes (Python, regex) are the single most common way weak models
  produce invalid JSON. If parsing fails, feed the exact parse error back
  to the model and ask it to fix just that section.

---

## Part 4 — The JSON Field Reference

Every slide is one object with a required `"type"`. A deck is
`{ "meta": { "footerName": "..." }, "slides": [ ... ] }`.

**`title`** (one per deck) — `eyebrow`, `title`, `subtitle`,
`description`, `footnote`.

**`section`** — `number`, `title`, `tagline`, `color` (role name).

**`bullets`** — `kicker`, `title`, `color`, `bullets` (array of strings
or `{ text, bold?, sub?, color? }` objects; `color: "sub"` is a special
muted-tone option for asides). **Soft limit: 6 items, ~220 chars each.**

**`twocol`** — `kicker`, `title`, `color`, `leftTitle`, `leftBullets`,
`rightTitle`, `rightBullets`. **Soft limit: 5 items per column, ~150
chars each.**

**`callout`** — `kicker`, `title`, `color`, `boxes` (array of
`{ label, tone, text }`, `tone` is a role name, conventionally `red` for
traps and `teal` for tips). **Soft limit: 4 boxes (hard limit — 5th+
dropped), ~300 chars each.**

**`table`** — `kicker`, `title`, `color`, `headers` (array), `rows`
(array of arrays, each same length as `headers`), optional `colWidths`.
**Soft limit: 10 rows** — split into "Part 1/Part 2" slides beyond that.

**`code`** — `kicker`, `title`, `color`, optional `desc`, `lines`
(array of strings — code, pseudocode, or ASCII diagrams). **Soft limit:
26 lines** (font auto-shrinks in tiers at 20 and 26 lines), **hard
limit: 34 lines** (beyond that, truncated).

**`checkpoint`** — `title`, `color`, `questions` (exactly 5, by
convention).

**`closing`** (one per deck) — `title`, `body`, `footnote`.

**Color roles:** `blue`, `purple`, `teal`, `orange`, `navy`, `red` —
each maps internally to a `{ main, tint }` hex pair. Assign consistently
per topic family (see Part 2's role guidance), not randomly.

---

## Part 5 — Putting It All Together, End to End

1. **Pick the subject and scope.** For anything beyond ~15-20 slides,
   plan sections before writing content — list them out, assign a color
   role to each, and check the ordering respects dependencies (nothing
   references a concept not yet introduced).
2. **Run every concept through the 8-step checklist (Part 1)** before
   writing a single slide. This is where the actual teaching quality
   comes from — the rendering system in Part 2 can't fix content that
   skipped this step.
3. **Write content as JSON matching the schema (Part 4)**, following the
   section slide-sequence template (Part 1) and the writing style rules.
4. **Validate the JSON** against the soft/hard limits — fix hard errors,
   note warnings.
5. **Render to `.pptx`.**
6. **Structurally validate the `.pptx` file itself**, then convert to
   images and actually look at a representative sample — title slide,
   one of each slide type, the longest/densest slides specifically.
7. **Fix anything that looks cramped, cut off, or inconsistent**, and
   re-render. Repeat until the sampled slides all look clean.
8. **Deliver the file** — don't over-explain it afterward; if the deck
   speaks for itself, a short summary of what it covers is enough.

That's the whole system: a fixed reasoning checklist that guarantees the
content teaches understanding instead of listing facts, and a layered,
self-defending rendering pipeline that guarantees the output looks clean
no matter how much (or how imperfectly-sized) content gets poured into
it — reproducible by a model far weaker than the one writing this
document, as long as both halves are followed.
