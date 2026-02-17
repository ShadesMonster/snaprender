# SnapRender — Product Spec

## One-Liner

**SnapRender turns your data into beautiful documents.** Send JSON + pick a template, get back a polished PDF. No HTML required.

---

## The Problem

Developers need to generate documents (invoices, reports, receipts, certificates) all the time. Their current options suck:

1. **DIY with Puppeteer/Playwright** — Spin up a headless browser, write HTML, pray the page breaks work. Ends up as a 1.5GB Docker image that leaks memory.
2. **Use an expensive API** — DocRaptor ($0.12/doc), CraftMyPDF ($0.024/doc with arbitrary limits), Carbone (requires Word templates).
3. **Use a crappy library** — jsPDF has no CSS support. WeasyPrint has no JavaScript support. pdf-lib hasn't been updated since 2021.

The result: developers spend days on what should take minutes, or they overpay for a basic service.

## The Solution

SnapRender is a document generation API with two modes:

### Mode 1: Template Mode (No HTML Required)
Send JSON data + pick a built-in template. Get back a beautiful PDF.

```bash
curl -X POST https://api.snaprender.dev/v1/render \
  -H "Authorization: Bearer sr_live_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "invoice",
    "data": {
      "from": {
        "name": "Acme Corp",
        "address": "123 Main St, SF, CA 94102"
      },
      "to": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "number": "INV-2026-001",
      "date": "2026-02-17",
      "due_date": "2026-03-17",
      "items": [
        { "description": "Web Development", "quantity": 40, "rate": 150 },
        { "description": "Design Review", "quantity": 4, "rate": 200 }
      ],
      "tax_rate": 0.08,
      "notes": "Payment due within 30 days."
    },
    "output": "pdf"
  }'
```

That's it. No HTML. No CSS. No fighting with page breaks. You get back a professional invoice PDF.

### Mode 2: HTML Mode (Full Control)
For power users who want pixel-perfect control. Send HTML + CSS, get back a PDF or screenshot.

```bash
curl -X POST https://api.snaprender.dev/v1/render \
  -H "Authorization: Bearer sr_live_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Custom Report</h1>...</body></html>",
    "output": "pdf",
    "format": "A4",
    "margin": { "top": "1in", "bottom": "1in" }
  }'
```

This is what we already have — the existing Playwright-based renderer. It stays as the power-user escape hatch.

### Mode 3: URL Mode (Screenshots & PDFs from URLs)
Point at any URL. Get a screenshot or PDF.

```bash
curl -X POST https://api.snaprender.dev/v1/render \
  -H "Authorization: Bearer sr_live_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/dashboard",
    "output": "png",
    "width": 1280,
    "height": 800
  }'
```

Also already built. Keeps working as-is.

---

## Built-In Templates (MVP)

Ship with 5 polished templates. Each one handles layout, page breaks, and styling automatically.

### 1. Invoice
- Company logo (URL or base64)
- From/to addresses
- Line items with quantity, rate, amount
- Subtotal, tax, discounts, total
- Payment terms and notes
- Supports multiple currencies

### 2. Receipt
- Simplified invoice for completed payments
- Transaction ID, payment method
- Optimized for email attachment (compact layout)

### 3. Report
- Title page with metadata
- Sections with headers and body text
- Tables and key-value data
- Auto-numbered pages, headers/footers
- Charts (via embedded SVG data)

### 4. Certificate
- Centered, landscape layout
- Recipient name (large, styled)
- Certificate title, description, date
- Signature lines
- Decorative border options

### 5. Letter
- Standard business letter format
- Sender/recipient addresses
- Date, subject, salutation
- Body paragraphs
- Closing, signature

---

## API Design

### Unified Endpoint

Everything goes through one endpoint: `POST /v1/render`

The request body determines what happens:

| Field | What it does |
|-------|-------------|
| `template` + `data` | Template mode — pick a template, send JSON data |
| `html` | HTML mode — full control with raw HTML/CSS |
| `url` | URL mode — screenshot or PDF of a webpage |
| `output` | `"pdf"` (default), `"png"`, `"jpeg"`, `"html"` |

### Response Options

| `output` value | Content-Type | Description |
|----------------|-------------|-------------|
| `pdf` | `application/pdf` | PDF binary |
| `png` | `image/png` | PNG screenshot |
| `jpeg` | `image/jpeg` | JPEG screenshot |
| `html` | `text/html` | Rendered HTML (useful for previewing before PDF) |

### Common Options (All Modes)

```json
{
  "format": "A4",           // A4, Letter, Legal
  "landscape": false,
  "margin": {
    "top": "0.5in",
    "right": "0.5in",
    "bottom": "0.5in",
    "left": "0.5in"
  },
  "scale": 1.0,
  "filename": "invoice-001.pdf",
  "metadata": {
    "title": "Invoice #001",
    "author": "Acme Corp"
  }
}
```

### Template Customization

Templates accept a `style` override object for common tweaks without touching HTML:

```json
{
  "template": "invoice",
  "data": { ... },
  "style": {
    "primaryColor": "#2563eb",
    "fontFamily": "Inter",
    "logoUrl": "https://example.com/logo.png",
    "fontSize": "14px"
  }
}
```

### Authentication

API keys prefixed with `sr_live_` (production) and `sr_test_` (sandbox).

```
Authorization: Bearer sr_live_abc123def456
```

### Webhooks (Later — Not MVP)

For async/batch generation:

```json
{
  "template": "invoice",
  "data": { ... },
  "webhook_url": "https://your-app.com/webhook/pdf-ready",
  "async": true
}
```

Returns immediately with a job ID. Hits your webhook when done.

