"""
Vitt-Marg company directory builder (Noida / Ghaziabad companies).

Input : MCA "Company Master Data" CSV for Uttar Pradesh, downloaded from data.gov.in
        (optional) directors.csv with columns: CIN, Director Name
Output: companies/ folder (search page + one page per company), sitemap-companies.xml

Usage : python build_directory.py company_master_up.csv [directors.csv] --out site_upload
"""
import csv, html, json, os, re, sys, datetime, argparse

SITE = 'https://vittmarg.com'
TEMPLATE = os.path.join(os.path.dirname(__file__), 'page_template.html')
PINS = re.compile(r'\b(2013\d\d|2010\d\d|2012\d\d|2030\d\d)\b')   # Noida/Gr. Noida, Ghaziabad, Dadri/Gr. Noida West, Jewar side
CITY_WORDS = ('NOIDA', 'GHAZIABAD', 'GAUTAM BUDDHA NAGAR', 'GAUTAM BUDH NAGAR', 'GREATER NOIDA', 'INDIRAPURAM', 'VAISHALI')

# column aliases in the data.gov.in / MCA files (names have varied over the years)
ALIASES = {
    'cin': ['corporate_identification_number', 'cin', 'company_cin'],
    'name': ['company_name', 'name'],
    'status': ['company_status', 'status'],
    'cls': ['company_class', 'class'],
    'cat': ['company_category', 'category'],
    'sub': ['company_sub_category', 'sub_category'],
    'doi': ['date_of_registration', 'company_registration_date', 'date_of_incorporation'],
    'state': ['registered_state', 'state'],
    'auth': ['authorized_cap', 'authorised_capital', 'authorized_capital'],
    'paid': ['paidup_capital', 'paid_up_capital', 'paidup_cap'],
    'act': ['principal_business_activity_as_per_cin', 'principal_business_activity', 'company_industrial_classification'],
    'addr': ['registered_office_address', 'registered_office_address_', 'address'],
    'roc': ['registrar_of_companies', 'roc'],
}
def norm(h): return re.sub(r'[^a-z0-9]+', '_', h.strip().lower()).strip('_')

def map_cols(header):
    hn = [norm(h) for h in header]; m = {}
    for k, al in ALIASES.items():
        for a in al:
            if a in hn: m[k] = hn.index(a); break
    missing = [k for k in ('cin', 'name') if k not in m]
    if missing: sys.exit(f'Could not find columns {missing} in CSV header: {header}')
    return m

def slugify(name, cin):
    s = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return f'{s}-{cin[-6:].lower()}'

def inr(v):
    try: x = float(str(v).replace(',', ''))
    except ValueError: return ''
    if x <= 0: return ''
    s = f'{int(round(x)):d}'; last3, rest = s[-3:], s[:-3]
    rest = re.sub(r'(\d)(?=(\d\d)+$)', r'\1,', rest)
    return 'Rs ' + (rest + ',' + last3 if rest else last3)

def tcase(a):
    t=(a or '').title()
    return re.sub(r"\b(Up|Ncr|Iii|Ii|Iv|Vi|Vii|Llp|Opc|Pvt|Ltd|Ub|Gf|Ff|Sf)\b",lambda m:m.group(1).upper() if m.group(1) not in ('Pvt','Ltd') else m.group(1),t)

def fmt_date(v):
    v = (v or '').strip()
    for f in ('%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%b-%Y', '%Y-%m-%dT%H:%M:%S'):
        try: return datetime.datetime.strptime(v[:19], f).strftime('%d %b %Y')
        except ValueError: pass
    return v

def in_area(addr):
    a = (addr or '').upper()
    return any(w in a for w in CITY_WORDS) or bool(PINS.search(a))

def city_of(addr):
    a = (addr or '').upper()
    if 'GREATER NOIDA' in a: return 'Greater Noida'
    if 'NOIDA' in a or 'GAUTAM' in a: return 'Noida'
    if 'GHAZIABAD' in a or 'INDIRAPURAM' in a or 'VAISHALI' in a: return 'Ghaziabad'
    return 'Noida / NCR'

