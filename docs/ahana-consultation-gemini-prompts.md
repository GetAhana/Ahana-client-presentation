# Ahana Consultation — Gemini Prompts (for the Make flow)

Two prompts. Both return **JSON only** that Make merges into the one payload it injects
into `index.html` (replace the `window.AHANA_DATA = null;` line, or pass
`?d=<base64url(JSON)>`). You can run them as two Gemini calls and deep-merge the results,
or paste both task blocks into a single call and ask for one combined object — see
"Combined" at the bottom.

Tone for every prose field: plain, warm, peer-to-peer. Talk about jobs, calls, and
customers. Never agency jargon, never shame the owner. No markdown, no emojis, keep each
string short enough to read on a slide.

---

## PROMPT A — Client enrichment

```
You enrich a US/Canada home-service business record into JSON for a sales presentation (Ahana Digital).

INPUT: the Supabase client record — business name, owner first name, **industry slug** (e.g.
"plumbing", "roofing", "hvac" — NOT occupation titles like "Plumber"), city,
and optionally the stated average job value, monthly volume, and website URL.

IMPORTANT — industry vs occupation:
- Store/pass `trade` as the industry slug: "plumbing", "roofing", "landscaping".
- In prose fields, refer to people as occupations: plumbers, roofers, landscapers.
- Map slugs → occupation plural when writing slide copy.

DO:
1. searchQuery = the exact phrase a real customer types, e.g. "emergency plumber Phoenix"
   or "roofing contractor Dallas".
2. **ACTUALLY SEARCH Google** for that query. Read the local/map pack. Put the real top 3
   businesses into "competitors" with their real "rating" and "reviews" count. This powers
   slide 4 (the SERP audit). If you cannot search, return 3 plausible local competitors.
3. recommendedPlan — Ahana's plan logic (see ahana-consultation-plan-logic.md): default
   "enhanced". "premium" only if 3+ cities, OR high-ticket (avg job ≥ $6k) serving 2+ areas,
   OR 3+ crews / ≥ $1M revenue in a competitive metro. "starter" only if solo/one-crew, single
   town, sub-$1,500 jobs, low volume. When unsure → "enhanced". Never upsell.
4. Return the sizing signals you used in "discovery": serviceAreas (cities served), crews,
   annualRevenue — so the deck reproduces the recommendation on slides 11–13.
5. **industryLeadsPerMonth** — set from the **specific industry** (not a generic home-service
   average). Examples: plumbing ≈ 12/mo, roofing ≈ 2/mo, HVAC ≈ 6/mo, electrical ≈ 10/mo.
   This powers slide 5 ("X new plumbers a month"). Use conservative numbers.
6. extraJobsPerMonth: conservative extra jobs for ROI on slide 11. Leave avgJobValue /
   jobsPerMonth to the stated client values if present; do NOT overwrite discovery numbers.
7. Write short, slide-length prose for: auditSummary (slide 4 callout), localInsight,
   painPoint (slide 5), planRationale (slide 11), roiNarrative (slide 11). One to three
   sentences each. Use occupation words in customer-facing copy.

OUTPUT — valid JSON only, this shape (omit anything you can't fill):

{
  "client": {"ownerFirstName":"","businessName":"","trade":"","city":""},
  "discovery": {"avgJobValue":"","jobsPerMonth":"","serviceAreas":"","crews":"","annualRevenue":""},
  "enrichment": {
    "searchQuery":"", "recommendedPlan":"enhanced",
    "competitors":[{"name":"","rating":"","reviews":""}],
    "industryLeadsPerMonth":"", "extraJobsPerMonth":"",
    "auditSummary":"", "localInsight":"", "painPoint":"", "planRationale":"", "roiNarrative":""
  }
}

Do NOT invent websiteUrl, proofImages, or repName — Ahana supplies those.
```

---

## PROMPT B — Google footprint audit (the "even if they don't sign" value)

