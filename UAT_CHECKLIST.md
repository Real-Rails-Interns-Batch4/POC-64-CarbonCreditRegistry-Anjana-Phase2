# UAT Checklist — Carbon Credit Registry Explorer (PoC 64)

This checklist verifies the functional requirements of the Carbon Credit Registry Explorer (PoC 64) under the **Level 2 (Cinematic Rail)** specification.

| Test Case | Step / Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **TC-01: Marker Handshake** | Click a project marker on the 100% Map Stage. | The Dynamic Slide-over Panel slides in smoothly from the right, showing the project's details (Title, Metrics, Narrative sections). | **Pass** |
| **TC-02: Ledger Handshake** | Click a row in the floating Registry Ledger Table. | The Map Stage flies smoothly to recenter on the selected coordinates, and the details slide-over panel opens. | **Pass** |
| **TC-03: Slide-over Exit** | Click the close ("X") button in the Slide-over Panel header. | The panel slides out to the right, returning the dashboard to the full-screen cinematic visualization. | **Pass** |
| **TC-04: Info Signature Popover**| Click the sleek Info `(i)` button in the transparent header. | A metadata modal popover opens displaying Developer details: Architect **Anjana KS**, Batch 4 Interns, Stack list. | **Pass** |
| **TC-05: Filter Telemetry** | Select "Gold Standard Registry" in the Registry dropdown. | The Map markers and ledger table filter instantly to display only Gold Standard projects. No full-page refresh. | **Pass** |
| **TC-06: Search Filter** | Type "Peatland" in the search filter box. | The ledger table filters in real-time to match only projects containing the keyword. | **Pass** |
| **TC-07: Toggle Panes** | Click "Ledger Feed" or "Analytics" toggle buttons. | Respectively collapses or expands the floating glassmorphic panels on the left side of the map backdrop. | **Pass** |
| **TC-08: Download Action** | Click "Download Sample Data" button in the slide-over. | Initiates download of a CSV file containing the project registry metadata. | **Pass** |
| **TC-09: Mock Fallback** | Disconnect backend API server and reload. | Frontend detects offline state and switches seamlessly to local mock dataset with a warning indicator. | **Pass** |
| **TC-10: Responsive Layout** | Shrink browser viewport to mobile width. | Slide-over panel adjusts to full width of viewport and ledger panel collapses cleanly. | **Pass** |
