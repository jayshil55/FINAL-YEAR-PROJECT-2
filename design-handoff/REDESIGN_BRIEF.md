# NutriHealth redesign brief

## Product

NutriHealth (also branded NutriCare in parts of the repository) helps general users understand blood/laboratory reports and explore general nutrition and wellness information. Core journey: create/sign into account → upload a report → review extracted/normalized biomarkers and rule-based analysis plus a separate local model assessment → optionally use a guided consultation, chat, static tips, and account health settings.

The product should be presented as an educational report explainer, not a diagnostic or treatment system. Report upload currently uses local OCR, a deterministic medical parsing/rules pipeline and a local scikit-learn model adapter. Generic meal examples and fallback recommendations are not personalized. Chat is local by default but may use external providers when configured. The separate Bedrock agent endpoint was not found connected to the frontend.

## Primary users and needs

- Patients and general wellness users who need plain-language help reading lab reports.
- Users with varied technical/health literacy who need clear units, reference ranges, status explanations, and honest uncertainty.
- Users storing profile/preferences/medical notes who need predictable privacy, visible save status and reliable empty/error states.

## Design goals

1. Unify the current landing, auth, and workspace into a calm, trustworthy visual system.
2. Make the task sequence obvious: upload → processing → current result → assistant/account.
3. Make result provenance legible: extracted lab facts, deterministic interpretation, ML output, and general education are distinct.
4. Improve accessibility for file selection, status/filter controls, loading/errors, keyboard navigation, contrast, reduced motion and mobile layouts.
5. Match labels to actual capabilities: no active Google OAuth, no persistent full-report history, no generated PDF, no model-personalized meal plan.

## Preserve these product behaviors

- Existing routes and their destination meanings (`/upload` is dashboard; `/recovery` renders the current result/empty state).
- Cognito sign-in/signup/verification/recovery transitions and API bearer-token/error behavior.
- Multipart upload field `report`, file constraints, OCR failure feedback and upload cleanup.
- Biomarker names, values, units, reference ranges, status/severity/critical fields and the distinction between pipeline and local model output.
- Account profile/preferences/goals/medical-info fields and server validation.
- Honest empty, loading, degraded, model-unavailable and error states.

Refer to `PROTECTED_FUNCTIONALITY.md` for the API, auth, privacy and medical data contracts. Refer to `FEATURE_INVENTORY.md` for verified feature status and `USER_JOURNEYS.md` for route workflows and failure paths.

## Current experience problems

- Visual identity splits between editorial cream/green landing, teal-gradient auth and indigo empty Results.
- Feature copy overstates AI/personalization and report-history/download capabilities.
- Navigation mismatch: users may ask for `/dashboard`, but the actual dashboard is `/upload`.
- Upload progress is time-based rather than tied to backend milestones.
- Some account fetch failures are console-only and can resemble empty/default data.
- Forms, biomarker filters/collapse and upload picker have keyboard/screen-reader gaps to address.
- Results and historical records are transient/summary-only, respectively; a refresh empties the active result and history cannot reopen it.

## Constraints and non-goals for design planning

- This handoff is an audit; no redesign or code change is included.
- Treat server responses and statuses as source of truth. Do not invent capabilities or data states.
- Avoid clinical claims, diagnosis language, fabricated samples in a live account, or promises of personalization without a functional product integration.
- A new persistent report archive, new hosted model behavior, new external data processing, generated PDF system, OAuth provider, or new clinical workflow would be product/backend scope, not a visual-only redesign.
- No mobile visual QA or populated report inspection was completed. Include these in the next design validation pass.

## Reference map

- Routes and shell: `NutriHealth-main/src/App.jsx`, `src/Layout.jsx`.
- Upload/results: `src/Dashboard.jsx`, `src/Processing.jsx`, `src/Results.jsx`.
- Account/consultation: `src/Account.jsx`, `src/components/account/`, `src/components/consultation/`.
- Backend contracts: `server/routes/`, `server/controllers/`, `server/services/`, `server/medical/`.
- Model adapter: `server/services/local-model.service.js`, `Project-Model/NutriCare-ML/predict_json.py`.
