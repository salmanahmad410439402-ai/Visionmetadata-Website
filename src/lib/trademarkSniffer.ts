/**
 * Trademark Sniffer - 3-Layer Defense System
 * Removes brand names and trademarks from metadata
 */

// Hard blacklist of known trademarks
const TRADEMARK_BLACKLIST = new Set([
  // Tech Companies
  "apple", "iphone", "ipad", "macbook", "airpods", "iwatch", "ios", "macos", "imac", "ipod",
  "google", "gmail", "chrome", "android", "pixel", "chromebook", "youtube",
  "microsoft", "windows", "xbox", "surface", "outlook", "azure",
  "amazon", "alexa", "kindle", "aws", "prime",
  "meta", "facebook", "instagram", "whatsapp", "oculus",
  "twitter",
  // "x" intentionally excluded from blacklist — too short, risks stripping
  // legitimate keywords like "x mark", "x symbol", "cross" (standalone letter x).
  // Twitter/X brand is already caught via the "twitter" entry above.
  "tiktok", "bytedance",
  "snapchat",
  "netflix",
  "spotify",
  "uber", "lyft",
  "airbnb",
  "samsung", "galaxy",
  "sony", "playstation",
  "nintendo", "switch",
  "tesla", "spacex", "starlink",
  "openai", "chatgpt", "dall-e", "gpt",
  "midjourney",

  // Fashion & Luxury
  "nike", "adidas", "puma", "reebok", "under armour",
  "gucci", "louis vuitton", "chanel", "prada", "hermes", "dior",
  "rolex", "omega", "cartier", "tiffany",
  "ray-ban", "oakley",

  // Automotive
  "bmw", "mercedes", "audi", "volkswagen", "porsche", "lamborghini", "ferrari",
  "toyota", "honda", "ford", "chevrolet", "dodge", "jeep",
  "harley-davidson",

  // Food & Beverage
  "coca-cola", "pepsi", "sprite", "fanta",
  "mcdonald's", "mcdonalds", "burger king", "wendy's", "kfc", "subway",
  "starbucks", "dunkin",
  "red bull", "monster energy",
  "nestle", "kraft", "heinz",

  // Finance
  "visa", "mastercard", "amex", "american express", "paypal",
  "bitcoin", "ethereum", "binance", "coinbase",

  // Entertainment
  "disney", "marvel", "dc comics", "warner bros",
  "star wars", "harry potter", "pokemon", "mario",
  "hbo", "paramount", "universal",

  // Sports
  "nfl", "nba", "mlb", "nhl", "fifa", "uefa",
  "olympics", "world cup",
]);

// Regex patterns for brand detection
const TRADEMARK_PATTERNS = [
  /\biphone\s*\d*/i,
  /\bipad\s*(pro|air|mini)?/i,
  /\bmac\s*(book|pro|air|mini|studio)?/i,
  /\bair\s*pods?\s*(pro|max)?/i,
  /\bapple\s*(watch|tv|music|pay)?/i,
  /\bgalaxy\s*(s|a|z|note|tab)?\s*\d*/i,
  /\bpixel\s*\d*/i,
  /\bsurface\s*(pro|go|laptop|studio)?/i,
  /\bplaystation\s*\d*/i,
  /\bxbox\s*(one|series|360)?/i,
  /\bnintendo\s*(switch|ds|wii)?/i,
  /\btesla\s*(model\s*[sxy3])?/i,
  /\bmodel\s*[sxy3]\b/i, // Tesla models
  /\bcybertruck/i,
  /\bstarlink/i,
];

// Semantic replacements
const SEMANTIC_REPLACEMENTS: Record<string, string> = {
  // Tech
  iphone: "modern smartphone with touchscreen",
  ipad: "digital tablet device",
  macbook: "silver laptop computer",
  airpods: "wireless earbuds",
  "apple watch": "smartwatch",
  android: "mobile operating system",
  pixel: "smartphone",
  galaxy: "smartphone",
  surface: "tablet computer",
  xbox: "gaming console",
  playstation: "gaming console",
  nintendo: "gaming console",
  switch: "portable gaming device",

  // Vehicles
  tesla: "electric vehicle",
  "model s": "electric sedan",
  "model 3": "electric sedan",
  "model x": "electric SUV",
  "model y": "electric crossover",
  cybertruck: "electric pickup truck",
  bmw: "luxury sedan",
  mercedes: "luxury vehicle",
  ferrari: "sports car",
  lamborghini: "supercar",
  porsche: "sports car",

  // Fashion
  nike: "athletic brand",
  adidas: "sportswear",
  gucci: "luxury fashion",
  "louis vuitton": "designer handbag",
  rolex: "luxury watch",

  // Food
  "coca-cola": "cola beverage",
  "coca cola": "cola beverage",
  pepsi: "cola beverage",
  starbucks: "coffee cup",
  "mcdonald's": "fast food restaurant",
  mcdonalds: "fast food restaurant",
  "red bull": "energy drink",

  // Social
  instagram: "social media app",
  facebook: "social network",
  twitter: "social media platform",
  tiktok: "short video app",
  youtube: "video platform",

  // AI
  chatgpt: "AI chatbot",
  "dall-e": "AI image generator",
  midjourney: "AI art tool",
};

export function containsTrademark(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check blacklist
  for (const trademark of TRADEMARK_BLACKLIST) {
    if (lowerText.includes(trademark)) {
      return true;
    }
  }

  // Check patterns
  for (const pattern of TRADEMARK_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

export function findTrademarks(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  // Check blacklist
  for (const trademark of TRADEMARK_BLACKLIST) {
    if (lowerText.includes(trademark)) {
      found.push(trademark);
    }
  }

  // Check patterns
  for (const pattern of TRADEMARK_PATTERNS) {
    const globalPattern = new RegExp(pattern.source, 'gi');
    const matches = text.match(globalPattern);
    if (matches) {
      found.push(...matches.map((m) => m.toLowerCase()));
    }
  }

  return [...new Set(found)];
}

export function replaceTrademark(text: string): { cleaned: string; removed: string[] } {
  let cleaned = text;
  const removed: string[] = [];

  // Apply semantic replacements
  for (const [trademark, replacement] of Object.entries(SEMANTIC_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${trademark}\\b`, "gi");
    if (regex.test(cleaned)) {
      removed.push(trademark);
      cleaned = cleaned.replace(new RegExp(`\\b${trademark}\\b`, "gi"), replacement);
    }
  }

  // Remove any remaining blacklisted terms
  for (const trademark of TRADEMARK_BLACKLIST) {
    const testRegex = new RegExp(`\\b${trademark}\\b`, "gi");
    if (testRegex.test(cleaned)) {
      if (!removed.includes(trademark)) {
        removed.push(trademark);
      }
      cleaned = cleaned.replace(new RegExp(`\\b${trademark}\\b`, "gi"), "");
    }
  }

  // Clean up double spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return { cleaned, removed };
}

export function cleanKeywords(keywords: string[]): { cleaned: string[]; removed: string[] } {
  const allRemoved: string[] = [];
  const cleaned = keywords
    .map((keyword) => {
      const result = replaceTrademark(keyword);
      allRemoved.push(...result.removed);
      return result.cleaned;
    })
    .filter((keyword) => keyword.length > 0);

  return { cleaned, removed: [...new Set(allRemoved)] };
}
