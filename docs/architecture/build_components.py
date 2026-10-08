"""Build docs/architecture/zimam-components.html.

Downloads product logos (Simple Icons) and pictograms (Lucide) once, embeds them
as SVG symbols, and writes a self-contained HTML page. Run from anywhere:

    python docs/architecture/build_components.py

Icons are cached in .icon-cache/ next to this script (git-ignored).
Cost tags and the cost tables come from cost_model.py, so the page always
matches hld-managed-services-costs.md.
"""
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import cost_model as cm  # noqa: E402
CACHE = HERE / ".icon-cache"
OUT = HERE / "zimam-components.html"

SI_URL = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/{}.svg"
LU_URL = "https://cdn.jsdelivr.net/npm/lucide-static@0.460.0/icons/{}.svg"

# Product logos: slug -> brand colour that reads on both light and dark tiles.
BRANDS = {
    "react": "#087EA4", "quarkus": "#4695EB", "postgresql": "#4169E1",
    "grafana": "#F46800", "git": "#F05032", "terraform": "#844FBA",
    "kubernetes": "#326CE5", "flux": "#5468FF", "prometheus": "#E6522C",
    "keycloak": "#00B8E3", "oracle": "#F80000",
}
PICTOS = [
    "users", "user-cog", "smartphone", "receipt", "lock-keyhole", "package-check",
    "refresh-cw", "shield-check", "key-round", "cable", "database", "credit-card",
    "file-check", "fingerprint", "message-square", "building-2", "archive", "copy",
    "landmark", "headset", "radar", "shield-alert", "tag",
    "sparkles", "bot", "gauge", "cpu",
]
ALLOWED = re.compile(r"^\s*(<(path|circle|rect|line|polyline|polygon|ellipse)\b[^<>]*/>\s*)*$")


def fetch(url, dest):
    if not dest.exists():
        CACHE.mkdir(exist_ok=True)
        # Windows curl uses the OS certificate store, which works behind TLS inspection.
        curl = "C:/Windows/System32/curl.exe" if sys.platform == "win32" else "curl"
        subprocess.run([curl, "-sSfL", "-o", str(dest), url], check=True)
    return dest.read_text(encoding="utf-8")


def inner(svg_text):
    body = re.sub(r"<!--.*?-->", "", svg_text, flags=re.S)
    body = re.search(r"<svg\b[^>]*>(.*)</svg>", body, re.S).group(1)
    body = re.sub(r"<title>.*?</title>", "", body, flags=re.S).strip()
    if not ALLOWED.match(body):
        raise ValueError("unexpected markup in icon")
    return body


def symbols():
    out = []
    for slug, colour in BRANDS.items():
        body = inner(fetch(SI_URL.format(slug), CACHE / f"si-{slug}.svg"))
        body = body.replace("<path ", f'<path fill="{colour}" ', 1)
        out.append(f'<symbol id="i-{slug}" viewBox="0 0 24 24">{body}</symbol>')
    for name in PICTOS:
        body = inner(fetch(LU_URL.format(name), CACHE / f"lu-{name}.svg"))
        out.append(
            f'<symbol id="i-{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{body}</symbol>'
        )
    return "\n".join(out)


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---------- drawing primitives ----------

def node(x, y, w, icon, title, lines, kind="bx", build=False, h=108):
    """Icon-on-top card. lines: list of (class, text) under the title."""
    cx = x + w / 2
    s = [f'<g><rect class="{kind}" x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/>',
         f'<rect class="tile" x="{cx - 22}" y="{y + 10}" width="44" height="44" rx="10"/>',
         f'<use class="ic" href="#i-{icon}" x="{cx - 14}" y="{y + 18}" width="28" height="28"/>',
         f'<text class="t" x="{cx}" y="{y + 72}" text-anchor="middle">{esc(title)}</text>']
    ty = y + 87
    for cls, text in lines:
        s.append(f'<text class="{cls}" x="{cx}" y="{ty}" text-anchor="middle">{esc(text)}</text>')
        ty += 14
    if build:
        s.append(f'<circle class="bd" cx="{x + w - 12}" cy="{y + 12}" r="4.5"/>')
    s.append("</g>")
    return "".join(s)


