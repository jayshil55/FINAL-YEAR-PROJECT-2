# NutriHealth complete project audit

**Audit date:** 2026-10-13
**Scope:** source-code investigation and limited prior localhost visual inspection documented in `UI_AUDIT.md`. This is not a clinical validation, security certification, or end-to-end test report. No application code/configuration/dependencies were changed for this deliverable.

## Executive summary

NutriHealth (also called NutriCare in parts of the UI) is a React web app for helping general users understand blood/lab reports and explore wellness information. The active report path is local OCR, a deterministic medical extraction/rules pipeline, generic fallback analysis, and a separate local scikit-learn model. The ordinary upload controller does not call a hosted LLM. A Bedrock agent endpoint exists separately and no frontend caller was found. Chat is local/deterministic by default, with optional external model providers when remote mode is configured.

The application includes account/auth flows, report upload/results, a basic assistant, static health tips, account preferences and medical information, a local consultation wizard, model assessment, report metadata summaries and browser print. Some visible names overstate implementation: Google login is a navigation placeholder, health tips and meal plans are static, personalization is a profile-completeness score, report history does not reopen old analyses, and “PDF” export invokes browser print.

Primary redesign concerns are inconsistent visual styles between landing/auth/workspace/results, unclear route terminology (`/upload` is the dashboard; `/dashboard` is absent), progress that is not connected to backend milestones, hidden/default account API failures, and accessibility gaps in upload/filter/collapse controls. The full-function map and detailed evidence remain in the six companion files under `design-handoff/`.

## Product and intended users

The intended users are patients and general wellness users who want plain-language help with lab values, nutrition, and healthy-living information. The UI should be supportive and understandable without implying a clinician relationship, diagnosis, treatment recommendation, or validated clinical prediction. Health values and medical notes are sensitive user data.

## Architecture and stack

### Frontend

`NutriHealth-main/` is a React 19/Vite 8 application using React Router v7, Tailwind CSS v4, Framer Motion, Lucide React, and AWS Amplify Auth 6. `src/main.jsx` configures Amplify and wraps `AuthContext` and `ReportContext`. `src/api/apiClient.js` calls `/api`, attaches bearer tokens, maps errors, and sets request timeouts. Vite proxies `/api` to the Express service on port 5000.

`ReportContext.jsx` keeps current report, selected file, analysis/error/loading and chat history only in browser memory. A reload or new tab loses the current result and conversation.

### Backend and analysis

`server/index.js` starts Express 4 on loopback port 5000 by default, applies security/transport middleware, mounts report/chat/account/agent routes, and exposes `/api/health`. PostgreSQL is optional; `server/services/db.service.js` uses a JSON store fallback when database configuration or connection is unavailable. Account data is persisted; report records are summary metadata, not stored report content.

`server/controllers/report.controller.js` coordinates:

1. Upload validation and OCR via `server/services/ocr.service.js` (embedded PDF text when usable; scanned PDF rasterization with `pdftoppm`; image/PDF OCR through Tesseract paths).
2. Medical extraction and normalization in `server/medical/`: catalogs and aliases, line/value/unit parsing, fragment recovery, reference ranges, canonical unit conversion, statuses, severity/critical flags, consistency checks, risk scoring, formatting and summarized AI context.
3. Deterministic `buildFallbackAnalysis` and local `predictLocalModel` assessment. The model adapter `server/services/local-model.service.js` launches `Project-Model/NutriCare-ML/predict_json.py` for its Random Forest path. Missing model/runtime can produce an unavailable/insufficient-data assessment while the pipeline remains separate.

The standalone model project also contains condition/panel tooling and a terminal UI; the website adapter does not call that path. Medical/model correctness and suitability are not clinically validated by this audit.

### Authentication, providers and integrations

Normal auth uses AWS Cognito through Amplify and backend JWT verification. The source includes an explicitly development-flagged local auth bypass; it must remain disabled in production and must never protect real health information. Optional PostgreSQL, AWS Bedrock, Gemini, and OpenRouter paths exist. Chat defaults to local mode; configured remote chat may transmit report context and chat history to a provider. The separate protected Bedrock agent route is not wired into the frontend flow found in source.

## Routes and major modules

| Route | Module | Verified purpose/status |
|---|---|---|
| `/` | `NutriHealth-main/src/Landing.jsx` | Landing/marketing and auth CTAs |
| `/login` | `src/Login.jsx` | Cognito login and duplicate inline signup; Google button does not authenticate |
| `/signup` | `src/Signup.jsx` | Signup UI; name is collected but only email/password are passed to auth context |
| `/verify-email` | `src/VerifyEmail.jsx` | Cognito confirmation; depends on email in router state |
| `/forgot-password`, `/reset-password` | `src/ForgotPassword.jsx`, `src/ResetPassword.jsx` | Cognito reset flow; email relies on route state |
| `/upload` | `src/Dashboard.jsx` inside `src/Layout.jsx` | Actual dashboard and report file selection; no `/dashboard` route |
| `/processing` | `src/Processing.jsx` | Animated, timer-based progress; not live backend milestones |
| `/recovery` | `src/Results.jsx` | Current in-memory report results or no-analysis state |
| `/health-tips` | `src/HealthTips.jsx` | Static education and client-side category filters |
| `/assistant` | `src/Assistant.jsx` | Chat UI backed by `/api/chat`; in-memory history |
| `/account`, `/profile` | `src/Account.jsx`, `src/components/account/*` | Profile, preferences, goals, medical info, completeness score, report summary |
| `*` | `src/NotFound.jsx` | Unknown-route fallback |

Workspace route components are nested in `Layout.jsx`; route-level auth guarding is absent. Protected APIs enforce auth independently. Layout signs out after five minutes of detected inactivity.

