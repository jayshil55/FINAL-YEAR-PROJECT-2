# Verified user journeys and data flow

Audit date: 2026-10-13. These journeys are reconstructed from source. No sign-in, account mutation, report upload, chat request, or report download was submitted during the audit. Results therefore describe the implemented path and its visible states, not a successful end-to-end run.

## 1. Landing to account creation and sign-in

**Routes/components:** `/` `Landing.jsx` → `/signup` `Signup.jsx` or `/login` `Login.jsx` → `AuthContext.jsx` → Cognito.

1. Landing CTAs navigate to signup or login.
2. Signup collects name, email, password, confirmation; validation occurs in the page. It calls `signup(email, password)` from `AuthContext`; name is not submitted. On success it navigates to `/verify-email` and places email in navigation state.
3. Verify page reads email from navigation state, submits email + code through `confirmSignUp`, then returns to `/`. A refresh/direct URL may lose email state. No resend-code path was identified.
4. Login calls Cognito `signIn`; successful sign-in navigates to `/upload`.
5. `Login.jsx` has a second inline register mode duplicating much of `/signup`. The Google-branded button navigates directly to `/upload`; it is not OAuth and does not authenticate.
6. A “Remember me” checkbox is rendered without a behavior handler. Authentication route pages are not wrapped in a frontend route guard; protected backend requests perform the actual auth check.

**Failure/loading:** AuthContext reports loading/current user; form pages show submit loading and inline errors. Cognito availability/configuration was not tested. The reset route also relies on `location.state.email`.

## 2. Password recovery

**Routes/components:** `/forgot-password` → `/reset-password` → `/login`.

`ForgotPassword.jsx` sends email via Cognito `resetPassword`; the reset code and new password are submitted from `ResetPassword.jsx` using `confirmResetPassword`. Email is forwarded through route state. If reset is opened without state, the page returns to forgot-password flow. This is implemented in source but not exercised against Cognito.

## 3. Dashboard/upload to report results

**Routes/components:** `/upload` `Dashboard.jsx` → `/processing` `Processing.jsx` → `/recovery` `Results.jsx`.

### Browser side

1. The actual dashboard is `/upload`; `/dashboard` is not a registered route. `Dashboard.jsx` accepts PDF, PNG, JPG/JPEG and WebP and checks nonzero size and a 15 MB limit. Drag/drop and file-picker are supported. UI copy lists PDF/PNG/JPG although validation also permits WebP.
2. On analyze, the page resets old `ReportContext`, stores the file in context, sets analyzing, navigates to `/processing`, and invokes `analyzeReport(file)` from `src/api/apiClient.js`.
3. The API client posts multipart field `report` to `/api/analyze-report`, with bearer token from Amplify session (or the local development bypass when explicitly enabled), a longer upload timeout, and JSON error mapping.
4. `Processing.jsx` shows four animated steps. Timings progress on a fixed interval rather than backend events; it later routes to `/recovery` on completion or error. Retry uses a page reload, which can clear in-memory context.
5. `Results.jsx` reads `analysisResult` from `ReportContext`. If absent or no `bloodParameters`, it shows an empty/error message and an upload action. A page refresh/new tab loses the analysis.

### Server side

1. `server/index.js` mounts `server/routes/report.routes.js`; route middleware authenticates, rate-limits analysis (20 requests per 15 minutes per user/IP path), parses single multipart `report`, and validates file type/size.
2. `server/controllers/report.controller.js` runs OCR through `server/services/ocr.service.js`. PDFs use embedded text when adequate; scanned PDFs require conversion through `pdftoppm` then OCR. Images use Tesseract CLI or Tesseract.js fallback.
3. OCR errors return structured client errors: unreadable/failed OCR, empty text or no detectable parameters use 422-class failures; missing/invalid uploads use 400-class failures; size validation rejects over-limit files; unexpected processing failures return server errors.
4. Text is passed to the ESM `server/medical` pipeline (extract, recover fragments, normalize units, resolve reference ranges, status/severity/critical/consistency/risk, format, build context). Extraction can return zero parameters or pipeline errors. Controller has a fallback path when enrichment fails, with degraded/less-informative output.
5. Controller calls `buildFallbackAnalysis` and `predictLocalModel`; ordinary uploads do not call Bedrock/Gemini. The response combines rule/pipeline information, general fallback text, and separate `modelAssessment` with `analysisMode: local_pipeline_and_model`.
6. A report summary record is stored for an authenticated user. The uploaded temp file is removed in `finally`; report bytes/full analysis are not persisted for later reconstruction.

