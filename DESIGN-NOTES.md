# vittmarg.com — Design system v2 (Oct 2026)

The logo, content, images and site functions are unchanged. This revision changes the visual design only.

## What changed
- **Typography:** Manrope for headings (600; the hero and page titles use 700) and Inter for body text and navigation (400/500). Fraunces, Sora and JetBrains Mono have been removed.
- **Colour:** off-white background #F8FAFC, navy #0B1220 for the CTA band and footer, text #111827 and #64748B, borders #E2E8F0. Blue #2563EB is used only for buttons and links. Gold #C9A227 appears only as the 20px rule before section labels. All gradients have been removed.
- **Removed decoration:** page loader, aurora and blob background, custom cursor, mouse glow, scroll-progress bar, 3D tilt cards, magnetic buttons, button ripple, floating dashboard cards and the scroll indicator.
- **Layouts:**
  - Services are a numbered three-column catalogue with rule lines and no icon cards.
  - Sectors, articles and the blog index are ruled lists.
  - "How we work" is an editorial numbered list with a sticky heading.
  - Due dates sit in one bordered panel.
  - The process is a four-step horizontal timeline.
  - Leadership uses plain photo and text rows.
  - Fees are shown in one bordered table with three columns.
  - The FAQ is a ruled accordion.
  - The footer is navy with services, firm links, office address, legal links and social links.
- **Navigation:** logo on the left, seven links in the middle and one "Book a Consultation" button on the right. Inner pages use the same nav and footer.
- **Form:** labels sit above the fields, with 6px corners.
- **Calculator page:** recoloured and switched to the new fonts. The "व" badge has been replaced with the actual logo.

## Small fixes (script.js)
- The calculator code no longer runs on pages without the calculator. This removes the console error on the home page.
- Tapping "Book a Consultation" in the mobile menu now closes the menu.

## Still pending
1. **Hero photo (Assets/office.png):** it looks like a generic stock or AI image and is now the most "template-like" element on the page. Replace it with a real photo of the Sector 63 office or the team, keeping the same filename.
2. The contact form still does not send enquiries anywhere.
3. Confirm the fee figures. Privacy, Terms, Disclaimer and the social links still point to "#".
