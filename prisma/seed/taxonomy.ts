/**
 * CardIntel — Network, Category, Synonym & Source Authority Seeds
 */

// ---------------------------------------------------------------------------
// Networks
// ---------------------------------------------------------------------------

export interface NetworkSeed {
  name: string;
  slug: string;
  type: "RUPAY" | "VISA" | "MASTERCARD" | "AMEX" | "DINERS" | "OTHER";
  description?: string;
}

export const networks: NetworkSeed[] = [
  { name: "RuPay", slug: "rupay", type: "RUPAY", description: "Indian domestic card network by NPCI. Supports UPI-linked credit cards." },
  { name: "Visa", slug: "visa", type: "VISA", description: "Global payment network." },
  { name: "Mastercard", slug: "mastercard", type: "MASTERCARD", description: "Global payment network." },
  { name: "American Express", slug: "amex", type: "AMEX", description: "Premium card network. Also a direct issuer in India." },
  { name: "Diners Club", slug: "diners-club", type: "DINERS", description: "Premium card network owned by Discover. Issued in India primarily by HDFC Bank." },
];

// ---------------------------------------------------------------------------
// Categories (Card Product Types)
// ---------------------------------------------------------------------------

export interface CategorySeed {
  name: string;
  slug: string;
  type: string;
  iconName: string;
  displayOrder: number;
  description: string;
}

export const categories: CategorySeed[] = [
  { name: "Cashback", slug: "cashback", type: "CASHBACK", iconName: "coins", displayOrder: 1, description: "Cards that return a percentage of spend as cashback" },
  { name: "Rewards", slug: "rewards", type: "REWARDS", iconName: "gift", displayOrder: 2, description: "Cards that earn reward points on spending" },
  { name: "Travel", slug: "travel", type: "TRAVEL", iconName: "plane", displayOrder: 3, description: "Cards with travel benefits, miles, and airport lounge access" },
  { name: "Fuel", slug: "fuel", type: "FUEL", iconName: "fuel", displayOrder: 4, description: "Cards with fuel surcharge waiver and fuel rewards" },
  { name: "Shopping", slug: "shopping", type: "SHOPPING", iconName: "shopping-cart", displayOrder: 5, description: "Cards optimized for online and offline shopping" },
  { name: "Dining", slug: "dining", type: "DINING", iconName: "utensils", displayOrder: 6, description: "Cards with dining rewards and food delivery benefits" },
  { name: "UPI", slug: "upi", type: "UPI", iconName: "smartphone", displayOrder: 7, description: "RuPay cards that can be linked to UPI for credit-on-UPI" },
  { name: "Lifetime Free", slug: "lifetime-free", type: "ENTRY_LEVEL", iconName: "badge-check", displayOrder: 8, description: "Cards with zero joining and annual fees forever" },
  { name: "Premium", slug: "premium", type: "PREMIUM", iconName: "crown", displayOrder: 9, description: "High-end cards with premium benefits and higher fees" },
  { name: "Super Premium", slug: "super-premium", type: "SUPER_PREMIUM", iconName: "sparkles", displayOrder: 10, description: "Ultra-premium/invitation-only cards" },
  { name: "Railway", slug: "railway", type: "RAILWAY", iconName: "train-front", displayOrder: 11, description: "Cards with IRCTC booking rewards and railway benefits" },
  { name: "Hotel", slug: "hotel", type: "HOTEL", iconName: "hotel", displayOrder: 12, description: "Cards with hotel loyalty benefits, free nights, and status" },
  { name: "Forex", slug: "forex", type: "FOREX", iconName: "globe", displayOrder: 13, description: "Cards with zero or low forex markup for international use" },
  { name: "FD-Backed / Secured", slug: "fd-backed", type: "SECURED", iconName: "shield", displayOrder: 14, description: "Cards secured against fixed deposits" },
  { name: "Business", slug: "business", type: "BUSINESS", iconName: "briefcase", displayOrder: 15, description: "Cards designed for business expenses" },
  { name: "Co-Branded", slug: "co-branded", type: "CO_BRANDED", iconName: "link", displayOrder: 16, description: "Cards co-branded with specific merchants or brands" },
  { name: "Airline", slug: "airline", type: "AIRLINE", iconName: "plane-takeoff", displayOrder: 17, description: "Cards co-branded with airlines for miles earning" },
  { name: "Metal", slug: "metal", type: "METAL", iconName: "credit-card", displayOrder: 18, description: "Metal-bodied premium cards" },
  { name: "Student", slug: "student", type: "STUDENT", iconName: "graduation-cap", displayOrder: 19, description: "Cards designed for students and young adults" },
  { name: "Salary", slug: "salary", type: "SALARY", iconName: "wallet", displayOrder: 20, description: "Cards offered to salary account holders" },
  { name: "Entertainment", slug: "entertainment", type: "ENTERTAINMENT", iconName: "tv", displayOrder: 21, description: "Cards with entertainment and subscription benefits" },
  { name: "Lifestyle", slug: "lifestyle", type: "LIFESTYLE", iconName: "heart", displayOrder: 22, description: "General lifestyle cards with varied benefits" },
  { name: "Fintech", slug: "fintech", type: "FINTECH", iconName: "zap", displayOrder: 23, description: "Cards from fintech/app-led brands" },
  { name: "Virtual", slug: "virtual", type: "VIRTUAL", iconName: "monitor-smartphone", displayOrder: 24, description: "Virtual-only credit cards" },
  { name: "Corporate", slug: "corporate", type: "CORPORATE", iconName: "building-2", displayOrder: 25, description: "Cards for corporate expense management" },
  { name: "Defence", slug: "defence", type: "DEFENCE", iconName: "shield-check", displayOrder: 26, description: "Cards designed for defence personnel" },
  { name: "Entry Level", slug: "entry-level", type: "ENTRY_LEVEL", iconName: "log-in", displayOrder: 27, description: "Basic cards for first-time credit card users" },
  { name: "Standard", slug: "standard", type: "STANDARD", iconName: "credit-card", displayOrder: 28, description: "Standard credit cards" },
];