### Output and limits

Output can include summary, disease label, confidence, disclaimer, blood parameters, nutrient/food/lifestyle lists and model assessment. `Results.jsx` renders biomarkers and local model output; optional `agentSummary`/`healthTips` content is conditional and normally absent from this controller response. Generic fallback suggestions are not individualized recommendations. Model label is a separate ML classification, not a validated diagnosis.

## 4. Report result consultation, print and history

`Results.jsx` feeds current result data into `AIConsultationFlow.jsx`, a local four-step questionnaire (including doctor-care and diet selections). It does not issue a model request. `MealPlanCard.jsx` renders hard-coded meal plans by dietary category; disease affects captioning, not biomarker-based meal generation.

The `PDFExportButton.jsx` calls `window.print()`. Its supplied data props are not used to generate a file. Print CSS hides app navigation/actions, so outcome depends on browser print/save behavior.

`UploadedReportsModule.jsx` requests `GET /api/reports/summary`, showing counts/latest summary. “View All Results” links back to `/recovery`; there is no implemented historical detail/reopen/download flow. Because full results are not persisted, the summary cannot recreate an older report.

## 5. Chat assistant

**Route/component/API:** `/assistant` `Assistant.jsx` → `apiClient.sendChatMessage` → `POST /api/chat` → `chat.controller.js` and `ai.service.js`.

The page starts with a local welcome message and suggestion chips. Submit sends message, `ReportContext` analysis (when present), and chat history. Backend validates message length and returns `{ reply }`. Default `NUTRICARE_AI_MODE` behavior is local deterministic report-aware chat. In remote mode, service can try Gemini, then OpenRouter, or Bedrock based on available configuration, falling back to local/static response when calls fail. A remote request may transmit report context and prior chat to an external provider. The route is unauthenticated in route setup. Messages/history are in memory and vanish on reload.

UI shows typing and error states. No streaming response is evidenced. Provider setup/reliability and privacy behavior were not runtime tested.

## 6. Health tips

`/health-tips` `HealthTips.jsx` shows five static educational items with client-side All/Diet/Exercise/Lifestyle filters. It does not load report data or generate personalized advice. Workspace navigation copy calling it “Personalized Health Insights” overstates implementation.

## 7. Account and health information

**Route/components/API:** `/account` (also `/profile`) `Account.jsx` composes six modules. On mount, modules request account sections through `apiClient` and `/api` account endpoints; saves submit PUT requests to the related section.

- `ProfileModule.jsx`: name, contact, demographics, height/weight and activity details.
- `PreferencesModule.jsx`: diet/cuisine, favorite/avoided foods, allergies/restrictions, activity, sleep/water targets.
- `HealthGoalsModule.jsx`: selectable supported goals.
- `MedicalInfoModule.jsx`: conditions, allergies, medications and notes.
- `AiPersonalizationModule.jsx`: completeness percentage based on saved account sections; not model personalization.
- `UploadedReportsModule.jsx`: report summary/latest metadata.

The backend `account.controller.js` validates fields and `db.service.js` persists either PostgreSQL JSONB or the JSON fallback store. Auth is required. Some modules log fetch failures without displaying a clear error and keep defaults, so a blank/default-looking form may mean API failure. No actual account changes were performed. Account data includes sensitive health information.

## 8. Failure and state-retention map

| Failure / state boundary | Observed source behavior | Product/design consequence |
|---|---|---|
| Direct browser access without auth | Routes render; APIs can reject unauthenticated requests | Handle 401 at relevant page/module; don’t assume page guard redirects |
| Cognito/session unavailable | Auth calls/API token retrieval can fail | Clear sign-in, session-expired and retry pathways |
| OCR cannot read PDF/image | Typed API errors; controller cleans temp file | Explain unsupported/unreadable file; preserve ability to choose another |
| OCR yields no labs | 422 no-parameters path | Explain what document types/content are supported |
| Pipeline/ML runtime fails | Enrichment fallback/model statuses can reduce result quality | Mark unavailable/degraded parts separately; avoid false green success |
| Result refresh/new tab | `ReportContext` is in-memory | Empty Results state; history does not restore analysis |
| Account GET fails | Some child modules only console-log and show defaults | User may confuse failed load with empty profile |
| Remote chat provider fails | Local/static fallback when configured service errors | Response provenance should remain clear if remote mode is offered |
| Verification/reset route state lost | email is carried by router state | Direct refresh can interrupt recovery; offer way to re-enter email |
