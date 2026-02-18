/**
 * OneTab Global — shared across all pages
 * Handles: country selector, theme toggle, currency formatting
 */
(function() {
  'use strict';

  var COUNTRIES = {
    US: { name: 'United States', currency: '$', code: 'USD', locale: 'en-US', medianIncome: 40480, medianSource: 'Census Bureau 2023', medianLabel: 'US median individual income', workHoursYear: 2080, defaultHolidays: 15, defaultSalary: 85000, defaultHourlyPlaceholder: '35', defaultSalaryPlaceholder: '65000', comparisons: [
      { name: 'fancy coffees', cost: 5 }, { name: 'Netflix subscriptions', cost: 15 }, { name: 'Uber rides across town', cost: 50 }, { name: 'round-trip domestic flights', cost: 250 }, { name: 'iPhones', cost: 1000 }, { name: "months of the average American's rent", cost: 2000 }
    ]},
    UK: { name: 'United Kingdom', currency: '\u00a3', code: 'GBP', locale: 'en-GB', medianIncome: 34963, medianSource: 'ONS ASHE 2023', medianLabel: 'UK median full-time salary', workHoursYear: 1730, defaultHolidays: 28, defaultSalary: 45000, defaultHourlyPlaceholder: '20', defaultSalaryPlaceholder: '35000', comparisons: [
      { name: 'pints at the pub', cost: 6 }, { name: 'Netflix subscriptions', cost: 11 }, { name: 'Uber rides across London', cost: 25 }, { name: 'return rail tickets', cost: 100 }, { name: 'iPhones', cost: 800 }, { name: "months of average UK rent", cost: 1200 }
    ]},
    CA: { name: 'Canada', currency: 'C$', code: 'CAD', locale: 'en-CA', medianIncome: 40500, medianSource: 'Statistics Canada 2023', medianLabel: 'Canadian median individual income', workHoursYear: 2080, defaultHolidays: 15, defaultSalary: 70000, defaultHourlyPlaceholder: '30', defaultSalaryPlaceholder: '55000', comparisons: [
      { name: 'Tim Hortons coffees', cost: 5 }, { name: 'Netflix subscriptions', cost: 17 }, { name: 'Uber rides', cost: 30 }, { name: 'domestic flights', cost: 300 }, { name: 'iPhones', cost: 1300 }, { name: "months of average Canadian rent", cost: 1800 }
    ]},
    AU: { name: 'Australia', currency: 'A$', code: 'AUD', locale: 'en-AU', medianIncome: 65000, medianSource: 'ABS 2023', medianLabel: 'Australian median income', workHoursYear: 1730, defaultHolidays: 28, defaultSalary: 90000, defaultHourlyPlaceholder: '40', defaultSalaryPlaceholder: '70000', comparisons: [
      { name: 'flat whites', cost: 5 }, { name: 'Netflix subscriptions', cost: 17 }, { name: 'Uber rides', cost: 25 }, { name: 'domestic flights', cost: 250 }, { name: 'iPhones', cost: 1700 }, { name: "months of average Australian rent", cost: 2200 }
    ]},
    DE: { name: 'Germany', currency: '\u20ac', code: 'EUR', locale: 'de-DE', medianIncome: 44000, medianSource: 'Destatis 2023', medianLabel: 'German median income', workHoursYear: 1600, defaultHolidays: 30, defaultSalary: 55000, defaultHourlyPlaceholder: '25', defaultSalaryPlaceholder: '45000', comparisons: [
      { name: 'coffees', cost: 4 }, { name: 'Netflix subscriptions', cost: 13 }, { name: 'Uber rides', cost: 20 }, { name: 'ICE train tickets', cost: 70 }, { name: 'iPhones', cost: 1000 }, { name: "months of average German rent", cost: 1000 }
    ]},
    FR: { name: 'France', currency: '\u20ac', code: 'EUR', locale: 'fr-FR', medianIncome: 29000, medianSource: 'INSEE 2023', medianLabel: 'French median gross income', workHoursYear: 1600, defaultHolidays: 36, defaultSalary: 45000, defaultHourlyPlaceholder: '20', defaultSalaryPlaceholder: '35000', comparisons: [
      { name: 'espressos', cost: 3 }, { name: 'Netflix subscriptions', cost: 14 }, { name: 'Uber rides', cost: 15 }, { name: 'TGV tickets', cost: 60 }, { name: 'iPhones', cost: 1000 }, { name: "months of average French rent", cost: 800 }
    ]},
    NL: { name: 'Netherlands', currency: '\u20ac', code: 'EUR', locale: 'nl-NL', medianIncome: 38500, medianSource: 'CBS 2023', medianLabel: 'Dutch median income', workHoursYear: 1680, defaultHolidays: 25, defaultSalary: 55000, defaultHourlyPlaceholder: '25', defaultSalaryPlaceholder: '42000', comparisons: [
      { name: 'coffees', cost: 4 }, { name: 'Netflix subscriptions', cost: 13 }, { name: 'Uber rides', cost: 15 }, { name: 'NS train tickets', cost: 30 }, { name: 'iPhones', cost: 1000 }, { name: "months of average Dutch rent", cost: 1100 }
    ]},
    SE: { name: 'Sweden', currency: 'kr', code: 'SEK', locale: 'sv-SE', medianIncome: 396000, medianSource: 'SCB 2023', medianLabel: 'Swedish median income', workHoursYear: 1600, defaultHolidays: 30, defaultSalary: 500000, defaultHourlyPlaceholder: '250', defaultSalaryPlaceholder: '420000', comparisons: [
      { name: 'fika coffees', cost: 50 }, { name: 'Netflix subscriptions', cost: 119 }, { name: 'Uber rides', cost: 200 }, { name: 'SJ train tickets', cost: 500 }, { name: 'iPhones', cost: 13000 }, { name: "months of average Swedish rent", cost: 8000 }
    ]},
    ES: { name: 'Spain', currency: '\u20ac', code: 'EUR', locale: 'es-ES', medianIncome: 24000, medianSource: 'INE 2023', medianLabel: 'Spanish median income', workHoursYear: 1700, defaultHolidays: 30, defaultSalary: 35000, defaultHourlyPlaceholder: '15', defaultSalaryPlaceholder: '28000', comparisons: [
      { name: 'caf\u00e9 con leches', cost: 2 }, { name: 'Netflix subscriptions', cost: 13 }, { name: 'Uber rides', cost: 12 }, { name: 'AVE train tickets', cost: 50 }, { name: 'iPhones', cost: 1000 }, { name: "months of average Spanish rent", cost: 700 }
    ]},
    IT: { name: 'Italy', currency: '\u20ac', code: 'EUR', locale: 'it-IT', medianIncome: 26000, medianSource: 'ISTAT 2023', medianLabel: 'Italian median income', workHoursYear: 1700, defaultHolidays: 30, defaultSalary: 38000, defaultHourlyPlaceholder: '15', defaultSalaryPlaceholder: '30000', comparisons: [
      { name: 'espressos', cost: 1.5 }, { name: 'Netflix subscriptions', cost: 13 }, { name: 'Uber rides', cost: 15 }, { name: 'Frecciarossa tickets', cost: 50 }, { name: 'iPhones', cost: 1000 }, { name: "months of average Italian rent", cost: 700 }
    ]},
    BR: { name: 'Brazil', currency: 'R$', code: 'BRL', locale: 'pt-BR', medianIncome: 34800, medianSource: 'IBGE 2023', medianLabel: 'Brazilian median income', workHoursYear: 2080, defaultHolidays: 30, defaultSalary: 60000, defaultHourlyPlaceholder: '30', defaultSalaryPlaceholder: '48000', comparisons: [
      { name: 'cafezinhos', cost: 5 }, { name: 'Netflix subscriptions', cost: 40 }, { name: 'Uber rides', cost: 25 }, { name: 'domestic flights', cost: 500 }, { name: 'iPhones', cost: 7000 }, { name: "months of average Brazilian rent", cost: 2000 }
    ]},
    IN: { name: 'India', currency: '\u20b9', code: 'INR', locale: 'en-IN', medianIncome: 300000, medianSource: 'PLFS 2023', medianLabel: 'Indian median income', workHoursYear: 2080, defaultHolidays: 15, defaultSalary: 800000, defaultHourlyPlaceholder: '400', defaultSalaryPlaceholder: '600000', comparisons: [
      { name: 'chai teas', cost: 20 }, { name: 'Netflix subscriptions', cost: 649 }, { name: 'Uber rides', cost: 300 }, { name: 'domestic flights', cost: 5000 }, { name: 'iPhones', cost: 80000 }, { name: "months of average Indian rent", cost: 15000 }
    ]},
    JP: { name: 'Japan', currency: '\u00a5', code: 'JPY', locale: 'ja-JP', medianIncome: 4500000, medianSource: 'NTA 2023', medianLabel: 'Japanese median income', workHoursYear: 1730, defaultHolidays: 20, defaultSalary: 5500000, defaultHourlyPlaceholder: '2500', defaultSalaryPlaceholder: '4500000', comparisons: [
      { name: 'vending machine coffees', cost: 150 }, { name: 'Netflix subscriptions', cost: 1490 }, { name: 'taxi rides', cost: 2000 }, { name: 'Shinkansen tickets', cost: 13000 }, { name: 'iPhones', cost: 150000 }, { name: "months of average Tokyo rent", cost: 100000 }
    ]},
    SG: { name: 'Singapore', currency: 'S$', code: 'SGD', locale: 'en-SG', medianIncome: 57600, medianSource: 'MOM 2023', medianLabel: 'Singaporean median income', workHoursYear: 2080, defaultHolidays: 14, defaultSalary: 72000, defaultHourlyPlaceholder: '30', defaultSalaryPlaceholder: '60000', comparisons: [
      { name: 'kopi-os', cost: 2 }, { name: 'Netflix subscriptions', cost: 16 }, { name: 'Grab rides', cost: 15 }, { name: 'budget airline flights', cost: 150 }, { name: 'iPhones', cost: 1600 }, { name: "months of average SG rent", cost: 2500 }
    ]},
    NZ: { name: 'New Zealand', currency: 'NZ$', code: 'NZD', locale: 'en-NZ', medianIncome: 56836, medianSource: 'Stats NZ 2023', medianLabel: 'NZ median income', workHoursYear: 1760, defaultHolidays: 24, defaultSalary: 72000, defaultHourlyPlaceholder: '35', defaultSalaryPlaceholder: '60000', comparisons: [
      { name: 'flat whites', cost: 6 }, { name: 'Netflix subscriptions', cost: 18 }, { name: 'Uber rides', cost: 25 }, { name: 'domestic flights', cost: 200 }, { name: 'iPhones', cost: 1800 }, { name: "months of average NZ rent", cost: 2000 }
    ]}
  };

  // Map timezone to country code (no geolocation permission needed)
  var TZ_MAP = {
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
    'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
    'America/Boise': 'US', 'America/Detroit': 'US', 'America/Indiana/Indianapolis': 'US',
    'America/Kentucky/Louisville': 'US', 'Pacific/Honolulu': 'US',
    'Europe/London': 'UK', 'Europe/Belfast': 'UK',
    'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
    'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA',
    'America/Regina': 'CA',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
    'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Australia/Hobart': 'AU',
    'Australia/Darwin': 'AU', 'Australia/Lord_Howe': 'AU',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Amsterdam': 'NL',
    'Europe/Stockholm': 'SE',
    'Europe/Madrid': 'ES',
    'Europe/Rome': 'IT',
    'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR',
    'America/Bahia': 'BR', 'America/Manaus': 'BR',
    'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Asia/Tokyo': 'JP',
    'Asia/Singapore': 'SG',
    'Pacific/Auckland': 'NZ'
  };

  function detectCountry() {
    var saved = localStorage.getItem('onetab-country');
    if (saved && COUNTRIES[saved]) return saved;
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (TZ_MAP[tz]) return TZ_MAP[tz];
    } catch(e) {}
    return 'US';
  }

  var currentCode = detectCountry();
  var callbacks = [];

  function setCountry(code) {
    if (!COUNTRIES[code]) return;
    currentCode = code;
    localStorage.setItem('onetab-country', code);
    // Update global dropdown if present
    var sel = document.getElementById('country-select-global');
    if (sel) sel.value = code;
    // Sync with freelance calc's own country selector
    var freeSel = document.getElementById('country-select');
    if (freeSel && freeSel !== sel) {
      freeSel.value = code;
      freeSel.dispatchEvent(new Event('change'));
    }
    // Notify listeners
    for (var i = 0; i < callbacks.length; i++) callbacks[i](COUNTRIES[code], code);
  }

  function init() {
    // Populate global country dropdown
    var sel = document.getElementById('country-select-global');
    if (sel) {
      var codes = Object.keys(COUNTRIES);
      for (var i = 0; i < codes.length; i++) {
        var opt = document.createElement('option');
        opt.value = codes[i];
        opt.textContent = COUNTRIES[codes[i]].name;
        sel.appendChild(opt);
      }
      sel.value = currentCode;
      sel.addEventListener('change', function() {
        setCountry(sel.value);
      });
    }

    // Theme toggle
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      if (localStorage.getItem('onetab-theme') === 'dark') toggle.textContent = 'Light';
      toggle.addEventListener('click', function() {
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

    // Fire initial callbacks so pages can set up with current country
    var c = COUNTRIES[currentCode];
    for (var i = 0; i < callbacks.length; i++) callbacks[i](c, currentCode);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.OneTab = {
    country: function() { return COUNTRIES[currentCode]; },
    countryCode: function() { return currentCode; },
    countries: COUNTRIES,
    onCountryChange: function(cb) {
      callbacks.push(cb);
      // If DOM already loaded, fire immediately with current country
      if (document.readyState !== 'loading') {
        cb(COUNTRIES[currentCode], currentCode);
      }
    },
    setCountry: setCountry,
    fmt: function(n, decimals) {
      var c = COUNTRIES[currentCode];
      var d = (typeof decimals === 'number') ? decimals : 0;
      return c.currency + n.toLocaleString(c.locale, { minimumFractionDigits: d, maximumFractionDigits: d });
    },
    fmt2: function(n) {
      var c = COUNTRIES[currentCode];
      return c.currency + n.toLocaleString(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };
})();
