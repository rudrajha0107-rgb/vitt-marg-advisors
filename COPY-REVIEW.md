# vittmarg.com — Copy review (Oct 2026)

Colours, logo, images, layout and site functions are unchanged. The changes are to the text, a few font sizes and two small bug fixes.

## What the review found (home page)

| Area | Issue | What changed |
|---|---|---|
| Hero heading | "Numbers, guided with a clear direction." Sounds like a slogan and says nothing about the work | "Tax, GST and ROC compliance in Noida and Delhi NCR" |
| Hero figures | "1200+ returns a year", "98% on-time compliance", "15+ years combined" are not verified | Replaced with the service areas: Tax · GST · TDS / ROC / Audit |
| Floating cards | "All filed – 4 states reconciled", "Refund tracked ₹4.2L" are invented results | Replaced with factual dates: GSTR-3B due on the 20th, advance tax dates, monthly MIS |
| Trust bar | "GSTN Practitioner" not confirmed. Startup India and Udyam are portals, not registrations | Relabelled "Membership and the portals we file on": ICMAI, Income Tax, GST, TRACES, MCA21, Udyam/DPIIT |
| Section headings | "keep Delhi NCR moving", "whole compliance stack", "chaos to clarity", "before the deadline calls", "sign your work" | Direct headings: Sectors we work with, What we handle for clients, How a new engagement starts, Who you will work with |
| Service cards | Cute link text ("Sort my GST →", "Protect my brand →"), and links on 11 cards that went nowhere | Each card now names actual forms and sections. Links say "ITR filing →" or "Enquire →" and go to the right page |
| Out-of-date / risky claims | "Angel-tax relief" (angel tax under section 56(2)(viib) was abolished from FY 2024-25). Trademark "hearing representation" | Removed |
| Why Us | "Partner-led, not junior-shuffled", "boutique price", "zero last-minute panic" | Four plain points: a principal reviews the work, a due-date calendar, working papers on file, advice in plain language |
| Stats band | "340+ clients", "₹12 Cr+ recovered" are not verified | Replaced with the monthly due dates: 7th TDS, 11th GSTR-1, 15th PF/ESI, 20th GSTR-3B |
| Leadership | "The people who sign your work" — a CMA cannot sign a statutory audit or tax audit. Founder bio claimed "fifteen years… statutory audit" | Neutral, factual bios with no unverified numbers |
| Testimonials | Five reviews with invented names, presented as real | **Section removed** |
| Pricing | "Starter / Growth / Enterprise", "Most chosen", "Talk to sales" read like a SaaS product | Basic / Standard / Extended. The fee is confirmed in writing. Buttons say "Discuss Your Requirement" and "Contact Us" |
| FAQ | "fractional finance chief" | Plain answers. Added: "Do you carry out statutory audit and tax audit?" (answer: a practising CA signs those; we prepare and coordinate) |
| Insights | Two cards (advance tax, DPIIT) pointed to articles that don't exist | Replaced with the new cost audit and internal audit articles |
| CTA band | "Put your compliance on autopilot?" | "Have a pending return, notice or filing?" |
| Contact | "Let's map your path forward", "A principal — not a bot" | "Discuss your requirement". Service options now include TDS and Accounting & MIS |
| Footer | "The path of finance — walked with you" | One plain line describing the practice |

## Other pages
- Service pages (GST, ITR, ROC, company registration): the content was already practical. Only the buttons changed ("Book a Consultation", "Talk to a Professional") and one filler line was removed.
- Blog: the listing intro was updated. On every article, the side box now says "Discuss your requirement".
- Tax calculator: removed "instantly", "accurate" and "highlights the winner". The CTA was rewritten.

## Typography and bug fixes (styles.css, at the end of the file)
- Hero and section headings are about 25% smaller, so they read as headings rather than banner slogans.
- Bug fix: the hero heading lines never finished their slide-in animation and sat 42px too low. This made the heading overlap the paragraph below once it ran to three lines.

## Needs your decision / not changed
1. **The contact form does not send anything.** script.js only shows a success message, so every enquiry typed into the form is lost. It needs a form service (Formspree, Web3Forms or Google Forms) or a WhatsApp/mailto fallback.
2. **Pricing figures** (₹2,999 / ₹8,999 / ₹24,999, Yearly −15%) were kept as they are. Confirm these are your real fees, or remove the section.
3. **Founder bio**: add your actual years of practice and areas of work if you want them shown. No figure was invented.
4. **Footer links**: Privacy, Terms, Disclaimer and the social icons point to "#". ICMAI's guidelines on websites expect a disclaimer page.
5. **Existing JS error**: one console error, "Cannot read properties of null (reading 'addEventListener')", was already there before these changes. There is also slight horizontal scrolling on mobile. Neither came from this revision.
