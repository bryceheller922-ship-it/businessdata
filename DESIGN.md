# FeedbackPalace Design System

## 1. Purpose and scope

Use this document to create or critique FeedbackPalace product UI. FeedbackPalace monitors public competitor-related complaints and surfaces potential buying signals for B2B teams. This is the source of truth for the currently implemented visual language; where the product has no settled decision, preserve the interface and mark the gap `[NEEDS TEAM INPUT]` rather than inventing a standard.

## 2. Product and user principles

**Product:** FeedbackPalace — turn public customer dissatisfaction with competitors into timely, actionable sales opportunities.

**Target users:** B2B sales, growth, and marketing teams monitoring competitors. Precise roles, company size, and technical skill range: `[NEEDS TEAM INPUT]`.

**Main jobs:** Monitor competitor names and keywords; review high-frustration mentions; judge intent; unlock a source and post link; contact prospects; manage billing.

**Principles:**
- Make relevant signals easy to scan and prioritize.
- Show why a lead matters without overstating certainty.
- Keep source details masked until the user is entitled to them.
- Make monitoring setup and next steps clear.
- Treat public social content and personal identifiers with care.

**Brand personality:** Confident, clear, useful, and respectful. Avoid hype, pressure, and language that treats a frustrated person as a target.

**Supported platforms:** Responsive web app. Desktop and mobile web are evidenced by the app; dedicated native apps are not. Tablet-specific behavior: `[NEEDS TEAM INPUT]`.

## 3. Visual hierarchy and layout rules

- Use a clear page title, short explanatory sentence, and one primary task per page.
- The authenticated app uses a persistent dark left sidebar on desktop, followed by a light content canvas. Navigation labels are “Lead Feed,” “Monitored Competitors,” and “Billing.”
- Lead feed cards prioritize competitor/platform context, post content, intent score, then source/next action.
- Competitor setup prioritizes adding a name and comma-separated tracking keywords, then the monitored list.
- Keep content in a readable central area; use cards and spacing to separate independent tasks. Existing maximum content width is not codified: `[NEEDS TEAM INPUT]`.
- The marketing page may use a distinct, spacious hero layout; do not bring marketing-only treatment into dense operational screens without reason.
- Avoid hiding core actions behind decorative elements or requiring color alone to communicate status.

## 4. Token and visual-system guidance

Use implemented tokens only. Values below are observed in `tailwind.config.ts` and `globals.css`.

| Token | Value | Use |
|---|---|---|
| `ink` | `#141923` | Primary text and dark surfaces |
| `muted` | `#667085` | Supporting text |
| `canvas` | `#f5f7fa` | App background |
| `violet` | `#6549e8` | Primary actions and brand emphasis |
| `soft` shadow | `0 8px 30px rgba(28,37,54,.07)` | Existing card elevation |
| Field border | `#e4e7ec` | Existing input outline |
| Field radius | `10px` | Existing input shape |

- Typography currently uses Arial/Helvetica/sans-serif. No custom typeface or type scale is defined: `[NEEDS TEAM INPUT]`.
- Existing components use rounded cards and controls, but there is no formal radius scale. Do not infer one globally: `[NEEDS TEAM INPUT]`.
- Spacing scale, motion tokens, semantic success/warning/error colors, and dark-mode behavior are not formally specified: `[NEEDS TEAM INPUT]`.
- Continue to use existing Tailwind tokens before introducing new values. New tokens require team approval.

## 5. Component selection and usage rules

**Available in the repository:** Tailwind CSS; custom auth frame; text fields with focus styling; buttons; dashboard sidebar links; lead cards; competitor add/list rows; badges; empty-state panels; billing summary. `lucide-react` icons are used in dashboard UI. There is no installed shadcn/ui component library, Storybook, or shared component package.

