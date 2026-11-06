# JACS DMS design and procurement

Open `public/jacs-dms-studio.html` directly in a browser. Self-contained static prototype, synthetic data only, no production credentials or device APIs.

## Recommendation
Pilot a licensed clinical DMS with a portable JACS corporate service layer. Obtain Rightest and Glooko quotations, and assess Tidepool eligibility with a clinical partner. Do not assume APIs, resale or white-label rights, Caribbean availability, or supplier endorsement.

## Default USD planning allowances
500 enrollees, 5 employers, 3 years, no growth or inflation, 15% setup reserve.

| Route | Setup incl reserve | Annual recurring | Year one | Three years |
|---|---:|---:|---:|---:|
|Custom|276,000|81,000|357,000|519,000|
|Rightest hybrid|34,500|57,000|91,500|205,500|
|Glooko|40,250|72,000|112,250|256,250|
|Tidepool clinic|51,750|39,000|90,750|168,750|
|Medplum hosted|109,250|72,000|181,250|325,250|
|Self-host foundation|138,000|78,000|216,000|372,000|

These are architect estimates, not vendor quotes. Medplum base uses its published Production starting price of $2,000/month, with possible tier/usage additions. Tidepool base licence allowance is conditional on clinic eligibility and standard agreements. Routes do not provide equivalent scope.

The Rightest scenario complete first-year programme funding requirement is $1,069,237.97, including technology, goods, clinical care, logistics, JACS fees and reserves. The model shows $160,000 JACS service revenue before costs, not profit. Devices, medicines and clinical support are estimates and may be insufficient for individual treatment needs. A staffed 24/7 monitoring centre and full clinical treatment are not included.

## Architecture
Approved vendor connector / native workflow -> identity, consent and unit validation -> observation store and clinical queue -> clinician review and messaging. JACS operates employer contracts, enrollment, supplies, billing and support. Employers get aggregate service measures with small-group suppression, not identifiable clinical records. Production must enforce tenant/care-team access on the server, audit exports, encrypt data, manage secrets and test restore/exit paths.

Targeted repository finding: `services/cgmService.ts` currently generates simulated readings in its sync flow. Existing UI/backend assets are reuse candidates after validation; production integration is still budgeted.

## Validation
Node script syntax checked. Six default budgets checked against expected totals; 432 boundary cases checked for annual and programme cost reconciliation, zero enrollment, CGM/BGM allocation, growth and inflation. Browser checked route selection, cohort slider changes, editable licence recalculation and design navigation. Demo role visibility is not authentication.

## Sources, reviewed 6 November 2026
- https://www.rightest.com/global/diabetesmanagementsystem/
- https://support.glooko.com/hc/en-us/articles/360008911377-Glooko-Enterprise-version-of-Population-Tracker
- https://www.tidepool.org/providers/resources
- https://www.medplum.com/pricing
- https://www.medplum.com/docs/self-hosting
