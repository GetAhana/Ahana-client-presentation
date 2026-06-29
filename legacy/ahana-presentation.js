/**
 * Ahana Digital Success Consultation — shared presentation data layer
 * Make / Gemini: POST enriched JSON or pass ?d=<base64url(JSON)>
 */
(function (global) {
  'use strict';

  var PLANS = {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 249,
      buildValue: 2000,
      features: [
        '5-page professional website',
        '1 SEO blog post every month',
        'Targets up to 3 main keywords',
        'Google Business Profile management',
        'Monthly SEO management report',
        'Google ranking tracking on all plans'
      ]
    },
    enhanced: {
      id: 'enhanced',
      name: 'Enhanced',
      price: 549,
      buildValue: 3000,
      features: [
        '8-page website + service detail pages',
        '2 SEO blog posts every month',
        'Targets up to 6 main keywords',
        'Location-based SEO for your service area',
        'Priority updates + advanced reporting',
        'Google ranking tracking on all plans'
      ]
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 1499,
      buildValue: 5000,
      features: [
        '12 pages — full services hub + deep service pages',
        '4 SEO blog posts every month',
        'Targets up to 10 main keywords',
        'Local landing pages per city served',
        'AI search visibility (Premium exclusive)',
        'Google ranking tracking on all plans'
      ]
    }
  };

  function emptyData() {
    return {
      meta: { leadId: '', repName: '', generatedAt: '', source: '' },
      client: {
        businessName: '',
        ownerFirstName: '',
        ownerName: '',
        trade: '',
        city: '',
        state: ''
      },
      discovery: {
        annualRevenue: '',
        growthGoal: '',
        serviceArea: '',
        crewCount: '',
        leadSources: '',
        competitors: '',
        avgJobValue: '',
        jobsPerMonth: '',
        biggestChallenge: '',
        complete: false
      },
      enrichment: {
        googleAnalysisSummary: '',
        competitorNames: [],
        rankingGap: '',
        localSearchInsight: '',
        personalizedPainPoint: '',
        recommendedPlan: 'enhanced',
        planRationale: '',
        roiNarrative: '',
        monthlyExtraJobs: '1',
        searchQuery: ''
      },
      assets: {
        sitePreviewUrl: '',
        leadProofNote: ''
      },
      options: {
        skipDiscovery: false
      }
    };
  }

  function mergeDeep(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (key) {
      var val = source[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        target[key] = target[key] || {};
        mergeDeep(target[key], val);
      } else if (val !== undefined && val !== null && val !== '') {
        target[key] = val;
      }
    });
    return target;
  }

  function base64UrlDecode(str) {
    try {
      var b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(b64), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch (e) {
      return null;
    }
  }

  function base64UrlEncode(str) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      })
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function parseParams() {
    var params = new URLSearchParams(window.location.search);
    var data = emptyData();

    if (params.has('d')) {
      var raw = base64UrlDecode(params.get('d'));
      if (raw) {
        try {
          mergeDeep(data, JSON.parse(raw));
        } catch (e) {
          console.warn('Invalid ?d= payload', e);
        }
      }
    }

    var flat = {
      'client.businessName': params.get('business') || params.get('businessName'),
      'client.ownerFirstName': params.get('owner') || params.get('firstName'),
      'client.ownerName': params.get('ownerName'),
      'client.trade': params.get('trade'),
      'client.city': params.get('city'),
      'client.state': params.get('state'),
      'meta.repName': params.get('rep'),
      'meta.leadId': params.get('leadId') || params.get('lead'),
      'enrichment.recommendedPlan': params.get('plan'),
      'assets.sitePreviewUrl': params.get('preview') || params.get('site'),
      'options.skipDiscovery': params.get('skipDiscovery') === '1' || params.get('skipDiscovery') === 'true'
    };

    Object.keys(flat).forEach(function (path) {
      var val = flat[path];
      if (!val) return;
      var parts = path.split('.');
      var obj = data;
      for (var i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = obj[parts[i]] || {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = val;
    });

    if (params.get('discovery') === 'complete') {
      data.discovery.complete = true;
      data.options.skipDiscovery = true;
    }

    return data;
  }

  function formatMoney(num) {
    var n = parseFloat(String(num).replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return num || '—';
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function displayName(data) {
    return data.client.ownerFirstName || data.client.ownerName || 'there';
  }

  function businessLabel(data) {
    return data.client.businessName || 'Your Business';
  }

  function tradeCity(data) {
    var trade = data.client.trade || 'home services';
    var city = data.client.city || 'your area';
    return trade + ' in ' + city;
  }

  function searchQuery(data) {
    if (data.enrichment.searchQuery) return data.enrichment.searchQuery;
    var trade = data.client.trade || 'contractor';
    var city = data.client.city || '';
    return (trade + ' ' + city).trim();
  }

  function recommendedPlan(data) {
    var id = (data.enrichment.recommendedPlan || 'enhanced').toLowerCase();
    return PLANS[id] || PLANS.enhanced;
  }

  function roiCopy(data) {
    if (data.enrichment.roiNarrative) return data.enrichment.roiNarrative;
    var plan = recommendedPlan(data);
    var jobVal = data.discovery.avgJobValue || '$1,500';
    var extra = data.enrichment.monthlyExtraJobs || '1';
    return (
      'You mentioned an average job is around ' +
      formatMoney(jobVal) +
      '. If this brings you just ' +
      extra +
      ' extra job' +
      (extra === '1' ? '' : 's') +
      ' per month, that covers the entire ' +
      plan.name +
      ' investment — and everything after that is profit you were not getting before.'
    );
  }

  function googleSummary(data) {
    if (data.enrichment.googleAnalysisSummary) return data.enrichment.googleAnalysisSummary;
    var q = searchQuery(data);
    return (
      'When someone in ' +
      (data.client.city || 'your area') +
      ' searches "' +
      q +
      '," they see a short list of businesses at the top — and everyone else is invisible. ' +
      (data.enrichment.rankingGap ||
        'Right now, that top-of-page visibility is going to competitors who invested in showing up online.')
    );
  }

  function planRationale(data) {
    if (data.enrichment.planRationale) return data.enrichment.planRationale;
    var plan = recommendedPlan(data);
    return (
      'Based on what you shared — your market, services, and growth goals — ' +
      plan.name +
      ' is the right fit. It gives you the page depth and monthly SEO volume to compete in ' +
      (data.client.city || 'your market') +
      ' without overbuilding.'
    );
  }

  function discoveryComplete(data) {
    if (data.options.skipDiscovery || data.discovery.complete) return true;
    var d = data.discovery;
    return !!(d.avgJobValue && d.jobsPerMonth && d.leadSources);
  }

  function toShareUrl(data, baseFile) {
    var base = baseFile || 'ahana-client-presentation.html';
    var encoded = base64UrlEncode(JSON.stringify(data));
    var url = new URL(base, window.location.href);
    url.search = '?d=' + encoded;
    return url.toString();
  }

  function saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  function loadLocal(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function formToData(form) {
    var data = emptyData();
    var fields = form.querySelectorAll('[data-field]');
    fields.forEach(function (el) {
      var path = el.getAttribute('data-field');
      var val = el.type === 'checkbox' ? el.checked : el.value;
      var parts = path.split('.');
      var obj = data;
      for (var i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = obj[parts[i]] || {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = val;
    });
    if (data.discovery.avgJobValue && data.discovery.leadSources) {
      data.discovery.complete = true;
    }
    data.meta.generatedAt = new Date().toISOString();
    return data;
  }

  function populateForm(form, data) {
    form.querySelectorAll('[data-field]').forEach(function (el) {
      var path = el.getAttribute('data-field');
      var parts = path.split('.');
      var obj = data;
      for (var i = 0; i < parts.length; i++) {
        if (!obj) break;
        if (i === parts.length - 1) {
          if (el.type === 'checkbox') el.checked = !!obj[parts[i]];
          else el.value = obj[parts[i]] != null ? obj[parts[i]] : '';
        } else {
          obj = obj[parts[i]];
        }
      }
    });
  }

  global.AhanaPresentation = {
    PLANS: PLANS,
    emptyData: emptyData,
    parseParams: parseParams,
    mergeDeep: mergeDeep,
    formatMoney: formatMoney,
    displayName: displayName,
    businessLabel: businessLabel,
    tradeCity: tradeCity,
    searchQuery: searchQuery,
    recommendedPlan: recommendedPlan,
    roiCopy: roiCopy,
    googleSummary: googleSummary,
    planRationale: planRationale,
    discoveryComplete: discoveryComplete,
    toShareUrl: toShareUrl,
    base64UrlEncode: base64UrlEncode,
    base64UrlDecode: base64UrlDecode,
    saveLocal: saveLocal,
    loadLocal: loadLocal,
    formToData: formToData,
    populateForm: populateForm,
    STORAGE_KEY: 'ahana-presentation-draft'
  };
})(typeof window !== 'undefined' ? window : this);
