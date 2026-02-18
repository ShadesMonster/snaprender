(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // ============================================================
  // COUNTRY DATA
  // ============================================================
  var COUNTRIES = {
    US: { name: 'United States', currency: 'USD', symbol: '$', defaultTax: 30, holidays: 10, seTax: true, note: '', benchLow: 75, benchHigh: 150 },
    UK: { name: 'United Kingdom', currency: 'GBP', symbol: '\u00A3', defaultTax: 32, holidays: 8, seTax: false, note: 'UK freelancers pay Income Tax + Class 2/4 National Insurance. Basic rate: 20% income + 9% NI = ~29%. Higher rate: 40% income + 2% NI.', benchLow: 50, benchHigh: 100 },
    CA: { name: 'Canada', currency: 'CAD', symbol: 'C$', defaultTax: 30, holidays: 10, seTax: false, note: 'Canadian self-employed pay both employee and employer CPP contributions (~11.9% combined). Federal + provincial income tax varies by province.', benchLow: 60, benchHigh: 120 },
    AU: { name: 'Australia', currency: 'AUD', symbol: 'A$', defaultTax: 32, holidays: 8, seTax: false, note: 'Australian freelancers pay income tax at marginal rates (19-45%). GST of 10% applies if revenue exceeds $75,000. Super contributions are not mandatory for sole traders but recommended.', benchLow: 80, benchHigh: 150 },
    DE: { name: 'Germany', currency: 'EUR', symbol: '\u20AC', defaultTax: 42, holidays: 10, seTax: false, note: 'German Freiberufler pay income tax (14-45%), solidarity surcharge (~5.5% of tax), and optional health/pension insurance. VAT (Umsatzsteuer) of 19% applies unless you use the Kleinunternehmerregelung.', benchLow: 60, benchHigh: 110 },
    FR: { name: 'France', currency: 'EUR', symbol: '\u20AC', defaultTax: 45, holidays: 11, seTax: false, note: 'French auto-entrepreneurs pay social charges (~22% for services) + income tax. Micro-enterprise regime offers simplified flat-rate deductions.', benchLow: 50, benchHigh: 100 },
    NL: { name: 'Netherlands', currency: 'EUR', symbol: '\u20AC', defaultTax: 40, holidays: 8, seTax: false, note: 'Dutch ZZP-ers pay income tax (37-49.5%) but benefit from zelfstandigenaftrek (self-employment deduction) and MKB-winstvrijstelling (14% profit exemption).', benchLow: 55, benchHigh: 110 },
    SE: { name: 'Sweden', currency: 'SEK', symbol: 'kr', defaultTax: 50, holidays: 12, seTax: false, note: 'Swedish freelancers pay income tax (~30-57%) plus egenavgifter (self-employment contributions ~28.97%). High taxes but includes healthcare and pension.', benchLow: 500, benchHigh: 1200 },
    ES: { name: 'Spain', currency: 'EUR', symbol: '\u20AC', defaultTax: 35, holidays: 14, seTax: false, note: 'Spanish aut\u00F3nomos pay IRPF income tax (19-47%) plus monthly social security quota (~300\u20AC/month minimum). New freelancers get a reduced rate for the first year.', benchLow: 40, benchHigh: 80 },
    IT: { name: 'Italy', currency: 'EUR', symbol: '\u20AC', defaultTax: 40, holidays: 12, seTax: false, note: 'Italian partita IVA holders can use the regime forfettario (flat 15% tax, 5% for first 5 years) if revenue is under \u20AC85,000. INPS contributions apply.', benchLow: 40, benchHigh: 85 },
    BR: { name: 'Brazil', currency: 'BRL', symbol: 'R$', defaultTax: 27, holidays: 12, seTax: false, note: 'Brazilian freelancers (MEI or individual) pay Simples Nacional or IRPF (7.5-27.5%). MEI has a very low monthly fee but caps at R$81,000/year.', benchLow: 100, benchHigh: 350 },
    IN: { name: 'India', currency: 'INR', symbol: '\u20B9', defaultTax: 30, holidays: 15, seTax: false, note: 'Indian freelancers pay income tax (5-30%) + 4% cess. The presumptive taxation scheme (Section 44ADA) allows claiming 50% of gross receipts as expenses automatically.', benchLow: 1500, benchHigh: 5000 },
    JP: { name: 'Japan', currency: 'JPY', symbol: '\u00A5', defaultTax: 33, holidays: 16, seTax: false, note: 'Japanese freelancers pay income tax (5-45%), resident tax (~10%), and National Health Insurance + Pension. Filing a blue tax return (aoiro shinkoku) provides a \u00A5650,000 deduction.', benchLow: 5000, benchHigh: 15000 },
    SG: { name: 'Singapore', currency: 'SGD', symbol: 'S$', defaultTax: 15, holidays: 11, seTax: false, note: 'Singapore has low personal tax rates (0-22%). Self-employed must contribute to CPF MediSave. No capital gains tax. GST of 9% if revenue exceeds S$1M.', benchLow: 80, benchHigh: 180 },
    NZ: { name: 'New Zealand', currency: 'NZD', symbol: 'NZ$', defaultTax: 30, holidays: 11, seTax: false, note: 'NZ sole traders pay income tax at marginal rates (10.5-39%). ACC levies apply. GST of 15% if revenue exceeds NZ$60,000.', benchLow: 70, benchHigh: 140 }
  };

  // ============================================================
  // ROLE PRESETS
  // ============================================================
  var PRESETS = {
    'web-dev': { income: 90000, software: 3000, hardware: 2000, insurance: 6000, office: 0, retirement: 5000, other: 2000, billable: '70', hours: 40 },
    'designer': { income: 80000, software: 4000, hardware: 2500, insurance: 6000, office: 0, retirement: 5000, other: 1500, billable: '65', hours: 40 },
    'writer': { income: 65000, software: 1200, hardware: 1500, insurance: 6000, office: 0, retirement: 3000, other: 1000, billable: '75', hours: 35 },
    'consultant': { income: 120000, software: 2000, hardware: 1500, insurance: 6000, office: 2400, retirement: 6000, other: 4000, billable: '60', hours: 45 },
    'photographer': { income: 70000, software: 2400, hardware: 5000, insurance: 6000, office: 1200, retirement: 4000, other: 3000, billable: '55', hours: 40 },
    'marketer': { income: 85000, software: 3000, hardware: 1500, insurance: 6000, office: 0, retirement: 5000, other: 3000, billable: '60', hours: 40 }
  };

  // US federal tax brackets 2024 (simplified)
  var US_BRACKETS = {
    single: [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    married: [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    head: [
      { limit: 16550, rate: 0.10 },
      { limit: 63100, rate: 0.12 },
      { limit: 100500, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243700, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ]
  };

  var US_STANDARD_DEDUCTION = { single: 14600, married: 29200, head: 21900 };
  var SE_TAX_RATE = 0.153;
  var SE_TAX_INCOME_FACTOR = 0.9235;
  var INFLATION_RATE = 0.03; // 3% default

  // ============================================================
  // STATE
  // ============================================================
  var currentCountry = 'US';
  var lastHourlyRate = null;
  var lastBillableHoursPerYear = null;
  var saveTimer = null;

  // ============================================================
  // HELPERS
  // ============================================================
  function formatCurrency(num) {
    var c = COUNTRIES[currentCountry];
    var rounded = Math.round(num);
    return c.symbol + rounded.toLocaleString('en-US');
  }

  function formatPct(num) {
    return num.toFixed(1) + '%';
  }

  function setTextContent(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function calcUSTax(taxableIncome, filingStatus) {
    var brackets = US_BRACKETS[filingStatus] || US_BRACKETS.single;
    var tax = 0;
    var prev = 0;
    for (var i = 0; i < brackets.length; i++) {
      var bracket = brackets[i];
      if (taxableIncome <= prev) break;
      var taxable = Math.min(taxableIncome, bracket.limit) - prev;
      tax += taxable * bracket.rate;
      prev = bracket.limit;
    }
    return tax;
  }

  // ============================================================
  // NUMBER ANIMATION
  // ============================================================
  function animateValue(el, targetText) {
    if (!el) return;
    // Extract number from target text
    var numMatch = targetText.replace(/[^0-9.-]/g, '');
    var targetNum = parseFloat(numMatch);
    if (isNaN(targetNum)) {
      el.textContent = targetText;
      return;
    }
    // Extract number from current text
    var currentMatch = el.textContent.replace(/[^0-9.-]/g, '');
    var startNum = parseFloat(currentMatch);
    if (isNaN(startNum)) startNum = 0;

    // If numbers are the same, just set text
    if (Math.round(startNum) === Math.round(targetNum)) {
      el.textContent = targetText;
      return;
    }

    var duration = 400;
    var startTime = null;
    // Figure out prefix and suffix from target text
    var prefix = targetText.substring(0, targetText.indexOf(numMatch.charAt(0)));
    var numEndIdx = targetText.lastIndexOf(numMatch.charAt(numMatch.length - 1));
    var suffix = targetText.substring(numEndIdx + 1);

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(startNum + (targetNum - startNum) * eased);
      el.textContent = prefix + current.toLocaleString('en-US') + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = targetText;
      }
    }
    requestAnimationFrame(step);
  }

  function setAnimated(id, text) {
    var el = $(id);
    if (el) animateValue(el, text);
  }

  function buildStackedBar(containerId, legendId, segments) {
    var bar = $(containerId);
    var legend = $(legendId);
    if (!bar || !legend) return;
    var total = 0;
    for (var i = 0; i < segments.length; i++) total += segments[i].value;
    bar.innerHTML = '';
    legend.innerHTML = '';
    for (var j = 0; j < segments.length; j++) {
      var seg = segments[j];
      var pct = total > 0 ? (seg.value / total * 100) : 0;
      var div = document.createElement('div');
      div.className = 'segment';
      div.style.width = pct + '%';
      div.style.background = seg.color;
      if (pct > 12) div.textContent = Math.round(pct) + '%';
      bar.appendChild(div);

      var item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = '<span class="legend-dot" style="background:' + seg.color + '"></span>' + seg.label + ': ' + formatCurrency(seg.value);
      legend.appendChild(item);
    }
  }

  // ============================================================
  // DONUT CHART
  // ============================================================
  function drawDonutChart(segments, totalLabel) {
    var canvas = $('donut-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var outerR = Math.min(cx, cy) - 10;
    var innerR = outerR * 0.62;

    ctx.clearRect(0, 0, w, h);

    var total = 0;
    for (var i = 0; i < segments.length; i++) total += segments[i].value;
    if (total <= 0) return;

    var startAngle = -Math.PI / 2;
    for (var j = 0; j < segments.length; j++) {
      var seg = segments[j];
      var sliceAngle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sliceAngle;
    }

    // Center value
    setTextContent('donut-center-value', totalLabel);

    // Legend
    var legend = $('donut-legend');
    if (legend) {
      legend.innerHTML = '';
      for (var k = 0; k < segments.length; k++) {
        var s = segments[k];
        var pct = (s.value / total * 100).toFixed(0);
        var item = document.createElement('div');
        item.className = 'donut-legend-item';
        item.innerHTML = '<span class="donut-legend-dot" style="background:' + s.color + '"></span>' +
          '<span class="donut-legend-label">' + s.label + '</span>' +
          '<span class="donut-legend-value">' + formatCurrency(s.value) + ' (' + pct + '%)</span>';
        legend.appendChild(item);
      }
    }
  }

  // ============================================================
  // CONFIDENCE METER
  // ============================================================
  function updateConfidenceMeter(hourlyRate) {
    var c = COUNTRIES[currentCountry];
    var low = c.benchLow;
    var high = c.benchHigh;
    var range = high - low;
    // Extend range slightly beyond benchmarks
    var displayLow = Math.round(low * 0.5);
    var displayHigh = Math.round(high * 1.3);
    var displayRange = displayHigh - displayLow;

    setTextContent('confidence-low', c.symbol + displayLow);
    setTextContent('confidence-high', c.symbol + displayHigh);

    var position = displayRange > 0 ? ((hourlyRate - displayLow) / displayRange * 100) : 50;
    position = Math.max(2, Math.min(98, position));
    $('confidence-marker').style.left = position + '%';

    var note = $('confidence-note');
    if (hourlyRate < low) {
      note.innerHTML = '<strong>Below market range.</strong> Your calculated rate of ' + formatCurrency(hourlyRate) + '/hr is below the typical ' + c.symbol + low + '-' + c.symbol + high + '/hr range for ' + c.name + '. Consider whether you\'re undervaluing your work.';
    } else if (hourlyRate > high) {
      note.innerHTML = '<strong>Premium rate.</strong> Your rate of ' + formatCurrency(hourlyRate) + '/hr is above the ' + c.symbol + low + '-' + c.symbol + high + '/hr market range. This is common for specialists and senior professionals in ' + c.name + '.';
    } else {
      note.innerHTML = '<strong>Within market range.</strong> Your rate of ' + formatCurrency(hourlyRate) + '/hr falls within the typical ' + c.symbol + low + '-' + c.symbol + high + '/hr range for tech/creative freelancers in ' + c.name + '.';
    }
  }

  // ============================================================
  // SMART TIPS
  // ============================================================
  function generateSmartTips(v, hourlyRate, grossRevenue) {
    var tips = [];
    var c = COUNTRIES[currentCountry];

    if (v.billablePct < 0.5) {
      tips.push({ type: 'warn', text: '<strong>Low billable percentage (' + Math.round(v.billablePct * 100) + '%).</strong> Most established freelancers bill 60-70% of their time. Consider streamlining admin work or using automation tools.' });
    }
    if (v.billablePct > 0.85) {
      tips.push({ type: 'warn', text: '<strong>Very high billable percentage (' + Math.round(v.billablePct * 100) + '%).</strong> Make sure you\'re leaving time for invoicing, marketing, and professional development. Burnout risk is real.' });
    }
    if (v.vacationDays < 10) {
      tips.push({ type: 'info', text: '<strong>Only ' + v.vacationDays + ' vacation days?</strong> Burnout is the #1 freelancer risk. Most successful freelancers take 3-4 weeks off per year to maintain quality work.' });
    }
    var totalExpenses = v.softwareCosts + v.hardwareCosts + v.insuranceCosts + v.officeCosts + v.retirementCosts + v.otherExpenses;
    if (totalExpenses > v.desiredIncome * 0.3) {
      tips.push({ type: 'warn', text: '<strong>High expenses.</strong> Your business costs (' + formatCurrency(totalExpenses) + ') are over 30% of your income goal. Review whether all expenses are essential.' });
    }
    if (v.retirementCosts === 0) {
      tips.push({ type: 'info', text: '<strong>No retirement savings?</strong> Unlike employees, you won\'t get an employer match. Even ' + formatCurrency(5000) + '/year now compounds significantly over time.' });
    }
    if (v.insuranceCosts === 0 && c.seTax) {
      tips.push({ type: 'warn', text: '<strong>No health insurance cost?</strong> If you\'re in the US without employer coverage, factor in $300-$800/month for marketplace insurance.' });
    }
    if (hourlyRate < c.benchLow * 0.7) {
      tips.push({ type: 'warn', text: '<strong>Rate significantly below market.</strong> At ' + formatCurrency(hourlyRate) + '/hr, you may be undercharging. The market range in ' + c.name + ' is ' + c.symbol + c.benchLow + '-' + c.symbol + c.benchHigh + '/hr.' });
    }
    if (hourlyRate >= c.benchHigh) {
      tips.push({ type: 'good', text: '<strong>Premium rate.</strong> At ' + formatCurrency(hourlyRate) + '/hr, you\'re at the high end. Consider value-based pricing for even more leverage.' });
    }
    if (v.hoursPerWeek > 50) {
      tips.push({ type: 'warn', text: '<strong>Working ' + v.hoursPerWeek + ' hours/week.</strong> Studies show productivity drops significantly past 50 hours. You may get more done in fewer, more focused hours.' });
    }

    var container = $('smart-tips');
    if (!container) return;
    container.innerHTML = '';
    // Show max 3 tips
    var shown = Math.min(tips.length, 3);
    for (var i = 0; i < shown; i++) {
      var tip = tips[i];
      var div = document.createElement('div');
      div.className = 'smart-tip';
      var iconClass = tip.type === 'warn' ? 'warn' : (tip.type === 'good' ? 'good' : 'info');
      var iconChar = tip.type === 'warn' ? '!' : (tip.type === 'good' ? '*' : 'i');
      div.innerHTML = '<span class="smart-tip-icon ' + iconClass + '">' + iconChar + '</span><span class="smart-tip-text">' + tip.text + '</span>';
      container.appendChild(div);
    }
  }

  // ============================================================
  // WHAT-IF SLIDER
  // ============================================================
  function updateWhatIf() {
    if (!lastHourlyRate || !lastBillableHoursPerYear) return;
    var adjustment = Number($('whatif-slider').value) || 0;
    var c = COUNTRIES[currentCountry];
    var newRate = lastHourlyRate + adjustment;
    var annualDiff = adjustment * lastBillableHoursPerYear;
    var monthlyDiff = annualDiff / 12;

    var sign = adjustment >= 0 ? '+' : '';
    setTextContent('whatif-amount', sign + c.symbol + adjustment);
    setTextContent('whatif-new-rate', formatCurrency(newRate) + '/hr');

    var annualEl = $('whatif-annual-diff');
    var monthlyEl = $('whatif-monthly-diff');

    setTextContent('whatif-annual-diff', sign + formatCurrency(annualDiff));
    setTextContent('whatif-monthly-diff', sign + formatCurrency(monthlyDiff));

    // Color code
    annualEl.className = 'whatif-item-value' + (annualDiff >= 0 ? ' positive' : ' negative');
    monthlyEl.className = 'whatif-item-value' + (monthlyDiff >= 0 ? ' positive' : ' negative');
  }

  var whatifSlider = $('whatif-slider');
  if (whatifSlider) {
    whatifSlider.addEventListener('input', updateWhatIf);
  }

  // ============================================================
  // DARK MODE
  // ============================================================
  function initDarkMode() {
    var saved = localStorage.getItem('onetab-theme');
    var toggle = $('theme-toggle');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggle) toggle.textContent = 'Light';
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          toggle.textContent = 'Dark';
          localStorage.setItem('onetab-theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          toggle.textContent = 'Light';
          localStorage.setItem('onetab-theme', 'dark');
        }
      });
    }
  }

  initDarkMode();

  // ============================================================
  // TABS
  // ============================================================
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].classList.toggle('active', tabBtns[i].getAttribute('data-tab') === tabId);
    }
    for (var j = 0; j < tabContents.length; j++) {
      tabContents[j].classList.toggle('active', tabContents[j].id === 'tab-' + tabId);
    }
  }

  for (var t = 0; t < tabBtns.length; t++) {
    tabBtns[t].addEventListener('click', function () {
      switchTab(this.getAttribute('data-tab'));
    });
  }

  // ============================================================
  // COUNTRY SELECTOR
  // ============================================================
  var countrySelect = $('country-select');

  function onCountryChange() {
    currentCountry = countrySelect.value;
    var c = COUNTRIES[currentCountry];

    $('currency-badge').textContent = c.currency + ' (' + c.symbol + ')';

    var symbols = document.querySelectorAll('.currency-symbol');
    for (var i = 0; i < symbols.length; i++) {
      symbols[i].textContent = c.symbol;
    }

    $('tax-rate').value = c.defaultTax;
    $('tax-rate-display').textContent = c.defaultTax + '%';
    $('holidays').value = c.holidays;

    var isUS = currentCountry === 'US';
    $('tax-us-card').style.display = isUS ? '' : 'none';
    $('tax-intl-card').style.display = isUS ? 'none' : '';
    if (!isUS) {
      $('tax-intl-rate').value = c.defaultTax;
      $('tax-intl-title').textContent = c.name + ' Tax Settings';
      var noteEl = $('tax-intl-note');
      if (c.note) {
        noteEl.innerHTML = '<strong>' + c.name + ':</strong> ' + c.note;
        noteEl.style.display = '';
      } else {
        noteEl.style.display = 'none';
      }
    }
  }

  countrySelect.addEventListener('change', onCountryChange);

  // ============================================================
  // ROLE PRESETS
  // ============================================================
  var presetSelect = $('role-preset');
  if (presetSelect) {
    presetSelect.addEventListener('change', function () {
      var preset = PRESETS[this.value];
      if (!preset) return;

      $('desired-income').value = preset.income;
      $('software-costs').value = preset.software;
      $('hardware-costs').value = preset.hardware;
      $('insurance-costs').value = preset.insurance;
      $('office-costs').value = preset.office;
      $('retirement-costs').value = preset.retirement;
      $('other-expenses').value = preset.other;
      $('hours-per-week').value = preset.hours;

      var billSelect = $('billable-pct');
      var option = billSelect.querySelector('option[value="' + preset.billable + '"]');
      if (option) billSelect.value = preset.billable;
      // If no exact match, find closest
      if (!option) {
        var opts = billSelect.options;
        for (var i = 0; i < opts.length; i++) {
          if (Number(opts[i].value) >= Number(preset.billable)) {
            billSelect.value = opts[i].value;
            break;
          }
        }
      }

      // Flash "applied" indicator
      var applied = $('preset-applied');
      if (applied) {
        applied.classList.add('show');
        setTimeout(function () { applied.classList.remove('show'); }, 2000);
      }

      scheduleSave();
    });
  }

  // ============================================================
  // TAX RATE SLIDER SYNC
  // ============================================================
  $('tax-rate').addEventListener('input', function () {
    $('tax-rate-display').textContent = this.value + '%';
    $('tax-rate-exact').value = '';
  });

  $('tax-rate-exact').addEventListener('input', function () {
    if (this.value !== '') {
      $('tax-rate').value = Math.min(60, Math.max(5, Number(this.value)));
      $('tax-rate-display').textContent = this.value + '%';
    }
  });

  // ============================================================
  // EMPTY STATES
  // ============================================================
  function hideEmptyState(tabId) {
    var empty = $(tabId);
    if (empty) empty.style.display = 'none';
  }

  // ============================================================
  // TAB 1: HOURLY RATE
  // ============================================================
  function getHourlyValues() {
    var desiredIncome = Number($('desired-income').value) || 0;
    var softwareCosts = Number($('software-costs').value) || 0;
    var hardwareCosts = Number($('hardware-costs').value) || 0;
    var insuranceCosts = Number($('insurance-costs').value) || 0;
    var officeCosts = Number($('office-costs').value) || 0;
    var retirementCosts = Number($('retirement-costs').value) || 0;
    var otherExpenses = Number($('other-expenses').value) || 0;

    var exactTax = $('tax-rate-exact').value;
    var taxRate = exactTax !== '' ? Number(exactTax) : Number($('tax-rate').value);

    var hoursPerWeek = Number($('hours-per-week').value) || 40;
    var billablePct = Number($('billable-pct').value) / 100;
    var vacationDays = Number($('vacation-days').value) || 0;
    var sickDays = Number($('sick-days').value) || 0;
    var holidays = Number($('holidays').value) || 0;

    return {
      desiredIncome: desiredIncome,
      softwareCosts: softwareCosts,
      hardwareCosts: hardwareCosts,
      insuranceCosts: insuranceCosts,
      officeCosts: officeCosts,
      retirementCosts: retirementCosts,
      otherExpenses: otherExpenses,
      taxRate: taxRate,
      hoursPerWeek: hoursPerWeek,
      billablePct: billablePct,
      vacationDays: vacationDays,
      sickDays: sickDays,
      holidays: holidays
    };
  }

  function calculateHourlyRate() {
    var v = getHourlyValues();
    var totalExpenses = v.softwareCosts + v.hardwareCosts + v.insuranceCosts + v.officeCosts + v.retirementCosts + v.otherExpenses;
    var preTaxSubtotal = v.desiredIncome + totalExpenses;
    var taxMultiplier = 1 - (v.taxRate / 100);
    var grossRevenue = taxMultiplier > 0 ? preTaxSubtotal / taxMultiplier : 0;
    var taxAmount = grossRevenue - preTaxSubtotal;

    var totalDaysOff = v.vacationDays + v.sickDays + v.holidays;
    var weeksOff = totalDaysOff / 5;
    var workingWeeks = Math.max(52 - weeksOff, 1);
    var billableHoursPerWeek = v.hoursPerWeek * v.billablePct;
    var billableHoursPerYear = Math.max(workingWeeks * billableHoursPerWeek, 1);

    var hourlyRate = grossRevenue / billableHoursPerYear;
    lastHourlyRate = hourlyRate;
    lastBillableHoursPerYear = billableHoursPerYear;

    // Update project cost tab rate
    $('proj-hourly-rate').value = Math.round(hourlyRate);
    $('proj-rate-hint').textContent = 'Auto-filled from Hourly Rate tab';
    $('profit-rate').value = Math.round(hourlyRate);

    var comfortableRate = hourlyRate * 1.2;
    var premiumRate = hourlyRate * 1.5;
    var expertRate = hourlyRate * 2.0;

    var monthlyRevenue = grossRevenue / 12;
    var weeklyRevenue = grossRevenue / workingWeeks;
    var dailyRate = hourlyRate * 8;
    var equivSalary = v.desiredIncome + totalExpenses;

    // Update DOM with animations
    setAnimated('result-rate', formatCurrency(hourlyRate));
    setTextContent('result-income-goal', formatCurrency(v.desiredIncome));

    setAnimated('rate-comfortable', formatCurrency(comfortableRate));
    setAnimated('rate-premium', formatCurrency(premiumRate));
    setAnimated('rate-expert', formatCurrency(expertRate));

    setTextContent('bd-income', formatCurrency(v.desiredIncome));
    setTextContent('bd-expenses', formatCurrency(totalExpenses));
    setTextContent('bd-pretax-subtotal', formatCurrency(preTaxSubtotal));
    setTextContent('bd-tax-rate', v.taxRate.toString());
    setTextContent('bd-taxes', formatCurrency(taxAmount));
    setTextContent('bd-gross', formatCurrency(grossRevenue));

    setTextContent('bd-weeks-off', weeksOff.toFixed(1) + ' weeks (' + totalDaysOff + ' days)');
    setTextContent('bd-working-weeks', workingWeeks.toFixed(1));
    setTextContent('bd-billable-calc', v.hoursPerWeek + 'hr \u00D7 ' + Math.round(v.billablePct * 100) + '% = ' + billableHoursPerWeek.toFixed(1) + 'hr');
    setTextContent('bd-billable-hours', Math.round(billableHoursPerYear).toString());

    setAnimated('bd-daily', formatCurrency(dailyRate));
    setAnimated('bd-weekly', formatCurrency(weeklyRevenue));
    setAnimated('bd-monthly', formatCurrency(monthlyRevenue));
    setAnimated('bd-equiv-salary', formatCurrency(equivSalary));

    // Stacked bar
    var barSegments = [
      { label: 'Take-home', value: v.desiredIncome, color: '#059669' },
      { label: 'Expenses', value: totalExpenses, color: '#d97706' },
      { label: 'Taxes', value: taxAmount, color: '#dc2626' }
    ];
    buildStackedBar('revenue-bar', 'revenue-legend', barSegments);

    // Donut chart
    drawDonutChart(barSegments, formatCurrency(grossRevenue));

    // Confidence meter
    updateConfidenceMeter(hourlyRate);

    // What-if slider
    $('whatif-slider').value = 0;
    updateWhatIf();

    // Inflation
    var inflatedRate = hourlyRate * (1 + INFLATION_RATE);
    setTextContent('inflation-badge', '+' + Math.round(INFLATION_RATE * 100) + '%');
    setTextContent('inflation-rate', formatCurrency(inflatedRate));

    // Smart tips
    generateSmartTips(v, hourlyRate, grossRevenue);

    // Hide empty state, show results
    hideEmptyState('hourly-empty');
    $('hourly-results').classList.add('visible');
    $('hourly-results').scrollIntoView({ behavior: 'smooth', block: 'start' });

    scheduleSave();
  }

  $('hourly-form').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateHourlyRate();
  });

  // ============================================================
  // TAB 2: PROJECT COST
  // ============================================================
  function calculateProjectCost() {
    var rate = Number($('proj-hourly-rate').value) || 100;
    var hours = Number($('proj-hours').value) || 40;
    var complexity = Number($('proj-complexity').value) || 1.5;
    var revisions = Number($('proj-revisions').value) || 0;
    var revisionHours = Number($('proj-revision-hours').value) || 0;
    var depositPct = Number($('proj-deposit').value) / 100;
    var rushPct = Number($('proj-rush').value) / 100;

    var baseCost = hours * rate;
    var complexityCost = baseCost * (complexity - 1);
    var revisionCost = revisions * revisionHours * rate;
    var subtotal = baseCost + complexityCost + revisionCost;
    var rushCost = subtotal * rushPct;
    var totalCost = subtotal + rushCost;

    var totalHours = hours * complexity + (revisions * revisionHours);

    var lowPrice = baseCost + revisionCost;
    var midPrice = totalCost;
    var highPrice = totalCost * 1.3;

    var deposit = totalCost * depositPct;
    var finalPayment = totalCost - deposit;

    var effRateEst = totalCost / totalHours;
    var effRateOver = totalCost / (totalHours * 1.5);
    var effRateUnder = totalCost / (totalHours * 0.75);

    setAnimated('proj-result-price', formatCurrency(totalCost));
    setTextContent('proj-result-hours', Math.round(totalHours).toString());

    setAnimated('proj-price-low', formatCurrency(lowPrice));
    setAnimated('proj-price-mid', formatCurrency(midPrice));
    setAnimated('proj-price-high', formatCurrency(highPrice));

    setTextContent('proj-bd-base', formatCurrency(baseCost));
    setTextContent('proj-bd-complexity-label', complexity + 'x');
    setTextContent('proj-bd-complexity', formatCurrency(complexityCost));
    setTextContent('proj-bd-rev-label', revisions + ' \u00D7 ' + revisionHours + 'hr');
    setTextContent('proj-bd-revisions', formatCurrency(revisionCost));
    setTextContent('proj-bd-rush', formatCurrency(rushCost));
    setTextContent('proj-bd-total', formatCurrency(totalCost));

    setTextContent('proj-pay-deposit', formatCurrency(deposit));
    setTextContent('proj-pay-final', formatCurrency(finalPayment));

    setTextContent('proj-eff-rate-est', formatCurrency(effRateEst) + '/hr');
    setTextContent('proj-eff-rate-over', formatCurrency(effRateOver) + '/hr');
    setTextContent('proj-eff-rate-under', formatCurrency(effRateUnder) + '/hr');

    hideEmptyState('project-empty');
    $('project-results').classList.add('visible');
    $('project-results').scrollIntoView({ behavior: 'smooth', block: 'start' });

    scheduleSave();
  }

  $('project-form').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateProjectCost();
  });

  // ============================================================
  // TAB 3: PROFITABILITY
  // ============================================================
  function calculateProfitability() {
    var rate = Number($('profit-rate').value) || 100;
    var hoursWeek = Number($('profit-hours-week').value) || 28;
    var weeksYear = Number($('profit-weeks-year').value) || 46;
    var bizExpenses = Number($('profit-biz-expenses').value) || 0;
    var taxRatePct = Number($('profit-tax-rate').value) || 30;
    var incomeGoal = Number($('profit-income-goal').value) || 0;
    var savingsGoal = Number($('profit-savings-goal').value) || 0;

    var grossRevenue = rate * hoursWeek * weeksYear;
    var taxes = grossRevenue * (taxRatePct / 100);
    var takeHome = grossRevenue - taxes - bizExpenses;
    var profitMargin = grossRevenue > 0 ? (takeHome / grossRevenue * 100) : 0;

    var totalHoursYear = hoursWeek * weeksYear;
    var effRate = totalHoursYear > 0 ? takeHome / totalHoursYear : 0;

    setAnimated('profit-gross-revenue', formatCurrency(grossRevenue));
    setAnimated('profit-take-home', formatCurrency(takeHome));
    setAnimated('profit-eff-rate', formatCurrency(effRate));
    setTextContent('profit-margin', formatPct(profitMargin));

    var takeHomeBox = $('profit-take-home-box');
    takeHomeBox.className = 'stat-box';
    if (takeHome >= incomeGoal && incomeGoal > 0) {
      takeHomeBox.classList.add('success');
    } else if (takeHome > 0) {
      takeHomeBox.classList.add('warning');
    } else {
      takeHomeBox.classList.add('danger');
    }

    var marginBox = $('profit-margin-box');
    marginBox.className = 'stat-box';
    if (profitMargin >= 50) marginBox.classList.add('success');
    else if (profitMargin >= 35) marginBox.classList.add('warning');
    else marginBox.classList.add('danger');

    buildStackedBar('profit-revenue-bar', 'profit-revenue-legend', [
      { label: 'Take-home', value: Math.max(takeHome, 0), color: '#059669' },
      { label: 'Expenses', value: bizExpenses, color: '#d97706' },
      { label: 'Taxes', value: taxes, color: '#dc2626' }
    ]);

    setTextContent('profit-bd-gross', formatCurrency(grossRevenue));
    setTextContent('profit-bd-taxes', formatCurrency(taxes));
    setTextContent('profit-bd-expenses', formatCurrency(bizExpenses));
    setTextContent('profit-bd-takehome', formatCurrency(takeHome));

    var incomeProgress = incomeGoal > 0 ? Math.min(takeHome / incomeGoal * 100, 100) : 0;
    var incomeProgressBar = $('profit-income-progress');
    incomeProgressBar.style.width = Math.max(incomeProgress, 0) + '%';
    incomeProgressBar.className = 'progress-fill';
    if (incomeProgress >= 100) incomeProgressBar.classList.add('green');
    else if (incomeProgress >= 70) incomeProgressBar.classList.add('yellow');
    else incomeProgressBar.classList.add('red');

    setTextContent('profit-income-current', formatCurrency(takeHome));
    setTextContent('profit-income-target', 'Goal: ' + formatCurrency(incomeGoal));

    var surplus = takeHome - incomeGoal;
    var savingsProgress = savingsGoal > 0 ? Math.min(Math.max(surplus, 0) / savingsGoal * 100, 100) : 0;
    var savingsProgressBar = $('profit-savings-progress');
    savingsProgressBar.style.width = Math.max(savingsProgress, 0) + '%';
    savingsProgressBar.className = 'progress-fill';
    if (savingsProgress >= 100) savingsProgressBar.classList.add('green');
    else if (savingsProgress >= 50) savingsProgressBar.classList.add('yellow');
    else savingsProgressBar.classList.add('red');

    setTextContent('profit-savings-current', formatCurrency(Math.max(surplus, 0)));
    setTextContent('profit-savings-target', 'Goal: ' + formatCurrency(savingsGoal));

    var advice = $('profit-advice');
    if (takeHome >= incomeGoal + savingsGoal && incomeGoal > 0) {
      advice.className = 'info-box success';
      advice.innerHTML = '<strong>Great news:</strong> At your current rate and hours, you\'re on track to exceed both your income and savings goals. Consider whether you could reduce hours for better work-life balance, or invest the surplus into growing your business.';
    } else if (takeHome >= incomeGoal && incomeGoal > 0) {
      advice.className = 'info-box';
      advice.innerHTML = '<strong>On track:</strong> You\'re meeting your income goal but not quite reaching your savings target. A 10% rate increase or a few more billable hours per week would close the gap. See the what-if scenarios below.';
    } else if (takeHome > 0) {
      var shortfall = incomeGoal - takeHome;
      var rateIncrease = hoursWeek * weeksYear > 0 ? shortfall / ((1 - taxRatePct / 100) * hoursWeek * weeksYear) : 0;
      advice.className = 'info-box warning';
      advice.innerHTML = '<strong>Below target:</strong> You\'re ' + formatCurrency(shortfall) + ' short of your income goal. You\'d need to raise your rate by about ' + formatCurrency(rateIncrease) + '/hr (to ' + formatCurrency(rate + rateIncrease) + '/hr) to close the gap at current hours.';
    } else {
      advice.className = 'info-box warning';
      advice.innerHTML = '<strong>Attention:</strong> Your expenses and taxes exceed your revenue. Review your expense structure or increase your rate and billable hours.';
    }
    advice.style.display = '';

    var takeHome10 = (rate * 1.1 * hoursWeek * weeksYear) * (1 - taxRatePct / 100) - bizExpenses;
    var takeHome5hrs = (rate * (hoursWeek + 5) * weeksYear) * (1 - taxRatePct / 100) - bizExpenses;
    var takeHomeLessExp = grossRevenue * (1 - taxRatePct / 100) - bizExpenses * 0.8;

    setTextContent('profit-whatif-rate', '+' + formatCurrency(takeHome10 - takeHome) + '/yr');
    setTextContent('profit-whatif-hours', '+' + formatCurrency(takeHome5hrs - takeHome) + '/yr');
    setTextContent('profit-whatif-expenses', '+' + formatCurrency(takeHomeLessExp - takeHome) + '/yr');

    hideEmptyState('profit-empty');
    $('profit-results').classList.add('visible');
    $('profit-results').scrollIntoView({ behavior: 'smooth', block: 'start' });

    scheduleSave();
  }

  $('profit-form').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateProfitability();
  });

  // ============================================================
  // TAB 4: TAX CALCULATOR
  // ============================================================
  function calculateTax() {
    var grossIncome = Number($('tax-gross-income').value) || 0;
    var deductions = Number($('tax-deductions').value) || 0;
    var isUS = currentCountry === 'US';

    var totalTax, takeHome;

    if (isUS) {
      var filingStatus = $('tax-filing-status').value;
      var stateRate = Number($('tax-state').value) / 100;

      var netEarnings = grossIncome - deductions;
      var standardDeduction = US_STANDARD_DEDUCTION[filingStatus] || US_STANDARD_DEDUCTION.single;

      var seIncome = netEarnings * SE_TAX_INCOME_FACTOR;
      var seTax = Math.max(seIncome * SE_TAX_RATE, 0);

      var seDeduction = seTax / 2;
      var taxableIncome = Math.max(netEarnings - standardDeduction - seDeduction, 0);

      var federalTax = calcUSTax(taxableIncome, filingStatus);
      var stateTax = netEarnings * stateRate;

      totalTax = federalTax + seTax + stateTax;
      takeHome = grossIncome - deductions - totalTax;

      $('tax-us-breakdown').style.display = '';
      $('tax-intl-breakdown').style.display = 'none';

      setTextContent('tax-bd-gross', formatCurrency(grossIncome));
      setTextContent('tax-bd-deductions', formatCurrency(deductions));
      setTextContent('tax-bd-taxable', formatCurrency(taxableIncome));
      setTextContent('tax-bd-federal', formatCurrency(federalTax));
      setTextContent('tax-bd-se', formatCurrency(seTax));
      setTextContent('tax-bd-state', formatCurrency(stateTax));
      setTextContent('tax-bd-total', formatCurrency(totalTax));

      buildStackedBar('tax-bar', 'tax-legend', [
        { label: 'Take-home', value: Math.max(takeHome, 0), color: '#059669' },
        { label: 'Federal tax', value: federalTax, color: '#dc2626' },
        { label: 'SE tax', value: seTax, color: '#b91c1c' },
        { label: 'State tax', value: stateTax, color: '#f59e0b' },
        { label: 'Deductions', value: deductions, color: '#6b7280' }
      ]);
    } else {
      var intlRate = Number($('tax-intl-rate').value) / 100;
      var taxableIncomeIntl = Math.max(grossIncome - deductions, 0);
      totalTax = taxableIncomeIntl * intlRate;
      takeHome = grossIncome - deductions - totalTax;

      $('tax-us-breakdown').style.display = 'none';
      $('tax-intl-breakdown').style.display = '';

      setTextContent('tax-intl-bd-gross', formatCurrency(grossIncome));
      setTextContent('tax-intl-bd-deductions', formatCurrency(deductions));
      setTextContent('tax-intl-bd-taxable', formatCurrency(taxableIncomeIntl));
      setTextContent('tax-intl-bd-rate-label', $('tax-intl-rate').value);
      setTextContent('tax-intl-bd-tax', formatCurrency(totalTax));
      setTextContent('tax-intl-bd-takehome', formatCurrency(takeHome));
    }

    var effRate = grossIncome > 0 ? (totalTax / grossIncome * 100) : 0;
    var quarterly = totalTax / 4;

    setAnimated('tax-total-owed', formatCurrency(totalTax));
    setAnimated('tax-take-home', formatCurrency(takeHome));
    setTextContent('tax-eff-rate', formatPct(effRate));
    setAnimated('tax-quarterly-amt', formatCurrency(quarterly));

    setTextContent('tax-q1', formatCurrency(quarterly));
    setTextContent('tax-q2', formatCurrency(quarterly));
    setTextContent('tax-q3', formatCurrency(quarterly));
    setTextContent('tax-q4', formatCurrency(quarterly));

    hideEmptyState('tax-empty');
    $('tax-results').classList.add('visible');
    $('tax-results').scrollIntoView({ behavior: 'smooth', block: 'start' });

    scheduleSave();
  }

  $('tax-form').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateTax();
  });

  // ============================================================
  // SHARE BUTTONS
  // ============================================================
  function buildShareURL() {
    var v = getHourlyValues();
    var params = new URLSearchParams();
    params.set('country', currentCountry);
    params.set('income', v.desiredIncome);
    params.set('sw', v.softwareCosts);
    params.set('hw', v.hardwareCosts);
    params.set('ins', v.insuranceCosts);
    params.set('office', v.officeCosts);
    params.set('retire', v.retirementCosts);
    params.set('other', v.otherExpenses);
    params.set('tax', v.taxRate);
    params.set('hrs', v.hoursPerWeek);
    params.set('bill', Math.round(v.billablePct * 100));
    params.set('vac', v.vacationDays);
    params.set('sick', v.sickDays);
    params.set('hol', v.holidays);
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  $('share-copy').addEventListener('click', function () {
    var url = buildShareURL();
    navigator.clipboard.writeText(url).then(function () {
      $('share-copy').textContent = 'Copied!';
      setTimeout(function () { $('share-copy').textContent = 'Copy Link'; }, 2000);
    });
  });

  $('share-twitter').addEventListener('click', function () {
    var rate = $('result-rate').textContent;
    var text = 'I just calculated my freelance hourly rate: ' + rate + '/hr. Find yours:';
    var url = buildShareURL();
    window.open(
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
      '_blank',
      'width=550,height=420'
    );
  });

  $('share-linkedin').addEventListener('click', function () {
    var url = buildShareURL();
    window.open(
      'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
      '_blank',
      'width=550,height=420'
    );
  });

  // ============================================================
  // PRINT
  // ============================================================
  var printBtn = $('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }

  // ============================================================
  // LOCAL STORAGE SAVE / RESTORE
  // ============================================================
  var STORAGE_KEY = 'onetab-freelance-calc';

  function saveToStorage() {
    try {
      var data = {
        country: currentCountry,
        hourly: {
          income: $('desired-income').value,
          software: $('software-costs').value,
          hardware: $('hardware-costs').value,
          insurance: $('insurance-costs').value,
          office: $('office-costs').value,
          retirement: $('retirement-costs').value,
          other: $('other-expenses').value,
          taxRate: $('tax-rate').value,
          taxExact: $('tax-rate-exact').value,
          hours: $('hours-per-week').value,
          billable: $('billable-pct').value,
          vacation: $('vacation-days').value,
          sick: $('sick-days').value,
          holidays: $('holidays').value
        },
        project: {
          rate: $('proj-hourly-rate').value,
          hours: $('proj-hours').value,
          complexity: $('proj-complexity').value,
          revisions: $('proj-revisions').value,
          revisionHours: $('proj-revision-hours').value,
          deposit: $('proj-deposit').value,
          rush: $('proj-rush').value
        },
        profit: {
          rate: $('profit-rate').value,
          hours: $('profit-hours-week').value,
          weeks: $('profit-weeks-year').value,
          expenses: $('profit-biz-expenses').value,
          tax: $('profit-tax-rate').value,
          incomeGoal: $('profit-income-goal').value,
          savingsGoal: $('profit-savings-goal').value
        },
        tax: {
          gross: $('tax-gross-income').value,
          deductions: $('tax-deductions').value,
          filing: $('tax-filing-status').value,
          state: $('tax-state').value,
          intlRate: $('tax-intl-rate').value
        },
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Show save indicator
      var indicator = $('save-indicator');
      if (indicator) {
        indicator.classList.add('show');
        setTimeout(function () { indicator.classList.remove('show'); }, 1500);
      }
    } catch (e) {
      // localStorage might be unavailable
    }
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveToStorage, 500);
  }

  function loadFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);

      // Don't restore if data is very old (30 days)
      if (data.timestamp && Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) return false;

      if (data.country && COUNTRIES[data.country]) {
        countrySelect.value = data.country;
        onCountryChange();
      }

      if (data.hourly) {
        var h = data.hourly;
        if (h.income) $('desired-income').value = h.income;
        if (h.software) $('software-costs').value = h.software;
        if (h.hardware) $('hardware-costs').value = h.hardware;
        if (h.insurance) $('insurance-costs').value = h.insurance;
        if (h.office !== undefined) $('office-costs').value = h.office;
        if (h.retirement) $('retirement-costs').value = h.retirement;
        if (h.other) $('other-expenses').value = h.other;
        if (h.taxRate) {
          $('tax-rate').value = h.taxRate;
          $('tax-rate-display').textContent = h.taxRate + '%';
        }
        if (h.taxExact) $('tax-rate-exact').value = h.taxExact;
        if (h.hours) $('hours-per-week').value = h.hours;
        if (h.billable) $('billable-pct').value = h.billable;
        if (h.vacation !== undefined) $('vacation-days').value = h.vacation;
        if (h.sick !== undefined) $('sick-days').value = h.sick;
        if (h.holidays !== undefined) $('holidays').value = h.holidays;
      }

      if (data.project) {
        var p = data.project;
        if (p.rate) $('proj-hourly-rate').value = p.rate;
        if (p.hours) $('proj-hours').value = p.hours;
        if (p.complexity) $('proj-complexity').value = p.complexity;
        if (p.revisions !== undefined) $('proj-revisions').value = p.revisions;
        if (p.revisionHours !== undefined) $('proj-revision-hours').value = p.revisionHours;
        if (p.deposit) $('proj-deposit').value = p.deposit;
        if (p.rush !== undefined) $('proj-rush').value = p.rush;
      }

      if (data.profit) {
        var pr = data.profit;
        if (pr.rate) $('profit-rate').value = pr.rate;
        if (pr.hours) $('profit-hours-week').value = pr.hours;
        if (pr.weeks) $('profit-weeks-year').value = pr.weeks;
        if (pr.expenses) $('profit-biz-expenses').value = pr.expenses;
        if (pr.tax) $('profit-tax-rate').value = pr.tax;
        if (pr.incomeGoal) $('profit-income-goal').value = pr.incomeGoal;
        if (pr.savingsGoal) $('profit-savings-goal').value = pr.savingsGoal;
      }

      if (data.tax) {
        var tx = data.tax;
        if (tx.gross) $('tax-gross-income').value = tx.gross;
        if (tx.deductions) $('tax-deductions').value = tx.deductions;
        if (tx.filing) $('tax-filing-status').value = tx.filing;
        if (tx.state) $('tax-state').value = tx.state;
        if (tx.intlRate) $('tax-intl-rate').value = tx.intlRate;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  // ============================================================
  // URL PARAMS (restore shared calculations)
  // ============================================================
  function loadFromURL() {
    var params = new URLSearchParams(window.location.search);
    if (window.location.search.length <= 1) return false;

    var country = params.get('country');
    if (country && COUNTRIES[country]) {
      countrySelect.value = country;
      onCountryChange();
    }

    var fields = {
      'desired-income': 'income',
      'software-costs': 'sw',
      'hardware-costs': 'hw',
      'insurance-costs': 'ins',
      'office-costs': 'office',
      'retirement-costs': 'retire',
      'other-expenses': 'other',
      'hours-per-week': 'hrs',
      'vacation-days': 'vac',
      'sick-days': 'sick',
      'holidays': 'hol'
    };

    var hasParams = false;
    for (var fieldId in fields) {
      var val = params.get(fields[fieldId]);
      if (val !== null && !isNaN(Number(val))) {
        $(fieldId).value = val;
        hasParams = true;
      }
    }

    var tax = params.get('tax');
    if (tax !== null) {
      $('tax-rate').value = Math.min(60, Math.max(5, Number(tax)));
      $('tax-rate-display').textContent = tax + '%';
      hasParams = true;
    }

    var bill = params.get('bill');
    if (bill !== null) {
      var billSelect = $('billable-pct');
      var option = billSelect.querySelector('option[value="' + bill + '"]');
      if (option) billSelect.value = bill;
      hasParams = true;
    }

    if (hasParams) {
      calculateHourlyRate();
    }
    return hasParams;
  }

  // ============================================================
  // INIT
  // ============================================================
  onCountryChange();

  // URL params take priority over localStorage
  var loadedFromURL = loadFromURL();
  if (!loadedFromURL) {
    loadFromStorage();
  }
})();
