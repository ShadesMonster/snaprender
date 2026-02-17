# Product Research: What Should We Build?

> Research compiled February 2026. Based on analysis of 1,000+ micro-SaaS businesses, competitor pricing, HackerNews/Reddit sentiment, and verified indie hacker revenue data.

---

## TL;DR

After deep research across the micro-SaaS landscape, document generation market, Chrome extensions, Shopify apps, MCP servers, and developer tools — **the document/PDF generation API is the highest-conviction opportunity**. The market is $1.42B and growing, competitors are either overpriced or painful to use, and we already have the codebase started.

The twist: **ship it as both a traditional API and an MCP server**. The MCP ecosystem is months old and being called "the early days of mobile app stores." Same product, two distribution channels, zero extra engineering.

---

## The Raw Data

### What's Actually Making Money (Verified Revenue, 2025-2026)

| Product | MRR | Team | Category |
|---------|-----|------|----------|
| Bolt.new | ~$3.3M | Small | AI code generation |
| PDF.ai | ~$300K | Solo | Chat with PDF |
| Momentum (Chrome ext) | $300K | Small | New tab dashboard |
| Numerous.ai | $175K | Small | AI spreadsheet add-on |
| PhotoAI | $138K | Solo | AI photo generation |
| GMass (Chrome ext) | $130K | Small | Gmail campaigns |
| Senja.io | $83K | 2 people | Testimonial collection |
| Subscribr | ~$83K | 2-3 | YouTube script AI |
| Kleo | $62K | 4 | LinkedIn content AI |
| Eightify (Chrome ext) | $45K | 3 | AI YouTube summarizer |
| Andrew Fennell | $30K | Solo | SEO-first SaaS |
| Audio Pen | $15K | Solo | Voice-to-text |
| PDFShift | $9K | Solo | HTML-to-PDF API |
| EZ Fulfill (Shopify) | $8K | Solo | CSV tracking upload |

**Key patterns:**
- The portfolio approach works: one founder grew from $130/mo to $25K/mo in a year by running 30+ small apps
- AI "wrappers" convert at 47% vs 25% for traditional SaaS
- Distribution beats product every single time — Kleo had 60K free users before monetizing
- 70% of micro-SaaS makes under $1K/mo. Only 1-2% exceed $50K/mo. But 95% reach profitability within 12 months because costs are near zero

### The Winning Formula

Every breakout AI product follows this pattern:

**Specific input → Specific output → Specific audience**

| Input | Output | Product | Revenue |
|-------|--------|---------|---------|
| Photos of you | Pro headshots | PhotoAI | $138K/mo |
| PDF/document | Conversational answers | PDF.ai | $300K/mo |
| Natural language | Full-stack app | Bolt.new | $3.3M/mo |
| Spreadsheet data | Cleaned/categorized data | Numerous.ai | $175K/mo |
| Voice memo | Structured text | Audio Pen | $15K/mo |

---

## The Document Generation Opportunity (Deep Dive)

### Market Size
- PDF Generation API market: **$1.42B in 2024**, projected **$3.85B by 2033** (11.7% CAGR)
- Document Generation Software market: **$2.78B in 2024**

### Competitor Landscape

| Tool | Approach | Lowest Paid | Per-Doc Cost | Engine | Key Weakness |
|------|----------|-------------|-------------|--------|-------------|
| DocRaptor | HTML/CSS→PDF | $15/mo (125 docs) | $0.025-0.12 | Prince XML | Most expensive |
| Carbone | JSON + Word templates | €29/mo (1K docs) | ~€0.029 | LibreOffice | Word-template-centric, small community |
| CraftMyPDF | Drag-and-drop + JSON | $29/mo (1.2K docs) | ~$0.024 | Custom | Only 6 templates on starter plan |
| PDFShift | HTML/URL→PDF | $9/mo (100 docs) | ~$0.09 | Chromium | No compression, size caps |
| PDFMonkey | HTML templates + JSON | €5/mo (300 docs) | €0.005-0.017 | HTML-based | Limited features |
| Onedoc (YC W24) | React/Tailwind→PDF | ~$0.05/doc | $0.05 | Custom | Got destroyed on HN for pricing |
| WeasyPrint | Open-source Python | Free | $0 | Custom CSS | No JS, no calc(), SSRF vulns |
| Gotenberg | Docker-based | Free | $0 | Chromium+LibreOffice | Requires DevOps, no templates |

### What Users Are Actually Saying (HN/Reddit Quotes)

> *"$2,500 to generate 50,000 PDFs... extremely costly"* — Brajeshwar on HN

> *"I wouldn't consider any solution that costs more than 1 cent per page"* — breadwinner on HN

> *"Chrome is very slow and uses a bunch of memory"* — plopz on HN

> *"Most HTML-to-PDF are deeply insecure"* — Sytten on HN (SSRF confirmed by Black Hills InfoSec)

