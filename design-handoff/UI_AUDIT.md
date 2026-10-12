# Current UI audit

Audit date: 2026-10-13. Browser review was limited to localhost desktop pages at approximately 1280×720. The inspected views included landing, upload shell, assistant, and an empty Results state. Auth page was loaded but browser autofill content was deliberately excluded from notes. No private saved report/account data was opened. Mobile behavior and the populated report state were not visually verified; those observations below are source-based.

## Visual system and consistency

### Strengths

- The landing page establishes a clear NutriHealth identity with a cream/green palette, serif headline, concise hero hierarchy, and visible calls to action (`src/Landing.jsx`, `src/index.css`).
- The workspace has a recognizable left navigation, header, main content area and responsive drawer (`src/Layout.jsx`).
- Most workspace content uses repeated rounded card surfaces and spacing; global focus-visible styles and reduced-motion preference support are present (`src/index.css`, `src/main.jsx`).
- Empty Results and upload views provide next-step actions rather than a dead end.

### Main inconsistencies

- Auth screens still use a darker teal/emerald gradient “AI Healthcare Platform” visual language, unlike the calmer cream/green landing and workspace. Landing, auth, and workspace feel like different product generations.
- Empty Results uses dark slate/indigo surfaces and a prominent indigo action, visually clashing with the green/cream shell. This was visible in the fresh-context `/recovery` state.
- Marketing and route labels overstate features: “AI” on an upload processed locally, “Personalized Health Insights” for static tips, and “AI personalization” for profile completeness. Trust depends on matching language to provenance.
- Typography varies: landing uses a distinct serif hero while workspace is primarily sans; auth copy and styling use yet another tone. Button radius, gradients, shadows and icon color intensity are inconsistent.
- UI copy alternates NutriHealth/NutriCare, “dashboard” vs actual `/upload`, and report/recovery/results terminology. Clarify product naming and page titles.
- `GlassCard.jsx` appears unused and duplicates a potential surface pattern, while actual pages compose their own card styles.

## Navigation and journeys

- `/upload` is the actual dashboard; there is no `/dashboard` route. This mismatch has already caused direct-navigation confusion and should inform IA labels/links.
- Workspace navigation is persistent on desktop and becomes a drawer below the large breakpoint. Landing and workspace use separate navigation styles; landing hides some content links at narrow widths without an equivalent menu apparent in source.
- Five-minute idle sign-out in `Layout.jsx` is not surfaced as an explicit countdown/dialog. If retained, explain expiration and preserve an action to re-authenticate.
- Auth pages duplicate registration between `/signup` and Login’s inline mode. Consolidating the experience is a design opportunity, but keep Cognito code/email state transitions intact.
- No route guard exists in `App.jsx`, so direct routes may show content before an API request fails. Empty/loading/error UI should explicitly distinguish logged-out from no data.
- “View All Results” points back to current `/recovery` and cannot reopen historical analysis. Avoid styling it as a functional archive until a history-detail capability exists.

## Forms, upload, and feedback

- Upload is visually centered in a card and presents a drop zone; accepted file size/type rules need to be visible and consistent with actual validation (15 MB; PDF/PNG/JPG/JPEG/WebP). The hidden file input inside a label does not show a dedicated keyboard-focus target; improve keyboard access, browse button semantics, focus feedback, and screen-reader instructions.
- Upload errors need to distinguish unsupported file, oversized file, unreadable/scanned PDF, empty OCR, no lab parameters, authentication, and service/model partial failure. Avoid a single generic “analysis failed” surface.
- Processing screen communicates four named milestones, but the backend does not stream stage progress and the animation is timer-based. Make progress honest (indeterminate or explicitly staged by real events).
- Account submodules show loading indicators, but several fetch catches only log errors and leave defaults on screen. Provide visible inline error/retry states and distinguish an empty field from unloaded/failed data.
- Save feedback, disabled/loading affordances and success/error placement should be consistent across account forms. These modules carry health details, so save state must be unambiguous.

## Results, charts, assistant and dialogs

- Biomarkers are the core report value. Preserve name/value/unit/reference range/status and distinction between parsed facts, deterministic flags, and model assessment. Avoid relying on color alone; include readable labels/icons and a clear legend.
- Biomarker filters do not expose `aria-pressed`; collapse control uses a title without explicit accessible name/expanded state. Selected states need keyboard and assistive-technology semantics.
- No chart implementation was confirmed in the audited Results component paths. Do not infer charts from marketing or module names. If added, pair values with text/table access and define units/reference bands.
- Results’ AI consultation questions are a local wizard and meal plans are static. UI should present this as guided/general education unless those behaviors are connected to personalized analysis.
- Assistant screenshot showed a stable chat surface with suggestion chips and a bottom composer. Chips horizontally scroll with hidden scrollbar; preserve an accessible way to discover overflow. Provide clear provenance for local vs optional remote response modes, plus an explicit consent/privacy cue if report context can leave the server.
- The print control calls browser print. Name it “Print / save as PDF” and make print layout robust; don’t claim a download until a generated artifact exists.
- No dialog flow was confirmed in these inspected screens. Any dialogs added in redesign should preserve focus management, Escape behavior, and mobile sizing.

## Responsive and accessibility evidence

- Responsive breakpoints and mobile drawer are present in `src/Layout.jsx`/`src/index.css`; marketing sections have responsive rules. Actual mobile screenshots were not captured, so breakpoint quality and overflow remain unverified.
- `MotionConfig reducedMotion="user"` is wired in `src/main.jsx`; check custom CSS animations and timer-driven transitions against reduced-motion settings.
- Global focus-visible styling exists. The file picker, filter toggles, collapsible biomarker section, horizontal chips, error announcements, and form validation should be audited with keyboard and screen reader.
- Inputs/forms should have persistent labels, not placeholder-only context. Validation errors should be programmatically associated and focus should move predictably after submit.
- Biomarker status, severity and progress must not be encoded only by color. Use text and accessible descriptions.
- Ensure responsive shell does not let the sidebar or fixed assistant composer obscure content on small screens and zoomed layouts; this is a source-informed design risk, not a verified defect.

## Route-by-route visual inspection confidence

| Route/view | Evidence | Confidence / limitation |
|---|---|---|
| `/` | Local desktop page visually inspected | High for desktop appearance; mobile not checked |
| `/upload` | Local desktop page visually inspected | High for shell/upload card; did not upload file |
| `/assistant` | Local desktop page after settling | High for empty chat appearance; no message submitted |
| `/recovery` empty state | Local desktop fresh context | High for no-analysis palette/state; no real result data inspected |
| `/login` | Route loaded; browser autofill excluded | Limited; no auth submitted |
| `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/processing`, `/health-tips`, `/account`, `/profile`, wildcard | Source audited | Visual details not verified or not all states opened |

## Design opportunities that preserve behavior

1. Establish one visual system across marketing, auth, and workspace: cream/green base, defined typography scale, shared buttons/cards/forms, restrained accent colors.
2. Align navigation and route names around user intent; make Upload/Results/Assistant/Account discoverable and avoid implying a nonexistent dashboard path.
3. Define reusable states for loading, empty, partial result, error, authentication required, and saved. Ensure each state has a clear next action.
4. Reserve high-salience colors for meaningful health status and separate those from brand accent and generic action states.
5. Make model provenance/limits visible in plain language and reserve “personalized” for outputs that actually use the user/report data.
6. Improve keyboard, contrast, labels, announcements and responsive overflow without changing endpoint contracts or medical logic.
