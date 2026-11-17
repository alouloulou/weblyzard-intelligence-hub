export interface DocumentEntity {
  organizations: string[];
  locations: string[];
  technologies: string[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  category: string;
  text: string;
  entities: DocumentEntity;
  sentiment: "positive" | "neutral" | "challenging";
  sentiment_score: number;
}

export const INITIAL_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "doc_01",
    title: "Austrian National Hydrogen Strategy 2030: Electrolysis Capacity & Industrial Roadmap",
    source: "BMK (Austrian Federal Ministry for Climate Action, Environment, Energy)",
    date: "2025-11-14",
    url: "https://www.bmk.gv.at/themen/energie/wasserstoff.html",
    category: "Hydrogen & Storage",
    text: "Austria's revised National Hydrogen Strategy targets 1 GW of domestic electrolysis capacity by 2030, scaling up to 4 GW by 2040. The strategic focus prioritizes hard-to-abate heavy industries—primarily steel production in Linz and chemical processing in Upper Austria and Lower Austria. The Austrian government has allocated €820 million in CAPEX subsidies under the EU Hydrogen Bank umbrella. Due to high Alpine grid stability and surplus seasonal hydropower, regional clusters along the Danube corridor are designated as early hydrogen production hubs. Import corridors via the SouthH2 Corridor connecting Italy, Austria, and Southern Germany will supply an estimated 60% of baseline industrial demand by 2035.",
    entities: {
      organizations: ["BMK", "EU Hydrogen Bank", "voestalpine", "VERBUND"],
      locations: ["Austria", "Linz", "Upper Austria", "Lower Austria", "Danube Corridor", "Italy", "Germany"],
      technologies: ["Electrolysis", "Green Hydrogen", "SouthH2 Corridor", "Hydropower"]
    },
    sentiment: "positive",
    sentiment_score: 0.72
  },
  {
    id: "doc_02",
    title: "Austrian Power Grid (APG) Investment Plan: €9 Billion for High-Voltage Decarbonization",
    source: "APG (Austrian Power Grid)",
    date: "2026-01-20",
    url: "https://www.apg.at/en/grid/grid-development-plan/",
    category: "Grid Infrastructure",
    text: "Austrian Power Grid (APG) confirmed a landmark €9 billion grid modernization roadmap through 2034 to integrate intermittent wind and solar generation. Current transmission bottlenecks frequently force redispatch interventions, costing Austrian grid users over €140 million annually. Key projects include reinforcing the 380 kV transmission ring across Salzburg, Upper Austria, and Styria, alongside installing synchronous condensers to maintain grid inertia. APG highlights that grid connection requests for ground-mounted photovoltaics have surged by 310% in Burgenland and Lower Austria, requiring rapid regulatory approval for grid-scale battery storage co-location.",
    entities: {
      organizations: ["APG (Austrian Power Grid)", "E-Control"],
      locations: ["Salzburg", "Upper Austria", "Styria", "Burgenland", "Lower Austria", "Austria"],
      technologies: ["380 kV High-Voltage Ring", "Synchronous Condensers", "Battery Storage", "Grid-Scale Solar"]
    },
    sentiment: "challenging",
    sentiment_score: -0.28
  },
  {
    id: "doc_03",
    title: "EU Carbon Border Adjustment Mechanism (CBAM): Phase 2 Compliance for Austrian Heavy Industry",
    source: "European Commission - DG Climate Action",
    date: "2025-12-05",
    url: "https://ec.europa.eu/commission/presscorner/detail/en/cbam_report_2025",
    category: "Policy & Carbon Pricing",
    text: "The European Commission's transition of CBAM into its definitive compliance phase imposes direct carbon pricing obligations on imports of cement, iron, steel, aluminum, fertilizers, and hydrogen. Austrian manufacturing leaders reported high administrative overhead during trial reporting, but economic models from WIFO indicate CBAM will safeguard European steel producers against carbon leakage from non-EU jurisdictions with unpriced emissions. Importers must purchase digital CBAM certificates corresponding to the EU ETS weekly average auction price, currently stabilizing around €78 per metric ton of CO2 equivalent.",
    entities: {
      organizations: ["European Commission", "WIFO", "DG Climate Action"],
      locations: ["European Union", "Austria", "Brussels"],
      technologies: ["CBAM", "EU ETS", "Carbon Border Tariff", "Digital Certificates"]
    },
    sentiment: "neutral",
    sentiment_score: 0.15
  },
  {
    id: "doc_04",
    title: "VERBUND Pumped Storage & Alpine Battery Hybridization in Kaprun",
    source: "VERBUND AG Sustainability Dispatch",
    date: "2026-02-02",
    url: "https://www.verbund.com/en-at/about-verbund/power-plants/pumped-storage-plants",
    category: "Hydrogen & Storage",
    text: "VERBUND AG, Austria's largest electricity provider, has completed the commissioning of its hybrid storage facility at the Limberg III power plant complex in Kaprun. Combining 480 MW of high-head pumped hydro capacity with an adjacent 60 MW / 120 MWh lithium-iron-phosphate (LFP) utility battery system, the facility provides millisecond primary frequency response followed by multi-hour bulk energy storage. VERBUND CEO highlighted that Alpine pumped storage acts as the 'green battery of Central Europe', balancing export fluctuations between the German wind belt and Austrian Alpine peak demand.",
    entities: {
      organizations: ["VERBUND AG", "Limberg III"],
      locations: ["Kaprun", "Salzburg", "Austria", "Germany", "Alps"],
      technologies: ["Pumped Hydro", "LFP Battery Storage", "Frequency Containment Reserve (FCR)"]
    },
    sentiment: "positive",
    sentiment_score: 0.88
  },
  {
    id: "doc_05",
    title: "Deep Geothermal District Heating in the Vienna Basin: Wien Energie & OMV Aderklaa Project",
    source: "Wien Energie & OMV Media Center",
    date: "2026-01-10",
    url: "https://www.wienenergie.at/ueber-uns/unternehmen/presse/geothermie-aderklaa/",
    category: "Geothermal & Heating",
    text: "Wien Energie and OMV have reached a final investment decision for the 'GeoVienna' deep geothermal extraction facility in Aspern and the Aderklaa reservoir. Drilling into permeable dolomite strata at depths exceeding 3,000 meters taps into hot thermal brine at 105°C. The geothermal plant will feed up to 120 MW of zero-emission thermal energy directly into Vienna's district heating network, supplying heat to more than 125,000 Viennese households by 2028. This replaces approximately 130 million cubic meters of fossil natural gas per year, marking Austria's largest urban municipal decarbonization milestone.",
    entities: {
      organizations: ["Wien Energie", "OMV", "City of Vienna"],
      locations: ["Vienna", "Aspern", "Aderklaa", "Vienna Basin", "Austria"],
      technologies: ["Deep Geothermal", "District Heating", "Dolomite Brine Heat Exchangers"]
    },
    sentiment: "positive",
    sentiment_score: 0.82
  },
  {
    id: "doc_06",
    title: "Critical Raw Materials Act: Austria's Lithium Mining in Wolfsberg & Supply Chain Resilience",
    source: "Austrian Mining Association & European Parliament",
    date: "2025-10-18",
    url: "https://www.carinthia.gv.at/lithium-wolfsberg-project",
    category: "Industrial Decarbonization",
    text: "Under the EU Critical Raw Materials Act (CRMA), domestic European extraction benchmarks require at least 10% of critical minerals to be mined within EU borders by 2030. The Wolfsberg Lithium Project in Carinthia, Austria, received preliminary environmental fast-track authorization for underground spodumene extraction. However, local municipal stakeholders and environmental NGOs have raised concerns over groundwater contamination risks in the Lavanttal valley and demanded closed-loop hydrometallurgical refining processes. The project aims to supply battery-grade lithium hydroxide for approximately 500,000 electric vehicle battery packs annually.",
    entities: {
      organizations: ["European Parliament", "Austrian Mining Association", "Global Lithium Corp"],
      locations: ["Carinthia", "Wolfsberg", "Lavanttal", "Austria", "European Union"],
      technologies: ["Lithium Extraction", "Spodumene Mining", "EV Battery Chemistry", "Hydrometallurgy"]
    },
    sentiment: "challenging",
    sentiment_score: -0.18
  },
  {
    id: "doc_07",
    title: "Austrian PV Expansion Milestone: Solar Rooftop Cap Reached with Grid Curtailment Concerns",
    source: "Photovoltaic Austria (PV Austria) Industry Review",
    date: "2026-02-12",
    url: "https://www.pvaustria.at/statistiken-2025/",
    category: "Renewable Generation",
    text: "Austria recorded a cumulative installed solar PV capacity exceeding 7.5 GWp by the close of 2025, meeting the 2030 Renewable Expansion Act (EAG) solar targets five years ahead of schedule. However, rapid deployment has triggered negative electricity prices during sunny midday intervals on the EPEX SPOT power exchange, reaching minus €45/MWh in May 2025. Distribution System Operators (DSOs) in Lower Austria and Upper Austria were forced to curtail over 180 GWh of residential and commercial solar feed-in to prevent transformer overload, highlighting an urgent need for smart net-metering and dynamic local tariffs.",
    entities: {
      organizations: ["PV Austria", "EAG (Renewable Expansion Act)", "EPEX SPOT"],
      locations: ["Lower Austria", "Upper Austria", "Austria", "Vienna"],
      technologies: ["Solar Photovoltaics (PV)", "Grid Curtailment", "Negative Electricity Prices", "Smart Inverters"]
    },
    sentiment: "neutral",
    sentiment_score: 0.05
  },
  {
    id: "doc_08",
    title: "Industrial Steel Decarbonization: voestalpine Greentec Steel Electric Arc Furnaces in Linz & Donawitz",
    source: "voestalpine AG Corporate Strategy",
    date: "2026-01-29",
    url: "https://www.voestalpine.com/greentecsteel/en/",
    category: "Industrial Decarbonization",
    text: "Steelmaker voestalpine has commenced civil construction on two hybrid electric arc furnaces (EAFs) in Linz and Donawitz under its 'greentec steel' capital program valued at €1.5 billion. The replacement of one traditional coal-fired blast furnace at each site by 2027 will slash Austria's total national greenhouse gas emissions by roughly 5%—representing the single largest industrial climate protection project in the country. To power the EAFs, voestalpine secured long-term Power Purchase Agreements (PPAs) for 100% renewable electricity with VERBUND and local wind operators in Burgenland.",
    entities: {
      organizations: ["voestalpine AG", "VERBUND", "Greentec Steel"],
      locations: ["Linz", "Donawitz", "Styria", "Upper Austria", "Burgenland", "Austria"],
      technologies: ["Electric Arc Furnace (EAF)", "Direct Reduced Iron (DRI)", "Power Purchase Agreements (PPA)"]
    },
    sentiment: "positive",
    sentiment_score: 0.85
  },
  {
    id: "doc_09",
    title: "Central European Heat Pump Adoption & Grid Interconnection Bottlenecks",
    source: "European Heat Pump Association (EHPA)",
    date: "2025-11-28",
    url: "https://www.ehpa.org/market-data-2025/",
    category: "Geothermal & Heating",
    text: "Residential and commercial heat pump installations in Austria and Southern Germany surpassed 95,000 units in 2025, driven by the federal 'Raus aus Öl und Gas' subsidy framework covering up to 75% of boiler replacement costs. Nevertheless, the rapid increase in winter peak load presents challenges for low-voltage municipal distribution grids. Municipal utilities (Stadtwerke) are implementing automated load-shedding protocols under §14a EnWG regulations, allowing DSOs to temporarily throttle heat pump power draws during severe thermal peaks to safeguard local substation fuses.",
    entities: {
      organizations: ["EHPA", "BMK", "Stadtwerke"],
      locations: ["Austria", "Germany", "Vienna", "Innsbruck"],
      technologies: ["Heat Pumps", "Grid Throttling §14a", "Electrification of Heat", "Peak Shaving"]
    },
    sentiment: "neutral",
    sentiment_score: 0.12
  },
  {
    id: "doc_10",
    title: "Carbon Capture, Utilization & Storage (CCUS) Framework in the Austrian Cement Industry",
    source: "W&P Zement & Holcim Central Europe Consortium",
    date: "2026-02-08",
    url: "https://www.zement.at/klimaneutralitaet-2050/",
    category: "Industrial Decarbonization",
    text: "Austria's cement producers, led by W&P Zement in Carinthia and Rohrdorfer in Upper Austria, presented an updated industrial CCUS roadmap. Because process emissions from calcination cannot be eliminated solely via electrification, carbon capture remains mandatory to reach net zero by 2040. The consortium proposes building a dedicated CO2 railway transport corridor connecting Austrian clinker plants to maritime storage hubs in the North Sea (Northern Lights project) and depleted gas reservoirs in the Adriatic Sea. Regulatory clarity regarding Austrian bans on geological carbon storage remains a key legislative battleground in parliament.",
    entities: {
      organizations: ["W&P Zement", "Rohrdorfer", "Holcim", "Northern Lights Consortium"],
      locations: ["Carinthia", "Upper Austria", "North Sea", "Adriatic Sea", "Austria", "Norway"],
      technologies: ["CCUS (Carbon Capture & Storage)", "Amine Scrubbing", "CO2 Rail Logistics", "Geological Storage"]
    },
    sentiment: "challenging",
    sentiment_score: -0.15
  },
  {
    id: "doc_11",
    title: "Danube Hydrokinetic & Run-of-River Power Optimization with Predictive AI Modeling",
    source: "Institute of Water Management & VERBUND Hydro Power",
    date: "2025-12-19",
    url: "https://www.verbund.com/en-at/about-verbund/power-plants/run-of-river-power-plants",
    category: "Renewable Generation",
    text: "VERBUND Hydro Power integrated neural hydro-meteorological forecasting models across its 10 run-of-river power plants on the Austrian Danube (including Aschach, Ottensheim-Wilhering, and Freudenau). Combining satellite snowpack observations in the Bavarian Alps with upstream telemetry, the predictive AI models anticipate discharge variations 72 hours in advance with 94.2% accuracy. This automated dispatch optimization yields an estimated 115 GWh in additional annual electricity generation without expanding turbine physical infrastructure, helping stabilize seasonal base load.",
    entities: {
      organizations: ["VERBUND Hydro Power", "Institute of Water Management"],
      locations: ["Danube", "Aschach", "Freudenau", "Vienna", "Bavaria", "Austria"],
      technologies: ["Run-of-River Hydro", "Predictive AI Forecasting", "Turbine Telemetry", "Discharge Modeling"]
    },
    sentiment: "positive",
    sentiment_score: 0.76
  },
  {
    id: "doc_12",
    title: "Wind Energy Expansion in Eastern Austria: Repowering Bottlenecks & Biodiversity Guidelines",
    source: "IG Windkraft Austria",
    date: "2026-01-14",
    url: "https://www.igwindkraft.at/fakten-ausbau-2025/",
    category: "Renewable Generation",
    text: "Burgenland and Lower Austria continue to host over 90% of Austria's onshore wind capacity, with repowering projects replacing legacy 1.5 MW turbines with modern 6.2 MW multi-megawatt systems. While repowering triples energy yield on existing turbine footprints, environmental licensing procedures under Nature Protection Directives average 4.2 years per wind park. IG Windkraft urges federal zoning harmonization and AI-powered radar collision-avoidance systems for red kites and white-tailed eagles to expedite pending permitting queues across the Parndorfer Platte.",
    entities: {
      organizations: ["IG Windkraft", "Austrian Wind Energy Association", "Burgenland Energie"],
      locations: ["Burgenland", "Lower Austria", "Parndorfer Platte", "Austria"],
      technologies: ["Onshore Wind", "Turbine Repowering", "Avian Collision Radar", "Environmental Fast-Tracking"]
    },
    sentiment: "neutral",
    sentiment_score: 0.08
  }
];