def kind(cin, cls):
    c = cin[:1]
    if 'LLP' in (cls or '').upper() or re.match(r'^[A-Z]{3}-\d{4}$', cin): return 'LLP'
    if 'OPC' in cin: return 'One Person Company'
    if 'PTC' in cin: return 'Private Limited Company'
    if 'PLC' in cin: return 'Public Limited Company'
    return 'Company'

def load(master, directors, all_up=False):
    rows = []
    with open(master, newline='', encoding='utf-8-sig', errors='replace') as f:
        rd = csv.reader(f); m = map_cols(next(rd))
        for r in rd:
            g = lambda k: r[m[k]].strip() if k in m and m[k] < len(r) else ''
            if not g('cin') or not g('name'): continue
            if not all_up and 'addr' in m and not in_area(g('addr')): continue
            rows.append({k: g(k) for k in ALIASES})
    dirs = {}
    if directors:
        with open(directors, newline='', encoding='utf-8-sig', errors='replace') as f:
            rd = csv.DictReader(f)
            for r in rd:
                cin = (r.get('CIN') or r.get('cin') or '').strip(); nm = (r.get('Director Name') or r.get('director_name') or r.get('name') or '').strip()
                if cin and nm: dirs.setdefault(cin, []).append(nm.title())
    return rows, dirs

