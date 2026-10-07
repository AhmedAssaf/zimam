/*
 * Build docs/commercial/zimam-pricing-deck.pptx, the stakeholder pricing deck.
 *
 * Every cost, price and margin comes from docs/architecture/cost_model.py
 * (python cost_model.py --json), so the deck matches the managed-services HLD.
 *
 *   npm install pptxgenjs react-icons react react-dom sharp   (once, anywhere on NODE_PATH)
 *   node docs/commercial/build_pricing_deck.js
 */
const path = require("path");
const { execFileSync } = require("child_process");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const lu = require("react-icons/lu");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(__dirname, "zimam-pricing-deck.pptx");
const N = JSON.parse(execFileSync("python", [path.join(ROOT, "docs/architecture/cost_model.py"), "--json"]).toString());
const B = N.book;

// ---------- theme ----------
const THEME = {
  name: "Zimam",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "16201B", lt1: "FFFFFF", dk2: "0B3D2E", lt2: "EEF3F0",
    accent1: "0C6A4E", accent2: "B26B00", accent3: "7A3E9D", accent4: "2458C6",
    accent5: "56645C", accent6: "9BC9B5", hlink: "0C6A4E", folHlink: "7A3E9D",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.title = "Zimam pricing and unit economics";
pres.author = "Ahmed Assaf";
pres.company = "Zimam";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

const sar = (v) => v.toLocaleString("en-US");
const FOOTER = "Zimam · Pricing and unit economics · Draft for discussion · Confidential";

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: HEX.dk2 },
  objects: [
    { text: { text: "زمام", options: { x: 8.3, y: 1.2, w: 4.4, h: 3.2, fontFace: "Arial", fontSize: 150, bold: true, color: C.accent1, align: "right", valign: "middle", margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "TITLE_DARK_PH",
  background: { color: HEX.dk2 },
  objects: [
    { text: { text: "زمام", options: { x: 8.3, y: 1.0, w: 4.4, h: 3.2, fontFace: "Arial", fontSize: 150, bold: true, color: C.accent1, align: "right", valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.2, w: 8.6, h: 1.6, fontSize: 44, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.0, w: 8.6, h: 1.4, fontSize: 20, color: C.accent6, valign: "top", align: "left", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.lt1 },
  margin: [0.4, 0.6, 0.7, 0.6],
  objects: [
    { text: { text: FOOTER, options: { x: 0.6, y: 6.95, w: 9.5, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontSize: 34, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.2, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: HEX.accent5, align: "right" },
});

// ---------- helpers ----------
const iconCache = {};
async function icon(name, hex) {
  const key = name + hex;
  if (!iconCache[key]) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(lu[name], { color: "#" + hex, size: 256 }));
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    iconCache[key] = "image/png;base64," + png.toString("base64");
  }
  return iconCache[key];
}

// Icon in a tinted circle: the deck's visual motif.
async function badge(slide, name, x, y, d = 0.6, dark = false, onCard = true) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: dark ? C.accent1 : onCard ? C.background1 : C.background2 }, line: { type: "none" }, objectName: `badge ${name}` });
  const pad = d * 0.24;
  slide.addImage({ data: await icon(name, dark ? HEX.lt1 : HEX.accent1), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: `icon ${name}` });
}

function card(slide, x, y, w, h, name, tint = true) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: tint ? C.background2 : C.background1 }, line: tint ? { type: "none" } : { color: C.accent6, width: 1 }, objectName: name });
}

function text(slide, t, opts) {
  slide.addText(t, { isTextBox: true, margin: 0, valign: "top", color: C.text1, fontSize: 14, ...opts });
}

