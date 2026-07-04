/* =================================================================
   VITT-MARG ADVISORS — Income Tax Calculator (isolated module)
   income-tax/income-tax.js
   FULLY SELF-CONTAINED. All identifiers prefixed `vmtax`.
   No global collisions with the main site's script.js.

   Tax rules — AY 2026-27 (FY 2025-26), verified:
   NEW slabs: 0-4L nil,4-8L 5%,8-12L 10%,12-16L 15%,16-20L 20%,
              20-24L 25%, >24L 30%; std ded 75,000 (salaried);
              87A rebate up to 60,000 (taxable <=12L => nil);
              surcharge 10%>50L,15%>1Cr,25%>2Cr (cap 25%); cess 4%.
   OLD slabs (below 60): 0-2.5L nil,2.5-5L 5%,5-10L 20%,>10L 30%;
              exemption 3L (senior),5L (super); std ded 50,000;
              87A rebate up to 12,500 (taxable <=5L => nil);
              surcharge 10%>50L,15%>1Cr,25%>2Cr,37%>5Cr; cess 4%.
   Marginal relief applied at surcharge thresholds.
   ================================================================= */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  function vmtaxParse(v) {
    if (typeof v === 'number') return v;
    var c = String(v == null ? '' : v).replace(/[^0-9.\-]/g, '');
    var f = parseFloat(c);
    return isNaN(f) ? 0 : f;
  }
  function vmtaxInr(n, dec) {
    if (n == null || isNaN(n)) n = 0;
    var neg = n < 0; n = Math.abs(n);
    var opts = dec ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : { maximumFractionDigits: 0 };
    return (neg ? '-₹' : '₹') + n.toLocaleString('en-IN', opts);
  }
  function vmtaxWords(n) {
    n = Math.round(Math.abs(n));
    if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2).replace(/\.00$/, '') + ' L';
    if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return '₹' + n;
  }
  function vmtaxEl(id) { return document.getElementById(id); }
  var vmtaxReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tax engine ---------- */
  var VMTAX_NEW_SLABS = [
    [400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15],
    [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]
  ];
  function vmtaxOldSlabs(exemption) {
    return [[exemption, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
  }
  function vmtaxSlabTax(income, slabs) {
    var tax = 0, lower = 0;
    for (var i = 0; i < slabs.length; i++) {
      var upper = slabs[i][0], rate = slabs[i][1];
      if (income > lower) {
        var band = Math.min(income, upper) - lower;
        if (band > 0) tax += band * rate;
        lower = upper;
      } else break;
    }
    return tax;
  }
  function vmtaxSurchargeRate(income, regime) {
    var rates = regime === 'new'
      ? [[20000000, 0.25], [10000000, 0.15], [5000000, 0.10]]
      : [[50000000, 0.37], [20000000, 0.25], [10000000, 0.15], [5000000, 0.10]];
    for (var i = 0; i < rates.length; i++) {
      if (income > rates[i][0]) return { rate: rates[i][1], threshold: rates[i][0] };
    }
    return { rate: 0, threshold: 0 };
  }

  // compute a full regime result
  function vmtaxCompute(regime, inp) {
    var slabs, exemption = 250000, stdDed = 0, rebateLimit, rebateMax;
    if (regime === 'new') {
      slabs = VMTAX_NEW_SLABS;
      stdDed = inp.salaried ? 75000 : 0;
      rebateLimit = 1200000; rebateMax = 60000;
    } else {
      if (inp.age === 'senior') exemption = 300000;
      else if (inp.age === 'super') exemption = 500000;
      slabs = vmtaxOldSlabs(exemption);
      stdDed = inp.salaried ? 50000 : 0;
      rebateLimit = 500000; rebateMax = 12500;
    }

    // slab (ordinary) income — capital gains handled separately
    var ordinary = inp.salary + inp.house + inp.business + inp.other;

    var deductions = 0;
    if (regime === 'old') {
      deductions =
        Math.min(inp.d80c, 150000) +
        Math.min(inp.d80ccd, 50000) +
        inp.d80d +
        Math.min(inp.loan, 200000) +
        inp.hra +
        Math.min(inp.ptax, 2500);
    }
    var taxable = Math.max(0, ordinary - stdDed - deductions);

    var baseTax = vmtaxSlabTax(taxable, slabs);

    var rebate = 0;
    if (taxable <= rebateLimit) rebate = Math.min(baseTax, rebateMax);
    var taxAfterRebate = baseTax - rebate;

    // capital gains tax (special rate) — simple LTCG 12.5% treatment as add-on,
    // shown separately; rebate does not apply. (User enters net gain.)
    var cgTax = inp.capital > 0 ? inp.capital * 0.125 : 0;

    var taxForSurcharge = taxAfterRebate + cgTax;

    var sc = 0, scRate = 0;
    var scInfo = vmtaxSurchargeRate(taxable + inp.capital, regime);
    if (scInfo.rate > 0) {
      scRate = scInfo.rate;
      sc = taxForSurcharge * scRate;
      // marginal relief on ordinary income threshold
      var taxAtThresh = vmtaxSlabTax(scInfo.threshold, slabs);
      var cap = taxAtThresh + ((taxable + inp.capital) - scInfo.threshold);
      if (taxForSurcharge + sc > cap) sc = Math.max(0, cap - taxForSurcharge);
    }

    var cess = (taxForSurcharge + sc) * 0.04;
    var total = taxForSurcharge + sc + cess;

    return {
      regime: regime,
      grossIncome: ordinary + inp.capital,
      ordinary: ordinary,
      stdDed: stdDed,
      deductions: deductions,
      taxable: taxable,
      baseTax: baseTax,
      rebate: rebate,
      taxAfterRebate: taxAfterRebate,
      cgTax: cgTax,
      surchargeRate: scRate,
      surcharge: sc,
      cess: cess,
      total: Math.round(total),
      monthly: Math.round(total / 12)
    };
  }

  /* ---------- read inputs ---------- */
  var vmtaxSalaried = true;
  var vmtaxAge = 'below60';

  function vmtaxReadInputs() {
    return {
      salary: vmtaxParse(vmtaxEl('vmtaxSalary').value),
      house: vmtaxParse(vmtaxEl('vmtaxHouse').value),
      business: vmtaxParse(vmtaxEl('vmtaxBusiness').value),
      capital: vmtaxParse(vmtaxEl('vmtaxCapital').value),
      other: vmtaxParse(vmtaxEl('vmtaxOther').value),
      d80c: vmtaxParse(vmtaxEl('vmtax80C').value),
      d80ccd: vmtaxParse(vmtaxEl('vmtax80CCD').value),
      d80d: vmtaxParse(vmtaxEl('vmtax80D').value),
      loan: vmtaxParse(vmtaxEl('vmtaxLoan').value),
      hra: vmtaxParse(vmtaxEl('vmtaxHRA').value),
      ptax: vmtaxParse(vmtaxEl('vmtaxPtax').value),
      salaried: vmtaxSalaried,
      age: vmtaxAge
    };
  }

  var vmtaxLast = null;

  /* ---------- count-up ---------- */
  function vmtaxCountTo(el, target, dec) {
    if (vmtaxReduce) { el.textContent = vmtaxInr(target, dec); return; }
    var from = 0, dur = 650, t0 = performance.now();
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(now) {
      var t = Math.min((now - t0) / dur, 1);
      el.textContent = vmtaxInr(from + (target - from) * ease(t), dec);
      if (t < 1) requestAnimationFrame(step); else el.textContent = vmtaxInr(target, dec);
    }
    requestAnimationFrame(step);
  }

  /* ---------- render main result ---------- */
  function vmtaxRow(label, value, mod) {
    var cls = 'vmtax-row';
    if (mod === 'total') cls += ' vmtax-row--total';
    if (mod === 'muted') cls += ' vmtax-row--muted';
    if (mod === 'credit') cls += ' vmtax-row--credit';
    return '<div class="' + cls + '"><span class="vmtax-row__label">' + label +
      '</span><span class="vmtax-row__value">' + value + '</span></div>';
  }

  function vmtaxRenderMain(chosen, best, other) {
    vmtaxEl('vmtaxRegimePill').textContent = chosen.regime === best.regime
      ? 'Recommended · ' + (chosen.regime === 'new' ? 'New' : 'Old') + ' regime'
      : (chosen.regime === 'new' ? 'New' : 'Old') + ' regime';
    vmtaxCountTo(vmtaxEl('vmtaxTotalTax'), chosen.total, 0);

    var saved = Math.abs(best.total - other.total);
    vmtaxEl('vmtaxTotalSub').innerHTML = chosen.regime === best.regime && saved > 0
      ? 'You save ' + vmtaxInr(saved) + ' vs the ' + (best.regime === 'new' ? 'old' : 'new') + ' regime'
      : (saved === 0 ? 'Both regimes cost the same' : 'Monthly ≈ ' + vmtaxInr(chosen.monthly));

    var c = chosen;
    var rows = [];
    rows.push(vmtaxRow('Gross Income', vmtaxInr(c.grossIncome)));
    rows.push(vmtaxRow('Standard Deduction', c.stdDed ? '− ' + vmtaxInr(c.stdDed) : '—', 'muted'));
    if (c.regime === 'old') rows.push(vmtaxRow('Deductions & Exemptions', c.deductions ? '− ' + vmtaxInr(c.deductions) : '—', 'muted'));
    rows.push(vmtaxRow('Taxable Income', vmtaxInr(c.taxable)));
    rows.push(vmtaxRow('Tax before rebate', vmtaxInr(c.baseTax)));
    if (c.rebate > 0) rows.push(vmtaxRow('Rebate u/s 87A', '− ' + vmtaxInr(c.rebate), 'credit'));
    if (c.cgTax > 0) rows.push(vmtaxRow('Capital Gains tax (12.5%)', '+ ' + vmtaxInr(c.cgTax)));
    if (c.surcharge > 0) rows.push(vmtaxRow('Surcharge (' + Math.round(c.surchargeRate * 100) + '%)', '+ ' + vmtaxInr(c.surcharge)));
    rows.push(vmtaxRow('Health & Education Cess (4%)', '+ ' + vmtaxInr(c.cess)));
    rows.push(vmtaxRow('Total Tax', vmtaxInr(c.total), 'total'));
    rows.push(vmtaxRow('Monthly Tax', vmtaxInr(c.monthly)));

    vmtaxEl('vmtaxBreakdown').innerHTML = rows.join('');
    vmtaxEl('vmtaxNote').style.display = '';
  }

  /* ---------- render comparison ---------- */
  function vmtaxRenderCompare(newR, oldR) {
    var best = newR.total <= oldR.total ? newR : oldR;
    vmtaxEl('vmtaxCompareSection').style.display = '';

    // bars
    var max = Math.max(newR.total, oldR.total, 1);
    vmtaxEl('vmtaxBars').innerHTML =
      '<div class="vmtax-barcol"><span class="vmtax-barval">' + vmtaxInr(oldR.total) + '</span>' +
        '<div class="vmtax-bar vmtax-bar--old" style="height:0" data-h="' + (oldR.total / max * 100) + '"></div>' +
        '<span class="vmtax-barlabel">Old Regime</span></div>' +
      '<div class="vmtax-barcol"><span class="vmtax-barval">' + vmtaxInr(newR.total) + '</span>' +
        '<div class="vmtax-bar vmtax-bar--new" style="height:0" data-h="' + (newR.total / max * 100) + '"></div>' +
        '<span class="vmtax-barlabel">New Regime</span></div>';
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.querySelectorAll('#vmtaxBars .vmtax-bar').forEach(function (b) {
        b.style.height = Math.max(2, parseFloat(b.getAttribute('data-h'))) + '%';
      });
    }); });

    // cards
    function card(r, label) {
      var win = r.total === best.total;
      var rows = [
        ['Gross income', vmtaxInr(r.grossIncome)],
        ['Standard deduction', r.stdDed ? vmtaxInr(r.stdDed) : '—'],
        ['Other deductions', r.deductions ? vmtaxInr(r.deductions) : '—'],
        ['Taxable income', vmtaxInr(r.taxable)],
        ['Tax + surcharge', vmtaxInr(r.taxAfterRebate + r.cgTax + r.surcharge)],
        ['Cess (4%)', vmtaxInr(r.cess)]
      ];
      var body = rows.map(function (x) { return '<div class="vmtax-crow"><span>' + x[0] + '</span><strong>' + x[1] + '</strong></div>'; }).join('');
      return '<div class="vmtax-ccard' + (win ? ' vmtax-ccard--win' : '') + '">' +
        '<div class="vmtax-ccard__name">' + label + '</div>' +
        '<div class="vmtax-ccard__tax' + (win ? ' vmtax-win' : '') + '">' + vmtaxInr(r.total) + '</div>' +
        '<div class="vmtax-ccard__meta">Monthly ≈ ' + vmtaxInr(r.monthly) + '</div>' +
        '<div class="vmtax-ccard__rows">' + body + '</div></div>';
    }
    vmtaxEl('vmtaxCompareCards').innerHTML = card(oldR, 'Old Regime') + card(newR, 'New Regime');

    // verdict
    var saved = Math.abs(newR.total - oldR.total);
    var name = best.regime === 'new' ? 'New Regime' : 'Old Regime';
    vmtaxEl('vmtaxVerdict').innerHTML = saved === 0
      ? '<div>Both regimes result in the same tax of <strong>' + vmtaxInr(best.total) + '</strong>.</div>'
      : '<div>The <strong>' + name + '</strong> saves you</div><div class="vmtax-verdict__big">' + vmtaxInr(saved) + ' per year</div>';

    return best;
  }

  /* ---------- tax saving suggestions ---------- */
  function vmtaxRenderTips(inp, oldR) {
    vmtaxEl('vmtaxTipsSection').style.display = '';
    var rate = vmtaxMarginalRate(oldR.taxable, inp.age);
    var tips = [];

    var used80c = Math.min(inp.d80c, 150000);
    if (used80c < 150000) {
      var room = 150000 - used80c;
      tips.push({ icon: 'M12 2l2.4 7.3H22l-6 4.4 2.3 7.3L12 16.9 5.7 21l2.3-7.3-6-4.4h7.6z',
        h: 'Increase 80C Investment', p: 'You have ₹' + room.toLocaleString('en-IN') + ' of unused 80C limit — ELSS, PPF, life insurance or principal repayment.',
        save: room * rate });
    }
    if (inp.d80ccd < 50000) {
      var nps = 50000 - Math.min(inp.d80ccd, 50000);
      tips.push({ icon: 'M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5zM4 22v-2a6 6 0 016-6h4a6 6 0 016 6v2z',
        h: 'Invest in NPS 80CCD(1B)', p: 'An extra ₹' + nps.toLocaleString('en-IN') + ' in NPS is deductible over and above 80C, exclusively under the old regime.',
        save: nps * rate });
    }
    if (inp.d80d < 25000) {
      var hd = 25000 - inp.d80d;
      tips.push({ icon: 'M12 2l9 4v6c0 5-3.8 9-9 10-5.2-1-9-5-9-10V6zm-1 13l6-6-1.4-1.4L11 12.2 8.4 9.6 7 11z',
        h: 'Health Insurance u/s 80D', p: 'Premiums up to ₹25,000 (₹50,000 for seniors) are deductible. You can still claim about ₹' + hd.toLocaleString('en-IN') + '.',
        save: hd * rate });
    }
    if (inp.loan < 200000) {
      var li = 200000 - Math.min(inp.loan, 200000);
      tips.push({ icon: 'M12 3l9 8h-3v9h-5v-5h-2v5H6v-9H3zm-1 8h2V9h-2z',
        h: 'Home Loan Benefit', p: 'Interest on a housing loan is deductible up to ₹2 lakh under Section 24(b). Unused headroom ≈ ₹' + li.toLocaleString('en-IN') + '.',
        save: li * rate });
    }
    // always give something
    if (!tips.length) {
      tips.push({ icon: 'M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z', h: "You're well optimised", p: 'Your major deductions are maxed out. Speak to a CA about advanced planning like HUF, capital-gains harvesting or business structuring.', save: 0 });
    }
    tips = tips.slice(0, 6);

    vmtaxEl('vmtaxTips').innerHTML = tips.map(function (t) {
      return '<div class="vmtax-tip">' +
        '<div class="vmtax-tip__icon"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="' + t.icon + '"/></svg></div>' +
        '<h4>' + t.h + '</h4><p>' + t.p + '</p>' +
        (t.save > 0 ? '<span class="vmtax-tip__save">Save up to ' + vmtaxInr(Math.round(t.save)) + '</span>' : '') +
        '</div>';
    }).join('');

    var totalPot = tips.reduce(function (s, t) { return s + (t.save || 0); }, 0);
    vmtaxEl('vmtaxPotential').innerHTML = totalPot > 0
      ? 'Total tax-saving potential: <strong>' + vmtaxInr(Math.round(totalPot)) + '</strong> per year (old regime, at your ' + Math.round(rate * 100) + '% marginal rate)'
      : '';
  }

  function vmtaxMarginalRate(taxable, age) {
    var ex = age === 'senior' ? 300000 : (age === 'super' ? 500000 : 250000);
    var slabs = vmtaxOldSlabs(ex);
    var rate = 0, lower = 0;
    for (var i = 0; i < slabs.length; i++) {
      if (taxable > lower) rate = slabs[i][1];
      lower = slabs[i][0];
    }
    return rate * 1.04; // include cess
  }

  /* ---------- main calculate ---------- */
  function vmtaxCalculate(scrollToCompare) {
    var inp = vmtaxReadInputs();
    var newR = vmtaxCompute('new', inp);
    var oldR = vmtaxCompute('old', inp);
    var chosenRegime = document.querySelector('input[name="vmtaxRegime"]:checked').value;
    var chosen = chosenRegime === 'new' ? newR : oldR;
    var best = newR.total <= oldR.total ? newR : oldR;
    var other = best.regime === 'new' ? oldR : newR;

    vmtaxRenderMain(chosen, best, other);
    vmtaxLast = { chosen: chosen, best: best, other: other, newR: newR, oldR: oldR, inp: inp };

    if (scrollToCompare) {
      vmtaxRenderCompare(newR, oldR);
      vmtaxRenderTips(inp, oldR);
      vmtaxEl('vmtaxCompareSection').scrollIntoView({ behavior: vmtaxReduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* ---------- reset ---------- */
  function vmtaxReset() {
    ['vmtaxHouse', 'vmtaxBusiness', 'vmtaxCapital', 'vmtaxOther', 'vmtax80CCD', 'vmtax80D', 'vmtaxLoan', 'vmtaxHRA'].forEach(function (id) { vmtaxEl(id).value = '0'; });
    vmtaxEl('vmtaxSalary').value = '12,00,000';
    vmtaxEl('vmtax80C').value = '1,50,000';
    vmtaxEl('vmtaxPtax').value = '2,500';
    vmtaxSalaried = true; vmtaxAge = 'below60';
    vmtaxEl('vmtaxSal1').checked = true;
    vmtaxEl('vmtaxAge1').checked = true;
    vmtaxEl('vmtaxRegNew').checked = true;
    vmtaxEl('vmtaxCompareSection').style.display = 'none';
    vmtaxEl('vmtaxTipsSection').style.display = 'none';
    vmtaxEl('vmtaxNote').style.display = 'none';
    vmtaxEl('vmtaxRegimePill').textContent = 'Recommended';
    vmtaxEl('vmtaxTotalTax').textContent = '₹0';
    vmtaxEl('vmtaxTotalSub').textContent = 'Enter your details and calculate';
    vmtaxEl('vmtaxBreakdown').innerHTML =
      '<div class="vmtax-placeholder"><svg viewBox="0 0 24 24" width="46" height="46"><path fill="currentColor" d="M4 3h16v18l-4-2-4 2-4-2-4 2zm3 5h10V6H7zm0 4h10v-2H7zm0 4h7v-2H7z"/></svg>' +
      '<h3>Your tax breakdown appears here</h3><p style="color:var(--vmtax-mut);font-size:.88rem">Fill in your income and press Calculate Tax.</p></div>';
    vmtaxLast = null;
  }

  /* ---------- PDF ---------- */
  function vmtaxDownloadPDF() {
    if (!vmtaxLast) vmtaxCalculate(false);
    if (!vmtaxLast) return;
    var jsPDFLib = window.jspdf && window.jspdf.jsPDF;
    var c = vmtaxLast.chosen, best = vmtaxLast.best, newR = vmtaxLast.newR, oldR = vmtaxLast.oldR;

    if (!jsPDFLib) { window.print(); return; }
    var doc = new jsPDFLib({ unit: 'pt', format: 'a4' });
    var W = doc.internal.pageSize.getWidth(), M = 48, y = 0;

    doc.setFillColor(7, 17, 31); doc.rect(0, 0, W, 92, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
    doc.text('Vitt-Marg Advisors', M, 44);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 190, 245);
    doc.text('Chartered Accountants  |  Income Tax Calculator', M, 62);
    doc.setTextColor(180, 190, 210);
    doc.text('AY 2026-27 (FY 2025-26)  |  +91 93156 39676', M, 77);
    y = 122;

    doc.setTextColor(20, 30, 50); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text('Income Tax Computation', M, y); y += 18;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110, 120, 140);
    doc.text('Recommended: ' + (best.regime === 'new' ? 'New' : 'Old') + ' Regime', M, y); y += 20;

    doc.setDrawColor(37, 99, 235); doc.setFillColor(240, 245, 255);
    doc.roundedRect(M, y, W - M * 2, 58, 8, 8, 'FD');
    doc.setTextColor(90, 100, 120); doc.setFontSize(10);
    doc.text('TOTAL TAX PAYABLE (' + (c.regime === 'new' ? 'NEW' : 'OLD') + ' REGIME)', M + 18, y + 23);
    doc.setTextColor(29, 78, 216); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.text(vmtaxInr(c.total), M + 18, y + 47);
    y += 82;

    var rows = [
      ['Gross Income', vmtaxInr(c.grossIncome)],
      ['Standard Deduction', c.stdDed ? '- ' + vmtaxInr(c.stdDed) : '-'],
      ['Deductions & Exemptions', c.deductions ? '- ' + vmtaxInr(c.deductions) : '-'],
      ['Taxable Income', vmtaxInr(c.taxable)],
      ['Tax before rebate', vmtaxInr(c.baseTax)],
      ['Rebate u/s 87A', c.rebate ? '- ' + vmtaxInr(c.rebate) : '-'],
      ['Surcharge', c.surcharge ? '+ ' + vmtaxInr(c.surcharge) : '-'],
      ['Health & Education Cess (4%)', '+ ' + vmtaxInr(c.cess)],
      ['TOTAL TAX', vmtaxInr(c.total)],
      ['Monthly Tax', vmtaxInr(c.monthly)],
      ['— — —', ''],
      ['New Regime tax', vmtaxInr(newR.total)],
      ['Old Regime tax', vmtaxInr(oldR.total)],
      ['You save', vmtaxInr(Math.abs(newR.total - oldR.total)) + ' (' + (best.regime === 'new' ? 'New' : 'Old') + ')']
    ];
    doc.setFontSize(11);
    rows.forEach(function (r) {
      if (y > doc.internal.pageSize.getHeight() - 70) { doc.addPage(); y = M; }
      var bold = r[0] === 'TOTAL TAX';
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(bold ? 20 : 70, bold ? 30 : 80, bold ? 50 : 100);
      doc.text(String(r[0]), M, y);
      if (r[1]) doc.text(String(r[1]), W - M, y, { align: 'right' });
      y += 6; doc.setDrawColor(230, 234, 240); doc.line(M, y, W - M, y); y += 16;
    });

    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(120, 130, 150);
    var disc = doc.splitTextToSize('Computed under AY 2026-27 slab rates with standard deduction, Section 87A rebate, surcharge (with marginal relief) and 4% cess. Capital gains, where entered, are taxed at special rates and shown separately. This is a planning aid, not a filing document.', W - M * 2);
    disc.forEach(function (l) { if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = M; } doc.text(l, M, y); y += 12; });

    doc.save('vitt-marg-income-tax-ay-2026-27.pdf');
  }

  /* ---------- toast ---------- */
  var vmtaxToastEl = null;
  function vmtaxToast(msg) {
    if (!vmtaxToastEl) { vmtaxToastEl = document.createElement('div'); vmtaxToastEl.className = 'vmtax-toast'; document.body.appendChild(vmtaxToastEl); }
    vmtaxToastEl.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg><span>' + msg + '</span>';
    vmtaxToastEl.classList.add('vmtax-show');
    clearTimeout(vmtaxToastEl._t);
    vmtaxToastEl._t = setTimeout(function () { vmtaxToastEl.classList.remove('vmtax-show'); }, 2400);
  }

  /* ---------- input formatting ---------- */
  function vmtaxAttachFormat(id) {
    var input = vmtaxEl(id);
    input.addEventListener('input', function () {
      var atEnd = input.selectionStart === input.value.length;
      if (input.value.trim() === '') return;
      var raw = vmtaxParse(input.value);
      input.value = raw ? raw.toLocaleString('en-IN') : '';
      if (atEnd) try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
    });
  }

  /* ---------- ripple ---------- */
  function vmtaxRipple(e) {
    var btn = e.currentTarget, r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height);
    var s = document.createElement('span'); s.className = 'vmtax-btn__ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(s); setTimeout(function () { s.remove(); }, 660);
  }

  /* ---------- FAQ ---------- */
  function vmtaxInitFaq() {
    document.querySelectorAll('.vmtax-faqitem').forEach(function (item) {
      var q = item.querySelector('.vmtax-faqq'), a = item.querySelector('.vmtax-faqa');
      q.addEventListener('click', function () {
        var open = item.classList.contains('vmtax-open');
        document.querySelectorAll('.vmtax-faqitem.vmtax-open').forEach(function (o) {
          if (o !== item) { o.classList.remove('vmtax-open'); o.querySelector('.vmtax-faqq').setAttribute('aria-expanded', 'false'); o.querySelector('.vmtax-faqa').style.maxHeight = null; }
        });
        if (open) { item.classList.remove('vmtax-open'); q.setAttribute('aria-expanded', 'false'); a.style.maxHeight = null; }
        else { item.classList.add('vmtax-open'); q.setAttribute('aria-expanded', 'true'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  /* ---------- reveal ---------- */
  function vmtaxInitReveal() {
    var items = document.querySelectorAll('.vmtax-reveal');
    if (vmtaxReduce || !('IntersectionObserver' in window)) { items.forEach(function (e) { e.classList.add('vmtax-vis'); }); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vmtax-vis'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (e) { io.observe(e); });
  }

  /* ---------- boot ---------- */
  function vmtaxBoot() {
    ['vmtaxSalary', 'vmtaxHouse', 'vmtaxBusiness', 'vmtaxCapital', 'vmtaxOther', 'vmtax80C', 'vmtax80CCD', 'vmtax80D', 'vmtaxLoan', 'vmtaxHRA', 'vmtaxPtax'].forEach(vmtaxAttachFormat);

    document.querySelectorAll('input[name="vmtaxSalaried"]').forEach(function (r) { r.addEventListener('change', function () { vmtaxSalaried = this.value === 'yes'; }); });
    document.querySelectorAll('input[name="vmtaxAge"]').forEach(function (r) { r.addEventListener('change', function () { vmtaxAge = this.value; }); });

    vmtaxEl('vmtaxBtnCalc').addEventListener('click', function () { vmtaxCalculate(false); });
    vmtaxEl('vmtaxBtnCompare').addEventListener('click', function () { vmtaxCalculate(true); });
    vmtaxEl('vmtaxBtnReset').addEventListener('click', vmtaxReset);
    vmtaxEl('vmtaxBtnPdf').addEventListener('click', vmtaxDownloadPDF);

    document.querySelectorAll('.vmtax-btn').forEach(function (b) { b.addEventListener('click', vmtaxRipple); });

    vmtaxInitFaq();
    vmtaxInitReveal();
    var y = vmtaxEl('vmtaxYear'); if (y) y.textContent = new Date().getFullYear();

    // compute once on load so the panel isn't empty
    vmtaxCalculate(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vmtaxBoot);
  else vmtaxBoot();
})();
