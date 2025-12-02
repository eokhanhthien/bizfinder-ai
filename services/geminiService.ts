import { GoogleGenAI } from "@google/genai";
import { Business } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini's general knowledge to list sub-areas (wards, streets) for a given location.
 * This does NOT use Maps Grounding, just pure LLM knowledge to plan the crawl.
 */
export const generateSubAreas = async (location: string): Promise<string[]> => {
  try {
    const prompt = `
      I want to search for businesses in "${location}" comprehensively.
      List all official administrative subdivisions (like Wards/Phường, Communes/Xã) inside "${location}".
      
      If "${location}" is a small area or street, list major intersecting streets or nearby landmarks instead.
      
      Format: Return ONLY a raw list of names separated by newlines. Do not number them. Do not add explanations.
      Example Output:
      Ben Nghe Ward
      Ben Thanh Ward
      Da Kao Ward
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      // No tools needed here, just general knowledge
    });

    const text = response.text || "";
    // Split by newline, trim, filter empty
    return text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Error generating sub-areas:", error);
    return [];
  }
};

export const fetchBusinessData = async (
  industry: string,
  location: string,
  excludeNames: string[] = []
): Promise<Business[]> => {
  try {
    // Construct exclusion text if there are existing businesses
    const exclusionInstruction = excludeNames.length > 0 
      ? `CRITICAL EXCLUSION LIST: You must NOT include these businesses (we already have them): ${JSON.stringify(excludeNames)}. Find DIFFERENT businesses.`
      : "";

    // IMPROVED PROMPT: Deep Mining Mode
    const prompt = `
      Task: Perform a DEEP DATA MINING search for businesses in category "${industry}" located in "${location}".
      Goal: Extract exactly 20 distinct businesses. Do not stop at 5 or 10.

      SEARCH STRATEGY (Must Follow):
      1. **Semantic Expansion**: Do not just search for the exact keyword "${industry}". 
         - Use synonyms (e.g., if "Cafe", also look for "Coffee Shop", "Espresso Bar", "Bistro", "Tea House").
         - If "Bách hoá", look for "Supermarket", "Convenience Store", "Mini-mart".
      2. **Geographic Diversity**: Do not just list the famous spots in the center. Look for businesses on different streets within "${location}".
      3. **Quantity over Fame**: We need volume. Include small businesses, new openings, and local favorites, not just the top-rated ones.

      ${exclusionInstruction}
      
      REQUIRED DATA PER BUSINESS:
      - Name
      - Specific Address
      - Rating (number, e.g. 4.5)
      - Review Count (number)
      - Phone Number (Must try to find this)
      - Website (Official site or social page)
      - A very short 1-sentence description in Vietnamese.

      STRICT OUTPUT FORMAT:
      1. Return ONLY a raw JSON array.
      2. No markdown, no code blocks, no intro/outro text.
      3. Keys: "name", "address", "rating", "reviewCount", "website", "phone", "description".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.warn("Parsing failed for location:", location, e);
      // Attempt to clean simple markdown issues if JSON parse fails
      try {
         const firstBracket = cleanText.indexOf('[');
         const lastBracket = cleanText.lastIndexOf(']');
         if (firstBracket !== -1 && lastBracket !== -1) {
            const subStr = cleanText.substring(firstBracket, lastBracket + 1);
            parsedData = JSON.parse(subStr);
         }
      } catch (e2) {
         return [];
      }
    }

    if (!Array.isArray(parsedData)) return [];

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const businesses: Business[] = parsedData.map((item: any, index: number) => {
      // Logic to attach real Google Maps URI from grounding metadata
      const match = groundingChunks.find((chunk: any) => {
         // Check map uri or title
         const titleMatch = chunk.web?.title?.toLowerCase().includes(item.name?.toLowerCase());
         return titleMatch;
      });

      return {
        id: `biz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || "Unknown Name",
        address: item.address || "Unknown Address",
        rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating) || 0,
        reviewCount: typeof item.reviewCount === 'number' ? item.reviewCount : parseInt(item.reviewCount) || 0,
        website: item.website || null,
        phone: item.phone || null,
        businessType: industry,
        description: item.description || "",
        googleMapsUri: match?.web?.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`
      };
    });

    return businesses;

  } catch (error: any) {
    console.error(`Error fetching for ${location}:`, error);
    return [];
  }
};