> *"What starts as a simple PDF feature ends up requiring full-blown browser orchestration and DevOps maintenance."* — developer on Medium

### Top Pain Points (Ranked)

1. **Page breaks** — The #1 technical complaint. Dynamic content + reliable pagination = unsolved
2. **Headless Chrome overhead** — 100% CPU per PDF, 1-1.5GB Docker images, memory leaks
3. **Pricing at scale** — Users draw a hard line at $0.01/doc for high volume
4. **"Works in dev, breaks in prod"** — Rendering inconsistencies across environments
5. **PDF form filling** — "A huge pain point" with no good solution
6. **Security** — SSRF vulnerabilities in HTML-to-PDF pipelines

### The Gap

**No tool simultaneously offers:**
- Sub-penny-per-document pricing at scale
- Developer-friendly API with modern DX (not Word templates or drag-and-drop builders from 2015)
- Reliable page breaks for dynamic content
- No headless Chrome overhead
- Self-hosting option

Carbone comes closest but is Word-template-centric. DocRaptor has the best rendering (Prince engine) but charges 10x what users want to pay.

### Highest-Volume Use Cases

1. **Invoices/billing** — 50% of B2B invoices expected automated. Highest volume, low per-unit tolerance
2. **Contracts/legal** — Highest willingness to pay ($49-100+/user/mo)
3. **Reports/compliance** — 37.2% of document generation market
4. **Proposals/quotes** — PandaDoc proved this model at $19-59/user/mo
5. **Certificates/badges** — Growing with e-learning boom

---

## Other Opportunities Considered

### MCP Servers (New, Low Competition)

- Multiple sources call MCP servers **"the early days of mobile app stores"**
- Monetization infrastructure already exists: Apify (pay-per-event), MCPize (usage-based, dev keeps 85%), MonetizedMCP (open-source payment framework)
- Playbook: useful MCP server → 5 free requests → $20/mo
- Very low competition, ecosystem is months old
- **Verdict: Best as a distribution channel for our main product, not a standalone play**

### Chrome Extensions

- Revenue kings: Momentum ($300K/mo), GMass ($130K/mo), Eightify ($45K/mo)
- 83% profit margins, 40-60x monthly profit exit multiples
- AI extension market: $1.5B → $7.8B by 2031
- **Verdict: Great margins but needs a specific pain point. Better as Product #2 or #3**

### Shopify Apps

- EZ Fulfill ($8K MRR) just uploads CSV tracking numbers
- Median new app revenue in first 3 months: $0. 54% earn under $1K/mo
- Biggest pain: EU invoice compliance, bulk product editing, chargebacks
- **Verdict: High ceiling, brutal start. Not ideal for first product**

### Vertical SaaS (Trades, Small Landlords, Clinics)

- Plumbers, HVAC, landscapers still use whiteboards and paper
- Small landlords (2-10 properties) collect rent via Venmo with no tracking
- Physical therapy clinics lack patient compliance tools
- Willingness to pay: $79-199/mo
- **Verdict: Huge opportunity but requires domain knowledge we don't have. Park for later**

---

## Pricing Strategy Research

### What the Data Says About Free Tiers

**Kill or tightly gate the free plan.** Multiple real examples:

| Company | What They Did | Result |
|---------|--------------|--------|
| SyncToSheets | Killed free plan | Revenue jumped 60% ($5K→$8K MRR) |
| Reform | Killed freemium | 14 new customers in 10 days (vs 5 in prev 3 weeks) |
| RB2B | Tightened free usage | Crossed $1M ARR |
| Toggl | Switched to reverse trial | More than doubled paid revenue |

**Conversion rates by model:**

| Model | Conversion | Best For |
|-------|-----------|----------|
| Freemium (permanent free) | 2-5% | Large TAM, network effects |
| Free trial (time-limited) | 15-30% | High-value B2B tools |
| Reverse trial (full → downgrade) | 10-15% | Habit-forming products |
| Hybrid (free + usage caps) | 8-15% | Usage-based products |

**Rule of thumb:** If >50% of users are satisfied with free, it's too generous. Target: 20-40% satisfied with free.

**Our approach:** Reverse trial or tightly gated free tier (50-100 docs/month — enough to evaluate, not enough for production).

---

## The Recommendation

### Build: SnapRender — The Developer-First Document API

**What it is:** JSON data + template → beautiful PDF/PNG/HTML. No headless browser required for common templates. HTML supported for power users.

**Why this wins:**
1. **Validated market** — $1.42B, growing 11.7% CAGR
2. **Clear pricing gap** — Users want $0.005-0.01/doc. Most tools charge 3-10x that
3. **Proof it works** — PDFShift hit $9K MRR as basically a Chromium wrapper. We can do better
4. **Built-in differentiation** — Beautiful default templates (invoice, receipt, report, certificate) that competitors don't offer. No HTML required for 80% of use cases
5. **MCP distribution** — Ship as an MCP server on day one. AI coding assistants can generate documents directly. No competitor is doing this
6. **SEO plays** — "free invoice generator," "free PDF API," "JSON to PDF" — high-intent, low-competition keywords
7. **We already have the codebase started** — SnapRender exists, we're building on momentum

