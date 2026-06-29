# Ahana — Plan Recommendation Logic

Which tier to recommend to which customer. Used by **Gemini** (Prompt A sets
`enrichment.recommendedPlan`) and by the deck as a fallback (`autoPlan()` runs the same rules
when Gemini didn't set a plan).

## Principle

**Default to Enhanced.** Enhanced is the smart middle for most established local home-service
businesses. Premium is priced high on purpose — it anchors prospects toward Enhanced. So:

- Recommend the **smallest tier that genuinely fits** — never upsell by default.
- **Starter** only for clearly small / solo / single-town operators.
- **Premium** only when the market genuinely warrants it (multi-city, high-ticket, competitive).
- There is **no tier below Starter**.

## The tiers (what each is *for*)

| Tier | Best fit | Why |
|---|---|---|
| **Starter** $249 — 5 pages · 1 blog · 3 keywords | Solo / 1-crew, one town, lower ticket, just needs to exist & be found | Enough to show up locally and look professional. Don't oversell presence-only needs. |
| **Enhanced** $549 — 8 pages · 2 blogs · 6 keywords · location SEO | The typical established local trade: one metro + suburbs, a few services, 1–2 crews, steady growth | Page depth + location SEO to actually compete in a real market. **The default.** |
| **Premium** $1,499 — 12 pages · 4 blogs · 10 keywords · per-city landing pages · AI search visibility | Multi-city operators, high-ticket trades, competitive metros, teams wanting to dominate | Per-city landing pages + 10 keywords + AI visibility to win a wide, competitive footprint. |

## Signals (from CRM / intake / Gemini research)

1. **Service-area breadth** — how many distinct cities/towns they serve.
2. **Average job value (ticket)** — high-ticket trades justify more pages & landing pages.
3. **Team size** — solo vs. multiple crews.
4. **Volume / revenue** — jobs per month, annual revenue.
5. **Local competition** — competitors in the map pack for their main query.

## Decision tree (what Gemini should follow)

```
START → Enhanced (default)

▸ Recommend STARTER if ALL of these hold:
    • serves essentially ONE city/town
    • solo or a single crew
    • average job < $1,500
    • lower volume (< ~20 jobs/mo) or clearly early-stage
  → They mainly need presence in one place.

▸ Recommend PREMIUM if ANY of these hold:
    • serves 3+ cities / a wide regional footprint
    • high-ticket trade (avg job ≥ $6,000: roofing, remodeling, HVAC, concrete, pool)
      AND serves 2+ areas
    • 3+ crews or annual revenue ≥ $1M, AND a competitive metro (15+ in the local pack)
  → They can leverage per-city pages + AI visibility to dominate.

▸ Otherwise → ENHANCED.
```

## Point-score version (encoded in the deck's `autoPlan()`)

```
points = 0
service areas:   1 →+0   |  2 →+1   |  3+ →+2
avg job value:   <$2k →+0 | $2k–5,999 →+1 | ≥$6k →+2
team / crews:    1 →+0   |  2 →+1   |  3+ →+2
volume:          <20/mo →+0 | 20–39 →+1 | ≥40/mo or rev ≥ $1M →+2
competition:     <15 in pack →+0 | 15+ →+1

DECISION
  service areas ≥ 3 .......................... Premium
  else points ≥ 5 ............................ Premium
  else (single area AND points ≤ 1) .......... Starter
  else ....................................... Enhanced
```

### Worked examples

| Customer | Areas | Avg job | Crews | Vol/mo | Pack | Points | → |
|---|---|---|---|---|---|---|---|
| Solo handyman, one town, $300 jobs | 1 | $300 | 1 | 12 | 8 | 0 | **Starter** |
| Plumber, city + suburbs, $450, 2 crews | 2 | $450 | 2 | 45 | 12 | 1+0+1+2+0=4 | **Enhanced** |
| Roofer, 2 cities, $9.5k jobs | 2 | $9,500 | 2 | 14 | 18 | 1+2+1+0+1=5 | **Premium** |
| General contractor, 4 cities, $18k | 4 | $18,000 | 3 | 8 | 20 | areas ≥ 3 | **Premium** |
| Landscaper, one city, $4k, 1 crew | 1 | $4,200 | 1 | 18 | 10 | 0+1+0+0+0=1 | **Starter** (borderline → nudge Enhanced if growth-minded) |

> Borderline cases default **up to Enhanced**, not down to Starter — unless the business is
> unmistakably solo/single-town. Enhanced is the anchor target.

## Data the logic needs

`discovery.serviceAreas` (list or count of cities), `discovery.avgJobValue`,
`discovery.crews`, `discovery.jobsPerMonth`, `discovery.annualRevenue`,
`footprint.competitorCount`. Any missing signal scores 0 (conservative → biases toward
Enhanced/Starter, never an unjustified Premium).

## For the Gemini prompt

Add this instruction to **Prompt A**:

> Choose `recommendedPlan` using Ahana's plan logic: default **enhanced**. Recommend
> **premium** only if the business serves 3+ cities, OR is a high-ticket trade (avg job ≥ $6k)
> serving 2+ areas, OR has 3+ crews / ≥ $1M revenue in a competitive metro. Recommend
> **starter** only if it's solo/one-crew, single town, sub-$1,500 jobs, low volume. When
> unsure, choose **enhanced** — never recommend a bigger tier just to upsell. Also return the
> sizing signals you used in `discovery` (serviceAreas, crews, annualRevenue) so the deck can
> show its work.
