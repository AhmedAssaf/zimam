# Zimam (زمام) - KSA IAM/CIAM Competitor and Market Analysis

| | |
|---|---|
| Product | Zimam - "Identity Cloud, powered by Keycloak" (managed IAM/CIAM on OCI Riyadh, DR in Jeddah) |
| Document type | Market and competitor analysis |
| Research date | 7 October 2026 |
| Status | Draft v1 - for internal planning |

---

## 1. Executive summary

- **In-Kingdom identity hosting is still scarce, but the window is closing.** Today, among global CIAM SaaS leaders, only Ping Identity lists a Saudi region for its PingOne Advanced Identity Cloud (Dammam, `me-central2`, on Google Cloud) [16], and Oracle OCI IAM identity domains can be homed in OCI Jeddah or Riyadh [26][28][29][30]. Auth0 private cloud stops at UAE/Bahrain [11], Entra External ID has no Saudi data-residency option [2], and Amazon Cognito runs in UAE/Bahrain only [7]. Microsoft's Saudi Arabia East region goes live in November 2026 [1] and AWS's Saudi region is due in December 2026 [5], so "we are the only in-Kingdom option" will not hold for long.
- **Oracle OCI IAM is the most direct threat, and also a possible partner.** It runs natively on the same OCI Saudi regions Zimam plans to use, OCI holds CST Class C [31], and its External User domain lists at about USD 0.016 per stored user per month [27]. Zimam cannot win on infrastructure price against its own host cloud. It has to win on Keycloak openness and extensibility, Nafath and Saudi identity integrations, Arabic-first UX, local support, and SAR/ZATCA-compliant commercial terms.
- **Ping is now a residency competitor, not just a role model.** Zimam's "like Ping, but Saudi-native" message needs sharpening, because Ping Advanced Identity Cloud already lists Dammam [16]. Zimam's real edge over Ping is price and accessibility: Ping's customer identity plans start at USD 35k-50k per year and are sold through sales [17], while Zimam can be self-serve, priced in SAR, open-source based, and run by a local team.
- **None of the managed-Keycloak specialists (Cloud-IAM, Skycloak, Yookey, Phase Two) advertises a Saudi or GCC region** [34][35][36][37]. Zimam would be the first managed-Keycloak service hosted in the Kingdom, which matters to the many Saudi organisations already running Keycloak themselves (Riyadh job postings ask for Keycloak administrators [69]).
- **The regulatory pull is strongest in government, critical national infrastructure (CNI) and finance, and weaker elsewhere in the private sector.** NCA CCC-2:2024 was updated for data localisation [55]. CCRF bars Saudi government data from leaving the Kingdom [57]. Analyses of SAMA's framework read it as expecting in-Kingdom cloud unless SAMA approves otherwise [60]. PDPL, by contrast, allows transfers abroad with SCCs, BCRs or certification [59]. Zimam should therefore target government, semi-government and regulated sectors first, not general consumer apps.
- **Nafath is the one local feature no global vendor ships natively, but access is licensed per organisation.** Secondary sources report that Nafath and Yakeen credentials are issued to the end organisation (against its commercial registration and a stated purpose) and need a TCC licence and Elm onboarding [42][43]. Zimam should build a "bring-your-own Nafath credentials" connector rather than plan to resell Nafath access. Its value is in the integration, compliance evidence and UX, not the data feed.
- **The market is growing, but published IAM sizing is thin.** NCA reports Saudi cybersecurity spending of SAR 15.2 billion in 2024, up 14% year on year [65]. Analyst estimates put Saudi digital identity solutions at USD 0.82 billion in 2024, rising to USD 1.99 billion by 2030 (16% CAGR, estimate) [66].
- **Recommended MVP focus:** a Business tier (isolated Keycloak per customer on OCI Riyadh), plus a Nafath connector, Arabic/RTL login and account pages, an NCA ECC/CCC + PDPL evidence pack, and SAR/ZATCA billing. Self-serve Starter comes second, and Enterprise/Gov is sold through partners. Defer no-code journeys, IGA and fraud.

---

## 2. Scope and method

- **Date of research:** 7 October 2026. Prices and region lists change often, so re-check them before external use.
- **Question:** Which identity platforms can a Saudi buyer use today, which of them can keep identity data in the Kingdom, and where can Zimam differentiate?
- **Sources:** We preferred primary sources: vendor docs, pricing pages, regulator websites and official press releases. Where a primary page could not be fetched (Auth0, Skycloak and some Oracle pages blocked automated retrieval), we used secondary sources and say so inline. All sources are numbered in Section 11 and cited as [n].
- **Fact vs analysis:** Sections 3-6 report sourced facts, and cells or sentences without a source are marked `?` or "unverified". Sections 7-10, and any sentence starting "Analysis:", are our own judgement.
- **Limitations:**
  - Several regional facts move fast. Azure and AWS Saudi regions are not live as of the research date [1][5], and service-by-service availability at launch is unknown.
  - Feature cells for mature global platforms (for example OIDC/SAML and social login) come from general vendor product documentation and are not individually footnoted. Residency, compliance and pricing cells are footnoted.
  - Market-size numbers are third-party analyst estimates with undisclosed methods. Treat them as directional only.
  - Corporate HQ locations are the publicly listed headquarters and are not separately cited.
  - We could not verify Nafath onboarding rules from an official SDAIA/Elm page (the official portal redirects to a login page). The Nafath statements here rely on secondary sources and need confirmation with Elm/SDAIA.

---

## 3. Market overview

### 3.1 Demand drivers

1. **Digital government and national digital identity.** Nafath (Unified National Access) is the national SSO/digital identity platform. It was developed by Elm and Technology Control Company with the National Information Center, is connected to more than 530 government and private platforms, and had executed more than 3 billion verifications by November 2024 [41]. More than 28.5 million people had enrolled in national digital identity platforms (Absher/Nafath) by early 2025 [66]. Analysis: Saudi users expect Nafath-style sign-in, so any CIAM sold in the Kingdom will be asked for it.
2. **Cloud migration with sovereignty requirements.** Hyperscalers are building in-Kingdom regions: OCI Jeddah (2020) and Riyadh (2024) [29][30], Google Cloud Dammam via CNTXT [8], Huawei Cloud Riyadh (2023) [53], SCCC/sccc by stc [51], Microsoft Saudi Arabia East (November 2026) [1] and AWS (December 2026) [5]. Identity is usually among the first workloads to move, and also one of the most sensitive.
3. **Cybersecurity spending growth.** NCA reports total cybersecurity spending of SAR 15.2 billion in 2024 (+14% year on year). The private sector accounts for 68% (SAR 10.3 billion) and products for SAR 7.7 billion [65].
4. **Open banking and fintech.** SAMA's Open Banking Framework includes a FAPI security profile (FAPI OP - KSA OB), and vendors such as Curity certify against it [61]. Keycloak 26.4 added FAPI 2 Final and DPoP support [62]. Analysis: this is a credible, testable feature for Zimam's fintech pitch.
5. **Keycloak already has a local footprint.** Riyadh employers are hiring Keycloak administrators for realm management, LDAP/AD federation and custom Java extensions [69]. Analysis: these organisations are natural "move my self-managed Keycloak to a managed in-Kingdom service" prospects.

