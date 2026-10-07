"""Zimam OCI cost model.

Prices are OCI pay-as-you-go USD list prices from Oracle's public price API
(https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD,
retrieved 2026-10-07). OCI charges the same price in every commercial region,
including Riyadh and Jeddah. Free tiers are ignored, so totals are slightly
conservative. Run `python docs/architecture/cost_model.py` to print the tables
used in hld-managed-services-costs.md.
"""

HOURS = 730          # hours per month
SAR = 3.75           # USD to SAR peg

# --- Unit prices (USD) --------------------------------------------------------
E5_OCPU_H = 0.03         # B97384, 1 OCPU = 2 vCPU
E5_GB_H = 0.002          # B97385
OKE_ENHANCED_H = 0.10    # B96545 (basic cluster is free)
BLOCK_GB_M = 0.0255 + 10 * 0.0017   # B91961 + 10 VPU balanced (B91962)
OBJ_GB_M = 0.0255        # B91628
ARCHIVE_GB_M = 0.0026    # B91633
LB_BASE_H = 0.0113       # B93030
LB_MBPS_H = 0.0001       # B93031
WAF_INSTANCE_M = 5.0     # B94579
WAF_PER_M_REQ = 0.60     # B94277 (first 10M free)
PRIVATE_VAULT_H = 3.724  # B90328
NETWORK_FW_H = 2.75      # B95403
LOG_GB_M = 0.05          # B92593
LA_UNIT_M = 372.0        # B95634, 1 unit = 300 GB active storage
PG_OCPU_H = 0.098        # B99060
PG_GB_H = E5_GB_H        # ASSUMPTION: no PostgreSQL memory SKU is published
PG_STORAGE_GB_M = 0.072  # B99062
CACHE_GB_H = 0.0194      # B98217
FASTCONNECT_1G_H = 0.2125  # B88325
DNS_PER_M = 0.85         # B88525
STEERING_PER_M = 4.0     # B90327
EMAIL_PER_K = 0.085      # B88523


def node(ocpu, gb, count=1):
    return count * HOURS * (ocpu * E5_OCPU_H + gb * E5_GB_H)


def pg(ocpu, gb, storage_gb, nodes=2):
    """OCI Database with PostgreSQL. ASSUMPTION: compute and memory are billed
    per node (primary + replica); storage is billed once; backups at the
    Object Storage rate."""
    compute = nodes * HOURS * (ocpu * PG_OCPU_H + gb * PG_GB_H)
    return compute + storage_gb * PG_STORAGE_GB_M + storage_gb * OBJ_GB_M


def lb(mbps=100):
    return HOURS * (LB_BASE_H + mbps * LB_MBPS_H)


def waf(million_requests=10):
    return WAF_INSTANCE_M + max(0, million_requests - 10) * WAF_PER_M_REQ


OKE_ENH = HOURS * OKE_ENHANCED_H
PRIVATE_VAULT = HOURS * PRIVATE_VAULT_H
NETWORK_FW = HOURS * NETWORK_FW_H
FASTCONNECT_1G = HOURS * FASTCONNECT_1G_H
BOOT = 50 * BLOCK_GB_M   # boot volume per node