const AXIS = { catAxisLabelColor: HEX.accent5, valAxisLabelColor: HEX.accent5, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt", titleFontFace: "+mn-lt", catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, dataLabelFontSize: 12, dataLabelColor: HEX.dk1 };

function tableRows(header, rows, numCols = []) {
  const head = header.map((h, i) => ({ text: h, options: { bold: true, color: C.background1, fill: { color: C.accent1 }, align: numCols.includes(i) ? "right" : "left" } }));
  const body = rows.map((r, ri) => r.map((v, i) => ({ text: String(v), options: { color: C.text1, fill: { color: ri % 2 ? C.background1 : C.background2 }, align: numCols.includes(i) ? "right" : "left", bold: i === 0 } })));
  return [head, ...body];
}

async function build() {
  // ===== 1. Title =====
  pres.addSection({ title: "Summary" });
  let s = pres.addSlide({ masterName: "TITLE_DARK_PH", sectionTitle: "Summary" });
  s.addText("Pricing and unit economics", { placeholder: "title" });
  s.addText("Zimam Identity Cloud, powered by Keycloak\nOCI Riyadh and Jeddah · Stakeholder review · October 2026", { placeholder: "body" });
  s.addNotes("Purpose: agree the first price book and the cost plan behind it. All numbers come from the cost model in the repo (OCI list prices, no discounts, VAT excluded, USD 1 = SAR 3.75). Draft: some third-party costs are placeholders.");

  // ===== 2. Executive summary =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Summary" });
  s.addText("Breaks even at launch with about 35 customers", { placeholder: "title" });
  const stats = [
    ["LuServer", `SAR ${(N.launch / 1000).toFixed(1)}k`, "OCI infrastructure per month at launch"],
    ["LuTrendingUp", `${B["Business L"].margin}–${B["Business M"].margin}%`, "Business tier gross margin"],
    ["LuLandmark", `~${B["Enterprise S (DR included)"].margin}%`, "Enterprise margin, Jeddah DR included"],
    ["LuWallet", "SAR 33k", "Monthly fixed cost at launch, before salaries"],
  ];
  for (let i = 0; i < stats.length; i++) {
    const x = 0.6 + i * 3.1;
    card(s, x, 1.6, 2.85, 2.5, `stat ${i + 1}`);
    await badge(s, stats[i][0], x + 0.3, 1.85);
    text(s, stats[i][1], { x: x + 0.3, y: 2.6, w: 2.4, h: 0.7, fontFace: THEME.headFontFace, fontSize: 32, bold: true, color: C.accent1 });
    text(s, stats[i][2], { x: x + 0.3, y: 3.3, w: 2.4, h: 0.7, fontSize: 14, color: C.accent5 });
  }
  card(s, 0.6, 4.4, 12.1, 2.0, "decision box", false);
  text(s, "What we ask today", { x: 0.9, y: 4.6, w: 5, h: 0.4, fontFace: THEME.headFontFace, fontSize: 20, bold: true, color: C.text2 });
  s.addText([
    { text: "Approve the SAR price book as v1, to publish once the open items are settled", options: { bullet: true, breakLine: true } },
    { text: "Approve the phased cost plan: 24/7 SOC partner only after the first Enterprise contract", options: { bullet: true, breakLine: true } },
    { text: "Start the open items: Oracle pricing call, third-party quotes, load tests, trademark search", options: { bullet: true } },
  ], { isTextBox: true, x: 0.9, y: 5.1, w: 11.5, h: 1.5, fontSize: 15, color: C.text1, paraSpaceAfter: 6, margin: 0, valign: "top" });
  s.addNotes("Launch break-even example: 10 Business M plus 25 Starter 10k customers cover SAR 33k a month of fixed cost (infrastructure, pentests, ISO, tools). Salaries are not included; with a team of three the number rises to about SAR 148k a month.");

  // ===== 3. Tiers =====
  pres.addSection({ title: "Offer and market" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Offer and market" });
  s.addText("Three tiers, priced the way they cost us", { placeholder: "title" });
  const tiers = [
    ["LuUsers", "Starter", "Realm in a shared Keycloak", "Self-serve developers and small apps", "Per MAU band", `Free to SAR ${sar(B["Starter 50k MAU"].price)}`],
    ["LuBoxes", "Business", "Own Keycloak instance and database", "Companies running production CIAM", "Per instance size, unlimited users", `SAR ${sar(B["Business S"].price)}–${sar(B["Business L"].price)}`],
    ["LuLandmark", "Enterprise / Gov", "Dedicated cell, Jeddah DR included", "Banks, government, critical infrastructure", "Per cell size, annual contract", `SAR ${sar(B["Enterprise S (DR included)"].price)}–${sar(B["Enterprise L (DR included)"].price)}`],
  ];
  for (let i = 0; i < 3; i++) {
    const [ic, name, iso, who, basis, price] = tiers[i];
    const x = 0.6 + i * 4.1;
    card(s, x, 1.6, 3.85, 5.0, `tier ${name}`);
    await badge(s, ic, x + 0.35, 1.9, 0.7, i === 1);
    text(s, name, { x: x + 0.35, y: 2.8, w: 3.2, h: 0.5, fontFace: THEME.headFontFace, fontSize: 24, bold: true, color: C.text2 });
    text(s, price, { x: x + 0.35, y: 3.35, w: 3.2, h: 0.5, fontSize: 20, bold: true, color: C.accent1 });
    text(s, "per month, excluding VAT", { x: x + 0.35, y: 3.8, w: 3.2, h: 0.3, fontSize: 12, color: C.accent5 });
    s.addText([
      { text: "Isolation", options: { bold: true, breakLine: true } }, { text: iso, options: { breakLine: true } },
      { text: "For", options: { bold: true, breakLine: true } }, { text: who, options: { breakLine: true } },
      { text: "Pricing basis", options: { bold: true, breakLine: true } }, { text: basis },
    ], { isTextBox: true, x: x + 0.35, y: 4.3, w: 3.2, h: 2.1, fontSize: 14, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 2 });
  }
  s.addNotes("Starter is priced per MAU because many realms share one Keycloak. Business and Enterprise are priced per instance because our cost is CPU and memory, not users; customers also prefer predictable bills.");

  // ===== 4. Starter vs market =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Offer and market" });
  s.addText("Starter undercuts in-Kingdom options at 10k MAU", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [{ name: "SAR per month at ~10k MAU", labels: ["Zimam Starter 10k", "OCI IAM (in-Kingdom)", "Yookey", "Auth0 B2C Essentials"], values: [B["Starter 10k MAU"].price, 600, 1680, 2625] }], {
    x: 0.6, y: 1.5, w: 7.6, h: 5.1, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [HEX.accent1, HEX.accent6, HEX.accent6, HEX.accent6],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", showTitle: true, title: "Monthly price at about 10,000 MAU (SAR)", titleFontSize: 14, titleColor: HEX.dk2,
    valGridLine: { color: "E1E8E3", size: 0.75 }, catGridLine: { style: "none" }, valAxisHidden: true, showLegend: false, ...AXIS,
  });
  card(s, 8.6, 1.6, 4.1, 5.0, "commentary");
  await badge(s, "LuGlobe", 8.9, 1.9);
  text(s, "Only two of these keep data in the Kingdom: Zimam and OCI IAM.", { x: 8.9, y: 2.7, w: 3.5, h: 1.0, fontSize: 16, bold: true, color: C.text2 });
  text(s, "Entra External ID, Cognito and Google Identity Platform are free at this volume but have no Saudi residency. They are the price ceiling for low-compliance consumer apps, so Starter competes on residency, Nafath and Arabic UX, not on price alone.", { x: 8.9, y: 3.8, w: 3.5, h: 2.6, fontSize: 14, color: C.text1 });
  s.addNotes("Competitor prices from the KSA competitor analysis (research date 7 October 2026): OCI IAM External User USD 0.016 per user per month; Yookey EUR 390; Auth0 about USD 700 (secondary source). Converted at USD 3.75 and EUR 4.3.");

  // ===== 5. Dedicated vs market =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Offer and market" });
  s.addText("Dedicated plans sit between specialists and Ping", { placeholder: "title" });
  const ann = Math.round(B["Enterprise S (DR included)"].price * 0.9);
  s.addChart(pres.charts.BAR, [{ name: "SAR per month", labels: ["Zimam Business S", "Cloud-IAM Essential", "Skycloak Business", "Phase Two Premium (from)", "Zimam Business M", "Zimam Enterprise S (annual)", "Ping Essential"], values: [B["Business S"].price, 2130, 2246, 2809, B["Business M"].price, ann, 10938] }], {
    x: 0.6, y: 1.5, w: 7.6, h: 5.1, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [HEX.accent1, HEX.accent6, HEX.accent6, HEX.accent6, HEX.accent1, HEX.accent1, HEX.accent6],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", showTitle: true, title: "Monthly price for a dedicated instance (SAR)", titleFontSize: 14, titleColor: HEX.dk2,
    valGridLine: { color: "E1E8E3", size: 0.75 }, catGridLine: { style: "none" }, valAxisHidden: true, showLegend: false, ...AXIS,
  });
  card(s, 8.6, 1.6, 4.1, 5.0, "commentary");
  await badge(s, "LuScale", 8.9, 1.9);
  text(s, "Business is the anchor of the range; Enterprise lands just under Ping.", { x: 8.9, y: 2.7, w: 3.5, h: 1.0, fontSize: 16, bold: true, color: C.text2 });
  text(s, `Business S/M bracket the managed-Keycloak specialists, none of which host in the Kingdom. Enterprise S with annual prepay (SAR ${sar(ann)} a month) comes in below Ping's entry price and includes a dedicated cell and Jeddah DR.`, { x: 8.9, y: 3.8, w: 3.5, h: 2.6, fontSize: 14, color: C.text1 });
  s.addNotes("Ping PingOne for Customers Essential: USD 35k a year (SAR 131,250). Skycloak, Phase Two and Cloud-IAM prices from their public pages as captured in the competitor analysis; sizing differs between vendors, so this is an anchor, not a like-for-like benchmark.");

  // ===== 6. Price book =====
  pres.addSection({ title: "Price book" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Price book" });
  s.addText("Starter and Business price book", { placeholder: "title" });
  const pb = [
    ["Free", "1 realm, 1,000 MAU, Zimam subdomain, community support", "0"],
    ["Starter 5k", "5,000 MAU, themes, email support", sar(B["Starter 5k MAU"].price)],
    ["Starter 10k", "10,000 MAU", sar(B["Starter 10k MAU"].price)],
    ["Starter 25k", "25,000 MAU", sar(B["Starter 25k MAU"].price)],
    ["Starter 50k", "50,000 MAU; above this, move to Business", sar(B["Starter 50k MAU"].price)],
    ["Business S", "Own Keycloak (2 pods) and database, custom SPIs, custom domain, Nafath connector", sar(B["Business S"].price)],
    ["Business M", "As S, twice the capacity (up to ~25 logins per second)", sar(B["Business M"].price)],
    ["Business L", "As S, 3 pods (up to ~75 logins per second)", sar(B["Business L"].price)],
  ];
  s.addTable(tableRows(["Plan", "Includes", "SAR / month"], pb, [2]), { x: 0.6, y: 1.55, w: 12.1, colW: [2.0, 8.3, 1.8], fontSize: 14, rowH: 0.48, border: { type: "solid", color: HEX.lt1, pt: 1 }, valign: "middle", margin: [0.04, 0.12, 0.04, 0.12] });
  await badge(s, "LuTag", 0.6, 6.05, 0.5, false, false);
  text(s, "Prices exclude 15% VAT. Annual prepay: 10% off. Starter overage is a soft limit: the customer moves to the next band the following month.", { x: 1.25, y: 6.12, w: 11.4, h: 0.5, fontSize: 13, color: C.accent5 });
  s.addNotes("Business sizes are capacity-based: 1 vCPU per 15 password logins per second with 150% headroom, from the Keycloak sizing guide. Token refreshes and client-credential grants are about 8 times cheaper per request.");

  // ===== 7. Enterprise and Gov =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Price book" });
  s.addText("Enterprise: dedicated cells, Gov options extra", { placeholder: "title" });
  const ent = [["S", "3 shared nodes · PostgreSQL 2 OCPU"], ["M", "Keycloak 3 x 4 OCPU · PostgreSQL 4 OCPU"], ["L", "Keycloak 3 x 8 OCPU · PostgreSQL 8 OCPU"]];
  for (let i = 0; i < 3; i++) {
    const y = 1.55 + i * 1.7;
    const p = B[`Enterprise ${ent[i][0]} (DR included)`].price;
    card(s, 0.6, y, 6.3, 1.5, `enterprise ${ent[i][0]}`);
    text(s, `Enterprise ${ent[i][0]}`, { x: 0.9, y: y + 0.2, w: 3, h: 0.45, fontFace: THEME.headFontFace, fontSize: 20, bold: true, color: C.text2 });
    text(s, ent[i][1], { x: 0.9, y: y + 0.75, w: 3.6, h: 0.4, fontSize: 13, color: C.accent5 });
    text(s, `SAR ${sar(p)}`, { x: 4.2, y: y + 0.2, w: 2.45, h: 0.5, fontSize: 22, bold: true, color: C.accent1, align: "right" });
    text(s, `SAR ${sar(p * 12 * 0.9)} a year prepaid`, { x: 3.9, y: y + 0.75, w: 2.75, h: 0.4, fontSize: 12, color: C.accent5, align: "right" });
  }
  card(s, 7.2, 1.55, 5.5, 4.9, "gov options", false);
  await badge(s, "LuShieldCheck", 7.5, 1.8, 0.6, true);
  text(s, "Gov options, per cell", { x: 8.3, y: 1.9, w: 4.2, h: 0.45, fontFace: THEME.headFontFace, fontSize: 20, bold: true, color: C.text2 });
  const gov = [
    ["Dedicated HSM vault", `SAR ${sar(B["Gov: dedicated HSM vault"].price)}`, "or BYOK via External KMS: SAR 500"],
    ["Dedicated Network Firewall", `SAR ${sar(B["Gov: dedicated Network Firewall"].price)}`, "or shared hub firewall: SAR 2,500"],
    ["FastConnect 1 Gbps", `SAR ${sar(B["Gov: FastConnect 1 Gbps"].price)}`, "plus partner cross-connect at cost"],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 2.7 + i * 1.05;
    text(s, gov[i][0], { x: 7.5, y, w: 3.2, h: 0.4, fontSize: 15, bold: true });
    text(s, gov[i][1], { x: 10.4, y, w: 2.0, h: 0.4, fontSize: 15, bold: true, color: C.accent1, align: "right" });
    text(s, gov[i][2], { x: 7.5, y: y + 0.42, w: 4.9, h: 0.4, fontSize: 13, color: C.accent5 });
  }
  text(s, "These options cost Oracle more than a whole Enterprise S cell, so they are never bundled into the base price.", { x: 7.5, y: 5.75, w: 4.9, h: 0.5, fontSize: 12, italic: true, color: C.accent5 });
  s.addNotes(`Gov options at Oracle list price: private vault USD 2,719 a month, Network Firewall USD 2,008, FastConnect 1 Gbps port USD 155. All three together cost SAR ${sar(N.blocks["Gov pack (per dedicated cell)"])} a month. Steer customers to BYOK and the shared hub firewall where their regulator allows it.`);

  // ===== 8. Add-ons =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Price book" });
  s.addText("Add-ons and pass-through costs", { placeholder: "title" });
  const addons = [
    ["Jeddah DR warm standby", "Business S / M / L", `${sar(B["Business S DR add-on"].price)} / ${sar(B["Business M DR add-on"].price)} / ${sar(B["Business L DR add-on"].price)}`],
    ["Extra environment (non-prod, no HA)", "Business", "600"],
    ["Event and SIEM export stream", "Business (included in Enterprise)", "400"],
    ["Premium support, 24/7, 1-hour response", "Business", "20% of plan, min 1,500"],
    ["Nafath connector (customer's own Elm credentials)", "Starter (included in Business+)", "250"],
    ["Custom domain", "Starter (included in Business+)", "75"],
    ["SMS OTP, Nafath and Yakeen fees", "All tiers", "At cost + 10%"],
  ];
  s.addTable(tableRows(["Add-on", "Available on", "SAR / month"], addons, [2]), { x: 0.6, y: 1.55, w: 12.1, colW: [5.6, 4.0, 2.5], fontSize: 14, rowH: 0.52, border: { type: "solid", color: HEX.lt1, pt: 1 }, valign: "middle", margin: [0.04, 0.12, 0.04, 0.12] });
  await badge(s, "LuReceipt", 0.6, 6.0, 0.5, false, false);
  text(s, "Pass-through costs stay outside the plan price, so heavy SMS or Nafath users never erode the margin.", { x: 1.25, y: 6.07, w: 11.4, h: 0.5, fontSize: 13, color: C.accent5 });
  s.addNotes("Nafath and Yakeen credentials are issued to the end organisation by Elm, so Zimam sells the integration, not the data feed.");

  // ===== 9. Managed services =====
  pres.addSection({ title: "Costs" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Costs" });
  s.addText("Oracle runs the heavy lifting, we run Keycloak", { placeholder: "title" });
  const ociRuns = [["LuLayers", "Kubernetes (OKE)", "control plane, add-ons, node upgrades"], ["LuDatabase", "PostgreSQL", "HA, backups, point-in-time restore"], ["LuKeyRound", "Vault and HSM", "keys, secrets, customer-held keys"], ["LuShieldCheck", "WAF, load balancing, SIEM", "Logging Analytics, Cloud Guard"], ["LuWorkflow", "Resource Manager", "Terraform state, audit, drift"]];
  const weRun = [["LuBoxes", "Keycloak + Operator", "no managed Keycloak exists"], ["LuNetwork", "Envoy + cert-manager", "thousands of customer domains"], ["LuReceipt", "Lago billing + ZATCA", "no OCI billing service"], ["LuCpu", "Zimam API, portal, cell agent", "the product itself"]];
  text(s, "OCI managed", { x: 0.6, y: 1.5, w: 5.8, h: 0.4, fontFace: THEME.headFontFace, fontSize: 20, bold: true, color: C.accent1 });
  text(s, "We run", { x: 6.9, y: 1.5, w: 5.8, h: 0.4, fontFace: THEME.headFontFace, fontSize: 20, bold: true, color: C.accent2 });
  for (let i = 0; i < ociRuns.length; i++) {
    const y = 2.05 + i * 0.85;
    await badge(s, ociRuns[i][0], 0.6, y, 0.6, true);
    text(s, ociRuns[i][1], { x: 1.4, y: y + 0.02, w: 5, h: 0.32, fontSize: 15, bold: true });
    text(s, ociRuns[i][2], { x: 1.4, y: y + 0.32, w: 5, h: 0.3, fontSize: 13, color: C.accent5 });
  }
  for (let i = 0; i < weRun.length; i++) {
    const y = 2.05 + i * 0.85;
    await badge(s, weRun[i][0], 6.9, y, 0.6, false, false);
    text(s, weRun[i][1], { x: 7.7, y: y + 0.02, w: 5, h: 0.32, fontSize: 15, bold: true });
    text(s, weRun[i][2], { x: 7.7, y: y + 0.32, w: 5, h: 0.3, fontSize: 13, color: C.accent5 });
  }
  card(s, 6.9, 5.55, 5.8, 0.95, "availability note");
  text(s, "Every service is confirmed live in both Riyadh and Jeddah (checked 7 October 2026).", { x: 7.15, y: 5.7, w: 5.3, h: 0.7, fontSize: 14, color: C.text2, bold: true, valign: "middle" });
  s.addNotes("Managed-first rule: if OCI runs it in both Saudi regions and it meets the requirement, we use it. What we save is operations work (patching, HA, backups, audit evidence), which matters more than invoice cost for a team of one to three.");

  // ===== 10. Building block costs =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Costs" });
  s.addText("What each building block costs per month", { placeholder: "title" });
  const bl = [["Platform (control plane)", N.blocks["Platform (control plane, prod)"]], ["Staging", N.blocks["Staging environment"]], ["Pooled cell base", N.blocks["Pooled cell (fixed base)"]],
    ["+ Business S tenant", N.business["Business S"]], ["+ Business M tenant", N.business["Business M"]], ["+ Business L tenant", N.business["Business L"]],
    ["Enterprise cell S + DR", N.dedicated.S], ["Enterprise cell M + DR", N.dedicated.M], ["Enterprise cell L + DR", N.dedicated.L], ["Gov options, per cell", N.blocks["Gov pack (per dedicated cell)"]]];
  s.addChart(pres.charts.BAR, [{ name: "SAR per month", labels: bl.map((b) => b[0]), values: bl.map((b) => b[1]) }], {
    x: 0.6, y: 1.5, w: 7.9, h: 5.2, barDir: "bar", catAxisOrientation: "maxMin",
    chartColors: [HEX.accent5, HEX.accent5, HEX.accent5, HEX.accent1, HEX.accent1, HEX.accent1, HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent3],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", showTitle: true, title: "OCI list cost, SAR per month", titleFontSize: 14, titleColor: HEX.dk2, valAxisMinVal: 0, valAxisMaxVal: 23000,
    valGridLine: { color: "E1E8E3", size: 0.75 }, catGridLine: { style: "none" }, valAxisHidden: true, showLegend: false, ...AXIS,
  });
  const insights = [
    ["LuServer", `SAR ${sar(N.launch)}`, "a month of infrastructure at launch: platform, staging and one pooled cell"],
    ["LuDatabase", `${N.pg_share}%`, "of a pooled cell is PostgreSQL, the first line to right-size after load tests"],
    ["LuShieldCheck", "Gov > Enterprise S", "the three Gov options cost more than a whole Enterprise S cell"],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 1.6 + i * 1.7;
    card(s, 8.8, y, 3.9, 1.5, `insight ${i + 1}`);
    await badge(s, insights[i][0], 9.05, y + 0.25, 0.55);
    text(s, insights[i][1], { x: 9.8, y: y + 0.22, w: 2.8, h: 0.45, fontSize: 18, bold: true, color: C.accent1 });
    text(s, insights[i][2], { x: 9.8, y: y + 0.65, w: 2.75, h: 0.8, fontSize: 12, color: C.text1 });
  }
  s.addNotes("OCI pay-as-you-go list prices from Oracle's public price API, retrieved 7 October 2026; same price in every commercial region. Free tiers ignored. PostgreSQL memory and HA-replica billing are not published; the model assumes both nodes are billed at compute rates.");

  // ===== 11. Margins =====
  pres.addSection({ title: "Economics" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Economics" });
  s.addText("Pooled tiers clear 70% margin, dedicated near 60%", { placeholder: "title" });
  const mg = [["Starter 10k", "Starter 10k MAU"], ["Business S", "Business S"], ["Business M", "Business M"], ["Business L", "Business L"], ["Business DR add-on", "Business M DR add-on"], ["Enterprise S", "Enterprise S (DR included)"], ["Enterprise M", "Enterprise M (DR included)"], ["Enterprise L", "Enterprise L (DR included)"], ["Gov HSM vault", "Gov: dedicated HSM vault"], ["Gov Network Firewall", "Gov: dedicated Network Firewall"]];
  s.addChart(pres.charts.BAR, [{ name: "Gross margin", labels: mg.map((m) => m[0]), values: mg.map((m) => B[m[1]].margin / 100) }], {
    x: 0.6, y: 1.5, w: 7.9, h: 5.2, barDir: "bar", catAxisOrientation: "maxMin",
    chartColors: [HEX.accent6, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent1, HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent3, HEX.accent3],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0%", showTitle: true, title: "Infrastructure gross margin by plan", titleFontSize: 14, titleColor: HEX.dk2,
    valAxisMinVal: 0, valAxisMaxVal: 1.1, valGridLine: { color: "E1E8E3", size: 0.75 }, catGridLine: { style: "none" }, valAxisHidden: true, showLegend: false, ...AXIS,
  });
  const targets = [
    ["Target ≥ 70%", "Starter and Business, on pooled cells. Met with room to spare."],
    ["Target ≥ 55%", "Enterprise dedicated cells carry single-tenant fixed cost, as with Phase Two and Cloud-IAM. Met."],
    ["Pass-through", "Gov security options run at about 25% on purpose: mostly Oracle cost. The Enterprise contract carries the margin."],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 1.6 + i * 1.7;
    card(s, 8.8, y, 3.9, 1.5, `target ${i + 1}`);
    text(s, targets[i][0], { x: 9.1, y: y + 0.2, w: 3.4, h: 0.4, fontSize: 18, bold: true, color: i === 2 ? C.accent3 : C.accent1 });
    text(s, targets[i][1], { x: 9.1, y: y + 0.62, w: 3.4, h: 0.8, fontSize: 12, color: C.text1 });
  }
  s.addNotes("Gross margin here is price minus OCI infrastructure cost only. Support staff, the SOC partner and certifications sit in fixed cost (next slide).");

  // ===== 12. Break-even =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Economics" });
  s.addText("Business funds launch; Enterprise funds the SOC", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [
    { name: "Monthly fixed cost", labels: ["1. Launch", "2. + 24/7 SOC", "3. + team of 3"], values: [33.2, 58.2, 148.2] },
    { name: "Contribution from example mix", labels: ["1. Launch", "2. + 24/7 SOC", "3. + team of 3"], values: [34.3, 60.9, 148.8] },
  ], {
    x: 0.6, y: 1.5, w: 6.6, h: 5.2, barDir: "col", barGapWidthPct: 60, chartColors: [HEX.accent5, HEX.accent1],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0.0", showTitle: true, title: "SAR thousand per month", titleFontSize: 14, titleColor: HEX.dk2,
    valGridLine: { color: "E1E8E3", size: 0.75 }, catGridLine: { style: "none" }, valAxisHidden: true, showLegend: true, legendPos: "b", legendFontSize: 12, legendFontFace: "+mn-lt", legendColor: HEX.accent5, ...AXIS,
  });
  const mixes = [
    ["1", "Launch: SAR 33k fixed", "10 Business M + 25 Starter 10k"],
    ["2", "+ SOC partner: SAR 58k", "Phase 1 mix + 4 Enterprise S"],
    ["3", "+ team of 3: SAR 148k", "Phase 2 mix + 2 Enterprise M + 20 Business M + 30 Starter 10k"],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 1.6 + i * 1.7;
    card(s, 7.6, y, 5.1, 1.5, `mix ${i + 1}`);
    s.addShape(pres.shapes.OVAL, { x: 7.85, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { type: "none" }, objectName: `step ${i + 1}` });
    text(s, mixes[i][0], { x: 7.85, y: y + 0.3, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
    text(s, mixes[i][1], { x: 8.6, y: y + 0.22, w: 3.9, h: 0.4, fontSize: 16, bold: true, color: C.text2 });
    text(s, mixes[i][2], { x: 8.6, y: y + 0.65, w: 3.9, h: 0.75, fontSize: 13, color: C.text1 });
  }
  s.addNotes("Fixed cost: infrastructure SAR 11.7k plus placeholders for pentests (SAR 10k a month), ISO 27001 (7.5k), ZATCA provider, insurance and tools (4k). SOC partner placeholder SAR 25k. Team placeholder SAR 30k per person fully loaded. Replace placeholders with quotes. Rule: do not sign the SOC partner before the first Enterprise or Gov contract.");

  // ===== 13. Levers =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Economics" });
  s.addText("Six levers to lift margin", { placeholder: "title" });
  const levers = [
    ["LuHandshake", "Oracle annual commit", "Universal Credits discount on every line, once monthly spend is predictable"],
    ["LuCpu", "Ampere A1 for Keycloak", "About 30% cheaper per vCPU than E5; validate login throughput in load tests"],
    ["LuDatabase", "Right-size PostgreSQL", `${N.pg_share}% of a pooled cell today; 2 OCPU handles about 300 logins per second`],
    ["LuArchive", "Archive logs after 90 days", "Logging Analytics archive costs USD 14.6 per unit, against 372 active"],
    ["LuNetwork", "Shared hub firewall", "One USD 2,008 firewall across all Gov cells instead of one each"],
    ["LuKeyRound", "BYOK before private vault", "USD 3 per key version against USD 2,719 a month for a private vault"],
  ];
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.1, y = 1.6 + row * 2.6;
    card(s, x, y, 3.85, 2.35, `lever ${i + 1}`);
    await badge(s, levers[i][0], x + 0.3, y + 0.3);
    text(s, levers[i][1], { x: x + 0.3, y: y + 1.05, w: 3.3, h: 0.4, fontSize: 17, bold: true, color: C.text2 });
    text(s, levers[i][2], { x: x + 0.3, y: y + 1.5, w: 3.3, h: 0.75, fontSize: 13, color: C.text1 });
  }
  s.addNotes("Levers 3 and 2 depend on load tests; lever 1 needs about six months of spend history; levers 5 and 6 come up in the first Gov sales conversations.");

  // ===== 14. Open items =====
  pres.addSection({ title: "Decisions" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Decisions" });
  s.addText("Settle four items before publishing prices", { placeholder: "title" });
  const risks = [
    ["LuDatabase", "PostgreSQL pricing", "Oracle doesn't publish the memory price or how HA replicas are billed. It is our largest cost line.", "Oracle sales call, cost estimator"],
    ["LuReceipt", "Third-party costs", "SOC partner, pentests, ISO certification and ZATCA provider are placeholders.", "Get three quotes each"],
    ["LuGauge", "Pooled cell capacity", "200 Starter realms and 40 Business instances per cell are estimates.", "Load tests on Keycloak"],
    ["LuTriangleAlert", "Brand name", "zimam.com, .sa, .io, .ai and .dev are taken; zimam.dev is an AI agent governance product.", "SAIP trademark search; zimamid.com and .sa are free"],
  ];
  for (let i = 0; i < 4; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.6 + row * 2.6;
    card(s, x, y, 5.95, 2.35, `risk ${i + 1}`);
    await badge(s, risks[i][0], x + 0.3, y + 0.3, 0.6, i === 3);
    text(s, risks[i][1], { x: x + 1.1, y: y + 0.38, w: 4.6, h: 0.45, fontSize: 18, bold: true, color: C.text2 });
    text(s, risks[i][2], { x: x + 0.3, y: y + 1.05, w: 5.35, h: 0.75, fontSize: 14, color: C.text1 });
    text(s, "Next: " + risks[i][3], { x: x + 0.3, y: y + 1.8, w: 5.35, h: 0.4, fontSize: 13, bold: true, color: C.accent1 });
  }
  s.addNotes("Domain check (7 October 2026): zimam.com (since 2005, parked), zimam.sa and zimam.com.sa (Saudi companies), zimam.io, zimam.co, zimam.me, zimam.ai (regional AI commerce analytics), getzimam.com (Saudi COD e-commerce) and zimam.dev (open-source AI agent governance) are taken. Available: zimamid.com, zimamid.sa, zimamcloud.com, zimamcloud.sa, zimamidentity.com, usezimam.com.");

  // ===== 15. Decisions =====
  s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Decisions" });
  text(s, "Decisions we need today", { x: 0.8, y: 0.8, w: 8, h: 0.9, fontFace: THEME.headFontFace, fontSize: 40, bold: true, color: C.background1 });
  const asks = [
    ["Approve the price book as v1", "Starter per MAU band, Business and Enterprise per instance, in SAR, published after the open items close"],
    ["Approve the phased cost plan", "Launch at SAR 33k a month before salaries; add the SOC partner only with the first Enterprise contract"],
    ["Start the four open items now", "Oracle pricing call, third-party quotes, load tests, trademark search and fallback domains"],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 2.1 + i * 1.5;
    s.addShape(pres.shapes.OVAL, { x: 0.8, y, w: 0.6, h: 0.6, fill: { color: C.accent1 }, line: { type: "none" }, objectName: `decision ${i + 1}` });
    text(s, String(i + 1), { x: 0.8, y, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle" });
    text(s, asks[i][0], { x: 1.7, y: y - 0.02, w: 6.6, h: 0.45, fontSize: 22, bold: true, color: C.background1 });
    text(s, asks[i][1], { x: 1.7, y: y + 0.48, w: 6.6, h: 0.75, fontSize: 15, color: C.accent6 });
  }
  s.addNotes("Close by confirming owners and dates for the open items.");

  await pres.writeFile({ fileName: OUT });
  // pptxgenjs can't write theme colours; apply_theme.js (from the pptx skill) does.
  if (process.env.PPTX_SKILL) {
    const { applyTheme } = require(path.join(process.env.PPTX_SKILL, "scripts", "apply_theme.js"));
    await applyTheme(OUT, THEME);
  } else {
    console.warn("PPTX_SKILL not set: theme colours not applied");
  }
  console.log("wrote " + OUT);
}

build().catch((e) => { console.error(e); process.exit(1); });