// ---------------------------------------------------------------------------
// Synonyms (Search synonym dictionary)
// ---------------------------------------------------------------------------

export interface SynonymSeed {
  term: string;
  synonyms: string[];
  category: string;
}

export const synonyms: SynonymSeed[] = [
  // Merchants → categories
  { term: "Swiggy", synonyms: ["food delivery", "food ordering", "dining", "online food"], category: "merchant" },
  { term: "Zomato", synonyms: ["food delivery", "food ordering", "dining", "online food"], category: "merchant" },
  { term: "Amazon", synonyms: ["online shopping", "e-commerce", "shopping"], category: "merchant" },
  { term: "Flipkart", synonyms: ["online shopping", "e-commerce", "shopping"], category: "merchant" },
  { term: "Myntra", synonyms: ["fashion", "online shopping", "clothing"], category: "merchant" },
  { term: "IRCTC", synonyms: ["railway", "train booking", "railway ticket"], category: "merchant" },

  // Abbreviations
  { term: "LTF", synonyms: ["lifetime free", "zero annual fee", "no annual fee", "free forever"], category: "abbreviation" },
  { term: "UPI", synonyms: ["RuPay UPI", "credit on UPI", "UPI credit card"], category: "abbreviation" },
  { term: "SBI", synonyms: ["State Bank of India", "SBI Card"], category: "abbreviation" },
  { term: "HDFC", synonyms: ["HDFC Bank"], category: "abbreviation" },
  { term: "ICICI", synonyms: ["ICICI Bank"], category: "abbreviation" },
  { term: "BoB", synonyms: ["Bank of Baroda", "BOBCARD"], category: "abbreviation" },
  { term: "PNB", synonyms: ["Punjab National Bank"], category: "abbreviation" },

  // Concepts
  { term: "zero forex", synonyms: ["0% forex markup", "no forex fee", "no foreign transaction fee", "zero foreign currency markup"], category: "concept" },
  { term: "airport lounge", synonyms: ["lounge access", "domestic lounge", "international lounge", "Priority Pass"], category: "concept" },
  { term: "fuel surcharge waiver", synonyms: ["fuel benefit", "petrol benefit", "fuel card"], category: "concept" },
  { term: "cashback", synonyms: ["cash back", "money back", "statement credit"], category: "concept" },
  { term: "reward points", synonyms: ["rewards", "points", "loyalty points"], category: "concept" },
  { term: "secured card", synonyms: ["FD card", "fixed deposit card", "FD-backed", "deposit card"], category: "concept" },
  { term: "travel card", synonyms: ["travel credit card", "miles card", "airline card", "frequent flyer"], category: "concept" },
  { term: "premium card", synonyms: ["super premium", "luxury card", "high-end card", "metal card"], category: "concept" },
  { term: "low income", synonyms: ["low salary", "entry level", "beginner", "first card", "basic card"], category: "concept" },

  // Fuel brands
  { term: "IndianOil", synonyms: ["IOCL", "Indian Oil"], category: "fuel" },
  { term: "HPCL", synonyms: ["Hindustan Petroleum", "HP Petrol"], category: "fuel" },
  { term: "BPCL", synonyms: ["Bharat Petroleum", "BP Petrol"], category: "fuel" },

  // Hotel brands
  { term: "Marriott", synonyms: ["Bonvoy", "Marriott Bonvoy"], category: "hotel" },
  { term: "Taj", synonyms: ["Taj Hotels", "IHCL", "Indian Hotels"], category: "hotel" },
  { term: "ITC Hotels", synonyms: ["ITC", "ITC Welcom"], category: "hotel" },
];