def card(x, y, w, icon, title, tool, h=64):
    """Compact icon-left card for outside services and DR."""
    return (f'<g><rect class="bx" x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/>'
            f'<rect class="tile" x="{x + 12}" y="{y + (h - 40) / 2}" width="40" height="40" rx="9"/>'
            f'<use class="ic" href="#i-{icon}" x="{x + 20}" y="{y + (h - 24) / 2}" width="24" height="24"/>'
            f'<text class="t" x="{x + 64}" y="{y + h / 2 - 3}">{esc(title)}</text>'
            f'<text class="tool" x="{x + 64}" y="{y + h / 2 + 13}">{esc(tool)}</text></g>')


def zone(x, y, w, h, icon, label):
    return (f'<rect class="zone" x="{x}" y="{y}" width="{w}" height="{h}" rx="14"/>'
            f'<use class="ic" href="#i-{icon}" x="{x + 16}" y="{y + 12}" width="16" height="16"/>'
            f'<text class="zt" x="{x + 40}" y="{y + 25}">{esc(label)}</text>')


def arrow(d, label=None, lx=0, ly=0, anchor="start", dash=False, both=False, rotate=False):
    cls = "ar dash" if dash else "ar"
    start = ' marker-start="url(#ah)"' if both else ""
    s = f'<path class="{cls}" d="{d}"{start} marker-end="url(#ah)"/>'
    if label:
        rot = f' transform="rotate(-90 {lx} {ly})"' if rotate else ""
        s += f'<text class="lbl" x="{lx}" y="{ly}" text-anchor="{anchor}"{rot}>{esc(label)}</text>'
    return s


def pill(right, cy, lines):
    """Cost tag, right-aligned at `right`, vertically centred on `cy`."""
    w = max(len(t) for t in lines) * 6.0 + 34
    h = 8 + 14 * len(lines)
    x, y = right - w, cy - h / 2
    s = [f'<g><rect class="cost" x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(h / 2, 11)}"/>',
         f'<use class="ci" href="#i-tag" x="{x + 9}" y="{cy - 6}" width="12" height="12"/>']
    for i, t in enumerate(lines):
        s.append(f'<text class="ct" x="{x + 27}" y="{y + 15 + 14 * i}">{esc(t)}</text>')
    s.append("</g>")
    return "".join(s)


def usd(v):
    return f"{v:,.0f}"


def step(n, x, y):
    return (f'<g class="step"><circle cx="{x}" cy="{y}" r="9"/>'
            f'<text x="{x}" y="{y + 4}" text-anchor="middle">{n}</text></g>')


def head(x, y, text):
    return f'<text class="zt" x="{x}" y="{y}">{esc(text)}</text>'


