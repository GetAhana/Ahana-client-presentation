/** Shared sample client — Summit Plumbing Co., Austin TX */
export const summitPlumbing = {
  meta: { repName: 'Janica', leadId: 'summit-demo-001' },
  client: {
    ownerFirstName: 'Mike',
    businessName: 'Summit Plumbing Co.',
    trade: 'plumbing',
    city: 'Austin',
  },
  discovery: {
    avgJobValue: '$850',
    jobsPerMonth: '20',
    serviceAreas: 'Austin, Round Rock, Cedar Park',
    crews: '2',
    annualRevenue: '$204,000',
  },
  enrichment: {
    searchQuery: 'emergency plumber Austin TX',
    recommendedPlan: 'enhanced',
    competitors: [
      { name: 'ABC Plumbing & Drain', rating: '4.8', reviews: '212 reviews' },
      { name: 'Hill Country Rooter', rating: '4.6', reviews: '96 reviews' },
      { name: 'Austin Rapid Drain Pros', rating: '4.9', reviews: '340 reviews' },
    ],
    industryLeadsPerMonth: '12',
    extraJobsPerMonth: '3',
    auditSummary:
      "Three well-reviewed competitors dominate page-one for emergency plumbing in Austin. Summit's GBP is complete but thin on photos and service-area detail.",
    localInsight:
      "Austin's booming suburbs are driving after-hours drain calls — competitors with 24/7 messaging win those clicks.",
    painPoint:
      "Most of your new work still comes from referrals — the website isn't pulling its weight yet.",
    planRationale:
      'Two crews across three cities — Enhanced gives you location pages and enough monthly content to compete without overbuilding.',
    roiNarrative:
      'At $850 average job, three extra plumbing jobs a month pays for the plan several times over.',
  },
  footprint: {
    profileScore: 72,
    rankingQuery: 'plumber Austin TX',
    rankingStatus: 'Outside the top 20 in Google Maps',
    competitorCount: 18,
    summary:
      "Mike runs a solid operation with repeat customers, but Google visibility lags behind competitors who've invested in local SEO and citations.",
    profileNotes: [
      'GBP has only 8 photos — competitors average 40+',
      'Service areas list Austin but not Round Rock or Cedar Park',
      'No posts in the last 90 days',
      'Q&A section unanswered',
    ],
    citationsPresent: ['Yelp', 'BBB', 'Angi', 'HomeAdvisor'],
    citationsMissing: ['Chamber of Commerce', 'Houzz', 'Nextdoor Business'],
    waysToRank: [
      'Add service-area pages for Round Rock and Cedar Park',
      'Publish monthly plumbing tips targeting Austin emergency keywords',
      'Collect 5 new Google reviews this quarter',
      'Complete GBP Q&A with top 10 customer questions',
      'Build local citations on industry directories',
    ],
    diyTips: [
      'Add a prominent click-to-call button above the fold on mobile',
      'List emergency services with clear response-time promise',
      'Show license and insurance badges on every service page',
      'Add customer reviews with schema markup on homepage',
      'Speed up page load — current site loads in 4.2 seconds',
    ],
  },
  assets: { websiteUrl: 'https://summit-plumbing-demo.netlify.app' },
};
