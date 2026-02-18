#!/usr/bin/env node
/**
 * Generates 51 state-specific take-home pay calculator pages
 * for programmatic SEO. Run from the take-home-pay-calculator directory.
 *
 * Usage: node generate-state-pages.js
 */
var fs = require('fs');
var path = require('path');

var STATES = {
  'AL': { name:'Alabama', rate:'5%', note:'Alabama uses progressive rates (2%–5%) and uniquely allows a deduction for federal taxes paid.' },
  'AK': { name:'Alaska', rate:'0%', note:'Alaska has no state income tax, making it one of the most tax-friendly states for workers.' },
  'AZ': { name:'Arizona', rate:'2.5%', note:'Arizona has a flat 2.5% income tax rate, one of the lowest flat rates in the country.' },
  'AR': { name:'Arkansas', rate:'4.4%', note:'Arkansas has a flat income tax rate of 4.4% as of 2024.' },
  'CA': { name:'California', rate:'1%–13.3%', note:'California has the highest top marginal income tax rate in the nation at 13.3%, with 10 tax brackets.' },
  'CO': { name:'Colorado', rate:'4.4%', note:'Colorado has a flat 4.4% income tax rate applied to all taxable income.' },
  'CT': { name:'Connecticut', rate:'3%–6.99%', note:'Connecticut has a progressive income tax with rates from 3% to 6.99% across seven brackets.' },
  'DE': { name:'Delaware', rate:'2.2%–6.6%', note:'Delaware has progressive rates from 2.2% to 6.6% and no sales tax, though income taxes are moderate.' },
  'DC': { name:'District of Columbia', rate:'4%–10.75%', note:'DC has progressive rates reaching 10.75% for high earners, among the highest in the nation.' },
  'FL': { name:'Florida', rate:'0%', note:'Florida has no state income tax, which is a major draw for workers and retirees.' },
  'GA': { name:'Georgia', rate:'5.49%', note:'Georgia has a flat income tax rate of 5.49% as of 2024, recently simplified from a progressive system.' },
  'HI': { name:'Hawaii', rate:'1.4%–11%', note:'Hawaii has 12 tax brackets with a top rate of 11%, among the highest state rates.' },
  'ID': { name:'Idaho', rate:'5.8%', note:'Idaho has a flat 5.8% income tax rate, recently simplified from a progressive system.' },
  'IL': { name:'Illinois', rate:'4.95%', note:'Illinois has a flat 4.95% income tax rate that applies to all taxable income equally.' },
  'IN': { name:'Indiana', rate:'3.05%', note:'Indiana has one of the lowest flat income tax rates at 3.05%, plus county taxes may apply.' },
  'IA': { name:'Iowa', rate:'4.4%–5.7%', note:'Iowa has progressive rates from 4.4% to 5.7% across three brackets, with plans to reduce further.' },
  'KS': { name:'Kansas', rate:'3.1%–5.7%', note:'Kansas has three tax brackets with rates from 3.1% to 5.7%.' },
  'KY': { name:'Kentucky', rate:'4%', note:'Kentucky has a flat 4% income tax rate, recently reduced from 5%.' },
  'LA': { name:'Louisiana', rate:'1.85%–4.25%', note:'Louisiana has three brackets with rates from 1.85% to 4.25%, among the lower progressive systems.' },
  'ME': { name:'Maine', rate:'5.8%–7.15%', note:'Maine has three brackets with a top rate of 7.15% on income over $58,050.' },
  'MD': { name:'Maryland', rate:'2%–5.75%', note:'Maryland has progressive rates from 2% to 5.75%, plus local county income taxes that add 2.25%–3.2%.' },
  'MA': { name:'Massachusetts', rate:'5%', note:'Massachusetts has a flat 5% income tax rate on most income, with an additional 4% surtax on income over $1 million.' },
  'MI': { name:'Michigan', rate:'4.25%', note:'Michigan has a flat 4.25% income tax rate. Some cities impose additional local income taxes.' },
  'MN': { name:'Minnesota', rate:'5.35%–9.85%', note:'Minnesota has four brackets with a top rate of 9.85%, one of the higher state rates.' },
  'MS': { name:'Mississippi', rate:'5%', note:'Mississippi has a flat 5% income tax rate on taxable income over $10,000.' },
  'MO': { name:'Missouri', rate:'2%–4.8%', note:'Missouri has progressive rates with a top rate of 4.8% on income over $8,449.' },
  'MT': { name:'Montana', rate:'1%–6.75%', note:'Montana has progressive rates from 1% to 6.75% across seven brackets.' },
  'NE': { name:'Nebraska', rate:'2.46%–5.84%', note:'Nebraska has four brackets with a top rate of 5.84%.' },
  'NV': { name:'Nevada', rate:'0%', note:'Nevada has no state income tax. Workers keep more of their salary compared to most states.' },
  'NH': { name:'New Hampshire', rate:'0%', note:'New Hampshire has no income tax on wages and salaries. It recently eliminated its tax on interest and dividends.' },
  'NJ': { name:'New Jersey', rate:'1.4%–10.75%', note:'New Jersey has progressive rates from 1.4% to 10.75%, with the top rate applying to income over $1 million.' },
  'NM': { name:'New Mexico', rate:'1.7%–5.9%', note:'New Mexico has progressive rates from 1.7% to 5.9% across five brackets.' },
  'NY': { name:'New York', rate:'4%–10.9%', note:'New York has progressive rates up to 10.9%. NYC residents pay an additional 3.078%–3.876% city income tax.' },
  'NC': { name:'North Carolina', rate:'4.5%', note:'North Carolina has a flat 4.5% income tax rate, reduced from 4.75% in prior years.' },
  'ND': { name:'North Dakota', rate:'1.95%', note:'North Dakota has one of the lowest state income tax rates at 1.95% flat.' },
  'OH': { name:'Ohio', rate:'0%–3.688%', note:'Ohio exempts the first $26,050 of income from tax. Above that, rates range from 2.765% to 3.688%.' },
  'OK': { name:'Oklahoma', rate:'0.25%–4.75%', note:'Oklahoma has six brackets with a top rate of 4.75% on income over $7,200.' },
  'OR': { name:'Oregon', rate:'4.75%–9.9%', note:'Oregon has four brackets with a top rate of 9.9%. Oregon has no sales tax, so income taxes are higher.' },
  'PA': { name:'Pennsylvania', rate:'3.07%', note:'Pennsylvania has a flat 3.07% income tax rate, one of the lowest flat rates. Local taxes may also apply.' },
  'RI': { name:'Rhode Island', rate:'3.75%–5.99%', note:'Rhode Island has three brackets with a top rate of 5.99% on income over $166,950.' },
  'SC': { name:'South Carolina', rate:'0%–6.4%', note:'South Carolina exempts the first $3,200 from tax, with a top rate of 6.4% above $16,040.' },
  'SD': { name:'South Dakota', rate:'0%', note:'South Dakota has no state income tax, making it very tax-friendly for workers.' },
  'TN': { name:'Tennessee', rate:'0%', note:'Tennessee has no state income tax on wages and salaries.' },
  'TX': { name:'Texas', rate:'0%', note:'Texas has no state income tax, which is a major factor in its popularity for relocating workers and businesses.' },
  'UT': { name:'Utah', rate:'4.65%', note:'Utah has a flat 4.65% income tax rate applied to all taxable income.' },
  'VT': { name:'Vermont', rate:'3.55%–8.75%', note:'Vermont has four brackets with a top rate of 8.75% on income over $229,550.' },
  'VA': { name:'Virginia', rate:'2%–5.75%', note:'Virginia has four brackets with a top rate of 5.75% on income over $17,000.' },
  'WA': { name:'Washington', rate:'0%', note:'Washington has no state income tax, though it does have a high sales tax.' },
  'WV': { name:'West Virginia', rate:'2.36%–5.12%', note:'West Virginia has five brackets with a top rate of 5.12% on income over $60,000.' },
  'WI': { name:'Wisconsin', rate:'3.5%–7.65%', note:'Wisconsin has four brackets with a top rate of 7.65% on income over $315,310.' },
  'WY': { name:'Wyoming', rate:'0%', note:'Wyoming has no state income tax and no corporate income tax.' }
};

