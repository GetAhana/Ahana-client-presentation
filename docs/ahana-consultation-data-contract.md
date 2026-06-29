# Ahana Consultation — Data Contract (Supabase → Make → Gemini → deck)

`ahana-consultation.html` is a **pure customer-facing presentation**. It collects nothing.
Make pulls the client record from Supabase, Gemini enriches it, and Make opens the deck
with the data baked into the URL.

## How Make supplies the data (two ways)

1. **Inject + republish (the main flow)** — Make pulls this template from the repo, finds the
   line tagged `__AHANA_INJECT__`, replaces `null` with the per-client JSON object, and deploys
   the result to **its own Netlify URL**. (Replace only the tagged line — don't first-match the
   word `null` elsewhere.) **A page with injected data opens straight into the deck**; the rep can
   add **`?control`** to that URL to edit it in place, or press **E / Setup** during the deck.
2. **URL** — append the JSON as a base64url param:
   ```
   ahana-consultation.html?d=<base64url(JSON)>
   ```
   `d` = the JSON below, UTF-8 → base64url (URL-safe: `+`→`-`, `/`→`_`, strip `=`).
   Quick flat params also work for testing: `?business=&owner=&trade=&city=&plan=enhanced&website=&rep=`

Injected data and `?d=` are deep-merged. Opening the page **without `?present`** shows the
**Control view** (rep-facing): pick a booked appointment, auto-populate, fill the red gaps,
then Run. Opening **with `?present=1`** goes straight to the customer deck.

### Control view + Supabase (the "encompass everything" surface)

The page opens in Control by default. Set `SUPABASE` at the top of the file's script to enable
the **appointments dropdown** (rep selects the customer in front of them → lead + appointment
auto-load):

```js
var SUPABASE = {
  url:'https://xxxx.supabase.co', anonKey:'<public anon key>',  // RLS read-only
  table:'appointments',
  columns:{ id:'id', label:'business_name',
    'client.businessName':'business_name','client.ownerFirstName':'contact_name',
    'client.trade':'project_type','client.city':'city',
    'discovery.avgJobValue':'avg_job_value','discovery.jobsPerMonth':'jobs_per_month',
    'discovery.serviceAreas':'service_areas','discovery.crews':'crews',
    'discovery.annualRevenue':'annual_revenue','assets.websiteUrl':'website_url' } };
```

- Every field shows as a `{{placeholder}}`; **missing required (hard) data is highlighted red**,
  **Gemini fields show `{{Gemini input}}`** (amber), numbers show "industry avg" (blue, dashed).
- A live **completeness** count and an **auto plan recommendation** (with reason) sit up top.
- Buttons: **Run presentation**, **Copy present link** (`?present=1&d=…`), **Copy inject JSON**.
- Leave `SUPABASE.url` blank → manual entry / `?d=` / inject still work. The deck itself shows
  the same `{{tokens}}` in place of any field left empty, so it doubles as a live template view.

If **business name, city, and industry** are all present, the deck opens straight into the
presentation. If any of those three is missing, a one-time popup asks for them (in-memory
only — nothing is stored). Missing **numbers** never trigger the popup; they fall back to the
industry averages below.

## JSON shape

```json
{
  "meta":   { "repName": "Marco", "leadId": "crm-123" },
  "client": { "ownerFirstName": "Mike", "businessName": "Summit Plumbing",
              "trade": "plumbing", "city": "Phoenix" },
  "discovery": { "avgJobValue": "$850", "jobsPerMonth": "20",
                 "serviceAreas": "Phoenix, Mesa", "crews": "2", "annualRevenue": "$400,000" },
  "enrichment": {
    "searchQuery": "emergency plumber Phoenix",
    "recommendedPlan": "starter | enhanced | premium",
    "competitors": [
      { "name": "ABC Plumbing", "rating": "4.8", "reviews": "212 reviews" },
      { "name": "Valley Rooter Co", "rating": "4.6", "reviews": "96 reviews" },
      { "name": "Rapid Drain Pros", "rating": "4.9", "reviews": "340 reviews" }
    ],
    "industryLeadsPerMonth": "12",
    "extraJobsPerMonth": "1",
    "auditSummary": "optional",
    "localInsight": "optional — shows as a callout on the audit slide",
    "painPoint": "optional — shows once on the Real Cost slide",
    "planRationale": "optional — subtitle on Your Plan",
    "roiNarrative": "optional — callout under the ROI calculator"
  },
  "footprint": {
    "profileScore": 95,
    "rankingQuery": "General contracting in Toronto",
    "rankingStatus": "Outside the top 20 in Google Maps",
    "competitorCount": 20,
    "summary": "personalized lead for the footprint slide",
    "profileNotes": ["3-5 Google Business Profile observations"],
    "citationsPresent": ["Yelp", "BBB", "..."],
    "citationsMissing": ["CHBA directory", "Houzz", "..."],
    "waysToRank": ["5 ranking actions"],
    "diyTips": ["5 do-it-yourself website tips"]
  },
  "assets": {
    "websiteUrl": "https://summit-plumbing.netlify.app"
  }
}
```

