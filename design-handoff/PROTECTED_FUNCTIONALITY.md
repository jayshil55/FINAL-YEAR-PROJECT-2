# Protected functionality and regression boundaries

This document identifies contracts a visual redesign must preserve. “Protected” means product/API/medical behavior should not be changed incidentally during UI work. Any intentional behavior or clinical logic change should be reviewed separately with explicit evidence and tests.

## 1. Report upload contract

- Frontend entry: `NutriHealth-main/src/Dashboard.jsx`.
- Client API: `NutriHealth-main/src/api/apiClient.js` `analyzeReport(file)`.
- Endpoint: `POST /api/analyze-report`, multipart field name exactly `report`.
- Auth: bearer token from Amplify Cognito in normal operation; backend route applies auth and per-user/IP throttling. Local auth bypass is a development-only exception and must not ship as product authentication.
- Upload constraints: nonempty PDF/image; 15 MB; accepted browser extensions include PDF, PNG, JPG/JPEG and WebP. Keep frontend/backend validation aligned.
- Failure families include invalid/missing upload, size/type rejection, OCR failure/unreadable PDF, empty OCR, no lab values, auth/rate-limit, pipeline or unexpected server errors. Preserve structured error code/status so UI can explain actionable fixes.
- Temporary upload cleanup occurs in the controller `finally` path. Do not change report retention/privacy behavior through a UI-only redesign.

## 2. Analysis pipeline semantics

Main controller: `server/controllers/report.controller.js`. Medical pipeline: `server/medical/`.

1. OCR text is extracted (`server/services/ocr.service.js`).
2. Catalog/alias extraction and line parsing find candidate parameter/value/unit/reference data (`server/medical/extractor/`, `server/medical/parameterCatalog*`).
3. Fragment recovery, alias resolution, unit normalization and reference parsing produce normalized `bloodParameters`.
4. Status, severity, critical flags, consistency checks and risk scoring enrich the parameter set.
5. Formatter and `aiContextBuilder.js` produce display/context data.
6. Report controller uses deterministic `buildFallbackAnalysis` and invokes local model adapter `predictLocalModel`. Normal uploaded reports do not route through Bedrock.

**Medical data UI contract:** preserve original parameter identity and meaning, numeric values, units, reference ranges, status, severity/critical state and data provenance. Do not silently replace a missing/uncertain reference range with a healthy value. Do not conflate pipeline risk/status and Random Forest `modelAssessment`. Textual disclaimers and uncertainty are part of safe interpretation.

`server/medical/extractor/parameterMatcher.js` explicitly protects demographic labels (including Age) from fuzzy matching into lab biomarkers; retain this guard and its boundary behavior in any parser-related change. Fuzzy aliases and OCR fragment recovery are regression-sensitive.

## 3. Model contract and limits

- Web process entry: `server/services/local-model.service.js` → `Project-Model/NutriCare-ML/predict_json.py`.
- Adapter uses a 39-feature mapping, ids and unit conversion; subprocess has a timeout and explicit unavailable/insufficient-data statuses.
- Inference requires the expected local model artifact and metadata. Missing Python/model/runtime can yield nonfatal model-unavailable output.
- Model assessment is additional to the medical rule pipeline. The outputs are not shown as validated diagnostic risk and should not be described as a diagnosis.
- The standalone condition/panel engine and terminal UI in the model repository are not called by this HTTP route.

Keep input feature names, canonical units, output fields/statuses, and graceful degradation stable. Model display must not make the overall report appear complete when the model status is unavailable.

## 4. Authentication and account API contracts

Frontend auth provider: `NutriHealth-main/src/context/AuthContext.jsx`; Amplify setup: `src/main.jsx`; API token/errors: `src/api/apiClient.js`. Backend JWT enforcement is in `server` auth middleware. Auth flows call Cognito sign-in/up/confirmation/password reset. Route state carries email between verification/reset pages.