def diagram():
    W = 184
    c1, c2, c3 = 266, 480, 694            # platform columns
    p1, p2, p3 = 264, 456, 648            # pooled-cell columns (width 172)
    pw = 172
    g = []

    # People
    g.append(node(20, 84, W, "users", "Customer admins",
                  [("tool", "portal · API · Terraform"), ("why", "manage their own realms")]))
    g.append(node(20, 214, W, "user-cog", "Zimam ops team",
                  [("tool", "on-call · support"), ("why", "no direct prod logins")]))
    g.append(node(20, 765, W, "smartphone", "End users",
                  [("tool", "of customers' apps"), ("why", "log in, MFA, Nafath")]))

    # Platform compartment
    g.append(zone(240, 40, 664, 432, "oracle", "OCI RIYADH · PLATFORM COMPARTMENT · CONTROL PLANE"))
    g.append(node(c1, 84, W, "react", "Customer portal",
                  [("tool", "React · Arabic + English"), ("why", "sign-up, plans, domains")], build=True))
    g.append(node(c2, 84, W, "quarkus", "Zimam API",
                  [("tool", "Java · Quarkus · OpenAPI"), ("why", "single source of truth")], build=True))
    g.append(node(c3, 84, W, "receipt", "Billing & metering",
                  [("tool", "Lago, self-hosted in KSA"), ("why", "MAU, instance, add-on plans")]))
    g.append(node(c1, 214, W, "lock-keyhole", "Staff access",
                  [("tool", "OCI Identity Domains + Bastion"), ("why", "MFA, recorded sessions")]))
    g.append(node(c2, 214, W, "postgresql", "Control-plane DB",
                  [("tool", "OCI Database PostgreSQL"), ("why", "tenants, plans, jobs, audit")]))
    g.append(node(c3, 214, W, "grafana", "Observability",
                  [("tool", "Prometheus · Grafana · Logs"), ("why", "SLA alerts, audit export")]))
    g.append(node(c1, 344, W, "git", "Config repo",
                  [("tool", "Git on OCI DevOps"), ("why", "every change reviewed")]))
    g.append(node(c2, 344, W, "package-check", "Image registry",
                  [("tool", "OCI Registry + Trivy"), ("why", "signed images, scanned SPIs")]))
    g.append(node(c3, 344, W, "terraform", "Cell provisioner",
                  [("tool", "Terraform · Resource Mgr"), ("why", "policy-checked, drift-detected")], build=True))

    g.append(arrow("M204,138 H264", "sign up", 234, 131, "middle"))
    g.append(step(1, 234, 152))
    g.append(arrow("M204,268 H264", "MFA", 234, 261, "middle"))
    g.append(arrow("M450,138 H478", "REST", 464, 131, "middle"))
    g.append(arrow("M664,138 H692", "plan", 679, 131, "middle"))
    g.append(step(2, 679, 152))
    g.append(arrow("M572,194 V212", "state", 580, 207, both=True))
    g.append(arrow("M664,178 H679 V398 H692", "create cell", 675, 300, "middle", rotate=True))

    # Saudi services next to billing
    g.append(head(940, 92, "SAUDI SERVICES"))
    g.append(card(940, 106, 200, "credit-card", "Payments", "Moyasar · HyperPay · Tap"))
    g.append(card(940, 218, 200, "file-check", "ZATCA Fatoora", "mandatory e-invoicing"))
    g.append(arrow("M878,138 H938", "charge SAR", 908, 131, "middle"))
    g.append(arrow("M878,172 H912 V250 H938", "e-invoice", 916, 206))

    # Security operations (Zimam-owned)
    g.append(zone(1170, 40, 230, 432, "shield-check", "SECURITY OPERATIONS"))
    g.append(node(1193, 84, W, "headset", "24/7 SOC",
                  [("tool", "Saudi MSSP under contract"), ("why", "Zimam stays accountable")]))
    g.append(node(1193, 214, W, "radar", "SIEM",
                  [("tool", "OCI Logging Analytics"), ("why", "immutable logs, detections")]))
    g.append(node(1193, 344, W, "shield-alert", "Security posture",
                  [("tool", "Cloud Guard · VSS · Kyverno"), ("why", "drift, vulns, policy checks")]))
    g.append(arrow("M878,300 H1191", "security events", 1035, 316, "middle"))
    g.append(arrow("M1285,214 V194", "alerts", 1293, 208))
    g.append(arrow("M1285,344 V324", "findings", 1293, 338))

    # Platform <-> cells
    g.append(head(262, 486, "▲ CELLS ONLY CALL OUT (mTLS)"))
    g.append(f'<text class="lbl" x="262" y="498">pull tenants, config, images</text>')
    g.append(f'<text class="lbl" x="262" y="510">push status, usage, metrics</text>')
    g.append(arrow("M600,520 V474"))
    g.append(step(3, 614, 497))
    g.append(arrow("M1150,520 V444 H906"))
    g.append(arrow("M786,452 V518", dash=True))
    g.append(arrow("M786,490 H1025 V518", "creates cells (Terraform)", 800, 484, dash=True))

    # Pooled cell
    g.append(zone(240, 520, 620, 580, "kubernetes", "POOLED CELL · STARTER + BUSINESS · OKE, 3 FAULT DOMAINS"))
    g.append(node(p1, 560, pw, "flux", "GitOps",
                  [("tool", "Flux"), ("why", "pulls platform config")]))
    g.append(node(p2, 560, pw, "refresh-cw", "Cell agent",
                  [("tool", "Java Operator SDK"), ("why", "reconciles tenants, usage")], build=True))
    g.append(node(p1, 700, pw, "shield-check", "Edge",
                  [("tool", "OCI WAF"), ("tool", "OCI Load Balancer"), ("tool", "Envoy Gateway"),
                   ("tool", "cert-manager"), ("why", ""), ("why", "TLS, bot filtering,"),
                   ("why", "routes by hostname")], h=238))
    g.append(node(p2, 700, pw, "keycloak", "Keycloak · shared",
                  [("tool", "Starter realms"), ("why", "~200 realms, themes")], kind="core", build=True))
    g.append(node(p2, 830, pw, "keycloak", "Keycloak · tenant",
                  [("tool", "Business instance"), ("why", "own pods, DB, SPIs")], kind="core", build=True))
    g.append(node(p3, 700, pw, "kubernetes", "Keycloak Operator",
                  [("tool", "official, upstream"), ("why", ""), ("why", "deploys, scales and"),
                   ("why", "upgrades every"), ("why", "Keycloak in the cell")], h=238))
    g.append(node(p1, 970, pw, "key-round", "OCI Vault",
                  [("tool", "secrets & keys"), ("why", "master key per cell")]))
    g.append(node(p2, 970, pw, "postgresql", "OCI PostgreSQL",
                  [("tool", "HA · PITR backups"), ("why", "DB per Business tenant")]))
    g.append(node(p3, 970, pw, "prometheus", "Telemetry",
                  [("tool", "Fluent Bit · Prometheus"), ("why", "logs tagged by tenant")]))

    g.append(arrow("M542,668 V698", "realms", 552, 688))
    g.append(step(4, 528, 684))
    g.append(arrow("M628,614 H734 V698", "Keycloak CRs", 640, 606))
    g.append(arrow("M436,754 H454"))
    g.append(arrow("M436,884 H454"))
    g.append(arrow("M648,754 H630"))
    g.append(arrow("M648,884 H630"))
    g.append(arrow("M542,938 V968", "data", 552, 958))
    g.append(arrow("M204,819 H262", "log in", 233, 812, "middle"))
    g.append(step(5, 233, 834))

    # Dedicated cell
    g.append(zone(890, 520, 270, 580, "landmark", "DEDICATED · ENTERPRISE / GOV"))
    dx = 925
    g.append(node(dx, 560, 200, "cable", "Private edge",
                  [("tool", "WAF · FastConnect · VPN"), ("why", "can skip public internet")]))
    g.append(node(dx, 700, 200, "keycloak", "Keycloak · dedicated",
                  [("tool", "customer's own cluster"), ("why", "any SPI, pinned version")], kind="core", build=True))
    g.append(node(dx, 830, 200, "kubernetes", "Cell agent + Operator",
                  [("tool", "same as pooled cell"), ("why", "one customer only")], build=True))
    g.append(node(dx, 970, 200, "database", "PostgreSQL + Vault HSM",
                  [("tool", "customer-held keys"), ("why", "own compartment & VCN")]))
    g.append(arrow("M1025,668 V698", "log in", 1033, 688))
    g.append(arrow("M1025,830 V810", "deploys", 1033, 824))
    g.append(arrow("M1125,754 H1142 V1024 H1127", "data", 1138, 890, "middle", rotate=True))

    # Keycloak outbound services
    g.append(head(1210, 684, "KEYCLOAK CALLS OUT TO"))
    g.append(card(1210, 700, 190, "fingerprint", "Nafath", "national ID login"))
    g.append(card(1210, 790, 190, "message-square", "SMS & email OTP", "Unifonic · OCI Email"))
    g.append(card(1210, 880, 190, "building-2", "Customer IdPs", "Entra ID · AD · Google"))
    g.append(arrow("M1160,732 H1208", "login", 1184, 725, "middle"))
    g.append(arrow("M1160,822 H1208", "OTP", 1184, 815, "middle"))
    g.append(arrow("M1160,912 H1208", "federate", 1184, 905, "middle"))

    # DR
    g.append(zone(240, 1130, 920, 140, "oracle", "OCI JEDDAH · DISASTER RECOVERY"))
    g.append(card(264, 1176, 380, "archive", "Cross-region backups",
                  "Object Storage replication · every tier", h=70))
    g.append(card(690, 1176, 440, "copy", "Warm standby",
                  "PostgreSQL replica + small cell · RPO 15 min / RTO 1 h", h=70))
    g.append(arrow("M542,1078 V1174", "backup copy", 552, 1122, dash=True))
    g.append(arrow("M1025,1078 V1174", "replicate", 1035, 1122, dash=True))

    # Monthly cost tags (OCI list prices, USD), from cost_model.py
    dedicated = {z: cm.total(f"Dedicated cell {z} (Enterprise)") + cm.total(f"DR warm standby {z} (Jeddah)")
                 for z in "SML"}
    biz = {n[-1]: cm.business_cost(*spec) for n, spec in cm.BUSINESS.items()}
    dr = {z: cm.total(f"DR warm standby {z} (Jeddah)") for z in "SML"}
    g.append(pill(892, 61, [f"Platform USD {usd(cm.total('Platform (control plane, prod)'))} / mo"]))
    g.append(pill(1392, 472, ["SOC partner ≈ SAR 25k / mo (quote)"]))
    g.append(pill(848, 1100, [f"Cell base USD {usd(cm.total('Pooled cell (fixed base)'))} / mo",
                              f"+ per Business S {usd(biz['S'])} · M {usd(biz['M'])} · L {usd(biz['L'])}"]))
    g.append(pill(1400, 1030, ["Dedicated incl. DR, USD / mo",
                               f"S {usd(dedicated['S'])} · M {usd(dedicated['M'])} · L {usd(dedicated['L'])}",
                               f"Gov options + {usd(cm.total('Gov pack (per dedicated cell)'))}"]))
    g.append(pill(860, 1151, [f"Standby S {usd(dr['S'])} · M {usd(dr['M'])} · L {usd(dr['L'])} USD / mo"]))

    # AI, Phase 2 (docs/product/ai-strategy.md). Everything stays in OCI Riyadh.
    g.append(zone(240, 1300, 920, 140, "sparkles", "AI · PHASE 2 · OCI RIYADH, NO DATA LEAVES THE KINGDOM"))
    g.append(card(264, 1346, 200, "gauge", "Zimam Protect", "risk service in every cell"))
    g.append(card(488, 1346, 200, "cpu", "OCI Data Science", "trains risk model, CPU"))
    g.append(card(712, 1346, 200, "bot", "AI gateway + MCP", "Zimam API · redaction"))
    g.append(card(936, 1346, 200, "sparkles", "OCI Generative AI", "Riyadh · Command A"))
    g.append(arrow("M488,1378 H466", "model", 476, 1340, "middle"))
    g.append(arrow("M912,1378 H934", "prompts", 924, 1340, "middle"))
    g.append(f'<text class="lbl" x="264" y="1430">Keycloak asks Protect for a score in 50 ms; no LLM decides a login. '
             f'Assist is unavailable in Jeddah DR; logins are not.</text>')
    req = cm.genai(cm.ASSIST_CHARS)
    g.append(pill(1152, 1440, [f"Protect {usd(cm.ai_total('Zimam Protect, pooled cell'))} / cell · Assist {req:.3f} / request",
                               f"Self-hosted A10 GPU {usd(sum(cm.SELF_HOSTED_A10.values()))} / region, USD / mo"]))

    return "\n".join(g)