# --- Building blocks -----------------------------------------------------------
BLOCKS = {
    "Platform (control plane, prod)": {
        "OKE enhanced cluster": OKE_ENH,
        "3 nodes E5 2 OCPU / 16 GB": node(2, 16, 3) + 3 * BOOT,
        "Control-plane PostgreSQL HA, 2 OCPU / 16 GB x2, 100 GB": pg(2, 16, 100),
        "OCI Cache for Lago, 2 GB x2 nodes": 2 * 2 * HOURS * CACHE_GB_H,
        "Load balancer 100 Mbps + WAF": lb(100) + waf(10),
        "Logging Analytics (SIEM), 1 unit = 300 GB": LA_UNIT_M,
        "Logging 50 GB": 50 * LOG_GB_M,
        "Object Storage: 1 TB standard + 5 TB archive (logs, backups)":
            1000 * OBJ_GB_M + 5000 * ARCHIVE_GB_M,
        "OCIR images 100 GB": 100 * OBJ_GB_M,
        "DNS 20M queries + steering 10M": 20 * DNS_PER_M + 10 * STEERING_PER_M,
        "DevOps build runners (~60 h of 2 OCPU / 16 GB)":
            60 * (2 * E5_OCPU_H + 16 * E5_GB_H),
        "Jeddah: cross-region backup copies 1 TB": 1000 * OBJ_GB_M,
        "Monitoring, Notifications, Email (platform mail)": 15.0,
    },
    "Staging environment": {
        "OKE basic cluster (free)": 0.0,
        "2 nodes E5 2 OCPU / 16 GB": node(2, 16, 2) + 2 * BOOT,
        "PostgreSQL single node 1 OCPU / 16 GB": pg(1, 16, 50, nodes=1),
        "Load balancer + WAF": lb(20) + waf(1),
        "Logs, objects, misc": 20.0,
    },
    "Pooled cell (fixed base)": {
        "OKE enhanced cluster": OKE_ENH,
        "System pool 3 x E5 2 OCPU / 16 GB (Envoy, Flux, agent, Prometheus, Fluent Bit, Falco, Kyverno)":
            node(2, 16, 3) + 3 * BOOT,
        "Starter pool 3 x E5 2 OCPU / 16 GB (shared Keycloak, 3 pods)":
            node(2, 16, 3) + 3 * BOOT,
        "Cell PostgreSQL HA, 4 OCPU / 64 GB x2, 500 GB": pg(4, 64, 500),
        "Load balancer 200 Mbps + WAF 100M requests": lb(200) + waf(100),
        "Prometheus volumes 200 GB": 200 * BLOCK_GB_M,
        "Logging 100 GB": 100 * LOG_GB_M,
        "Object Storage 500 GB + Jeddah copy 500 GB": 1000 * OBJ_GB_M,
        "SIEM share, 0.5 Logging Analytics unit": 0.5 * LA_UNIT_M,
        "DNS, Monitoring, Email": 25.0,
    },
    "Dedicated cell S (Enterprise)": {
        "OKE enhanced cluster": OKE_ENH,
        "3 x E5 2 OCPU / 16 GB (system + 3 Keycloak pods)": node(2, 16, 3) + 3 * BOOT,
        "PostgreSQL HA, 2 OCPU / 32 GB x2, 200 GB": pg(2, 32, 200),
        "Load balancer 100 Mbps + WAF 20M requests": lb(100) + waf(20),
        "Logs, Object Storage, Jeddah backup copy": 40.0,
        "SIEM share, 0.5 Logging Analytics unit": 0.5 * LA_UNIT_M,
    },
    "Dedicated cell M (Enterprise)": {
        "OKE enhanced cluster": OKE_ENH,
        "System pool 3 x E5 2 OCPU / 16 GB": node(2, 16, 3) + 3 * BOOT,
        "Keycloak pool 3 x E5 4 OCPU / 32 GB": node(4, 32, 3) + 3 * BOOT,
        "PostgreSQL HA, 4 OCPU / 64 GB x2, 500 GB": pg(4, 64, 500),
        "Load balancer 300 Mbps + WAF 60M requests": lb(300) + waf(60),
        "Logs, Object Storage, Jeddah backup copy": 70.0,
        "SIEM share, 1 Logging Analytics unit": LA_UNIT_M,
    },
    "Dedicated cell L (Enterprise)": {
        "OKE enhanced cluster": OKE_ENH,
        "System pool 3 x E5 2 OCPU / 16 GB": node(2, 16, 3) + 3 * BOOT,
        "Keycloak pool 3 x E5 8 OCPU / 64 GB": node(8, 64, 3) + 3 * BOOT,
        "PostgreSQL HA, 8 OCPU / 128 GB x2, 1 TB": pg(8, 128, 1000),
        "Load balancer 1 Gbps + WAF 200M requests": lb(1000) + waf(200),
        "Logs, Object Storage, Jeddah backup copy": 120.0,
        "SIEM share, 2 Logging Analytics units": 2 * LA_UNIT_M,
    },
    "DR warm standby S (Jeddah)": {
        "OKE basic cluster, 2 x E5 1 OCPU / 8 GB (scaled up on failover)":
            node(1, 8, 2) + 2 * BOOT,
        "PostgreSQL cross-region replica, 1 node 2 OCPU / 32 GB": pg(2, 32, 200, nodes=1),
        "Load balancer + WAF": lb(50) + waf(1),
    },
    "DR warm standby M (Jeddah)": {
        "OKE basic cluster, 2 x E5 2 OCPU / 16 GB": node(2, 16, 2) + 2 * BOOT,
        "PostgreSQL cross-region replica, 1 node 4 OCPU / 64 GB": pg(4, 64, 500, nodes=1),
        "Load balancer + WAF": lb(100) + waf(1),
    },
    "DR warm standby L (Jeddah)": {
        "OKE basic cluster, 3 x E5 4 OCPU / 32 GB": node(4, 32, 3) + 3 * BOOT,
        "PostgreSQL cross-region replica, 1 node 8 OCPU / 128 GB": pg(8, 128, 1000, nodes=1),
        "Load balancer + WAF": lb(300) + waf(1),
    },
    "Gov pack (per dedicated cell)": {
        "Virtual private vault (dedicated HSM partition)": PRIVATE_VAULT,
        "Network Firewall (inspection of cell traffic)": NETWORK_FW,
        "FastConnect 1 Gbps port": FASTCONNECT_1G,
    },
}