// ---------------------------------------------------------------------------
// Source Authority Rules (configurable priority)
// ---------------------------------------------------------------------------

export interface SourceAuthorityRuleSeed {
  sourceType: string;
  authorityScore: number;
  freshnessDecayDays: number;
  description: string;
}

export const sourceAuthorityRules: SourceAuthorityRuleSeed[] = [
  { sourceType: "OFFICIAL_MITC", authorityScore: 100, freshnessDecayDays: 180, description: "Official Most Important Terms & Conditions" },
  { sourceType: "OFFICIAL_FEE_SCHEDULE", authorityScore: 98, freshnessDecayDays: 180, description: "Official fee schedule" },
  { sourceType: "OFFICIAL_BANK_PAGE", authorityScore: 95, freshnessDecayDays: 90, description: "Official bank product page" },
  { sourceType: "OFFICIAL_TERMS", authorityScore: 93, freshnessDecayDays: 180, description: "Official terms and conditions" },
  { sourceType: "OFFICIAL_APPLICATION_PAGE", authorityScore: 90, freshnessDecayDays: 60, description: "Official application page" },
  { sourceType: "RBI", authorityScore: 90, freshnessDecayDays: 365, description: "Reserve Bank of India" },
  { sourceType: "NPCI", authorityScore: 88, freshnessDecayDays: 365, description: "National Payments Corporation of India" },
  { sourceType: "ANNUAL_REPORT", authorityScore: 85, freshnessDecayDays: 365, description: "Bank annual report" },
  { sourceType: "INVESTOR_PRESENTATION", authorityScore: 83, freshnessDecayDays: 180, description: "Investor presentation" },
  { sourceType: "REGULATORY_NOTICE", authorityScore: 80, freshnessDecayDays: 365, description: "Regulatory notice" },
  { sourceType: "SECONDARY_REPUTABLE_SOURCE", authorityScore: 60, freshnessDecayDays: 60, description: "Reputable third-party" },
  { sourceType: "EXTERNAL_DATABASE", authorityScore: 50, freshnessDecayDays: 30, description: "Third-party database" },
];

// ---------------------------------------------------------------------------
// Tax Configuration
// ---------------------------------------------------------------------------

export interface TaxConfigSeed {
  taxType: string;
  rate: string;
  effectiveFrom: string;
  description: string;
}

export const taxConfigs: TaxConfigSeed[] = [
  { taxType: "GST", rate: "18.00", effectiveFrom: "2017-07-01", description: "Goods & Services Tax applicable on credit card fees" },
];