## Important existing features and implementation status

| Feature | Status and key evidence |
|---|---|
| Cognito sign-in/signup/verification/reset | Implemented in source; runtime transactions not tested. Signup name is not submitted; Google sign-in is a placeholder. |
| Upload and OCR | Implemented; PDF/images up to 15 MB. OCR reliability depends on local Tesseract/`pdftoppm` setup and report quality. |
| Biomarker parsing and medical rules | Implemented pipeline; exactness/clinical safety unverified. Preserve values, units, ranges, status/severity and uncertainty. Age is explicitly treated as demographic text by `parameterMatcher.js`. |
| Local model assessment | Implemented adapter with unavailable/insufficient-data outcomes; separate from deterministic pipeline and not a diagnosis. |
| Recommendations/meal plans | Fallback lists and hard-coded menu examples; not truly individualized to biomarkers. |
| Processing/results | Implemented current-tab flow; progress is illustrative and results disappear on reload. |
| Report archive/export | Partial: summary metadata only; “View All” returns to current results. Export invokes `window.print()`, not a generated PDF. |
| Chat | Implemented; local default and optional external providers; unauthenticated route; report/history may be passed in remote mode. |
| Bedrock agent | Protected backend endpoint exists; frontend connection not found. |
| Health tips | Static, not report-personalized despite workspace copy. |
| Account settings | Profile/preferences/goals/medical information GET/PUT; some fetch failures only log and can appear as empty defaults. |
| AI personalization | Completeness percentage of profile sections, not model personalization. |
| DB | Optional PostgreSQL and JSON fallback. Report records do not retain full report/result. |

See `FEATURE_INVENTORY.md` for dependencies, UI implications, and regression risk for each feature.

## User journey and data flow

### Authentication

Landing → `/signup` or `/login` → Amplify Cognito. Signup routes to verification with email in router state; successful login routes to `/upload`. Forgot/reset use Cognito and similarly depend on route state. There is no frontend auth route guard. Some visible UI controls (Remember me, Google) are nonfunctional placeholders.

### Upload to results

`/upload` validates an extension/file size, stores the file in `ReportContext`, posts multipart field `report` to protected `POST /api/analyze-report`, and navigates to `/processing`. Server applies auth/rate/upload checks, OCRs, passes text through `server/medical`, adds fallback output, then invokes the local model adapter. The response renders at `/recovery`. OCR failure, empty text, no parameters, auth/rate limit, unexpected pipeline error, or missing model can lead to different failures/degraded result states. The upload file is removed after processing. Only a summary record is persisted; analysis and file are not reusable after reload.

### Consultation and report tools

Results display biomarkers and model output and can render optional agent summary fields, but the normal upload response does not establish an agent call. A local four-step consultation wizard asks about care/diet; static meal cards are examples. Browser print is the only export mechanism. `UploadedReportsModule` loads a summary, not full history.

### Chat, tips, account

`/assistant` sends message, in-memory report context and history to `/api/chat`; local deterministic reply is default, optional configured providers can be remote. `/health-tips` is static content. Account modules GET/PUT user-specific profile, preferences, goals and medical details, plus summary/completeness information. Persistence depends on Postgres configuration or JSON fallback.

## UI findings and screenshots

Prior local desktop visual inspection of landing, upload shell, assistant and an empty Results state is summarized in `UI_AUDIT.md`. Mobile and populated medical results are unverified. In the current finalization attempt the Vite frontend started successfully, but browser automation blocked localhost navigation under its URL security policy. No new screenshot was captured and none is fabricated. Details and route verification status are in `screenshots/SCREENSHOT_INDEX.md`.

Current visual concerns: editorial cream/green landing vs teal-gradient auth vs indigo empty Results; mixed naming/type hierarchy; misleading AI/personalized/history/download labels; weak upload keyboard affordance; inaccessible selected/collapsed filter semantics; generic errors and silent account-load failures; and progress motion not based on actual server stages. Refer to `UI_AUDIT.md` for the route-by-route visual/source confidence map.

## Protected functionality for redesign

- Keep routes and API contracts stable: notably `/upload`, multipart key `report`, bearer-token handling, structured API errors, auth, upload limit/types, account field shapes and values.
- Preserve parser/model boundaries and medical fields: parameter identity/value/unit/reference range/status/severity/critical/provenance; do not merge local model classification with deterministic pipeline or imply clinical validation.
- Keep OCR/pipeline failure and model-unavailable states understandable; preserve temp-file cleanup and current privacy/retention semantics.
- Do not claim Google OAuth, generated PDF, full history reopening, active model personalization, report-generated tips or individualized meal plans.
- Keep development auth bypass disabled outside local demos; avoid exposing health context to external providers without product/privacy review.
- Tests exist under `server/tests/` and `server/medical/`; they were not run in this investigation.

## Companion handoff files

- `PROJECT_MAP.md` — architecture, stack, route/API map and data flow.
- `FEATURE_INVENTORY.md` — feature status/dependencies/UI implications/regression risks.
- `USER_JOURNEYS.md` — source-based workflows, request/response behavior and failure paths.
- `UI_AUDIT.md` — inspected screens, visual/accessibility findings and uncertainty.
- `PROTECTED_FUNCTIONALITY.md` — API, auth, medical, model and data lifecycle contracts.
- `REDESIGN_BRIEF.md` — design goals, user needs and constraints.
- `screenshots/SCREENSHOT_INDEX.md` — real screenshot capture status and limitations.

## Privacy and evidence notes

No credentials, tokens, private report values or user data are included. No stored JSON user data was opened. No upload, sign-in, account write, chat message or external provider call was performed. Claims above are source-based unless explicitly marked as prior visual inspection. Paths are repository-relative.