# Business tenant increment inside a pooled cell.
# Keycloak sizing (keycloak.org HA guide): 1250 MB base per pod, 1 vCPU per
# 15 password logins/s, 150% CPU headroom. Packing overhead on nodes: 25%.
PACKING = 1.25
BUSINESS = {
    # name: (pods, vCPU per pod, GB per pod, DB OCPU share, DB GB, logs+backup USD)
    "Business S": (2, 1, 2, 0.25, 10, 5),
    "Business M": (2, 2, 4, 0.5, 25, 10),
    "Business L": (3, 4, 6, 1.0, 50, 20),
}


def business_cost(pods, vcpu, gb, db_ocpu, db_gb, misc):
    ocpu = pods * vcpu / 2
    compute = PACKING * HOURS * (ocpu * E5_OCPU_H + pods * gb * E5_GB_H)
    # DB share: OCPU share on the HA pair (x2 nodes) plus storage and backups
    db = 2 * HOURS * db_ocpu * (PG_OCPU_H + 16 * PG_GB_H) + db_gb * (PG_STORAGE_GB_M + OBJ_GB_M)
    return compute + db + misc


def business_dr(pods, vcpu, gb, db_ocpu, db_gb, misc):
    """Jeddah standby: one scaled-down pod, replica DB share, backups."""
    compute = PACKING * HOURS * ((vcpu / 2) * E5_OCPU_H + gb * E5_GB_H)
    db = HOURS * db_ocpu * (PG_OCPU_H + 16 * PG_GB_H) + db_gb * (PG_STORAGE_GB_M + OBJ_GB_M)
    return compute + db


def total(block):
    return sum(BLOCKS[block].values())


# --- Pooled cell allocation ---------------------------------------------------
# A full pooled cell holds about 200 Starter realms (HLD section 7, to be set by
# load tests) and 40 Business instances. The shared cell base is split 50/50.
STARTER_REALMS_PER_CELL = 200
BUSINESS_PER_CELL = 40