### Aligned to Ahana-CRM (Supabase `leads` + appointment brief)

The webhook is **v2** (`webhook_version: 2`). Use nested paths in Make — arrays live under `brief.*` as real JSON arrays (not inside `rep_brief_text`).

```json
{
  "event": "appointment_booked",
  "webhook_version": 2,
  "lead_id": "uuid",
  "lead": {
    "business_name": "", "contact_name": "", "trade": "plumbing", "city": "",
    "website": "", "email": "", "phone": "", "state": "", "google_rating": null
  },
  "appointment": { "at": "", "end": "", "formatted": "" },
  "rep": { "first_name": "", "full_name": "", "email": "" },
  "intake": {
    "average_project_size": "", "projects_per_month": "",
    "additional_projects_wanted": "", "team_count": ""
  },
  "brief": {
    "google_profile_score": 85,
    "current_ranking": "",
    "rep_brief_text": "…full plain text for rep only…",
    "ranking_points": ["line 1", "line 2"],
    "profile_gaps": ["line 1", "line 2"],
    "citations_present": ["Yelp", "BBB"],
    "citations_missing": ["Houzz"],
    "rank_actions": ["…", "…", "…", "…", "…"],
    "diy_website_actions": ["…", "…", "…", "…", "…"],
    "meeting_talking_points": ["…", "…"]
  },
  "onboarding_url": ""
}
```

**Make.com mapping (arrays):** turn **Map** ON for the array field, then map `{{1.brief.profile_gaps}}` (whole array) or `{{1.brief.profile_gaps[1]}}` (one line). Do **not** map from `appointment_brief` or `rep_brief_text` for structured lists.

Legacy flat keys (`profile_gaps`, `business_name`, etc.) are still sent at the root for old scenarios.

The deck **adapts your existing CRM data natively** — `adaptCrmPayload()` detects a CRM lead row
or the `appointment-booked` Make webhook payload and maps it, so Make can pass it almost verbatim.

| Deck field | CRM source (leads / appointment_brief) | Notes |
|---|---|---|
| client.businessName | `business_name` | exact |
| client.ownerFirstName | `contact_name` | first word taken |
| client.trade | `trade` | exact |
| client.city | `city` (+ `state`) | exact |
| assets.websiteUrl | `website` | exact |
| discovery.avgJobValue | `average_project_size` / `appointment_intake.average_project_size` | question-prefix auto-stripped |
| discovery.jobsPerMonth | `projects_per_month` | |
| enrichment.extraJobsPerMonth | `additional_projects_wanted` | "additional projects wanted" → ROI extra jobs |
| discovery.crews | `team_count` | |
| enrichment.recommendedPlan | `plan_name` / `scrape_metadata.plan_interest.name` | the plan they expressed interest in |
| footprint.profileScore | `google_profile_score` | from the brief |
| footprint.rankingStatus | `current_ranking` / `ranking_points[0]` | |
| footprint.summary | `meeting_talking_points[0]` | the rep's opener |
| footprint.profileNotes | `profile_gaps[]` | |
| footprint.citationsPresent / Missing | `citations_present[]` / `citations_missing[]` | |
| footprint.waysToRank | `rank_actions[]` (5) | |
| footprint.diyTips | `diy_website_actions[]` (5) | |
| meta.repName / leadId | `rep_first_name` / `lead_id` | |

**Not captured in the CRM (deck fills or you add):**
- `serviceAreas` — no column. Plan logic falls back to 1 area. *Add an intake question to improve plan accuracy.*
- `annualRevenue` — no column. Plan logic **derives** it as `avgJob × jobsPerMonth × 12`.
- `competitors[]` (names+ratings for the SERP audit) — the CRM stores `google_rating`/`google_review_count`
  for the *client*, not 3 competitors. Have Gemini Prompt A supply `enrichment.competitors`, or the
  audit slide shows `{{Gemini input}}` rows.

### Field notes
- **client.trade** — industry **slug** (`plumbing`, `roofing`, `hvac`…). The deck maps slugs to
  occupation copy (plumbers, roofers). Gemini should keep the slug in JSON and use occupations in prose.
- **discovery.avgJobValue** — *what the customer stated*. Shown on slides 3 & 11 as `{{average_job}}` until filled. **Required before presenting** — ask the client.
- **discovery.jobsPerMonth** — volume on slide 3. `{{jobs_per_month}}` until filled. **Required before presenting**.
- **enrichment.searchQuery** — the exact phrase a customer types. Drives slide 4 (Gemini must Google-search).
- **enrichment.competitors** — **from a real Google search** (Gemini Prompt A). Top 3 map-pack businesses; slide 4 shows `{{Gemini input}}` rows until filled.
- **enrichment.industryLeadsPerMonth** — web leads/month for **this industry** (not generic home-service). Slide 5 uses plumbing=12, roofing=2, etc. from the industry table when slug is known; otherwise Gemini must supply or slide shows `{{industry_leads_per_month}}`.
- **enrichment.extraJobsPerMonth** — conservative assumption seeding the Your Plan ROI. Missing → industry average.
- **footprint.\*** — the Google footprint mini-audit (score, ranking, citations, 5 ways to rank, 5 DIY tips). Generated by **Gemini Prompt B** (see `ahana-consultation-gemini-prompts.md`). Drives 4 extra slides after the search audit. **If `footprint` is absent, those 4 slides simply don't render** — the deck falls back to its 15 core slides.
- **REAL RESULTS is static** — always the 3 sample-lead cards (Kerry R. / William V. / Lucia P.). Not data-driven, not modular; there is no `proofImages` input.