- Reuse existing component patterns and tokens before creating a new visual treatment.
- Use labeled fields and explicit action labels. Do not use placeholder text as the only field label.
- Use buttons for actions and links for navigation. Give icon-only actions an accessible name.
- Keep lead actions contextual: “Unlock lead” when details are masked; “Reach out” when details are available.
- Show intent as a numeric percentage/score with text, not color alone. It indicates model-estimated intent, not a guarantee of purchase.
- Keep confirmation and destructive-action behavior consistent; a confirmation pattern for competitor removal is not implemented: `[NEEDS TEAM INPUT]`.
- Avoid implying that a disabled or unconfigured billing action has succeeded.

## 6. Interaction states and behavior

Design every data-dependent component for loading, success, empty, and error states.

- **Navigation:** sidebar links navigate among feed, competitor management, and billing. Active-link styling is not currently implemented: `[NEEDS TEAM INPUT]`.
- **Forms:** signup, login, and competitor addition show inline error feedback. Preserve entered values after recoverable failures. Communicate busy state and prevent accidental duplicate submission.
- **Lead access:** locked handles are visually obscured and links are omitted by the `get_leads()` RPC. Do not reveal the original handle or URL through DOM, client payloads, tooltips, analytics, or alternate queries. A locked lead opens a Stripe subscription checkout flow when configured; report setup or checkout failures honestly.
- **Reach out:** link opens the original post in a new tab only after the lead is unlocked; retain safe external-link behavior (`rel="noreferrer"`).
- **Competitors:** add requires a name and keywords; removal updates the list. Provide clear feedback on persistence errors.
- **Billing:** reflect subscription state returned by the server. Do not claim an active plan based only on client state.
- **Empty states:** explain what the user can do next (for example, add a competitor); do not leave blank panels.
- **Errors:** state what failed and the next useful action. Avoid exposing credentials, database internals, or raw provider errors.
- Keyboard, hover, focus, pressed, disabled, and reduced-motion specifications beyond observed behavior: `[NEEDS TEAM INPUT]`.

## 7. Content and microcopy guidance

- Use concise, plain English. Prefer sentence case for headings and labels.
- Be factual and specific: distinguish a public complaint, an estimated intent score, and a verified buying request.
- Use “lead” as the product's record label, but talk about people respectfully. Avoid “poach,” “exploit,” or claims that a person is ready to buy unless they said so.
- Explain why source details are locked and what unlock does before payment where relevant.
- Do not make unsupported performance, accuracy, coverage, or real-time guarantees.
- Do not imply that FeedbackPalace sends alerts by email: the current cron flags alerts in the database and does not deliver email.
- Localization and supported languages: `[NEEDS TEAM INPUT]`. Keep strings externalizable; do not assume English-only product requirements.

## 8. Accessibility requirements

Target WCAG 2.2 AA: `[NEEDS TEAM INPUT — formal conformance target not confirmed]`. Until confirmed, use these minimum practices:

- Provide semantic landmarks, logical heading order, labels, and accessible names.
- Ensure all actions work by keyboard and have a visible focus indicator. Do not remove the existing field focus treatment.
- Maintain sufficient text and control contrast; test actual combinations, especially muted text and violet controls.
- Never communicate score, lock status, error, or subscription state by color alone.
- Ensure focus order follows visual order. Announce validation and asynchronous status changes to assistive technology.
- Support browser zoom and text resizing without clipping or lost functionality.
- Respect `prefers-reduced-motion`; avoid nonessential animation.
- Make touch targets comfortably operable; exact minimum target size: `[NEEDS TEAM INPUT]`.
- Do not rely on blur as the sole explanation of a locked value; provide explicit text such as “Contact locked.”

## 9. Responsive behavior

- Existing layout uses Tailwind's default `md` breakpoint (768px) for the desktop sidebar/content offset and two-column layouts. Other breakpoint values are not customized.
- Below `md`, the sidebar becomes a full-width top section; preserve access to all navigation and avoid letting it consume the entire initial viewport. A compact mobile navigation pattern is `[NEEDS TEAM INPUT]`.
- Forms stack on small screens and become two columns at `md` where appropriate.
- Cards wrap their metadata and actions; prevent horizontal page scrolling. Keep primary actions reachable and avoid truncating meaningful post content.
- Test at narrow phone widths, tablet widths, and large desktop widths. Exact supported viewport range and tablet layout: `[NEEDS TEAM INPUT]`.