def pooled_shared():
    base = total("Pooled cell (fixed base)")
    starter_pool = BLOCKS["Pooled cell (fixed base)"][
        "Starter pool 3 x E5 2 OCPU / 16 GB (shared Keycloak, 3 pods)"]
    return base - starter_pool, starter_pool


def starter_realm_cost():
    shared, starter_pool = pooled_shared()
    return (starter_pool + 0.5 * shared) / STARTER_REALMS_PER_CELL


def business_alloc():
    shared, _ = pooled_shared()
    return 0.5 * shared / BUSINESS_PER_CELL


# --- Proposed price book (SAR per month, excluding VAT) -----------------------
# name: (price SAR, monthly cost USD)
def price_book():
    s = starter_realm_cost()
    book = {
        "Starter 5k MAU": (290, s),
        "Starter 10k MAU": (490, s * 1.5),
        "Starter 25k MAU": (990, s * 3),
        "Starter 50k MAU": (1690, s * 5),
    }
    for name, price in (("Business S", 1500), ("Business M", 3000), ("Business L", 6000)):
        book[name] = (price, business_cost(*BUSINESS[name]) + business_alloc())
    for name, price in (("Business S", 500), ("Business M", 1000), ("Business L", 2000)):
        book[f"{name} DR add-on"] = (price, business_dr(*BUSINESS[name]))
    for size, price in (("S", 11250), ("M", 24000), ("L", 45000)):
        cost = total(f"Dedicated cell {size} (Enterprise)") + total(f"DR warm standby {size} (Jeddah)")
        book[f"Enterprise {size} (DR included)"] = (price, cost)
    book["Gov: dedicated HSM vault"] = (13500, BLOCKS["Gov pack (per dedicated cell)"]["Virtual private vault (dedicated HSM partition)"])
    book["Gov: dedicated Network Firewall"] = (10000, BLOCKS["Gov pack (per dedicated cell)"]["Network Firewall (inspection of cell traffic)"])
    book["Gov: FastConnect 1 Gbps"] = (1500, BLOCKS["Gov pack (per dedicated cell)"]["FastConnect 1 Gbps port"])
    return book


def fmt(usd):
    return f"{usd:,.0f}"


if __name__ == "__main__":
    for name, items in BLOCKS.items():
        print(f"\n## {name}")
        for item, cost in items.items():
            print(f"| {item} | {fmt(cost)} |")
        t = sum(items.values())
        print(f"| **Total** | **{fmt(t)}** (SAR {fmt(t * SAR)}) |")

    print("\n## Business tenant increment (USD / SAR per month)")
    for name, spec in BUSINESS.items():
        c, d = business_cost(*spec), business_dr(*spec)
        print(f"| {name} | {fmt(c)} | {fmt(c * SAR)} | DR {fmt(d)} | SAR {fmt(d * SAR)} |")

    print("\n## Dedicated cell totals incl. DR")
    for size in "SML":
        t = total(f"Dedicated cell {size} (Enterprise)") + total(f"DR warm standby {size} (Jeddah)")
        print(f"| {size} | {fmt(t)} | SAR {fmt(t * SAR)} | + Gov pack SAR {fmt((t + total('Gov pack (per dedicated cell)')) * SAR)} |")

    fixed = total("Platform (control plane, prod)") + total("Staging environment") + total("Pooled cell (fixed base)")
    print(f"\nInfra fixed at launch: USD {fmt(fixed)} / SAR {fmt(fixed * SAR)}")

    print(f"\nStarter realm (avg) cost USD {starter_realm_cost():.2f}; Business allocation USD {business_alloc():.2f}")
    print("\n## Price book: price SAR | cost SAR | contribution SAR | gross margin")
    for name, (price, cost_usd) in price_book().items():
        cost = cost_usd * SAR
        print(f"| {name} | {fmt(price)} | {fmt(cost)} | {fmt(price - cost)} | {(price - cost) / price:.0%} |")