## Industry averages (the math fallbacks, baked into the deck)

| Trade | Avg job | Volume/mo | Web leads/mo | Extra jobs/mo |
|---|---|---|---|---|
| Roofing | $9,500 | 12 | 2 | 1 |
| Plumbing | $450 | 55 | 12 | 3 |
| HVAC | $6,000 | 20 | 6 | 2 |
| Electrical | $550 | 48 | 10 | 3 |
| Landscaping | $4,200 | 18 | 5 | 2 |
| Painting | $3,200 | 15 | 6 | 2 |
| Flooring | $3,800 | 14 | 5 | 2 |
| Remodeling | $18,000 | 8 | 2 | 1 |
| Pest control | $350 | 60 | 14 | 4 |
| Garage door | $1,200 | 30 | 9 | 3 |
| Cleaning | $250 | 70 | 16 | 5 |
| Fencing | $4,500 | 12 | 4 | 2 |
| Concrete/Masonry | $6,500 | 10 | 3 | 1 |
| Tree service | $1,800 | 22 | 7 | 2 |
| Pool/Spa | $5,000 | 14 | 4 | 2 |
| *(default)* | $1,500 | 25 | 8 | 2 |

Gemini should override these with better numbers when it has them; they exist so the deck never shows a blank.

## Plans (canonical — in the deck)

| Tier | Price | Build value | Blogs/mo |
|---|---|---|---|
| Starter | $249/mo | **$2,000** | 1 |
| Enhanced | $549/mo | **$3,000** | 2 |
| Premium | $1,499/mo | **$5,000** | 4 |

## Gemini enrichment prompt

> Full prompts (client enrichment **+** the Google footprint audit) live in
> **`ahana-consultation-gemini-prompts.md`**. The version below is the client-enrichment half only.

```
You enrich a US home-service business record into JSON for a sales presentation (Ahana Digital).
Tone in any prose fields: plain, warm, peer-to-peer. Talk about jobs, calls, and customers —
never agency jargon, never shame the owner.

INPUT: the Supabase client record (business name, owner, trade, city, optional avg job / volume / website).

DO:
1. Build "searchQuery" = the phrase a real customer types, e.g. "emergency plumber Phoenix".
2. ACTUALLY SEARCH Google for that query. Read the local/map results. Put the real top 3
   businesses into "competitors" with their real "rating" and "reviews" count. If you cannot
   search, return 3 plausible local competitors for that trade + city.
3. Recommend a plan: default "enhanced". "premium" only for multi-city / high-volume operators;
   "starter" for solo / single-city.
4. Set "industryLeadsPerMonth" and "extraJobsPerMonth" from your knowledge of the trade
   (conservative). Leave "avgJobValue" to the stated value if the record has one.
5. Write short, slide-length prose for: auditSummary, localInsight, painPoint, planRationale,
   roiNarrative. One to three sentences each. No markdown, no emojis.

OUTPUT: ONLY valid JSON in this shape (omit anything you can't fill):

{
  "client": {"ownerFirstName":"","businessName":"","trade":"","city":""},
  "discovery": {"avgJobValue":"","jobsPerMonth":""},
  "enrichment": {
    "searchQuery":"", "recommendedPlan":"enhanced",
    "competitors":[{"name":"","rating":"","reviews":""}],
    "industryLeadsPerMonth":"", "extraJobsPerMonth":"",
    "auditSummary":"", "localInsight":"", "painPoint":"", "planRationale":"", "roiNarrative":""
  }
}

Do NOT invent proof screenshots, websiteUrl, or repName — Ahana supplies those.
```

## Make flow (sketch)

1. **Trigger** — client ready in Supabase (or a manual "build deck" action).
2. **Get record** — Supabase row → client fields, stated avg job / volume, website URL, proof image URLs.
3. **Gemini (HTTP module)** — send the prompt + record; parse the JSON reply.
4. **Merge** — combine Supabase identity + proof images + website with Gemini enrichment.
5. **Encode** — JSON → base64url (a small Function/Tools step).
6. **Output** — `https://<host>/ahana-consultation.html?d=<encoded>`; email/Slack it to the rep, or store on the lead.

## The REAL RESULTS slide

**Static** — always the same 3 sample-lead cards (real inbound leads, names shortened). Hard-coded
in `SAMPLE_LEADS`; no data, no override.
