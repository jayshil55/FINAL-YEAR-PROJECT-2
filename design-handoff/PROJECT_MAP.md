# NutriHealth / NutriCare project map

Audit date: 2026-10-13
Scope: source inspection and limited localhost visual review. This is a source-based audit, not a clinical validation or full end-to-end test.

## Product summary

NutriHealth (also called NutriCare in UI and repository copy) is a blood/laboratory report explainer. A user can upload a PDF or image, have OCR extract text and a local medical pipeline identify and normalize lab parameters, then view a rule-based interpretation and a separate local machine-learning assessment. The product also has account health information, static wellness tips, a chat assistant, and a guided dietary consultation flow. The intended audience is general users/patients trying to understand lab results and nutrition options. The interface and code disclaimers should keep this educational and non-diagnostic; it is not a clinician workflow.

The product’s actual report-analysis path is local OCR + deterministic pipeline + a local scikit-learn model adapter. Despite some README/UI “AI” language, the upload controller does not call a hosted model. A separate assistant and a separate protected Bedrock agent endpoint can use hosted providers under certain settings; those are distinct paths and are not shown to be integrated into report results.

## Repository map

| Path | Role |
|---|---|
| `NutriHealth-main/` | React/Vite frontend. `src/` contains routes, pages, contexts, API client, and account/consultation components. |
| `server/` | Express backend, API routes/controllers, auth, OCR, account persistence, report-analysis pipeline, chat/agent services, and tests. |
| `server/medical/` | ESM medical report parsing, normalization, reference-range/status/severity/risk and AI-context pipeline. |
| `Project-Model/NutriCare-ML/` | Python model project and inference adapter target; standalone training/CLI material as well as the web-called random-forest path. Model binary artifacts are not assumed present in a clean clone. |
| `config/conversions/units.json` | Shared unit conversion definitions used by pipeline/model integration. |
| `docs/superpowers/` | Existing planning/spec material; not runtime product behavior. |
| `tests/`, `server/tests/` | Node tests and medical pipeline fixtures. Tests were not run for this audit. |
| `README.md` | Project overview/setup claims. Some top-level feature claims exceed the current upload implementation; see verified paths below. |

## Technology stack and architecture

### Frontend

- React 19 and Vite 8; React Router v7 for route composition.
- Tailwind CSS v4 with `@tailwindcss/vite`, additional rules in `NutriHealth-main/src/index.css` and `App.css`.
- Framer Motion for transitions and Lucide React for icons.
- AWS Amplify Auth 6 for Cognito authentication. Amplify configuration is imported from root `amplify_outputs.json`; do not copy deployment identifiers into design documents.
- `NutriHealth-main/src/api/apiClient.js` wraps `fetch` calls to `/api`, includes bearer-token handling, request timeouts, and API error mapping.

`NutriHealth-main/vite.config.js` proxies `/api` requests to `http://localhost:5000`. The UI dev server has been observed on port 5174 in the local browser, while Vite proxy target remains backend port 5000.

### Backend

- Node.js, CommonJS Express 4 app in `server/index.js`; the `server/medical` package declares ESM for the medical pipeline, which the report controller loads with dynamic import.
- Middleware includes Helmet, compression, CORS, JSON parsing, rate limiting, multer uploads, and Cognito JWT verification. Routes live in `server/routes/`; implementations in `server/controllers/` and `server/services/`.
- PostgreSQL via `pg` is optional. `server/services/db.service.js` falls back to a JSON file store when database configuration/connection is unavailable. The local environment reported this fallback; no store contents were inspected.
- `server/services/ocr.service.js` uses embedded PDF text where available, `pdftoppm` for scanned PDFs and Tesseract OCR; image OCR uses a Tesseract CLI path with a Tesseract.js fallback.
- Python/scikit-learn runs in a child process via `server/services/local-model.service.js` and `Project-Model/NutriCare-ML/predict_json.py`.

### AI/model providers

- Web report upload: OCR → `server/medical` pipeline → deterministic fallback analysis → local Random Forest assessment. No hosted AI request is made on this route, based on `server/controllers/report.controller.js`.
- Chat: `server/services/ai.service.js` defaults to local deterministic chat. Remote mode can use Gemini, OpenRouter or Bedrock depending on configuration and availability.
- Separate agent: protected `POST /api/agent/analyze` uses `server/services/ai-agent.service.js` and AWS Bedrock Runtime. No frontend caller was found during source search; Results only conditionally renders fields that the normal report response does not provide.
- Model repository also has a standalone condition/panel pattern engine and terminal UI, but the web adapter invokes only the general random-forest JSON inference script. Do not equate the standalone engine with the web model.

### Database and data lifecycle

