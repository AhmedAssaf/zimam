# Zimam Managed Service Gap Analysis

| | |
|---|---|
| **Status** | Draft |
| **Last updated** | 2026-10-07 |
| **Related** | [HLD](hld.md), [Security and compliance](security-compliance.md), [component diagram](zimam-components.html) |

Zimam is accountable for the whole service, not only for running Keycloak. This document lists what a managed identity SaaS needs that the design does not cover yet.

**Priority:**
- **P0:** needed before the first paying customer.
- **P1:** needed before the first government or bank customer, or within 6 months.
- **P2:** later.

## 1. Already covered

Cell architecture and tiers, control plane and tenant lifecycle, IaC, SIEM/SOC, NCA/SAMA control mapping, DR, billing with SAR/ZATCA, Nafath, and the competitor analysis.

## 2. Gaps

### 2.1 Reliability engineering (SRE)

| Gap | Why it matters | What to add | Priority |
|---|---|---|---|
| SLOs and error budgets per tier | An SLA is a promise; SLOs tell you if you are keeping it | Login success rate, login latency (p95), token endpoint availability, per cell and per tenant | P0 |
| Synthetic login probes | Many failures only show up as "users can't log in", not as server errors | A probe per cell (and per Enterprise tenant) doing a full OIDC login every minute from inside the Kingdom | P0 |
| On-call and paging | Small team; alerts must reach a person | Grafana OnCall (open source) or similar, rota, escalation to the MSSP | P0 |
| Runbooks | Fast, consistent recovery | One per alert: Keycloak pod crash, DB failover, certificate expiry, cell full, DR failover | P0 |
| Capacity management | Pooled cells fill up; Keycloak is memory-heavy | Cell capacity model (realms, MAU, RPS), auto-placement thresholds, monthly review | P1 |
| Load and performance testing | Realm limits per shared Keycloak are unknown (HLD risk 4) | Load-test suite (k6 or Keycloak benchmark) run on every Keycloak upgrade | P0 |
| DR drills | Unproven DR is assumed DR | Failover test to Jeddah twice a year, with a report for customers | P1 |

### 2.2 Keycloak lifecycle management

| Gap | Why it matters | What to add | Priority |
|---|---|---|---|
| Version support policy | Customers need to know how long a version is supported | e.g. latest + one previous minor, security patches within days | P0 |
| Upgrade pipeline | Upgrades are the riskiest routine operation | Canary order: internal cell → staging → one pooled cell → all; automatic rollback on SLO breach | P0 |
| Keycloak CVE response | Identity is a prime attack target | Watch Keycloak security advisories; patch SLA (critical within 72 h); customer advisory notices (CCC 2-9-P-1-2) | P0 |
| Extension certification | Business customers upload SPIs that can break upgrades | Compatibility tests per Keycloak version, signed approval, rejection reasons | P1 |

### 2.3 Customer-facing operations

| Gap | Why it matters | What to add | Priority |
|---|---|---|---|
| Support desk | Paid tiers promise response times | Ticketing with SLA timers (e.g. Zammad, self-hosted in KSA), Arabic and English | P0 |
| Status page and notifications | Every competitor has one | Public status per cell or region, maintenance announcements, incident updates by email | P0 |
| Customer dashboards | Customers want to see logins, MAU, errors and their bill | Per-tenant dashboards in the portal: MAU, login success and failure, top errors, security alerts | P1 |
| Security alerts to customers | Part of the managed detection in [security-compliance.md](security-compliance.md) section 5 | Alert channel per tenant (email, webhook, SIEM export) | P1 |
| Trust portal | Buyers ask for evidence before signing | Public page with certifications, policies, subprocessors; gated reports | P1 |
| Documentation portal | Self-serve customers need docs in Arabic and English | Getting started, integration guides per framework, Nafath guide, API reference | P0 |

### 2.4 Product features expected from a managed IAM

