# Zimam (زمام)

Identity Cloud, powered by Keycloak, hosted in OCI Saudi regions (Riyadh primary, Jeddah DR).

Status: design phase.

## Docs

- [High-level design](docs/architecture/hld.md): tiers, architecture, deployment, key flows, security, NFRs, decisions and risks.
- [Security and compliance](docs/architecture/security-compliance.md): SIEM and SOC, infrastructure as code, NCA CCC-2:2024 and SAMA control mapping, responsibility model.
- [Managed services and costs](docs/architecture/hld-managed-services-costs.md): which OCI managed services to use, infrastructure cost per building block, price book, margins and break-even. Numbers come from `python docs/architecture/cost_model.py`.
- [Gap analysis](docs/architecture/gap-analysis.md): what else the managed service needs, prioritized.
- [Platform components](docs/architecture/zimam-components.html): visual component diagram with every tool and why it was chosen. Open the file in a browser. Rebuild it with `python docs/architecture/build_components.py`.
- [Pricing deck](docs/commercial/zimam-pricing-deck.pptx): 15-slide stakeholder deck on tiers, price book, OCI costs, margins and break-even. Rebuild with `node docs/commercial/build_pricing_deck.js` (needs `pptxgenjs`, `react-icons`, `react`, `react-dom`, `sharp`).
- [KSA competitor and feature analysis](docs/market/ksa-competitor-analysis.md): market drivers and regulation, competitor landscape, feature matrix, pricing comparison, SWOT, recommendations, risks.
