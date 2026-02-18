(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // ============================================================
  // COUNTRY DATA
  // ============================================================
  var COUNTRIES = {
    US: { name: 'United States', currency: 'USD', symbol: '$', defaultTax: 30, holidays: 10, seTax: true, note: '' },
    UK: { name: 'United Kingdom', currency: 'GBP', symbol: '\u00A3', defaultTax: 32, holidays: 8, seTax: false, note: 'UK freelancers pay Income Tax + Class 2/4 National Insurance. Basic rate: 20% income + 9% NI = ~29%. Higher rate: 40% income + 2% NI.' },
    CA: { name: 'Canada', currency: 'CAD', symbol: 'C$', defaultTax: 30, holidays: 10, seTax: false, note: 'Canadian self-employed pay both employee and employer CPP contributions (~11.9% combined). Federal + provincial income tax varies by province.' },
    AU: { name: 'Australia', currency: 'AUD', symbol: 'A$', defaultTax: 32, holidays: 8, seTax: false, note: 'Australian freelancers pay income tax at marginal rates (19-45%). GST of 10% applies if revenue exceeds $75,000. Super contributions are not mandatory for sole traders but recommended.' },
    DE: { name: 'Germany', currency: 'EUR', symbol: '\u20AC', defaultTax: 42, holidays: 10, seTax: false, note: 'German Freiberufler pay income tax (14-45%), solidarity surcharge (~5.5% of tax), and optional health/pension insurance. VAT (Umsatzsteuer) of 19% applies unless you use the Kleinunternehmerregelung.' },
    FR: { name: 'France', currency: 'EUR', symbol: '\u20AC', defaultTax: 45, holidays: 11, seTax: false, note: 'French auto-entrepreneurs pay social charges (~22% for services) + income tax. Micro-enterprise regime offers simplified flat-rate deductions.' },
    NL: { name: 'Netherlands', currency: 'EUR', symbol: '\u20AC', defaultTax: 40, holidays: 8, seTax: false, note: 'Dutch ZZP-ers pay income tax (37-49.5%) but benefit from zelfstandigenaftrek (self-employment deduction) and MKB-winstvrijstelling (14% profit exemption).' },
    SE: { name: 'Sweden', currency: 'SEK', symbol: 'kr', defaultTax: 50, holidays: 12, seTax: false, note: 'Swedish freelancers pay income tax (~30-57%) plus egenavgifter (self-employment contributions ~28.97%). High taxes but includes healthcare and pension.' },
    ES: { name: 'Spain', currency: 'EUR', symbol: '\u20AC', defaultTax: 35, holidays: 14, seTax: false, note: 'Spanish aut\u00F3nomos pay IRPF income tax (19-47%) plus monthly social security quota (~300\u20AC/month minimum). New freelancers get a reduced rate for the first year.' },
    IT: { name: 'Italy', currency: 'EUR', symbol: '\u20AC', defaultTax: 40, holidays: 12, seTax: false, note: 'Italian partita IVA holders can use the regime forfettario (flat 15% tax, 5% for first 5 years) if revenue is under \u20AC85,000. INPS contributions apply.' },
    BR: { name: 'Brazil', currency: 'BRL', symbol: 'R$', defaultTax: 27, holidays: 12, seTax: false, note: 'Brazilian freelancers (MEI or individual) pay Simples Nacional or IRPF (7.5-27.5%). MEI has a very low monthly fee but caps at R$81,000/year.' },
    IN: { name: 'India', currency: 'INR', symbol: '\u20B9', defaultTax: 30, holidays: 15, seTax: false, note: 'Indian freelancers pay income tax (5-30%) + 4% cess. The presumptive taxation scheme (Section 44ADA) allows claiming 50% of gross receipts as expenses automatically.' },
    JP: { name: 'Japan', currency: 'JPY', symbol: '\u00A5', defaultTax: 33, holidays: 16, seTax: false, note: 'Japanese freelancers pay income tax (5-45%), resident tax (~10%), and National Health Insurance + Pension. Filing a blue tax return (aoiro shinkoku) provides a \u00A5650,000 deduction.' },
    SG: { name: 'Singapore', currency: 'SGD', symbol: 'S$', defaultTax: 15, holidays: 11, seTax: false, note: 'Singapore has low personal tax rates (0-22%). Self-employed must contribute to CPF MediSave. No capital gains tax. GST of 9% if revenue exceeds S$1M.' },
    NZ: { name: 'New Zealand', currency: 'NZD', symbol: 'NZ$', defaultTax: 30, holidays: 11, seTax: false, note: 'NZ sole traders pay income tax at marginal rates (10.5-39%). ACC levies apply. GST of 15% if revenue exceeds NZ$60,000.' }
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
  var SE_TAX_RATE = 0.153; // Social Security 12.4% + Medicare 2.9%
  var SE_TAX_INCOME_FACTOR = 0.9235; // 92.35% of net earnings subject to SE tax

  // ============================================================
  // STATE
  // ============================================================
  var currentCountry = 'US';
  var lastHourlyRate = null; // Pass between tabs

  // ============================================================
  // HELPERS
  // ============================================================
  function formatCurrency(num) {
    var c = COUNTRIES[currentCountry];
    var rounded = Math.round(num);
    if (c.currency === 'JPY') {
      return c.symbol + rounded.toLocaleString('en-US');
    }
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

    // Update currency badge
    setTextContent('currency-badge', c.currency + ' (' + c.symbol + ')');
    $('currency-badge').textContent = c.currency + ' (' + c.symbol + ')';

    // Update all currency symbols
    var symbols = document.querySelectorAll('.currency-symbol');
    for (var i = 0; i < symbols.length; i++) {
      symbols[i].textContent = c.symbol;
    }

    // Update tax rate slider default
    $('tax-rate').value = c.defaultTax;
    $('tax-rate-display').textContent = c.defaultTax + '%';

    // Update holidays default
    $('holidays').value = c.holidays;

    // Tax tab: toggle US vs international
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

    // Update DOM
    setTextContent('result-rate', formatCurrency(hourlyRate));
    setTextContent('result-income-goal', formatCurrency(v.desiredIncome));

    setTextContent('rate-comfortable', formatCurrency(comfortableRate));
    setTextContent('rate-premium', formatCurrency(premiumRate));
    setTextContent('rate-expert', formatCurrency(expertRate));

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

    setTextContent('bd-daily', formatCurrency(dailyRate));
    setTextContent('bd-weekly', formatCurrency(weeklyRevenue));
    setTextContent('bd-monthly', formatCurrency(monthlyRevenue));
    setTextContent('bd-equiv-salary', formatCurrency(equivSalary));

    // Stacked bar
    buildStackedBar('revenue-bar', 'revenue-legend', [
      { label: 'Take-home', value: v.desiredIncome, color: '#059669' },
      { label: 'Expenses', value: totalExpenses, color: '#d97706' },
      { label: 'Taxes', value: taxAmount, color: '#dc2626' }
    ]);

    // Show results
    $('hourly-results').classList.add('visible');
    $('hourly-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Price estimates
    var lowPrice = baseCost + revisionCost; // no complexity buffer
    var midPrice = totalCost;
    var highPrice = totalCost * 1.3; // 30% premium

    var deposit = totalCost * depositPct;
    var finalPayment = totalCost - deposit;

    // Effective rates
    var effRateEst = totalCost / totalHours;
    var effRateOver = totalCost / (totalHours * 1.5);
    var effRateUnder = totalCost / (totalHours * 0.75);

    setTextContent('proj-result-price', formatCurrency(totalCost));
    setTextContent('proj-result-hours', Math.round(totalHours).toString());

    setTextContent('proj-price-low', formatCurrency(lowPrice));
    setTextContent('proj-price-mid', formatCurrency(midPrice));
    setTextContent('proj-price-high', formatCurrency(highPrice));

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

    $('project-results').classList.add('visible');
    $('project-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Effective hourly rate = take-home / total hours worked (not just billable)
    var totalHoursYear = hoursWeek * weeksYear; // using billable hours since that's what they input
    var effRate = totalHoursYear > 0 ? takeHome / totalHoursYear : 0;

    // Update stat boxes
    setTextContent('profit-gross-revenue', formatCurrency(grossRevenue));
    setTextContent('profit-take-home', formatCurrency(takeHome));
    setTextContent('profit-eff-rate', formatCurrency(effRate));
    setTextContent('profit-margin', formatPct(profitMargin));

    // Color code take-home box
    var takeHomeBox = $('profit-take-home-box');
    takeHomeBox.className = 'stat-box';
    if (takeHome >= incomeGoal && incomeGoal > 0) {
      takeHomeBox.classList.add('success');
    } else if (takeHome > 0) {
      takeHomeBox.classList.add('warning');
    } else {
      takeHomeBox.classList.add('danger');
    }

    // Color code margin box
    var marginBox = $('profit-margin-box');
    marginBox.className = 'stat-box';
    if (profitMargin >= 50) marginBox.classList.add('success');
    else if (profitMargin >= 35) marginBox.classList.add('warning');
    else marginBox.classList.add('danger');

    // Stacked bar
    buildStackedBar('profit-revenue-bar', 'profit-revenue-legend', [
      { label: 'Take-home', value: Math.max(takeHome, 0), color: '#059669' },
      { label: 'Expenses', value: bizExpenses, color: '#d97706' },
      { label: 'Taxes', value: taxes, color: '#dc2626' }
    ]);

    setTextContent('profit-bd-gross', formatCurrency(grossRevenue));
    setTextContent('profit-bd-taxes', formatCurrency(taxes));
    setTextContent('profit-bd-expenses', formatCurrency(bizExpenses));
    setTextContent('profit-bd-takehome', formatCurrency(takeHome));

    // Goal tracking - income
    var incomeProgress = incomeGoal > 0 ? Math.min(takeHome / incomeGoal * 100, 100) : 0;
    var incomeProgressBar = $('profit-income-progress');
    incomeProgressBar.style.width = Math.max(incomeProgress, 0) + '%';
    incomeProgressBar.className = 'progress-fill';
    if (incomeProgress >= 100) incomeProgressBar.classList.add('green');
    else if (incomeProgress >= 70) incomeProgressBar.classList.add('yellow');
    else incomeProgressBar.classList.add('red');

    setTextContent('profit-income-current', formatCurrency(takeHome));
    setTextContent('profit-income-target', 'Goal: ' + formatCurrency(incomeGoal));

    // Goal tracking - savings
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

    // Advice
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

    // What-if scenarios
    var takeHome10 = (rate * 1.1 * hoursWeek * weeksYear) * (1 - taxRatePct / 100) - bizExpenses;
    var takeHome5hrs = (rate * (hoursWeek + 5) * weeksYear) * (1 - taxRatePct / 100) - bizExpenses;
    var takeHomeLessExp = grossRevenue * (1 - taxRatePct / 100) - bizExpenses * 0.8;

    setTextContent('profit-whatif-rate', '+' + formatCurrency(takeHome10 - takeHome) + '/yr');
    setTextContent('profit-whatif-hours', '+' + formatCurrency(takeHome5hrs - takeHome) + '/yr');
    setTextContent('profit-whatif-expenses', '+' + formatCurrency(takeHomeLessExp - takeHome) + '/yr');

    $('profit-results').classList.add('visible');
    $('profit-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      // Self-employment tax (on 92.35% of net earnings)
      var seIncome = netEarnings * SE_TAX_INCOME_FACTOR;
      var seTax = Math.max(seIncome * SE_TAX_RATE, 0);

      // Half of SE tax is deductible for income tax purposes
      var seDeduction = seTax / 2;
      var taxableIncome = Math.max(netEarnings - standardDeduction - seDeduction, 0);

      var federalTax = calcUSTax(taxableIncome, filingStatus);
      var stateTax = netEarnings * stateRate;

      totalTax = federalTax + seTax + stateTax;
      takeHome = grossIncome - deductions - totalTax;

      // Show US breakdown
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

      // Show intl breakdown
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

    setTextContent('tax-total-owed', formatCurrency(totalTax));
    setTextContent('tax-take-home', formatCurrency(takeHome));
    setTextContent('tax-eff-rate', formatPct(effRate));
    setTextContent('tax-quarterly-amt', formatCurrency(quarterly));

    setTextContent('tax-q1', formatCurrency(quarterly));
    setTextContent('tax-q2', formatCurrency(quarterly));
    setTextContent('tax-q3', formatCurrency(quarterly));
    setTextContent('tax-q4', formatCurrency(quarterly));

    $('tax-results').classList.add('visible');
    $('tax-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  // URL PARAMS (restore shared calculations)
  // ============================================================
  function loadFromURL() {
    var params = new URLSearchParams(window.location.search);
    if (params.size === 0 && !params.has('income')) return;

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
  }

  // ============================================================
  // INIT
  // ============================================================
  onCountryChange();
  loadFromURL();
})();