```
You produce a Google footprint mini-audit for a local home-service business, as JSON for a
sales presentation (Ahana Digital). This is genuine free value the client keeps regardless.

INPUT: business name, trade/industry, city (and the search query, if provided).

RESEARCH the business's local presence and produce:
- profileScore: a 0-100 Google Business Profile completeness/health score (integer).
- rankingQuery: the primary local search, e.g. "General contracting in Toronto".
- rankingStatus: a short status, e.g. "Outside the top 20 in Google Maps".
- competitorCount: number of competitors in the local pack for that query (integer).
- summary: 1-2 sentences, addressed to the owner, naming the business and the ranking gap.
  (A spoken-opener version of: "I noticed {business} isn't appearing in the top local
  results for '{query}', which is a key area for you.")
- profileNotes: 3-5 specific observations about the Google Business Profile (photos,
  service listings, website link, reviews, mis-categorized "types", etc.).
- citationsPresent: directories the business IS listed on (e.g. Yelp, BBB, Yellow Pages,
  HomeStars).
- citationsMissing: relevant directories it is NOT on yet (e.g. industry association,
  Chamber of Commerce, RenovationFind, Houzz).
- waysToRank: exactly 5 actions to rank higher locally.
- diyTips: exactly 5 things the owner can do on their own website this week.

OUTPUT — valid JSON only, this shape:

{
  "footprint": {
    "profileScore": 95,
    "rankingQuery": "",
    "rankingStatus": "",
    "competitorCount": 20,
    "summary": "",
    "profileNotes": ["", "", ""],
    "citationsPresent": ["", ""],
    "citationsMissing": ["", ""],
    "waysToRank": ["", "", "", "", ""],
    "diyTips": ["", "", "", "", ""]
  }
}

Keep every line concise and specific to this business. No markdown, no emojis.
```

### Example (Y2 Design & Build — matches the deck slides)

```json
{
  "footprint": {
    "profileScore": 95,
    "rankingQuery": "General contracting in Toronto",
    "rankingStatus": "Outside the top 20 in Google Maps",
    "competitorCount": 20,
    "summary": "Y2 Design & Build isn't appearing in the top local results for 'General contracting in Toronto', which is a key area for you. Here's where you stand and the quickest ways to climb.",
    "profileNotes": [
      "Photos are present (10) — a broader gallery showcasing diverse projects would help.",
      "List and detail every service offered under General Contracting.",
      "The website link is in the profile, but link back to the profile from the website itself.",
      "High rating and review count — actively soliciting reviews for specific services boosts relevance.",
      "Profile 'types' include painter and home_goods_store, which dilute the general-contractor focus."
    ],
    "citationsPresent": ["Yelp", "BBB", "Yellow Pages Canada", "HomeStars"],
    "citationsMissing": [
      "Canadian Home Builders' Association (CHBA) directory",
      "Local Toronto Chamber of Commerce directory",
      "RenovationFind directory",
      "BuildDirect directory",
      "Houzz (design/build services)"
    ],
    "waysToRank": [
      "Optimize the Google Business Profile with detailed service descriptions and relevant keywords.",
      "Actively solicit reviews that mention specific services like 'general contracting'.",
      "Use 'general contracting' and related local terms consistently across the website.",
      "Build local citations on relevant trade and community directories.",
      "Upload high-quality, diverse photos and videos of completed projects regularly."
    ],
    "diyTips": [
      "State 'General Contracting Services in Toronto' clearly on the homepage.",
      "Add a dedicated Services page detailing all aspects of the general contracting work.",
      "Include customer testimonials and project case studies with photos.",
      "Keep business name, address, and phone (NAP) consistent across the site and all listings.",
      "Optimize page titles and meta descriptions with keywords like 'Toronto general contractor'."
    ]
  }
}
```

The footprint slides auto-hide if `footprint` is absent, so a missing/failed Prompt B never
breaks the deck — you just get the 15 core slides instead of 19.

---

## Combined (one Gemini call)

If you'd rather make one call, concatenate the two task lists and ask for a single object
merging both shapes:

```
Do TASK A (client enrichment) and TASK B (Google footprint audit) for the business below,
then return ONE JSON object containing client, discovery, enrichment, and footprint.
Output JSON only.

[paste the DO/OUTPUT sections of PROMPT A and PROMPT B here]

BUSINESS: {{businessName}}, {{trade}}, {{city}}, owner {{ownerFirstName}},
stated avg job {{avgJobValue}}, website {{websiteUrl}}
```

Make then base64url-encodes the object and appends it as `?d=`, or string-replaces the
`window.AHANA_DATA = null;` line in the template with `window.AHANA_DATA = {…};`.