---

## Architecture

### What We Have (Already Built)
- Fastify API server with CORS
- Playwright browser pool (configurable size)
- PDF rendering from HTML (`POST /v1/pdf`)
- Screenshot rendering from URL or HTML (`POST /v1/screenshot`)
- Zod validation
- Error handling with error codes
- Config for Stripe, Redis, PostgreSQL, Resend (deps installed, not wired up yet)

### What We Need to Build

#### Phase 1: Core Product (Weeks 1-2)
- [ ] **Template engine** — Handlebars or custom. Takes JSON data + template name, outputs styled HTML, feeds into existing Playwright renderer
- [ ] **5 built-in templates** — Invoice, receipt, report, certificate, letter. Ship as HTML/CSS files with Handlebars placeholders
- [ ] **Unified `/v1/render` endpoint** — Replaces separate `/v1/pdf` and `/v1/screenshot` routes. One endpoint, multiple modes
- [ ] **Template style overrides** — primaryColor, fontFamily, logoUrl, fontSize
- [ ] **API key auth** — Generate keys, validate on requests, track usage per key
- [ ] **PostgreSQL schema** — Users, API keys, usage tracking, plans
- [ ] **Rate limiting per API key** — Using existing @fastify/rate-limit + Redis

#### Phase 2: Monetization (Week 3)
- [ ] **Stripe integration** — Plans (Free, Starter, Pro, Scale), checkout, billing portal
- [ ] **Usage metering** — Count renders per API key per billing period
- [ ] **Usage enforcement** — Reject requests when plan limit reached
- [ ] **Signup/login flow** — Simple email-based (magic link via Resend)
- [ ] **Dashboard** — API key management, usage stats, billing

#### Phase 3: Distribution (Week 4)
- [ ] **Landing page** — "Free invoice generator" SEO play. Paste your data, get a PDF. No signup required (with daily limits)
- [ ] **MCP server** — Wrap the API as an MCP server so AI coding tools can generate documents directly
- [ ] **npm package** — `snaprender` client library for Node.js
- [ ] **Show HN launch post**

#### Phase 4: Growth (Ongoing)
- [ ] Custom templates (user-uploaded HTML/CSS)
- [ ] Template marketplace
- [ ] Batch generation
- [ ] Webhooks for async rendering
- [ ] Python, Go, Ruby client libraries
- [ ] More built-in templates (contract, proposal, shipping label, report card)

---

## Pricing

| Tier | Price | Renders/month | Per-render | Target |
|------|-------|--------------|-----------|--------|
| Free | $0 | 50 | — | Evaluation |
| Starter | $9/mo | 1,000 | $0.009 | Solo devs |
| Pro | $29/mo | 10,000 | $0.0029 | Startups |
| Scale | $79/mo | 50,000 | $0.0016 | Production |
| Enterprise | Custom | Unlimited | <$0.001 | High-volume |

All plans include:
- All built-in templates
- HTML mode
- Screenshot mode
- API access
- Style customization

Pro and above:
- Custom templates
- Priority rendering
- Remove "Generated by SnapRender" footer on free/starter

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| API | Fastify | Already built. Fast, low overhead |
| Rendering | Playwright (Chromium) | Already built. Best HTML/CSS compatibility |
| Templates | Handlebars | Simple, logic-less, fast compilation |
| Database | PostgreSQL | Already in deps. Users, keys, usage |
| Queue | BullMQ + Redis | Already in deps. Async rendering later |
| Auth | API keys + magic links | Simple. Resend already in deps |
| Payments | Stripe | Already in deps. Subscriptions + metering |
| Email | Resend | Already in deps. Magic links + notifications |
| Hosting | Railway or Fly.io | Easy Docker deploys, good free tiers |

---

## What Makes This Different

1. **Template mode is the killer feature.** Competitors make you write HTML or use Word templates or drag-and-drop editors. We let you send JSON and get a beautiful doc. The 80% use case (invoices, receipts, reports) should require zero HTML knowledge.

2. **Pricing undercuts everyone.** $0.009/doc on Starter vs DocRaptor at $0.12 (13x cheaper) or CraftMyPDF at $0.024 (2.7x cheaper).

3. **MCP server distribution.** No competitor is in the AI tool ecosystem. We'll be the document generation tool that Claude, Cursor, and every AI coding assistant can use natively.

4. **Preview before render.** The `"output": "html"` option lets you preview the rendered template in a browser before burning a render credit on PDF generation. No competitor offers this.

5. **One endpoint, three modes.** Template, HTML, URL. Developers don't need to learn three different APIs or switch tools as their needs grow.

---

## Success Metrics

| Timeframe | Metric | Target |
|-----------|--------|--------|
| Month 1 | Free signups | 100 |
| Month 2 | First paying customer | 1 |
| Month 3 | MRR | $100 |
| Month 6 | MRR | $500 |
| Month 12 | MRR | $2-5K |

Conservative targets. PDFShift's trajectory ($9K MRR as a solo dev with a basic wrapper) is the upside case.

---

## The Pitch (For HN/Reddit/Communities)

> **SnapRender: Turn JSON into beautiful PDFs. No HTML required.**
>
> Tired of fighting Puppeteer page breaks? Paying $0.12/doc for DocRaptor? Wrestling with Word templates in Carbone?
>
> SnapRender is a document generation API that just works. Send JSON data + pick a template (invoice, receipt, report, certificate, letter) = polished PDF. Need full control? Send raw HTML instead. Need a screenshot? Send a URL.
>
> One endpoint. Three modes. Starting at $0.009/doc.
>
> Free tier: 50 renders/month. No credit card required.
