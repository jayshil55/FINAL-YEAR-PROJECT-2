# Screenshot index

**Audit date:** 2026-10-13
**Capture result:** no screenshot image was saved in this finalization run. The frontend Vite server starts at `http://127.0.0.1:5174/`, but browser automation rejected localhost navigation due to its URL security policy. No alternate browser or screenshot route was used to bypass that policy. This directory contains no fabricated images.

The prior audit included limited desktop visual inspection of landing, upload shell, assistant and empty Results at approximately 1280×720, but those captures were not saved as image files. Current screenshot artifacts: **none**.

| Requested screen | Route | Screenshot filename | Viewport | Verification status / reason |
|---|---|---|---|---|
| Landing page | `/` | Not captured | Not available in finalization; prior visual review ~1280×720 | Source route exists and had prior visual inspection; current browser navigation blocked before capture. |
| Login | `/login` | Not captured | Not available | Source route exists. No login submitted; browser autofill/private data must not be included. |
| Registration | `/signup` | Not captured | Not available | Source route exists. No account created. |
| Dashboard / upload | `/upload` | Not captured | Not available in finalization; prior visual review ~1280×720 | Actual dashboard is `/upload`; prior upload-shell review only, no file uploaded. Current browser navigation blocked. |
| Processing | `/processing` | Not captured | Not available | Route exists; no report upload/processing triggered. Timer-driven page not verified in this run. |
| Health results | `/recovery` | Not captured | Not available in finalization; prior empty state ~1280×720 | Empty state had prior visual inspection. Populated results require non-sensitive test report/result data not available or used. |
| Nutrition recommendations | `/recovery` | Not captured | Not available | Consultation/meal-plan components exist; no populated report context was created. Static-vs-personalized behavior is source-audited. |
| AI assistant | `/assistant` | Not captured | Not available in finalization; prior visual review ~1280×720 | Empty chat surface had prior visual inspection. No message submitted and no report context supplied. |
| History | `/account` | Not captured | Not available | Source shows summary metadata only. No account data was opened; avoid exposing private health details. |
| Report download/print | `/recovery` | Not captured | Not available | No current report was available. Source audit confirms print-only `window.print()` behavior, not generated PDF. |

## Safe recapture requirements

If browser access is enabled later, capture only the actual rendered app, use a blank/non-sensitive state, verify each image before saving, and do not include autofilled credentials, account details, or medical report data. A populated-result screenshot requires a synthetic, non-sensitive test report/result and an authorized test session.