Account endpoint shape is implemented in `server/routes/account.routes.js` and `server/controllers/account.controller.js`, persisted through `server/services/db.service.js`:

- profile: name/contact/demographic/body/activity fields, with range/format validation;
- preferences: diet, cuisine, foods, restrictions/allergies, activity, sleep and water targets;
- health goals: allowlisted goal identifiers;
- medical information: conditions/allergies/medications/notes;
- report summary and AI-personalization completeness.

Keep API field keys, validation bounds, allowed values, ownership boundaries and loading/save outcomes intact. Never put health details, auth tokens, Cognito identifiers or stored JSON data into design assets, analytics, screenshots or docs.

**Development bypass:** frontend has a development-flagged local token path; backend accepts the synthetic token only when explicitly enabled in non-production. It maps local traffic to a demo user and does not provide real identity/security. Ensure no production build/deployment enables it; do not use it for real health information.

## 5. Persistence and privacy contracts

- `server/services/db.service.js`: optional PostgreSQL storage, JSON-store fallback. Backend initialization logs which persistence path is active.
- Account sections are persisted. Report storage is metadata/summary only; temporary file is deleted, and full result is held in `ReportContext` memory.
- `ReportContext` (`NutriHealth-main/src/context/ReportContext.jsx`) stores current analysis, file, errors, analyzing state, chat history; reload/new tab clears it.
- Chat submits current report context and history. Local mode is default. If remote AI mode is configured, report and conversation data may be sent to external provider(s). `POST /api/chat` route is not protected by auth in the current route setup.
- Bedrock agent endpoint uses account/report context but was not found to have a frontend caller.

Any redesign integration involving analytics, durable history, cloud storage, remote model calls, exports or cross-tab state requires separate product/privacy review and updated consent/retention rules.

## 6. UI behaviors with hidden contracts

- `Processing.jsx` navigation depends on analysis Promise state in `ReportContext`; its progress is decorative/time-based. Preserve correct eventual transition and error handling if restyled.
- `Results.jsx` empty state occurs when no in-memory result exists. Do not replace it with fabricated sample results in the real workflow.
- “Print / save as PDF” currently relies on `window.print()` and browser print CSS; it is not a server-generated downloadable report.
- `UploadedReportsModule.jsx` summary fields cannot reopen previous full reports. Do not represent historical cards as restorable without backend capability.
- `AIConsultationFlow.jsx` and `MealPlanCard.jsx` are local UI/static data. Preserve their steps/selections if restyling, but avoid claims that the backend produced them.
- `HealthTips.jsx` is static. “AI personalization” percentage means profile completeness only.

## 7. High-risk regression checklist for a future implementation

- [ ] Preserve routes and map dashboard navigation to `/upload` (there is no `/dashboard`).
- [ ] Preserve auth token attachment, 401 mapping, 30-second default/90-second upload timeout, and protected account/report endpoints.
- [ ] Keep multipart `report` key, accepted types/size limits, OCR and pipeline errors user-actionable.
- [ ] Preserve parameter identity/value/unit/reference/status and distinction among deterministic result, model result and generic education.
- [ ] Keep Age/demographic exclusion from biomarker fuzzy matcher.
- [ ] Maintain model unavailable and insufficient-data behavior without blocking pipeline results.
- [ ] Preserve account payload field names, server-side validation, and user-owned data handling.
- [ ] Do not imply full report retention, history reopening, generated PDF, Google OAuth, or individualized meal plans.
- [ ] Keep health information out of logs/telemetry and hosted providers unless the configured product flow explicitly supports it.
- [ ] Verify dev auth bypass stays disabled in production and is never used with real patient data.

## Evidence scope

Protected contracts above come from `src/App.jsx`, `src/api/apiClient.js`, contexts, report/account controllers, route/middleware/service files, `server/medical/`, and `Project-Model/NutriCare-ML/predict_json.py`. Tests exist under `server/tests/` and medical subpackages, but were not executed in this investigation-only task. Runtime/clinical accuracy is not certified by this document.