| Gap | Why it matters | What to add | Priority |
|---|---|---|---|
| Migration tooling | Fastest way to win customers. Azure AD B2C stopped onboarding new customers in May 2025, and many Saudi organizations run Keycloak themselves. | Import from self-hosted Keycloak (realm export), Auth0, Azure AD B2C, CSV; password-hash migration or lazy migration on first login | P0 |
| Multiple environments per customer | Customers need dev, test and prod realms | "Extra environment" add-on, promotion of realm config between environments | P1 |
| Config as code for customers | DevOps teams expect it (Cloud-IAM and Skycloak offer it) | Terraform provider (the existing Keycloak provider plus Zimam resources), realm config export/import | P1 |
| Transactional email | Verification and reset emails must arrive and come from the customer's domain | SPF/DKIM/DMARC per custom domain, Arabic templates, bounce handling | P0 |
| Bot and abuse protection | Login pages attract credential stuffing | CAPTCHA, per-IP and per-realm rate limits, breached-password check, impossible-travel detection | P1 |
| Webhooks and events for customer apps | Apps react to user created, deleted, locked | Event webhooks from the Keycloak event listener | P1 |
| Self-service backup and export | Customers want control and an exit plan (CCC 2-6-T-1) | On-demand realm export, scheduled export to customer bucket | P1 |
| Custom domains and certificates | Brand trust | Automated validation and renewal, expiry alerts, customer-provided certificates for Gov | P0 |

### 2.5 Business, legal and commercial

| Gap | Why it matters | What to add | Priority |
|---|---|---|---|
| Company setup | Contracts, invoicing and licences need a legal entity | Commercial registration (CR), VAT registration, ZATCA onboarding, bank account | P0 |
| Contracts | Customers will not sign without them | Master Services Agreement, SLA with service credits, Data Processing Agreement (PDPL), Acceptable Use Policy, privacy policy, Arabic versions | P0 |
| Subprocessor list | Required by PDPL DPAs and bank flow-down | OCI, MSSP, SMS provider, payment gateway, email; change notification process | P0 |
| Cyber and professional liability insurance | Large customers ask for it; protects the company | Policy sized to contract values | P1 |
| Certifications roadmap | Gate for government and bank deals | ISO 27001 → ISO 27017/27018 (cloud and privacy) → ISO 22301 (continuity); NCA CCC self-assessment; CST registration decision; SOC 2 only if selling outside KSA | P1 |
| Pricing, quotas and overage policy | Usage-based plans need clear limits | What happens when MAU exceeds the plan: soft limits, notice, auto-upgrade or overage price | P0 |
| Partner channel | Government sales usually go through integrators | Partner programme for Saudi system integrators; Oracle partnership and marketplace listing | P1 |

### 2.6 Zimam's own corporate security

ECC also applies to Zimam as a company, not only to the platform.

| Gap | What to add | Priority |
|---|---|---|
| Staff devices | MDM, disk encryption, EDR on laptops used to reach production | P0 |
| Corporate identity | Staff SSO and MFA for email, GitHub, OCI console and support tools | P0 |
| Source code security | GitHub: branch protection, required reviews, secret scanning, signed commits, no production secrets in repos | P0 |
| Security awareness | Training and phishing exercises for all staff (ECC Human Resources) | P1 |
| Security leadership | Named security owner; plan for a qualified Saudi security lead (CCC 1-4-P-1-1) | P1 |

### 2.7 Cost management (FinOps)

| Gap | Why it matters | What to add | Priority |
|---|---|---|---|
| Cost per tenant and per cell | Pricing must cover OCI cost plus margin, especially for the Business tier | OCI cost tags per cell and tenant, monthly unit-cost report (cost per MAU, per instance) | P0 |
| Budget alerts | Avoid surprise bills | OCI budgets per compartment with alerts | P0 |

## 3. Recommended next steps

1. Add the P0 items to the spec and the implementation plan.
2. Run the first spike: check OKE, OCI PostgreSQL (with cross-region replication) and Logging Analytics availability in Riyadh and Jeddah.
3. Start the long-lead items in parallel: CR and VAT, Nafath application, MSSP shortlist, contract templates.