### 3.2 Regulatory drivers

| Regulation | Owner | What it means for identity platforms | Source |
|---|---|---|---|
| **ECC-2:2024** (Essential Cybersecurity Controls) | NCA | Baseline controls for national entities, updated 31 July 2025. Includes IAM controls that customers will want mapped. | [56] |
| **CCC-2:2024** (Cloud Cybersecurity Controls) | NCA | Extension of ECC with requirements for both cloud service providers (CSPs) and cloud service tenants. Updated "to reflect changes related to data localization requirements". Secondary sources say it is mandatory for government bodies and private-sector CNI operators. | [55] |
| **Cloud Computing Regulatory Framework (CCRF v3)** | CST (formerly CITC) | Applies to cloud services provided to customers with a KSA residence or address. Saudi government data may not be transferred outside the Kingdom except where KSA law expressly allows. Registration categories A/B/C determine which data classifications a CSP may process. | [57] |
| **CST Class C** | CST / NCA | Highest CSP category, qualified up to secret and top-secret data. Held by OCI [31], Google Cloud Dammam (based on NCA's ECC/CCC assessment) [9] and Huawei Cloud [54]. | [9][31][54] |
| **PDPL** and Transfer Regulation | SDAIA | Fully enforceable since 14 September 2024 [58]. The amended transfer regulation (September 2024) allows transfers abroad with SCCs, binding common rules or accreditation certificates, with risk assessments in some cases [59]. Analysis: PDPL alone does not force in-Kingdom hosting for private-sector consumer data, but in-Kingdom storage removes transfer paperwork. | [58][59] |
| **SAMA Cyber Security Framework / Cloud Computing Framework** | SAMA | The CSF includes a dedicated IAM domain (centralisation, MFA for remote and privileged access, audit trail). Secondary analyses state that member organisations should use cloud services located in KSA unless SAMA approves otherwise (unverified against primary text). The Cloud Computing Framework applies to member organisations notified by SAMA. | [60][46] |
| **Nafath integration** | SDAIA / NIC, operated with Elm | Secondary sources report that private-sector integration needs a TCC licence and credentials (APP_ID/APP_KEY) from Elm. Credentials are bound to the integrating organisation, and lead times are measured in weeks. Unverified against an official page. | [42][43] |
| **ZATCA e-invoicing (Fatoora Phase 2)** | ZATCA | Being rolled out in waves. Wave 25 covers taxpayers with VAT-able revenue above SAR 187,500 in any year 2022-2025 and must integrate by 1 February 2027. Analysis: once Zimam passes the threshold it must issue Phase 2 e-invoices itself, and Saudi buyers' finance teams prefer suppliers who already do. | [64] |

### 3.3 Market size and growth (third-party estimates, use with caution)

| Metric | Value | Type | Source |
|---|---|---|---|
| Saudi cybersecurity spending, 2024 | SAR 15.2 bn (+14% YoY). Products SAR 7.7 bn, services SAR 7.5 bn. | Official (NCA, with BCG and IDC) | [65] |
| Saudi digital identity solutions market | USD 0.82 bn (2024) to USD 1.99 bn (2030), 16.06% CAGR | Analyst estimate (ResearchAndMarkets) | [66] |
| Saudi IAM market, incremental growth 2026-2031 | "add USD 282.77 million" | Analyst estimate (Bonafide Research) | [67] |
| MEA IAM market growth | 13.2% CAGR to 2030 | Analyst estimate (QKS Group) | [68] |

Analysis: no published figure isolates managed CIAM in KSA. A reasonable reading is that IAM is a low single-digit share of the SAR 15.2 bn cybersecurity spend, growing faster than the overall market, with digital identity as the fastest-growing slice. Zimam's serviceable market is the subset that needs in-Kingdom hosting and values open-source portability.

---

## 4. Competitor landscape

Legend for **KSA hosting**:
- **Yes**: a documented in-Kingdom region for the identity service.
- **Partial**: in-Kingdom possible only through self-hosting or a dedicated deployment, or residency exists elsewhere in the GCC only.
- **No**: no in-Kingdom option found.

### 4(a) Global IAM/CIAM SaaS

**Okta / Auth0** (San Francisco, USA)
- **Offering:** Auth0 for customer identity; Okta Workforce Identity.
- **KSA hosting: No.** Auth0 public cloud regions are US, EU, AU, CA, JP and UK [13]. Auth0 Private Cloud regions include the United Arab Emirates and Bahrain, but not Saudi Arabia [11]. Okta Workforce data sits in US, EU or APJ cells [12]. Third-party add-ons (InCountry) market Saudi residency for some fields only [15].
- **Pricing:** B2C Essentials from USD 35/month for 500 MAU. The free tier was raised to 25,000 MAU. Large volumes are quoted by sales (secondary source; the official pricing page could not be fetched) [14].
- **Segment:** developers through to enterprise, globally.
- **Strengths:** developer experience, ecosystem, Actions extensibility, brand.
- **Weaknesses vs Zimam:** no in-Kingdom option; USD billing; no Nafath connector found; costs at scale.

**Microsoft Entra ID / Entra External ID** (Redmond, USA)
- **Offering:** workforce IAM (Entra ID) and CIAM (External ID external tenants).
- **KSA hosting: No (today).** Entra tenants map to a geo-location such as "Europe, Middle East and Africa", not to a country. The External ID Go-Local add-on is available only for Australia and Japan [2]. The Azure Saudi Arabia East region opens in November 2026 [1], but Microsoft's Entra residency documentation does not list Saudi Arabia [2].
- **Pricing:** first 50,000 MAU free [3], then USD 0.03 per MAU [4]. Add-ons (SMS, Go-Local) cost extra [3].
- **Segment:** Microsoft-centric enterprises and government.
- **Strengths:** bundled with M365/Azure estates, a generous free tier, procurement familiarity.
- **Weaknesses vs Zimam:** country-level residency is not offered for KSA; limited customisation of login journeys compared with Keycloak SPIs; vendor lock-in.

**Ping Identity, including ForgeRock** (Denver, USA; owned by Thoma Bravo, which merged ForgeRock into Ping in August 2023 [18])
- **Offering:** PingOne platform plus PingOne Advanced Identity Cloud (the former ForgeRock Identity Cloud).
- **KSA hosting: Yes, for Advanced Identity Cloud.** Dammam (`me-central2`) and Doha are listed regions [16]. Note that the Google Dammam region is sold only to KSA customers through CNTXT [8], and Ping says regional selection there is arranged through a Ping representative [16]. Core PingOne regions listed in Ping's data supplement do not include KSA [19].
- **Pricing:** PingOne for Customers Essential from USD 35k/year and Plus from USD 50k/year; Workforce from USD 3 per user per month with a 5,000-user minimum [17].
- **Segment:** large enterprise, banking, government.
- **Strengths:** no-code orchestration, adaptive MFA, enterprise depth, existing ForgeRock base in the Gulf (Riyadh job postings for ForgeRock/Ping skills [70]).
- **Weaknesses vs Zimam:** high entry price; sales-led; not open source; USD contracts; Nafath only as a custom integration (none found).

**IBM Verify** (Armonk, USA)
- **Offering:** IBM Verify SaaS and Verify Dedicated.
- **KSA hosting: Partial.** IBM states that Verify Dedicated can be deployed "in any region serviced by any major public cloud provider", starting with AWS and Azure [20]. No Saudi Verify SaaS region was found.
- **Pricing:** not public (`?`).
- **Segment:** large enterprise.
- **Strengths:** dedicated deployment model; IBM services footprint.
- **Weaknesses vs Zimam:** a KSA deployment depends on Azure/AWS Saudi regions that are not yet live; cost; no local CIAM features found.

**Thales (OneWelcome, SafeNet Trusted Access)** (Paris, France)
- **Offering:** OneWelcome CIAM/B2B; SafeNet Trusted Access for workforce SSO and MFA.
- **KSA hosting: No found.** OneWelcome added a US zone to its EU hosting [21]. No GCC or Saudi zone was found.
- **Pricing:** `?`.
- **Segment:** enterprise and government in Europe.
- **Strengths:** HSM and PKI pedigree (relevant to BYOK), consent management.
- **Weaknesses vs Zimam:** no in-Kingdom SaaS found.

**CyberArk Identity, now part of Palo Alto Networks ("Idira")** (Santa Clara, USA)
- **Offering:** identity security platform focused on privileged access and workforce identity. Palo Alto Networks completed the CyberArk acquisition on 11 February 2026 [23] and markets the platform as Idira [24].
- **KSA hosting: Partial.** A UAE-hosted platform launched in April 2024 [22]. No Saudi hosting was found.
- **Pricing:** `?`.
- **Segment:** enterprise security teams.
- **Strengths:** privileged access management leadership.
- **Weaknesses vs Zimam:** workforce and privileged-access focus, not CIAM; no in-Kingdom hosting.

**SailPoint** (Austin, USA) - identity governance
- **Offering:** Identity Security Cloud (IGA).
- **KSA hosting: Partial / unverified.** A first Middle East SaaS instance went live in May 2025, but the press release does not name the host country [25].
- **Pricing:** `?`.
- **Segment:** enterprise IGA.
- **Strengths:** IGA market leader.
- **Weaknesses vs Zimam:** not a CIAM competitor. Analysis: SailPoint is a potential partner or integration target for Zimam's later IGA module, not a head-on rival.

**Red Hat build of Keycloak** (Raleigh, USA; IBM)
- **Offering:** supported Keycloak distribution for self-hosting.
- **KSA hosting: Partial.** It is self-hosted, so the customer can run it in-Kingdom.
- **Pricing:** not sold standalone. It is included with Red Hat Runtimes, Application Foundations and OpenShift subscriptions [33].
- **Segment:** OpenShift/Red Hat estates (banks, government).
- **Strengths:** vendor support for the same engine Zimam uses.
- **Weaknesses vs Zimam:** the customer still operates it (patching, HA, DR, 24x7). Analysis: this is complementary. Zimam can position as "run Keycloak for you, in-Kingdom".

### 4(b) Managed-Keycloak specialists

| Vendor | HQ | KSA hosting | Pricing (public) | Segment | Strengths | Weaknesses vs Zimam |
|---|---|---|---|---|---|---|
| **Cloud-IAM** [35] | France | **No.** Hosted on AWS (all plans) and GCP/Scaleway/Outscale/Azure (Starter-Premium). No Middle East region mentioned. | Freemium (100 users); Starter €225+; Essential €495+; Premium €1,440+; Max custom. Users customisable; 10% off yearly. | EU mid-market and public sector | Dedicated bare-metal HA from Starter. ISO 27001:2022, SecNumCloud 3.2 on Outscale. SLA 99%-99.98%. Custom extensions from Essential. | No KSA region; EUR billing; no Arabic/Nafath/NCA positioning |
| **Skycloak** [36] | USA | **No.** Residency in "US, EU, Canada, Australia and more"; no GCC region found. | Developer USD 29/mo; Launch USD 149/mo (secondary sources differ: USD 119-149); Business USD 599/mo (2 clusters); Enterprise custom. Unlimited users, priced per cluster. | Startups through to mid-market | Flat pricing, SOC 2 Type II and ISO 27001 claims, up to 99.99% SLA, Private Link/VPC on Enterprise | No KSA region; USD billing |
| **Yookey / keycloak-saas.com** [34] | Italy | **No** (hosting location not stated; Italian market) | Free €0 (25 MAU); Starter €190/mo (500 MAU); Professional €290/mo (5k MAU); Enterprise €390/mo (10k MAU); Custom above 10k. Dedicated infrastructure above 5k MAU. | Italian public sector and SMEs | National eID (SPID/CIE) built in, the same play as Zimam's Nafath; passkeys; ISO 27001; up to 99.95% SLA | Italy-specific; no KSA presence |
| **Phase Two** [37] | USA | **No.** AMER, EU and APAC; Custom plan can use a provider of the customer's choice. | Starter USD 149/mo (sized for 5k active users); Premium USD 749/mo annual or USD 999 monthly (100k); Enterprise USD 2,499/mo annual or USD 2,999 monthly (500k). Unlimited registered users. | SaaS companies (B2B organisations) | Dedicated infrastructure on every plan; open-source extension suite; on-premises and air-gapped options on Custom | No KSA region; USD |

Analysis: these specialists set the price expectations for "managed Keycloak". A dedicated instance costs roughly €225-€500 or USD 150-1,000 per month at small and medium scale. Their weakness in KSA is the absence of an in-Kingdom region and of local compliance and identity features. Yookey shows that national-eID integration (SPID/CIE) is a viable wedge for a small managed-Keycloak vendor.

### 4(c) Saudi / GCC local players

| Player | Category | What it actually offers (verified) | Relation to Zimam |
|---|---|---|---|
| **Elm** (Riyadh, PIF-owned) [44] | National identity and e-services | Developed Nafath with TCC and NIC [41]. Operates **Yakeen**, the government-backed identity data verification service for regulated organisations, which SAMA's rulebook references [46]. Implemented WSO2 Identity Server for the Hafiz programme (2013) [39]. Led a USD 2.5M investment in Youverify, an eKYC/AML vendor, in March 2024 [45]. | **Supplier and potential competitor.** Zimam depends on Elm for Nafath and Yakeen access. Elm has the identity data, government relationships and a history of deploying IAM products. No Elm-branded general-purpose CIAM SaaS was found (unverified). |
| **Nafath** (SDAIA/NIC) | National IdP | National SSO with more than 530 integrated platforms [41] | Must-have integration, not a competitor |
| **Unifonic** (Saudi-founded CPaaS) [47] | Authentication messaging | "Authenticate" OTP/2FA over SMS, voice, WhatsApp, email and push | Complementary: an MFA delivery channel and local SMS provider for Zimam |
| **uqudo** [48] | eKYC | Document scanning, NFC ID chip reading, face match and liveness, government registry checks for MEA; serves KSA | Partner candidate for Zimam's future identity-verification module. KSA hosting of uqudo itself is unverified. |
| **Lean Technologies** [49] | Open banking verification | Account (IBAN) verification, business verification against Ministry of Commerce data, freelancer certificate verification. SAMA-licensed. | Partner candidate for B2B and fintech onboarding flows |
| **Mozn (FOCAL)** [50] | Fraud/AML/KYC | Unified fraud, AML and KYC platform for financial institutions | Partner, or a future competitor for Zimam's risk and fraud module |
| **WSO2** (Identity Server, Asgardeo) [38][40] | Open-source IAM | Asgardeo SaaS is hosted in US East and EU (Ireland) only [38]. Identity Server can be self-hosted in-Kingdom. Signed Saudi/GCC channel partners in July 2025, including United Delta Systems in Riyadh [40]. | **Closest open-source alternative**, sold through local SIs on-premises or in private cloud |
| **Local system integrators** | Services | Riyadh roles advertise Keycloak [69] and ForgeRock/Ping [70] implementation work, and WSO2 has named Saudi partners [40] | Channel partners for Zimam: they implement, Zimam runs |

Excluded: Tamara and Tabby (BNPL, not IAM). A Saudi passwordless-workforce IAM start-up surfaced in searches but could not be verified, so it is not listed.

### 4(d) Platform-native identity (cloud providers' IAM)

| Platform | HQ | KSA hosting | Pricing (public) | Notes and weaknesses vs Zimam |
|---|---|---|---|---|
| **Oracle OCI IAM Identity Domains** | Austin, USA | **Yes.** Identity domains are created in a home region chosen at creation and can be replicated [28]. OCI has Jeddah (`me-jeddah-1`, 2020) and Riyadh (`me-riyadh-1`, 2024) regions [29][30] and CST Class C [31]. Also offered through stc's sovereign cloud on Oracle Alloy [32]. | External User about USD 0.016 per user per month (billed on stored users); Premium about USD 3.20 per user per month [27]. Free domain type limited to 2,000 users with no self-registration [26]. | Six domain types including "External Active User" (per-MAU, price `?`) [26]. Supports social login, passwordless and adaptive sign-in policies [26]. Weaknesses: generic UX; no Keycloak-style SPI extensibility; no Nafath connector found; Oracle-centric. **Strongest residency competitor on Zimam's own cloud.** |
| **AWS Cognito** | Seattle, USA | **No (today).** Middle East regions are Bahrain and UAE [7]. The AWS Saudi region is due in December 2026 [5]; Cognito availability there at launch is `?`. | Lite USD 0.0055/MAU and Essentials USD 0.015/MAU above 10k free; Plus USD 0.020/MAU (no free tier); 50 free SAML/OIDC MAU [6] | Cheapest at scale. Weaknesses: basic hosted UI, limited protocol depth (no SAML IdP), no Nafath, AWS lock-in. |
| **Google Cloud Identity Platform** | Mountain View, USA | **No evidence.** The Dammam region exists and is Class C, but only through CNTXT [8][9]. No country-level data location for Identity Platform was found. | Tier 1 providers: 0-50k MAU free, then USD 0.0055/MAU up to 100k [10] | Weaknesses: developer-centric; residency unclear. |
| **SCCC / sccc by stc (Alibaba Cloud JV)** | Riyadh | Yes (all data in KSA) [51] | `?` | The Saudi region lists RAM (cloud resource access control) [52]. A CIAM/IDaaS service in the Saudi region was **not verified**. |
| **Huawei Cloud Riyadh** | Shenzhen, China | Yes (region live since 2023 [53], Class C [54]) | `?` | An IDaaS offering in the Riyadh region was **not verified**. |
| **Microsoft Azure Saudi Arabia East** | Redmond, USA | Region live November 2026 [1] | - | Entra residency is not country-level for KSA [2] (see 4a) |

---

## 5. Feature analysis

Legend: ✅ available. ⚠️ partial, add-on or with caveats. ❌ not available or not found. ? unknown/unverified. For Zimam, ✅ means **planned**, and (R) means roadmap, not MVP.

| Feature | **Zimam (planned)** | OCI IAM | Ping Adv. Identity Cloud | Auth0 | Entra External ID | AWS Cognito | Google Identity Platform | WSO2 (IS / Asgardeo) | Cloud-IAM | Skycloak | Yookey |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KSA in-Kingdom hosting | ✅ Riyadh + Jeddah DR | ✅ [28][29] | ✅ Dammam [16] | ❌ UAE/BH only [11] | ❌ [2] | ❌ today; ? after Dec 2026 [5][7] | ? [8] | ⚠️ IS self-host only; Asgardeo ❌ [38] | ❌ [35] | ❌ [36] | ❌ [34] |
| NCA ECC/CCC alignment evidence | ✅ (evidence pack) | ⚠️ platform Class C [31] | ? | ❌ | ? | ? | ⚠️ platform Class C [9] | ? | ❌ | ❌ | ❌ |
| PDPL readiness (in-Kingdom storage, DPA) | ✅ | ⚠️ in-Kingdom storage | ⚠️ in-Kingdom storage | ⚠️ transfer safeguards needed [59] | ⚠️ same | ⚠️ same | ? | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Nafath login (native connector) | ✅ (customer's own credentials) | ❌ none found | ❌ none found | ❌ none found | ❌ none found | ❌ none found | ❌ none found | ❌ none found | ❌ | ❌ | ❌ (has SPID/CIE instead) |
| Arabic/RTL login and admin | ✅ | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| SAR billing / ZATCA e-invoice | ✅ | ? | ❌ USD [17] | ❌ USD | ? | ? | ⚠️ via CNTXT [8] | ⚠️ via local partners [40] | ❌ EUR | ❌ USD | ❌ EUR |
| OIDC / SAML | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ OIDC; SAML inbound only | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| MFA / passkeys | ✅ (Keycloak passkeys GA in 26.4 [62]) | ✅ passwordless [26] | ✅ [17] | ✅ | ✅ | ✅ Essentials passwordless [6] | ⚠️ | ✅ | ✅ | ✅ | ✅ passkey [34] |
| Social login | ✅ | ✅ [26] | ✅ | ✅ | ✅ | ✅ [6] | ✅ [10] | ✅ | ✅ | ✅ | ✅ |
| LDAP/AD federation | ✅ | ⚠️ Premium tiers only [26] | ✅ | ✅ | ? | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| B2B organisations / multi-tenancy | ✅ (Keycloak Organizations [63]) | ⚠️ | ? | ✅ | ⚠️ | ⚠️ | ? | ✅ | ✅ | ✅ | ? |
| Custom extensions / plugins | ✅ Business+ (SPIs); ❌ Starter | ⚠️ | ✅ scripts | ✅ Actions | ⚠️ | ✅ Lambda triggers | ⚠️ | ✅ | ✅ Essential+ [35] | ? | ? |
| No-code journey orchestration | ⚠️ (R) | ⚠️ | ✅ [17] | ⚠️ | ⚠️ user flows | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Risk-based / adaptive auth | ⚠️ (R) | ✅ adaptive policies [26] | ✅ Plus [17] | ? | ? | ✅ Plus tier [6] | ? | ⚠️ | ❌ | ⚠️ security add-ons [36] | ❌ |
| Identity verification / eKYC | ⚠️ (R) Yakeen/uqudo | ❌ | ? | ❌ | ? | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ SPID/CIE |
| Fine-grained authorisation | ⚠️ (R); Keycloak Authorization Services | ? | ? | ? | ? | ⚠️ separate service | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Identity governance (IGA) | ❌ (R) | ❌ | ? | ❌ | ⚠️ business guests only [3] | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Dedicated / single-tenant | ✅ Business, Enterprise | ❌ | ? | ✅ Private Cloud [11] | ❌ | ❌ | ❌ | ✅ IS self-host | ✅ bare metal [35] | ✅ clusters [36] | ✅ >5k MAU [34] |
| Customer-managed keys (BYOK/HSM) | ✅ Enterprise/Gov | ? | ? | ? | ? | ? | ? | ✅ self-host | ? | ? | ? |
| Private connectivity | ✅ Enterprise/Gov | ? | ? | ? | ? | ? | ? | ✅ self-host | ? | ✅ Enterprise [36] | ? |
| SLA (max published) | TBD (target 99.95%) | ? | ? | ? | ? | ? | ? | ? | 99.98% [35] | 99.99% [36] | 99.95% [34] |
| Free tier | ✅ (proposed) | ⚠️ Free domain, 2k users, no self-reg [26] | ❌ [17] | ✅ 25k MAU [14] | ✅ 50k MAU [3] | ✅ 10k MAU [6] | ✅ 50k MAU [10] | ✅ Asgardeo (size unverified) | ✅ 100 users [35] | ❌ from USD 29 [36] | ✅ 25 MAU [34] |
| Self-serve sign-up | ✅ Starter | ✅ | ❌ sales-led [17] | ✅ | ✅ | ✅ | ⚠️ Dammam via CNTXT [8] | ✅ Asgardeo | ✅ | ✅ | ✅ |
| Open-source core (no lock-in) | ✅ Keycloak | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

Analysis: Zimam's combination of in-Kingdom hosting, a Nafath connector, Arabic UX, SAR/ZATCA billing and an open-source core is unique on paper. Every other cell where Zimam shows ✅ is also matched by at least two competitors. The defensible moat is therefore the local bundle, not any single feature.

---

## 6. Pricing comparison

Assumptions:
- MAU = monthly active users.
- Where a vendor bills on stored users (OCI), we assume stored users = MAU, which is a lower bound.
- USD to SAR at the 3.75 peg. EUR to SAR at about 4.3, which is indicative only; re-check the rate.
- Excludes SMS, taxes, add-ons and enterprise discounts.
- "Quote" means not published.

| Vendor / plan | Model | Public entry price | ~10k MAU / month | ~100k MAU / month | Notes |
|---|---|---|---|---|---|
| **Entra External ID** [3][4] | Per MAU | Free to 50k | **USD 0** | **USD 1,500** (50k × 0.03) | No KSA residency [2] |
| **AWS Cognito Essentials** [6] | Per MAU | Free to 10k | **USD 0** | **USD 1,350** (90k × 0.015) | Lite tier: USD 495. Plus tier: USD 2,000. No KSA region yet. |
| **Google Identity Platform** [10] | Per MAU | Free to 50k | **USD 0** | **USD 275** (50k × 0.0055) | Residency unclear |
| **OCI IAM External User** [27] | Per stored user | USD 0.016/user/mo | **USD 160** | **USD 1,600** | In-Kingdom. Actual cost is higher if stored users exceed MAU. |
| **Auth0 B2C Essentials** [14] | Tiered MAU | USD 35 (500 MAU) | **~USD 700** (estimate from secondary tier data) | Quote (Enterprise) | No KSA residency |
| **Ping PingOne for Customers** [17] | Annual contract | USD 35k/yr Essential; 50k/yr Plus | **≥ USD 2,917** (Essential/12) | Quote | MAU included in entry price `?` |
| **Yookey** [34] | Tiered MAU | €190 (500 MAU) | **€390** (~SAR 1,680) | Quote | Dedicated above 5k MAU |
| **Cloud-IAM** [35] | Per deployment (sized) | €225 Starter / €495 Essential | **≥ €225-495** (sizing `?`) | Quote | Dedicated bare metal |
| **Skycloak** [36] | Per cluster, unlimited users | USD 29 | **~USD 149** (Launch, assumed adequate) | **~USD 599** (Business, assumed) or Enterprise | Cluster sizing limits real capacity |
| **Phase Two** [37] | Per deployment, sized by active users | USD 149 (5k) | **USD 749-999** (Premium) | **USD 749-999** (Premium covers 100k) | Dedicated |
| **Red Hat build of Keycloak** [33] | Bundled subscription | Not sold standalone | Customer-operated | Customer-operated | Plus infrastructure and operations staff |

Analysis:
- Global hyperscalers make 10k MAU effectively free and 100k MAU cost USD 275-1,500 per month. Zimam cannot win on raw per-MAU price for low-compliance consumer apps.
- Managed-Keycloak specialists charge about USD 150-1,000 per month for dedicated small and medium instances. This is the natural anchor for Zimam's Business tier.
- Ping's entry point (about USD 2.9k per month, roughly SAR 10.9k) leaves room for a Zimam Enterprise/Gov tier that is materially cheaper and also in-Kingdom and dedicated.

---

## 7. Positioning map (analysis)

**Axes:**
- **X: KSA residency and compliance evidence**, from low (offshore, no KSA-specific controls) to high (in-Kingdom, Class C platform, NCA/PDPL evidence, local identity integrations).
- **Y: Price and entry barrier**, from low (free tier, self-serve, per-MAU cents) to high (annual contracts, sales-led).

| Quadrant | Who sits there | Comment |
|---|---|---|
| **Low residency, low price** (bottom-left) | AWS Cognito, Google Identity Platform, Entra External ID, Skycloak, Yookey, Cloud-IAM, Phase Two, Asgardeo, Auth0 (low end) | Crowded and commoditised. Cognito and Entra may move right once the AWS and Azure Saudi regions mature, but Entra's residency model is geo-level, not country-level [2]. |
| **Low residency, high price** (top-left) | Auth0 Enterprise / Private Cloud (UAE/Bahrain) [11], Thales, CyberArk/Idira (UAE) [22], IBM Verify | Gulf-adjacent but not in-Kingdom |
| **High residency, high price** (top-right) | Ping Advanced Identity Cloud (Dammam) [16]; self-hosted ForgeRock/Ping/WSO2/Red Hat Keycloak delivered by local SIs | Serves large government and banks. Long sales cycles and SI-heavy delivery. |
| **High residency, low price** (bottom-right) | **OCI IAM** (in-Kingdom, cents per user) [27][28]; **Zimam (target)** | Thinly occupied today. Zimam should sit slightly above OCI on price, justified by Keycloak extensibility, Nafath, Arabic UX, local support and dedicated instances. |

A useful second lens is **openness/extensibility vs residency**. On that view Zimam is alone in the "open-source core + in-Kingdom managed" corner. WSO2 and Red Hat Keycloak are open but customer-operated, and Ping and OCI are in-Kingdom but proprietary.

---

## 8. SWOT for Zimam (analysis)

| **Strengths** | **Weaknesses** |
|---|---|
| In-Kingdom hosting on Class C OCI regions, with DR to Jeddah (OCI paired regions) [29][30][31] | Team of 1-3 people: 24x7 operations, CCC evidence and enterprise sales all compete for the same hours |
| Open-source Keycloak core: no lock-in, portable realms, large talent pool [63][69] | No brand, references or certifications yet (ISO 27001, SOC 2, NCA evidence) |
| Keycloak extensibility (SPIs), FAPI 2 and DPoP support [62] | Depends on Oracle (infrastructure) and Elm/SDAIA (Nafath access) |
| Local differentiators: Nafath, Arabic/RTL, SAR/ZATCA, local support | Fewer packaged features than Ping or Auth0 (no-code journeys, risk, IGA all on the roadmap) |
| Three tiers cover developers through to government | Per-MAU pricing cannot undercut hyperscalers |
| **Opportunities** | **Threats** |
| Organisations already self-running Keycloak and looking for a managed in-Kingdom option [69] | Oracle promoting OCI IAM on the same regions at very low list prices [27] |
| Regulated sectors with localisation pull: government, CNI, SAMA-regulated finance [55][57][60] | Azure (November 2026) and AWS (December 2026) Saudi regions [1][5] bring Cognito and possibly Entra closer to residency |
| Open-banking and fintech FAPI needs [61][62] | Ping Advanced Identity Cloud already in Dammam [16] |
| Partnerships: SIs (implementation), Unifonic (OTP), uqudo/Lean/Mozn (verification and fraud), OCI Marketplace / stc Alloy (distribution) [32][40][47][48][49][50] | Elm or another national champion launching a Nafath-native CIAM SaaS |
| ZATCA Phase 2 waves push buyers toward suppliers with compliant local invoicing [64] | Nafath licensing rules (per-organisation credentials) could limit a shared-platform model [42] |

---

## 9. Gaps and opportunities: recommendations (prioritised, analysis)

### P0 - MVP (next 6 months)

1. **Lead with the Business tier, not Starter.** Offer an isolated Keycloak instance plus its own database in OCI Riyadh, custom SPIs allowed, and a 99.9% SLA.
   - Why: this is where Zimam's isolation, residency and extensibility beat both the hyperscalers and OCI IAM, and where pricing can be sustainable.
   - Indicative list price: from **SAR 3,500/month** (about USD 930) for up to about 50k MAU, anchored between Cloud-IAM Essential (€495+) [35] and Phase Two Premium (USD 749-999) [37]. Annual prepay discount 10-15%.
2. **Nafath connector, built as "bring your own credentials".** Ship a Keycloak identity-provider extension that stores each customer's own Nafath credentials and licence, with an Arabic UX for the push-approval flow, plus onboarding guidance (TCC licence and Elm request) [42][43].
   - Do not promise to resell Nafath access until Elm/SDAIA confirms in writing what is allowed.
3. **Compliance evidence pack.** Include NCA ECC-2:2024 and CCC-2:2024 control mapping (CSP and tenant responsibilities) [55][56], PDPL data-processing agreement and data-flow statement (in-Kingdom storage, no transfers) [58][59], OCI Class C inheritance [31], and a SAMA CSF IAM-domain mapping for banks [60].
   - Also get legal advice on whether Zimam itself needs CST CSP registration under CCRF [57]. This is an open question.
4. **Arabic-first UX.** Provide Arabic/RTL login, registration, account console and email/SMS templates, Hijri/Gregorian date handling, and Saudi phone formats. Analysis: this is a visible differentiator in every demo, and no competitor was verified to have it (all `?`).
5. **Local commercial stack.** SAR pricing, ZATCA Phase 2 compliant e-invoices [64], bank transfer and mada payments, and Arabic contracts.
6. **Migration tooling.** Offer realm export/import from self-hosted Keycloak and Red Hat build of Keycloak [33], with a fixed-price migration package delivered with SI partners.

### P1 - 6 to 12 months

7. **Starter tier (shared Keycloak, one realm per tenant, self-serve).**
   - Free up to **1,000 MAU** for development and pilots, with no SLA.
   - Then about **SAR 399/month including 5,000 MAU** and **SAR 0.06 per additional MAU**. That works out to about SAR 699 (USD 186) at 10k MAU and about SAR 6,100 (USD 1,625) at 100k MAU, which is in line with Entra and Cognito at 100k [3][6] but in-Kingdom.
   - Keep Starter limited: no custom SPIs, shared rate limits. This creates a natural upgrade path to Business.
8. **Enterprise/Gov tier.** Dedicated OCI compartment, customer-held keys in OCI Vault/HSM, FastConnect/private connectivity, active DR to Jeddah and 99.95% SLA.
   - Indicative price: from **SAR 20,000-25,000/month** plus onboarding. That is above Ping's entry price in absolute terms but includes in-Kingdom dedication; customer-managed keys are not verified for Ping.
   - Sell through 2-3 SI partners who handle L1 support and integration, because a 1-3 person team cannot staff 24x7 enterprise support alone.
9. **FAPI / KSA Open Banking profile.** Aim for OpenID FAPI conformance for the KSA OB profile using Keycloak's FAPI 2 support [61][62], and package it for fintechs.
10. **Unifonic OTP integration** as the default SMS/WhatsApp OTP channel [47].
11. **OCI Marketplace listing and Oracle ISV partnership.** Turn the OCI IAM threat into co-sell by positioning Zimam for Keycloak-based and Nafath use cases. Explore availability on stc's Oracle Alloy sovereign cloud [32].

### P2 - 12 to 24 months (roadmap modules)

12. **Identity verification:** Yakeen (through Elm or an authorised reseller [42]) and uqudo/Lean connectors [48][49].
13. **Risk and fraud:** adaptive authentication signals; partner with Mozn rather than build [50].
14. **No-code journeys:** a visual editor on top of Keycloak authentication flows.
15. **Fine-grained authorisation:** start with Keycloak Authorization Services and evaluate an embedded engine later.
16. **IGA:** integrate with SailPoint or similar rather than build [25].

### Pricing principles

- Publish SAR prices. Most competitors publish USD/EUR or no prices at all [17][34][35][37].
- Price Business and Enterprise per instance, not per MAU, to stay predictable, like Skycloak and Phase Two [36][37].
- Pass Nafath, Yakeen and SMS costs through at cost plus a small handling fee. Do not bundle them.

---

## 10. Risks (analysis)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Oracle OCI IAM** is promoted to Saudi OCI customers as "already in-Kingdom and Class C" at about USD 0.016 per user per month [27][28][31] | High | High | Do not compete on price. Sell extensibility, Nafath, Arabic UX, isolation and portability. Pursue an Oracle ISV/Marketplace partnership and co-sell. |
| 2 | **Microsoft Saudi Arabia East (November 2026) and AWS Saudi region (December 2026)** [1][5] narrow the residency gap. Cognito is likely to appear in-region at some point (`?`). | High | Medium-High | Move fast to reference customers in late 2026 and early 2027. Stress country-level residency for the whole identity stack (Entra residency is geo-level [2]), Nafath, and the open-source exit path. |
| 3 | **Ping Advanced Identity Cloud in Dammam** [16] wins large government and bank deals | Medium | Medium | Do not target Ping's top-end deals at first. Target the mid-market and the "Ping is too expensive" segment [17], and offer migration from ForgeRock-era deployments. |
| 4 | **Elm or another national champion launches a Nafath-native CIAM SaaS**, combining Nafath, Yakeen and hosting | Medium | High | Seek partnership rather than competition: become an implementation or hosting partner for Elm-adjacent services. Keep the open-source and multi-IdP story. |
| 5 | **Nafath access rules** (per-organisation credentials and licensing) make a shared connector harder than expected [42][43] | Medium | Medium | Bring-your-own-credentials design. Early engagement with Elm/SDAIA. Treat Nafath as a feature, not the business model. |
| 6 | **Regulatory classification of Zimam** (CST CSP registration, NCA CCC obligations as a SaaS CSP) is unclear [55][57] | Medium | High | Get a legal opinion before launch and budget for compliance assessment. Inherit OCI Class C controls where possible. |
| 7 | **Operational capacity** of a 1-3 person team (24x7, security patching, DR drills) | High | High | Heavy automation (one operator managing many Keycloak instances), managed OCI database services, SI partners for L1, and a limited number of Enterprise customers in year one. |
| 8 | **Keycloak upstream changes** (major releases, CVEs) force frequent upgrades | Medium | Medium | Lag-one-minor release policy, automated upgrade tests per customer SPI, and an optional support relationship with Red Hat [33]. |
| 9 | **Price pressure from offshore managed-Keycloak vendors** if one adds a GCC region | Low-Medium | Medium | Local presence, Arabic support, SAR/ZATCA invoicing and Nafath are hard to copy remotely. |
| 10 | **Market-size uncertainty**: estimates are third-party and inconsistent [66][67][68] | Medium | Low-Medium | Validate demand bottom-up through 20-30 discovery interviews (government entities, banks and fintechs, Keycloak self-hosters) before scaling spend. |

---

## 11. Sources

1. Microsoft Source EMEA - "Microsoft Announces That Saudi Arabia East Datacenter Region Will Be Available in November 2026" (Aug 2026). https://news.microsoft.com/source/emea/2026/08/microsoft-announces-saudi-arabia-east-datacenter-region-will-be-available-in-november-2026/
2. Microsoft Learn - "Microsoft Entra ID and data residency". https://learn.microsoft.com/en-us/entra/fundamentals/data-residency
3. Microsoft - Entra External ID pricing. https://www.microsoft.com/en-us/security/pricing/microsoft-entra-external-id
4. Microsoft Learn - Entra External ID FAQ (USD 0.03 per MAU above 50k). https://learn.microsoft.com/hr-hr/azure/active-directory/external-identities/customers/faq-customers
5. W.Media - "AWS Saudi Arabia cloud region set for December 2026 launch". https://w.media/aws-saudi-arabia-cloud-region-set-for-december-2026-launch/
6. AWS - Amazon Cognito pricing. https://aws.amazon.com/cognito/pricing/
7. AWS - "Amazon Cognito is now available in the Middle East (Bahrain) Region"; Cognito endpoints (me-south-1, me-central-1). https://aws.amazon.com/about-aws/whats-new/2021/06/amazon-cognito-is-now-available-in-the-middle-east-region and https://docs.aws.amazon.com/general/latest/gr/cognito_sync.html
8. Google Cloud - "Dammam region access". https://docs.cloud.google.com/docs/dammam-region-access
9. Google Cloud - KSA compliance (Class C licence, NCA ECC/CCC assessment, CNTXT control packages). https://cloud.google.com/security/compliance/ksa
10. Google Cloud - Identity Platform pricing. https://cloud.google.com/identity-platform/pricing
11. Okta - Sub-processor Information (May 2026), Auth0 Private Cloud regions. https://www.okta.com/content/dam/okta-www/en_us/legal/subprocessors/OKTA-Sub-processor-Information-Page-2026-05.pdf
12. Okta - Data residency. https://okta.com/okta-data-residency
13. Auth0 Docs - Public cloud service endpoints (regions). https://auth0.com/docs/troubleshoot/customer-support/operational-policies/public-cloud-service-endpoints
14. Costbench - Auth0 plans and pricing (secondary; official page not retrievable); Auth0 blog on pricing changes. https://costbench.com/software/identity-access-management/auth0/ and https://auth0.com/blog/upcoming-pricing-changes-for-the-customer-identity-cloud/
15. InCountry - Okta integration (data residency add-on). https://incountry.com/integrations/okta/
16. Ping Identity Docs - PingOne Advanced Identity Cloud regions / data residency. https://docs.pingidentity.com/pingoneaic/tenants/environments-data-residency.html
17. Ping Identity - Pricing. https://www.pingidentity.com/en/platform/pricing.html
18. Thoma Bravo - "Thoma Bravo completes acquisition of ForgeRock; combines ForgeRock into Ping Identity". https://www.thomabravo.com/press-releases/thoma-bravo-completes-acquisition-of-forgerock-combines-forgerock-into-ping-identity
19. Ping Identity - Data supplement (PingOne regions). https://pingidentity.com/data-supplement
20. IBM Community - "Introducing IBM Security Verify Dedicated". https://community.ibm.com/community/user/blogs/milan-patel/2021/09/21/introducing-ibm-security-verify-dedicated
21. Thales - OneWelcome Identity Platform US zone press release. https://cpl.thalesgroup.com/about-us/newsroom/onewelcome-identity-platform-expansion-usa-press-release
22. Business Wire - "CyberArk launches UAE-hosted Identity Security Platform" (Apr 2024). https://www.businesswire.com/news/home/20240423191193/en
23. Palo Alto Networks Form 8-K exhibit - completion of CyberArk acquisition (Feb 2026). https://www.sec.gov/Archives/edgar/data/1327567/000119312526045600/d40626dex991.htm
24. Palo Alto Networks - Idira. https://www.paloaltonetworks.com/idira
25. SailPoint press release (via Silicon UK) - first Middle East SaaS instance. https://www.silicon.co.uk/press-release/sailpoint-launches-first-saas-instance-in-the-middle-east-to-strengthen-global-strategy-and-accelerate-digital-transformation
26. Oracle Docs - IAM Identity Domain Types. https://docs.oracle.com/en-us/iaas/Content/Identity/sku/overview.htm
27. Oracle - Identity and Access Management FAQ (OCI IAM pricing). https://www.oracle.com/security/cloud-security/identity-cloud/faq/
28. Oracle Docs - Replicating an Identity Domain to Multiple Regions. https://docs.cloud.oracle.com/en-us/iaas/Content/Identity/domains/to-manage-regions-for-domains.htm
29. Oracle Docs release note - New Region in Riyadh, Saudi Arabia. https://docs.oracle.com/iaas/releasenotes/changes/45cb2bf5-290f-40fb-af89-b7b9455f35fe/index.htm
30. Oracle Docs release note - New region in Jeddah, Saudi Arabia. https://docs.cloud.oracle.com/en-us/iaas/releasenotes/changes/b38848ee-ecd2-4c36-9491-95628f16dffd
31. Oracle Cloud Infrastructure blog - "OCI achieves CST Class C in Saudi Arabia". https://blogs.oracle.com/cloud-infrastructure/post/oci-achieves-cst-class-c-in-saudi-arabia
32. Oracle - "stc to offer sovereign cloud services in Saudi Arabia with Oracle Alloy" (Apr 2024). https://www.oracle.com/ae/news/announcement/blog/stc-offer-sovereign-cloud-services-in-saudi-arabia-with-oracle-alloy-2024-04-23/
33. Red Hat - Subscriptions or entitlements requirements for Red Hat build of Keycloak. https://access.redhat.com/articles/7044244
34. Yookey (keycloak-saas.com) - Plans/pricing. https://www.keycloak-saas.com/prezzi
35. Cloud-IAM - Pricing. https://www.cloud-iam.com/pricing/
36. Skycloak - Pricing and hosting pages (site blocked automated retrieval; prices from search-indexed page content and secondary listings). https://skycloak.io/pricing/ and https://skycloak.io/hosting
37. Phase Two - Hosting pricing. https://phasetwo.io/pricing/hosting/
38. WSO2 - Data residency in Asgardeo. https://wso2.com/asgardeo/docs/references/data-residency-in-asgardeo/
39. WSO2 - "Elm manages identities of Saudi government program users with WSO2 Identity Server" (2013). https://wso2.com/about/news/secure-electronic-services-provider-elm-manages-identities-of-saudi-government-program-users-with-wso2-identity-server
40. Intelligent CIO ME - "WSO2 partners with Middle East firms to drive digital transformation" (Jul 2025). https://www.intelligentcio.com/me/2025/07/31/wso2-partners-with-middle-east-firms-to-drive-digital-transformation/
41. Wikipedia - Unified National Access (Nafath). https://en.wikipedia.org/wiki/Unified_national_access
42. Noqta - "Yakeen, Nafath, Wathq: Saudi identity verification 2026" (secondary). https://noqta.tn/en/blog/yakeen-nafath-wathq-saudi-identity-verification-2026
43. Noqta - "Nafath national SSO OAuth2 integration" tutorial (secondary). https://noqta.tn/en/tutorials/nafath-national-sso-oauth2-typescript-integration-2026
44. Wikipedia - Elm (company). https://en.wikipedia.org/wiki/Elm_(company)
45. Youverify - "Youverify secures strategic investment led by Elm" (Mar 2024). https://youverify.co/en/blogs/youverify-secures-strategic-investment-led-by-elm-to-enhance-anti-money-laundering-compliance
46. SAMA Rulebook - Yakeen electronic customer identity verification service; Cloud Computing Framework applicability. https://rulebook.sama.gov.sa/en/node/6439 and https://rulebook.sama.gov.sa/en/node/2223
47. Unifonic - Solutions (Authenticate). https://www.unifonic.com/solutions
48. uqudo - Home page. https://uqudo.com/
49. Lean Technologies - KSA identity/verification products. https://leantech.me/sa/product/identity
50. FinTech Global - "The inside story of Mozn's unified approach to fraud and AML" (Feb 2026). https://fintech.global/2026/02/10/the-inside-story-of-mozns-unified-approach-to-fraud-and-aml/
51. TelecomTV - "stc group launches 'sccc by stc' as new identity for its cloud subsidiary". https://www.telecomtv.com/content/digital-platforms-services/stc-group-launches-sccc-by-stc-as-new-identity-for-its-cloud-subsidiary-53747/
52. Alibaba Cloud blog - "Alibaba Cloud services in Saudi Arabia". https://www.alibabacloud.com/blog/alibaba-cloud-services-in-saudi-arabia_599248
53. DatacenterDynamics - "Huawei launches Saudi cloud region in Riyadh". https://datacenterdynamics.com/en/news/huawei-launches-saudi-cloud-region-in-riyadh
54. Huawei Cloud - Saudi Arabia Class C licence FAQ. https://www.huaweicloud.com/intl/en-us/securecenter/compliance/compliance-center/ksa-classc.html
55. NCA - Cloud Cybersecurity Controls (CCC-2:2024). https://nca.gov.sa/en/regulatory-documents/controls-list/ccc/
56. NCA - Essential Cybersecurity Controls (ECC-2:2024). https://nca.gov.sa/en/regulatory-documents/controls-list/ecc/
57. DLA Piper - "Saudi Arabia releases version 3 of its Cloud Computing Regulatory Framework". https://www.dlapiper.com/en/insights/publications/2021/04/saudi-arabia-releases-version-3-of-its-cloud-computing-regulatory-framework
58. Clyde & Co - "Saudi Arabia's Personal Data Protection Law becomes enforceable" (Sep 2024). https://www.clydeco.com/en/insights/2024/09/saudi-arabia-s-personal-data-protection-law-become
59. Mayer Brown - "Updates to Saudi Arabia's Personal Data Protection Regulations: SCCs, guidelines and more" (Oct 2024). https://www.mayerbrown.com/es/insights/publications/2024/10/updates-to-saudi-arabias-personal-data-protection-regulations-sccs-guidelines-and-more
60. SAMA Cyber Security Framework v1.0 (primary, not retrievable at research time) and MassiveGrid "SAMA CSF explained" (secondary). https://www.sama.gov.sa/en-US/Laws/FinanceRules/SAMA%20Cyber%20Security%20Framework%20v1.0%20final_updated.pdf and https://massivegrid.com/blog/sama-csf-explained/
61. Curity - "Curity Identity Server conforms to FAPI OP - KSA Open Banking profile" (Jan 2024). https://curity.io/news/curity-certified-fapi-op-ksa-open-banking/
62. Keycloak - "Keycloak 26.4.0 released" (passkeys, FAPI 2 Final, DPoP). https://www.keycloak.org/2025/09/keycloak-2640-released
63. Wikipedia - Keycloak (CNCF incubating since 2023; 26.x Organizations). https://en.wikipedia.org/wiki/Keycloak
64. ZATCA - Wave 25 e-invoicing integration announcement. https://zatca.gov.sa/en/MediaCenter/News/Pages/Wave25-E-invoicing.aspx
65. NCA - "Key Economic Indicators in the Cybersecurity Sector in the Kingdom 2025". https://nca.gov.sa/en/news/key-economic-indicators-in-cybersecurity-sector-in-the-kingdom-2025/
66. Business Wire / ResearchAndMarkets - "Saudi Arabia Digital Identity Solutions ... USD 1.99 Billion Market by 2030" (Oct 2025). https://www.businesswire.com/news/home/20251024716372/en
67. Bonafide Research - Saudi Arabia Identity and Access Management Market. https://www.bonafideresearch.com/product/6606284509/saudi-arabia-identity-and-access-management-market
68. QKS Group - Market Forecast: Identity and Access Management 2026-2030, Middle East and Africa. https://qksgroup.com/market-research/market-forecast-identity-and-access-management-2026-2030-middle-east-and-africa-7031
69. Workable - InnovationTeam, "Senior Keycloak Administrator", Riyadh (Sep 2025). https://apply.workable.com/innovationteam/jobs/view/416C64CD44.md
70. Workable - Qode, "Senior IAM Consultant" (ForgeRock/Ping), Saudi Arabia. https://apply.workable.com/qodeworld/jobs/view/895FAE7108.md