// Read main template
var mainHTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var stateEntries = Object.keys(STATES).sort(function(a, b) {
  return STATES[a].name.localeCompare(STATES[b].name);
});

stateEntries.forEach(function(code) {
  var state = STATES[code];
  var slug = state.name.toLowerCase().replace(/\s+/g, '-');
  var dir = path.join(__dirname, slug);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  var isNoTax = state.rate === '0%';

  var title = 'Take-Home Pay Calculator for ' + state.name + ' (' + state.rate + ' State Tax) | OneTab';
  var description = 'Calculate your take-home pay in ' + state.name + '. ' +
    (isNoTax ? state.name + ' has no state income tax. ' : state.name + ' state income tax rate: ' + state.rate + '. ') +
    'See your paycheck after federal, state, and FICA taxes.';

  var h1 = state.name + ' Take-Home Pay Calculator';
  var subtitle = state.note;
  var canonicalURL = 'https://onetab.tools/take-home-pay-calculator/' + slug + '/';

  // Build the page from template
  var html = mainHTML;

  // Replace title
  html = html.replace(
    /<title>[^<]+<\/title>/,
    '<title>' + title + '</title>'
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    '<meta name="description" content="' + description.replace(/"/g, '&quot;') + '">'
  );

  // Replace meta keywords
  html = html.replace(
    /<meta name="keywords" content="[^"]*">/,
    '<meta name="keywords" content="' + state.name.toLowerCase() + ' take home pay calculator, ' + state.name.toLowerCase() + ' paycheck calculator, ' + state.name.toLowerCase() + ' income tax calculator, ' + state.name.toLowerCase() + ' salary after taxes, ' + code + ' income tax">'
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    '<meta property="og:title" content="' + state.name + ' Take-Home Pay Calculator | OneTab">'
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    '<meta property="og:description" content="' + description.replace(/"/g, '&quot;') + '">'
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    '<meta property="og:url" content="' + canonicalURL + '">'
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    '<meta name="twitter:title" content="' + state.name + ' Take-Home Pay Calculator | OneTab">'
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    '<meta name="twitter:description" content="' + description.replace(/"/g, '&quot;') + '">'
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    '<link rel="canonical" href="' + canonicalURL + '">'
  );

  // Replace schema.org
  html = html.replace(
    /"name": "Take-Home Pay Calculator"/,
    '"name": "' + state.name + ' Take-Home Pay Calculator"'
  );
  html = html.replace(
    /"url": "https:\/\/onetab\.tools\/take-home-pay-calculator\/"/,
    '"url": "' + canonicalURL + '"'
  );
  html = html.replace(
    /"description": "[^"]*"/,
    '"description": "' + description.replace(/"/g, '\\"') + '"'
  );

  // Replace H1 and subtitle
  html = html.replace(
    /<h1>Take-Home Pay Calculator<\/h1>/,
    '<h1>' + h1 + '</h1>'
  );
  html = html.replace(
    /<p class="subtitle">See exactly how much of your salary you keep after federal, state, and FICA taxes\.<\/p>/,
    '<p class="subtitle">' + subtitle + '</p>'
  );

  // Fix relative paths (go up one more level)
  html = html.replace(/href="\.\.\/"/g, 'href="../../"');
  html = html.replace(/src="\.\.\/js\//g, 'src="../../js/');
  html = html.replace(/href="\.\.\/css\//g, 'href="../../css/');
  html = html.replace(/href="\.\.\/favicon/g, 'href="../../favicon');
  html = html.replace(/href="\.\.\/salary-converter\//g, 'href="../../salary-converter/');
  html = html.replace(/href="\.\.\/quarterly-tax-estimator\//g, 'href="../../quarterly-tax-estimator/');
  html = html.replace(/href="\.\.\/freelance-rate-calculator\//g, 'href="../../freelance-rate-calculator/');
  html = html.replace(/href="\.\.\/compound-interest-calculator\//g, 'href="../../compound-interest-calculator/');

  // Pre-select this state: replace stateSelect.value = 'CA'
  html = html.replace(
    "stateSelect.value = 'CA';",
    "stateSelect.value = '" + code + "';"
  );

  // Update state links to be relative to parent
  html = html.replace(
    "a.href = slug + '/';",
    "a.href = '../' + slug + '/';"
  );

  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log('Generated: ' + slug + '/index.html');
});

console.log('\nDone! Generated ' + stateEntries.length + ' state pages.');
