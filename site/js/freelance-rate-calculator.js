(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const form = $('calculator-form');
  const resultsSection = $('results');

  // Parse URL params on load to restore shared calculations
  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const fields = {
      'desired-income': 'income',
      'software-costs': 'sw',
      'hardware-costs': 'hw',
      'insurance-costs': 'ins',
      'other-expenses': 'other',
      'hours-per-week': 'hrs',
      'vacation-days': 'vac',
      'sick-days': 'sick',
      'holidays': 'hol',
    };

    let hasParams = false;
    for (const [fieldId, param] of Object.entries(fields)) {
      const val = params.get(param);
      if (val !== null && !isNaN(Number(val))) {
        $(fieldId).value = val;
        hasParams = true;
      }
    }

    // Tax rate
    const tax = params.get('tax');
    if (tax !== null) {
      const select = $('tax-rate');
      const option = select.querySelector(`option[value="${tax}"]`);
      if (option) {
        select.value = tax;
      } else {
        $('tax-rate-custom').value = tax;
      }
      hasParams = true;
    }

    // Billable percentage
    const bill = params.get('bill');
    if (bill !== null) {
      $('billable-pct').value = bill;
      hasParams = true;
    }

    if (hasParams) {
      calculate();
    }
  }

  function getValues() {
    const desiredIncome = Number($('desired-income').value) || 0;
    const softwareCosts = Number($('software-costs').value) || 0;
    const hardwareCosts = Number($('hardware-costs').value) || 0;
    const insuranceCosts = Number($('insurance-costs').value) || 0;
    const otherExpenses = Number($('other-expenses').value) || 0;

    // Tax rate: custom overrides select
    const customTax = $('tax-rate-custom').value;
    const taxRate = customTax !== '' ? Number(customTax) : Number($('tax-rate').value);

    const hoursPerWeek = Number($('hours-per-week').value) || 40;
    const billablePct = Number($('billable-pct').value) / 100;
    const vacationDays = Number($('vacation-days').value) || 0;
    const sickDays = Number($('sick-days').value) || 0;
    const holidays = Number($('holidays').value) || 0;

    return {
      desiredIncome,
      softwareCosts,
      hardwareCosts,
      insuranceCosts,
      otherExpenses,
      taxRate,
      hoursPerWeek,
      billablePct,
      vacationDays,
      sickDays,
      holidays,
    };
  }

  function formatCurrency(num) {
    return '$' + Math.round(num).toLocaleString('en-US');
  }

  function calculate() {
    const v = getValues();

    // Total business expenses
    const totalExpenses = v.softwareCosts + v.hardwareCosts + v.insuranceCosts + v.otherExpenses;

    // Pre-tax income needed (income + expenses)
    const preTaxSubtotal = v.desiredIncome + totalExpenses;

    // Gross revenue needed (accounting for taxes)
    const taxMultiplier = 1 - (v.taxRate / 100);
    const grossRevenue = taxMultiplier > 0 ? preTaxSubtotal / taxMultiplier : 0;
    const taxAmount = grossRevenue - preTaxSubtotal;

    // Working time
    const totalDaysOff = v.vacationDays + v.sickDays + v.holidays;
    const weeksOff = totalDaysOff / 5;
    const workingWeeks = Math.max(52 - weeksOff, 1);
    const billableHoursPerWeek = v.hoursPerWeek * v.billablePct;
    const billableHoursPerYear = Math.max(workingWeeks * billableHoursPerWeek, 1);

    // The rate
    const hourlyRate = grossRevenue / billableHoursPerYear;

    // Alternative rates
    const comfortableRate = hourlyRate * 1.2;
    const premiumRate = hourlyRate * 1.5;
    const expertRate = hourlyRate * 2.0;

    // Equivalent salary (a salaried employee getting benefits worth ~30% of salary)
    const equivSalary = v.desiredIncome + totalExpenses;

    // Time-based rates
    const monthlyRevenue = grossRevenue / 12;
    const weeklyRevenue = grossRevenue / workingWeeks;
    const dailyRate = hourlyRate * 8;

    // Update DOM
    $('result-rate').textContent = formatCurrency(hourlyRate);
    $('result-income-goal').textContent = formatCurrency(v.desiredIncome);

    $('rate-comfortable').textContent = formatCurrency(comfortableRate);
    $('rate-premium').textContent = formatCurrency(premiumRate);
    $('rate-expert').textContent = formatCurrency(expertRate);

    $('bd-income').textContent = formatCurrency(v.desiredIncome);
    $('bd-expenses').textContent = formatCurrency(totalExpenses);
    $('bd-pretax-subtotal').textContent = formatCurrency(preTaxSubtotal);
    $('bd-tax-rate').textContent = v.taxRate;
    $('bd-taxes').textContent = formatCurrency(taxAmount);
    $('bd-gross').textContent = formatCurrency(grossRevenue);

    $('bd-weeks-off').textContent = weeksOff.toFixed(1) + ' weeks (' + totalDaysOff + ' days)';
    $('bd-working-weeks').textContent = workingWeeks.toFixed(1);
    $('bd-hours-week').textContent = v.hoursPerWeek;
    $('bd-billable-pct').textContent = Math.round(v.billablePct * 100) + '%';
    $('bd-billable-hours').textContent = Math.round(billableHoursPerYear);

    $('bd-equiv-salary').textContent = formatCurrency(equivSalary);
    $('bd-monthly').textContent = formatCurrency(monthlyRevenue);
    $('bd-weekly').textContent = formatCurrency(weeklyRevenue);
    $('bd-daily').textContent = formatCurrency(dailyRate);

    // Show results
    resultsSection.classList.add('visible');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildShareURL() {
    const v = getValues();
    const params = new URLSearchParams();
    params.set('income', v.desiredIncome);
    params.set('sw', v.softwareCosts);
    params.set('hw', v.hardwareCosts);
    params.set('ins', v.insuranceCosts);
    params.set('other', v.otherExpenses);
    params.set('tax', v.taxRate);
    params.set('hrs', v.hoursPerWeek);
    params.set('bill', Math.round(v.billablePct * 100));
    params.set('vac', v.vacationDays);
    params.set('sick', v.sickDays);
    params.set('hol', v.holidays);
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  // Form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    calculate();
  });

  // Recalculate button
  $('recalculate-btn').addEventListener('click', function () {
    resultsSection.classList.remove('visible');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Clear custom tax when select changes
  $('tax-rate').addEventListener('change', function () {
    $('tax-rate-custom').value = '';
  });

  // Share: copy link
  $('share-copy').addEventListener('click', function () {
    const url = buildShareURL();
    navigator.clipboard.writeText(url).then(function () {
      $('share-copy').textContent = 'Copied!';
      setTimeout(function () { $('share-copy').textContent = 'Copy Link'; }, 2000);
    });
  });

  // Share: Twitter/X
  $('share-twitter').addEventListener('click', function () {
    const rate = $('result-rate').textContent;
    const text = 'I just calculated my freelance hourly rate: ' + rate + '/hr. Find yours:';
    const url = buildShareURL();
    window.open(
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
      '_blank',
      'width=550,height=420'
    );
  });

  // Share: LinkedIn
  $('share-linkedin').addEventListener('click', function () {
    const url = buildShareURL();
    window.open(
      'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
      '_blank',
      'width=550,height=420'
    );
  });

  // Load from URL on page load
  loadFromURL();
})();