## 10. AI-specific UI patterns

Lead qualification uses an LLM structured-output classifier when configured and a keyword-based fallback otherwise. The score is an estimate.

- Label scores as intent estimates; do not present them as objective facts or certainty.
- Preserve the original post text and platform attribution; clearly distinguish source content from generated analysis.
- Do not invent explanations, evidence, or sentiment labels absent from the data.
- Make failures or unavailable analysis visible without fabricating a score.
- Treat public content as potentially personal data. Do not expose masked handles/URLs before authorization, and do not use protected or sensitive traits to rank people.
- Model transparency, confidence explanation, appeal/correction, retention, and human review policies: `[NEEDS TEAM INPUT]`.

## 11. Anti-patterns and prohibited choices

- Do not expose locked `source_handle` or `post_url` in client-rendered data, HTML, logs, events, or hidden UI.
- Do not imply that a complaint alone establishes intent to switch or purchase.
- Do not invent palette values, typography, spacing/radius scales, or component-library dependencies and call them existing standards.
- Do not use mock data in production UI as though it were live customer data.
- Do not present checkout as successful until the server-confirmed Stripe flow completes.
- Do not display fabricated email-delivery or cron-success claims.
- Avoid color-only status, unlabeled controls, placeholder-only labels, inaccessible blur, excessive card nesting, and unnecessary motion.
- Do not add unrelated dashboard features or alter the established product name and navigation labels without team direction.

## 12. Canonical design references

1. `src/app/globals.css` — global styles and field behavior.
2. `tailwind.config.ts` — configured color and shadow tokens.
3. `src/app/dashboard/layout.tsx` — authenticated navigation and responsive shell.
4. `src/app/dashboard/leads/page.tsx` and `src/components/lead-feed.tsx` — lead feed hierarchy, masked/unlocked states, and empty state.
5. `src/app/dashboard/competitors/page.tsx` and `src/components/competitors-manager.tsx` — tracking setup and list behavior.
6. `src/app/login/page.tsx`, `src/app/signup/page.tsx`, and `src/components/auth-frame.tsx` — authentication forms.
7. `src/app/dashboard/billing/page.tsx` — subscription summary.
8. `README.md` and `supabase/migrations/202610240001_feedbackpalace.sql` — product capability and data/privacy constraints.

No Figma, Storybook, screenshots, or external design library is currently referenced: `[NEEDS TEAM INPUT]`.

## 13. Preflight checklist before generating UI

- [ ] Identify the user, task, and success condition for the screen.
- [ ] Check the canonical references above and reuse existing patterns.
- [ ] Identify whether source details are locked and enforce the server-side masking contract.
- [ ] Include loading, empty, error, and success states.
- [ ] Confirm whether a requested design value/component is established; if not, mark `[NEEDS TEAM INPUT]`.
- [ ] Keep estimated intent clearly qualified and content respectful.
- [ ] Define desktop and narrow-screen behavior before implementation.
- [ ] Check for accessibility and privacy implications before adding analytics or external links.

## 14. Final UI QA checklist

- [ ] Product name and navigation labels match FeedbackPalace.
- [ ] Heading/action hierarchy is clear; primary task is apparent.
- [ ] Existing tokens and component patterns are used consistently.
- [ ] All fields have labels; controls have accessible names and visible focus.
- [ ] Keyboard-only navigation and responsive layouts work.
- [ ] Text contrast, zoom, status announcements, and reduced-motion behavior are checked.
- [ ] Lead score is presented as an estimate, not a promise.
- [ ] Locked source handles and URLs are absent from client-visible data until authorized.
- [ ] Form, empty, loading, error, disabled, and success states are present and truthful.
- [ ] No unsupported email, coverage, or checkout claims are shown.
- [ ] Narrow mobile, tablet, and desktop layouts avoid clipping and horizontal scrolling.
- [ ] Any missing system decisions are recorded as `[NEEDS TEAM INPUT]`, not silently invented.