def row(cells, cls=""):
    tds = "".join(f'<td class="{c}">{v}</td>' for c, v in cells)
    attr = f' class="{cls}"' if cls else ""
    return f"<tr{attr}>{tds}</tr>"


def costs_html():
    """Cost tables: building blocks and the price book."""
    sar = cm.SAR
    blocks = [
        ("Platform, production", "Control-plane OKE, PostgreSQL HA, OCI Cache, SIEM (Logging Analytics), DNS steering, backups",
         cm.total("Platform (control plane, prod)")),
        ("Staging", "OKE Basic, 2 nodes, single-node PostgreSQL", cm.total("Staging environment")),
        ("Pooled cell base", "OKE Enhanced, system + shared Keycloak pools, PostgreSQL HA, WAF, LB, SIEM share",
         cm.total("Pooled cell (fixed base)")),
    ]
    for n, spec in cm.BUSINESS.items():
        blocks.append((f"+ {n} tenant", f"{spec[0]} Keycloak pods x {spec[1]} vCPU / {spec[2]} GB, own database",
                       cm.business_cost(*spec)))
    for z, what in (("S", "3 shared nodes, PostgreSQL 2 OCPU HA"),
                    ("M", "Keycloak pool 3 x 4 OCPU, PostgreSQL 4 OCPU HA"),
                    ("L", "Keycloak pool 3 x 8 OCPU, PostgreSQL 8 OCPU HA")):
        blocks.append((f"Dedicated cell {z}", f"{what}, Jeddah warm standby included",
                       cm.total(f"Dedicated cell {z} (Enterprise)") + cm.total(f"DR warm standby {z} (Jeddah)")))
    blocks.append(("Gov options", "Private HSM vault + Network Firewall + FastConnect 1 Gbps, per cell",
                   cm.total("Gov pack (per dedicated cell)")))
    launch = sum(cm.total(b) for b in
                 ("Platform (control plane, prod)", "Staging environment", "Pooled cell (fixed base)"))

    rows = [row([("need", esc(n)), ("", esc(w)), ("num", usd(v)), ("num", usd(v * sar))]) for n, w, v in blocks]
    rows.append(row([("need", "Infrastructure at launch"), ("", "Platform + staging + one pooled cell"),
                     ("num", f"<strong>{usd(launch)}</strong>"), ("num", f"<strong>{usd(launch * sar)}</strong>")],
                    "tot"))

    prices = []
    for n, (price, cost) in cm.price_book().items():
        c = cost * sar
        prices.append(row([("need", esc(n)), ("num", usd(price)), ("num", usd(c)),
                           ("num", f"{(price - c) / price:.0%}")]))

    ai_rows = []
    for name, (primary, dr_) in cm.AI_BLOCKS.items():
        v = cm.ai_total(name)
        ai_rows.append(row([("need", esc(name)), ("", esc("; ".join(list(primary) + list(dr_)))),
                            ("num", usd(v)), ("num", usd(v * sar))]))
    gpu = sum(cm.SELF_HOSTED_A10.values())
    ai_rows.append(row([("need", "Self-hosted model, per region"), ("", "1 x A10 GPU, 200 GB volume; pays off above "
                        f"{usd(gpu / cm.genai(cm.ASSIST_CHARS))} Assist requests a month"),
                        ("num", usd(gpu)), ("num", usd(gpu * sar))]))
    ai_prices = []
    for n, (price, cost) in cm.ai_book().items():
        c = cost * sar
        ai_prices.append(row([("need", esc(n)), ("num", usd(price)), ("num", usd(c)),
                              ("num", f"{(price - c) / price:.0%}")]))

    return f"""
  <section style="display:grid; gap:14px">
    <h2>What it costs per month</h2>
    <p class="lede">OCI pay-as-you-go list prices (the same in Riyadh and Jeddah), no discounts, VAT excluded, USD 1 = SAR 3.75. The tags on the diagram show the same numbers. Generated from <code>cost_model.py</code>; assumptions are in <code>hld-managed-services-costs.md</code>.</p>
    <div class="tbl">
      <table>
        <thead><tr><th>Building block</th><th>What's in it</th><th class="num">USD / mo</th><th class="num">SAR / mo</th></tr></thead>
        <tbody>{"".join(rows)}</tbody>
      </table>
    </div>
    <div class="tbl">
      <table>
        <thead><tr><th>Plan</th><th class="num">Price SAR / mo</th><th class="num">Infra cost SAR / mo</th><th class="num">Gross margin</th></tr></thead>
        <tbody>{"".join(prices)}</tbody>
      </table>
    </div>
    <h2>AI add-ons (Phase 2)</h2>
    <p class="lede">From <code>AI_BLOCKS</code> and <code>ai_book()</code> in <code>cost_model.py</code>; design in <code>docs/product/ai-strategy.md</code>. Assist costs USD {cm.genai(cm.ASSIST_CHARS):.3f} (SAR {cm.genai(cm.ASSIST_CHARS) * sar:.2f}) per request on OCI Generative AI.</p>
    <div class="tbl">
      <table>
        <thead><tr><th>AI building block</th><th>What's in it</th><th class="num">USD / mo</th><th class="num">SAR / mo</th></tr></thead>
        <tbody>{"".join(ai_rows)}</tbody>
      </table>
    </div>
    <div class="tbl">
      <table>
        <thead><tr><th>AI add-on</th><th class="num">Price SAR / mo</th><th class="num">Infra cost SAR / mo</th><th class="num">Gross margin</th></tr></thead>
        <tbody>{"".join(ai_prices)}</tbody>
      </table>
    </div>
  </section>
"""


PAGE = (HERE / "components_template.html").read_text(encoding="utf-8")

if __name__ == "__main__":
    html = (PAGE.replace("<!--ICONS-->", symbols()).replace("<!--DIAGRAM-->", diagram())
            .replace("<!--COSTS-->", costs_html()))
    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT}")