def build(rows, dirs, out, asof):
    tpl = open(TEMPLATE, encoding='utf-8').read()
    base = os.path.join(out, 'companies'); os.makedirs(base, exist_ok=True)
    seen = set(); index = []; urls = []
    for c in rows:
        slug = slugify(c['name'], c['cin'])
        if slug in seen: continue
        seen.add(slug)
        name = c['name'].upper(); city = city_of(c['addr']); typ = kind(c['cin'], c['cls'])
        facts = [('CIN / LLPIN', c['cin']), ('Company status', c['status'].title()), ('Type', typ),
                 ('Date of incorporation', fmt_date(c['doi'])), ('Class / category', ' / '.join(x.title() for x in (c['cls'], c['cat'], c['sub']) if x)),
                 ('Registrar of Companies', c['roc'] or 'RoC Kanpur'), ('Registered office address', tcase(c['addr'])),
                 ('Authorised capital', inr(c['auth'])), ('Paid-up capital', inr(c['paid'])), ('Principal activity', c['act'].title())]
        d = dirs.get(c['cin'])
        if d: facts.append(('Directors / designated partners', ', '.join(sorted(set(d)))))
        rows_html = '\n'.join(f'<tr><th>{html.escape(k)}</th><td>{html.escape(v)}</td></tr>' for k, v in facts if v)
        desc = f'{name} ({c["cin"]}) - {typ.lower()} registered in {city}. Status, date of incorporation, registered office address and capital as per MCA records.'
        body = f'''
    <section class="svc-hero">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="../../">Home</a><span>/</span><a href="../">Company search</a><span>/</span><span>{html.escape(name)}</span></nav>
        <span class="eyebrow">{html.escape(typ)} · {html.escape(city)}</span>
        <h1>{html.escape(name)}</h1>
        <p class="svc-hero__lede">CIN {html.escape(c["cin"])} · {html.escape(c["status"].title() or "Status not available")}{(" · Incorporated " + html.escape(fmt_date(c["doi"]))) if c["doi"] else ""}</p>
      </div>
    </section>
    <div class="container svc-layout">
      <article class="prose">
        <h2>Company details</h2>
        <div class="table-wrap"><table class="co-table"><tbody>
{rows_html}
        </tbody></table></div>
        <p class="note">Source: Ministry of Corporate Affairs company master data published on data.gov.in, as of {asof}. Vitt-Marg Advisors is not affiliated with MCA. To correct or remove this page, write to rudrajha0107@gmail.com.</p>
        <h2>Annual ROC compliance for a {html.escape(typ.lower())}</h2>
        <ul>
          <li><strong>AOC-4</strong> (financial statements): within 30 days of the AGM{" (Form 11 and Form 8 for an LLP)" if typ == "LLP" else ""}.</li>
          <li><strong>MGT-7 / MGT-7A</strong> (annual return): within 60 days of the AGM.</li>
          <li><strong>DIR-3 KYC</strong> for every director: by 30 September each year.</li>
          <li><strong>ADT-1</strong> for auditor appointment, and income-tax return / tax audit by the due date.</li>
        </ul>
        <p>Late filing attracts an additional fee of Rs 100 per day per form. See our note on <a href="../../blog/aoc-4-mgt-7-annual-filing-fy-2025-26/">AOC-4 and MGT-7 for FY 2025-26</a>.</p>
      </article>
      <aside class="svc-aside">
        <div class="svc-card-box">
          <h3>Is this your company?</h3>
          <p>We handle ROC filings, GST, TDS, income tax and audits for companies in Noida and Ghaziabad. Fixed quote, reply within one working day.</p>
          <a href="../../roc-compliance-noida/" class="btn btn--primary"><span>ROC compliance</span></a>
          <a href="tel:+919315639676" class="btn btn--ghost"><span>Call 9315639676</span></a>
        </div>
        <div class="svc-card-box svc-related"><h3>Search another company</h3><a href="../">Company search (Noida &amp; Ghaziabad)</a><a href="../../company-registration-noida/">Register a new company</a></div>
      </aside>
    </div>'''
        ld = {"@context": "https://schema.org", "@type": "Organization", "name": name, "identifier": c['cin'], "url": f"{SITE}/companies/{slug}/",
              "address": {"@type": "PostalAddress", "streetAddress": tcase(c['addr']), "addressRegion": "Uttar Pradesh", "addressCountry": "IN"}}
        if c['doi']: ld["foundingDate"] = fmt_date(c['doi'])
        page = (tpl.replace('{{TITLE}}', html.escape(f'{name} - CIN {c["cin"]}, address, status | Vitt-Marg'))
                   .replace('{{DESC}}', html.escape(desc)).replace('{{URL}}', f'{SITE}/companies/{slug}/')
                   .replace('{{LD}}', json.dumps(ld, ensure_ascii=False)).replace('{{ROOT}}', '../../').replace('{{MAIN}}', body))
        d_ = os.path.join(base, slug); os.makedirs(d_, exist_ok=True)
        open(os.path.join(d_, 'index.html'), 'w', encoding='utf-8').write(page)
        index.append([name, c['cin'], slug, city, c['status'].title()]); urls.append(f'{SITE}/companies/{slug}/')
    index.sort()
    json.dump(index, open(os.path.join(base, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    # search page
    search = open(os.path.join(os.path.dirname(__file__), 'search_body.html'), encoding='utf-8').read().replace('{{COUNT}}', f'{len(index):,}').replace('{{ASOF}}', asof)
    page = (tpl.replace('{{TITLE}}', 'Company Search by Name or CIN - Noida &amp; Ghaziabad | Vitt-Marg')
               .replace('{{DESC}}', 'Search companies and LLPs registered in Noida, Greater Noida and Ghaziabad by name or CIN. Status, incorporation date, registered address and capital as per MCA records.')
               .replace('{{URL}}', f'{SITE}/companies/').replace('{{LD}}', '{}').replace('{{ROOT}}', '../').replace('{{MAIN}}', search))
    open(os.path.join(base, 'index.html'), 'w', encoding='utf-8').write(page)
    urls.insert(0, f'{SITE}/companies/')
    today = datetime.date.today().isoformat()
    with open(os.path.join(out, 'sitemap-companies.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in urls[:50000]: f.write(f'  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n')
        f.write('</urlset>\n')
    return len(index)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('master'); ap.add_argument('directors', nargs='?')
    ap.add_argument('--out', default='site_upload'); ap.add_argument('--asof', default=datetime.date.today().strftime('%d %b %Y'))
    ap.add_argument('--all-up', action='store_true', help='include all UP companies, not only Noida / Ghaziabad')
    a = ap.parse_args()
    rows, dirs = load(a.master, a.directors, a.all_up)
    n = build(rows, dirs, a.out, a.asof)
    print(f'{n} company pages written to {a.out}/companies')