`server/services/db.service.js` supports PostgreSQL tables `users` and `user_data`, with JSONB sections for profile, preferences, goals, medical information, and report metadata. In the observed local configuration it falls back to `server/data/store.json`. This audit did not read private store data.

Report upload temporary files are deleted in the controller’s `finally` path. Persisted report entries are summaries/metadata (file name, upload time, status, disease label, health score), not uploaded report bytes or a reconstructable analysis. Full analysis, selected file, and chat history live in React `ReportContext` memory, so a page reload/new tab loses them.

## Frontend route and module map

Defined in `NutriHealth-main/src/App.jsx`:

| Route | Page/component | Purpose and known implementation |
|---|---|---|
| `/` | `Landing.jsx` | Marketing landing page and calls to signup/login. |
| `/login` | `Login.jsx` | Sign-in plus a duplicated inline registration mode; Google button is not Google OAuth and routes directly to upload. |
| `/signup` | `Signup.jsx` | Registration form; submits email/password only despite collecting name. |
| `/verify-email` | `VerifyEmail.jsx` | Cognito email confirmation, relying on route state for the email. |
| `/forgot-password` | `ForgotPassword.jsx` | Cognito reset initiation. |
| `/reset-password` | `ResetPassword.jsx` | Code/new-password confirmation; depends on email route state. |
| `/upload` | `Dashboard.jsx` within `Layout.jsx` | Actual workspace upload/dashboard route. There is no `/dashboard` route. |
| `/processing` | `Processing.jsx` | Timed illustrative progress before navigating to results. |
| `/recovery` | `Results.jsx` | Report results/empty state, biomarkers, consultation flow, print action. |
| `/health-tips` | `HealthTips.jsx` | Static general education tips and client-side category filters. |
| `/assistant` | `Assistant.jsx` | Chat UI using current in-memory report and chat state. |
| `/account` | `Account.jsx` in `Layout.jsx` | Profile, preferences, goals, medical information, AI personalization status, report summary modules. |
| `/profile` | `Account.jsx` | Alias to account. |
| `*` | `NotFound.jsx` | Unknown-route fallback. |

`Layout.jsx` supplies workspace navigation/sidebar, header, responsive drawer, and five-minute inactivity sign-out behavior. Routes themselves do not have a frontend auth guard; protected backend APIs independently verify bearer tokens. `main.jsx` configures Amplify, wraps `AuthProvider` and `ReportProvider`, and honors reduced-motion preference.

## Backend endpoints and data flow

`server/index.js` mounts the health, report, chat, account, and agent routes. Vite forwards `/api` to the backend.

| Endpoint | Auth | Input → output | Implementation |
|---|---|---|---|
| `GET /api/health` | No | Health probe → status JSON | `server/index.js` |
| `POST /api/analyze-report` | Yes (Cognito or explicitly enabled local dev bypass) | multipart `report` file → analysis payload | `server/routes/report.routes.js`, `server/controllers/report.controller.js` |
| `POST /api/chat` | No | JSON message, reportContext, history → `{ reply }` | `server/routes/chat.routes.js`, `server/controllers/chat.controller.js`, `server/services/ai.service.js` |
| `POST /api/agent/analyze` | Yes | report data/history/user context → agent JSON | `server/routes/agent.routes.js` (route handler), `server/services/ai-agent.service.js` |
| Account profile/preferences/goals/medical-information GET/PUT | Yes | account JSON section ↔ stored section | `server/routes/account.routes.js`, `server/controllers/account.controller.js`, `server/services/db.service.js` |
| `GET /api/reports/summary` | Yes | summary counts/latest/report metadata | account/report route and controller; frontend `UploadedReportsModule.jsx` |
| `GET /api/ai-personalization` | Yes | completeness indicator for stored account sections | account controller and `AiPersonalizationModule.jsx` |

## Important architecture boundaries

1. The UI labels report stages and some outputs “AI,” but the ordinary report path uses local code and a local ML process. A design should not promise a hosted-model diagnosis or personalization.
2. `ReportContext` is session-tab memory, not durable report storage.
3. The standalone model repo and web inference path are not equivalent: the web path calls `predict_json.py`.
4. The agent endpoint and conditional Results rendering exist separately from the upload endpoint’s normal response; no working end-to-end connection was found.
5. Local development auth bypass is enabled only by development flags in source/config and must never be treated as production authentication. The bypass maps local activity to a demo identity and is unsuitable for real health data.

## Evidence and unknowns

Findings derive from source paths cited above, package manifests, and limited visual inspection of localhost landing, upload, assistant, and empty-results states. Mobile behavior is inferred from CSS/component breakpoints and was not visually verified. No upload, external AI call, auth transaction, or account write was performed during this audit. Runtime provider readiness and clinical validity are unverified.