**Pricing:**

| Tier | Price | Docs/month | Per-doc | Target |
|------|-------|-----------|---------|--------|
| Free (reverse trial) | $0 | 50 | $0 | Evaluation only |
| Starter | $9/mo | 1,000 | $0.009 | Solo devs, side projects |
| Pro | $29/mo | 10,000 | $0.0029 | Growing startups |
| Scale | $79/mo | 50,000 | $0.0016 | Production workloads |
| Enterprise | Custom | Unlimited | <$0.001 | High-volume |

This undercuts every competitor at every tier while remaining profitable (our marginal cost per doc is near zero with template-based rendering).

**Launch plan:**
1. **Week 1-2:** Core API — JSON + template selection → PDF. 5 beautiful built-in templates (invoice, receipt, report, certificate, letter)
2. **Week 3:** Free tier + Stripe integration. Launch on HN as "Show HN"
3. **Week 4:** MCP server wrapper. Launch in MCP directories/communities
4. **Ongoing:** SEO content ("free invoice generator" landing page), community templates, API client libraries

**Success metrics:**
- 100 free signups in first month (validation)
- First paying customer within 60 days
- $500 MRR within 6 months (conservative)
- $2-5K MRR within 12 months (realistic based on PDFShift's trajectory)

---

## Products #2 and #3 (Queue for Later)

### Product #2: Chrome Extension — AI Document Assistant
Once SnapRender has traction, build a Chrome extension that lets you:
- Right-click any table/data on a webpage → generate a PDF report
- Convert any webpage to a clean PDF (better than "Print to PDF")
- Auto-generate invoices from email data

This uses SnapRender's API as the backend. Distribution through Chrome Web Store (3.2B+ extension users).

### Product #3: Specific Vertical Tool
Based on what we learn from SnapRender users:
- If invoice generation dominates → build a dedicated invoice SaaS for freelancers
- If report generation dominates → build a dashboard-to-PDF tool
- If certificates dominate → build a course completion certificate platform
- Let the data decide

---

## Sources

### Revenue Data
- [Indie Hackers: Kleo $0→$62K MRR](https://www.indiehackers.com/post/tech/from-0-to-62k-mrr-in-three-months-mUPVSYOlJAC2iogGK7d4)
- [Photo AI Deep Dive: $0→$132K MRR](https://www.indiehackers.com/post/photo-ai-by-pieter-levels-complete-deep-dive-case-study)
- [Senja.io: $0→$1M ARR](https://www.thesuccessfulprojects.com/how-two-indie-hackers-built-a-successful-micro-saas-senja-io-1m-arr/)
- [1,000 Micro SaaS Analysed: Real Revenue Data](https://www.rockingweb.com.au/micro-saas-revenue-analysis-2025/)
- [Top 40 Most Profitable GPT Wrappers](https://mktclarity.com/blogs/news/gpt-wrappers-top)

### Document Generation Market
- [Document Generation Software Market ($2.78B)](https://www.marketgrowthreports.com/market-reports/document-generation-software-market-119925)
- [PDF Generation API Market ($1.42B)](https://dataintelo.com/report/pdf-generation-api-market)
- [PDFShift: $9K MRR](https://superframeworks.com/blog/pdfshift)
- [HN: Onedoc pricing backlash](https://news.ycombinator.com/item?id=39668962)
- [HN: PDF generation pain points](https://news.ycombinator.com/item?id=39669806)
- [Puppeteer Isn't Meant for PDFs](https://medium.com/@onu.khatri/puppeteer-isnt-meant-for-pdfs-here-s-why-1e3a4419263f)

### Competitor Pricing
- [Carbone.io Pricing](https://carbone.io/pricing.html)
- [DocRaptor Pricing](https://docraptor.com/signup)
- [CraftMyPDF Pricing](https://craftmypdf.com/pricing/)
- [PDFMonkey Pricing](https://pdfmonkey.io/pricing/)

### Pricing Strategy
- [Killing Free Plan Increased Revenue 60%](https://stormy.ai/blog/saas-pricing-psychology-killing-free-plan)
- [Freemium Tanked My SaaS for 6 Months](https://petersuhm.com/posts/freemium/)
- [2025 State of Micro-SaaS](https://freemius.com/blog/state-of-micro-saas-2025/)
- [Freemium Conversion Benchmarks 2025](https://www.gurustartups.com/reports/freemium-to-paid-conversion-rate-benchmarks)

### Extensions & Platforms
- [Chrome Extensions with Impressive Revenue](https://extensionpay.com/articles/browser-extensions-make-money)
- [Chrome Extension Profitability 2025](https://www.starterstory.com/ideas/chrome-extension/profitability)
- [2025 State of Generative AI (Menlo Ventures)](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)
