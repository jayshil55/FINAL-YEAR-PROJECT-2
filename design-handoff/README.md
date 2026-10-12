# NutriHealth investigation handoff

This folder contains an evidence-based audit of the existing NutriHealth/NutriCare application, prepared to support a later redesign. It is deliberately separate from application source and does not implement UI changes.

## Project overview

NutriHealth helps general users read lab reports and explore wellness information. The existing web app combines a React frontend, Express APIs, OCR, a deterministic medical parsing/rules pipeline, a separate local ML assessment, account settings, and chat. This audit distinguishes implemented behavior from static, disconnected, partial, or unverified features so a design agent does not promise capabilities the code does not provide.

## Purpose and scope

The investigation maps architecture, routes, APIs, data flow, user journeys, verified feature status, UI quality, privacy boundaries, and redesign regression risks. It was source-based with limited prior desktop visual review. No application code/configuration/dependencies were changed; no real report was uploaded, no account was modified, and no test suite was run. Do not treat this audit as medical validation or a security certification.

## Architecture and technology stack

- **Frontend:** React 19, Vite 8, React Router v7, Tailwind CSS v4, Framer Motion, Lucide React, AWS Amplify Auth/Cognito.
- **Backend:** Node.js/Express 4 with auth middleware, upload handling, rate limiting, and account/report/chat/agent routes.
- **Database:** optional PostgreSQL; JSON file fallback for local operation.
- **Report processing:** PDF text/OCR with Tesseract and `pdftoppm`, medical extraction and normalization pipeline, deterministic fallback summary, plus separate local scikit-learn Random Forest model adapter.
- **AI integrations:** local chat is default. Gemini, OpenRouter and Bedrock are optional chat providers; a protected Bedrock agent endpoint exists separately and has no frontend caller found. The ordinary report upload path does not call a hosted model.

## Key existing features

- Signup/sign-in, email verification, password recovery.
- PDF/image upload, OCR, biomarker extraction and reference/unit/status processing.
- Current report results and separate model assessment.
- Chat assistant and generic wellness guidance.
- Static health tips, guided diet questionnaire, static meal examples.
- Profile, preferences, health goals, medical information and report-summary modules.

Some UI controls are placeholders, some outputs are generic/static, and current report results are transient in browser memory. Detailed status is in [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md).

## Key investigation findings

1. `/upload` is the dashboard path; there is no `/dashboard` route.
2. Report upload uses local OCR + deterministic medical pipeline + separate local model adapter. UI/README “AI” claims need careful qualification.
3. Google sign-in button navigates to upload without OAuth. Registration UI collects a name that is not sent to Cognito.
4. Meal examples and tips are static; the account “AI personalization” number is profile completeness.
5. Report metadata is persisted, but uploaded files and full analyses are not retained; browser refresh loses the current result. Print action uses browser print instead of generating a PDF.
6. The visual language varies among the landing page, auth pages, workspace, and empty Results. Upload accessibility, account error feedback, status semantics, and progress fidelity need design attention.

## Screenshot gallery

No screenshot image files were captured in this finalization run. The Vite frontend started, but the available browser automation blocked navigation to localhost under its URL security policy. Prior visual observations are described in [UI_AUDIT.md](UI_AUDIT.md); they are not represented as saved screenshots. See the [screenshot index](screenshots/SCREENSHOT_INDEX.md) for per-route status, viewport details, and limitations. No images are fabricated or linked as if captured.

## Investigation documents

- [Complete project audit](COMPLETE_PROJECT_AUDIT.md) — consolidated overview for Claude Chat or another agent.
- [Project map](PROJECT_MAP.md) — architecture, stack, routes, APIs and data flow.
- [Feature inventory](FEATURE_INVENTORY.md) — status, locations, dependencies, UI implications, regression risk.
- [User journeys](USER_JOURNEYS.md) — actual workflows, request/response paths and failure states.
- [UI audit](UI_AUDIT.md) — visual, navigation, responsiveness and accessibility findings with evidence limits.
- [Protected functionality](PROTECTED_FUNCTIONALITY.md) — medical/data/API/auth contracts and regression checklist.
- [Redesign brief](REDESIGN_BRIEF.md) — user needs, goals, constraints and preservation requirements.
- [Screenshot index](screenshots/SCREENSHOT_INDEX.md) — capture status for requested screens.

## Suggested use by Claude Chat and Hermes Agent

1. Give the agent this folder and ask it to read `COMPLETE_PROJECT_AUDIT.md` first, then use `PROTECTED_FUNCTIONALITY.md` and `FEATURE_INVENTORY.md` as source-of-truth constraints.
2. Ask it to propose a design plan against the actual routes and verified feature status. Require it to distinguish visual changes from new backend/product capabilities.
3. Before implementation, ask for route-by-route design coverage and explicit preservation of upload field/error behavior, biomarker data semantics, account contracts and auth flow.
4. Treat absent screenshots and unverified mobile/populated-result states as validation gaps. Do not use real patient data for screenshots or design examples.

## Suggested folder structure

```text
design-handoff/
├── README.md
├── COMPLETE_PROJECT_AUDIT.md
├── PROJECT_MAP.md
├── FEATURE_INVENTORY.md
├── USER_JOURNEYS.md
├── UI_AUDIT.md
├── PROTECTED_FUNCTIONALITY.md
├── REDESIGN_BRIEF.md
└── screenshots/
    └── SCREENSHOT_INDEX.md
```

## Publication status

This workspace is not a Git checkout and has no configured remote. GitHub CLI reports its saved GitHub token is invalid, and the read-only remote lookup could not resolve network access. No commit or push was attempted. See the final handoff response for safe, explicit publish steps once working repository access/authentication is available.
