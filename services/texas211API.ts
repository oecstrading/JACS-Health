/**
 * 2-1-1 Texas API Integration
 * 
 * Connects to 2-1-1 Texas (United Way) to retrieve social services resources
 * including food pantries, medical expense assistance, transportation services,
 * and other social determinants of health resources.
 * 
 * API Documentation: https://211texas.org/api
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Texas211Resource {
  id: string;
  name: string;
  description: string;
  category: "Food" | "Housing" | "Healthcare" | "Transportation" | "Utilities" | "Senior Services" | "Other";
  subcategory?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  eligibility?: string;
  services: string[];
  languages: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    publicTransportation: boolean;
    parking: boolean;
  };
  distance?: number;
  lastUpdated: string;
}

export interface ResourceSearchParams {
  zipCode?: string;
  category?: string;
  keyword?: string;
  radius?: number; // miles
  limit?: number;
}

class Texas211APIService {
  private baseURL = "https://api.211texas.org/v1";
  private apiKey = ""; // Set via configuration
  private cacheKey = "texas211_cache";
  private cacheExpiration = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Set API key
   */
  setAPIKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Search for resources
   */
  async searchResources(params: ResourceSearchParams): Promise<Texas211Resource[]> {
    try {
      // Check cache first
      const cached = await this.getCachedResults(params);
      if (cached) {
        console.log("Returning cached 2-1-1 Texas results");
        return cached;
      }

      // For now, return mock data since 2-1-1 Texas API requires partnership agreement
      // In production, replace with real API calls
      const mockResults = this.getMockResources(params);

      // Cache results
      await this.cacheResults(params, mockResults);

      return mockResults;
    } catch (error) {
      console.error("Error fetching 2-1-1 Texas data:", error);
      throw error;
    }
  }

  /**
   * Find food pantries
   */
  async findFoodPantries(zipCode: string, radius: number = 10): Promise<Texas211Resource[]> {
    return this.searchResources({
      zipCode,
      category: "Food",
      radius,
      limit: 20,
    });
  }

  /**
   * Find medical expense assistance programs
   */
  async findMedicalAssistance(zipCode: string): Promise<Texas211Resource[]> {
    return this.searchResources({
      zipCode,
      category: "Healthcare",
      keyword: "financial assistance",
      limit: 15,
    });
  }

  /**
   * Find transportation services
   */
  async findTransportation(zipCode: string): Promise<Texas211Resource[]> {
    return this.searchResources({
      zipCode,
      category: "Transportation",
      limit: 10,
    });
  }

  /**
   * Find senior services
   */
  async findSeniorServices(zipCode: string): Promise<Texas211Resource[]> {
    return this.searchResources({
      zipCode,
      category: "Senior Services",
      limit: 20,
    });
  }

  /**
   * Find prescription assistance programs
   */
  async findPrescriptionAssistance(zipCode: string): Promise<Texas211Resource[]> {
    return this.searchResources({
      zipCode,
      category: "Healthcare",
      keyword: "prescription assistance",
      limit: 10,
    });
  }

  /**
   * Get mock resources (replace with real API in production)
   */
  private getMockResources(params: ResourceSearchParams): Texas211Resource[] {
    const allResources: Texas211Resource[] = [
      {
        id: "211tx-001",
        name: "Fort Bend County Food Bank",
        description: "Provides emergency food assistance to families in need. No appointment necessary. Bring proof of residency.",
        category: "Food",
        subcategory: "Food Pantry",
        address: {
          street: "411 Herndon Dr",
          city: "Richmond",
          state: "TX",
          zipCode: "77469",
        },
        contact: {
          phone: "(281) 341-3663",
          email: "info@fortbendfoodbank.org",
          website: "https://www.fortbendfoodbank.org",
        },
        hours: {
          monday: "9:00 AM - 4:00 PM",
          tuesday: "9:00 AM - 4:00 PM",
          wednesday: "9:00 AM - 4:00 PM",
          thursday: "9:00 AM - 4:00 PM",
          friday: "9:00 AM - 4:00 PM",
        },
        eligibility: "Fort Bend County residents experiencing food insecurity",
        services: ["Emergency Food", "Fresh Produce", "Mobile Pantry"],
        languages: ["English", "Spanish"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransportation: false,
          parking: true,
        },
        distance: 8.2,
        lastUpdated: "2026-02-01",
      },
      {
        id: "211tx-002",
        name: "Houston Food Bank - Fulshear Distribution",
        description: "Weekly food distribution for families. Pre-registration required online.",
        category: "Food",
        subcategory: "Food Pantry",
        address: {
          street: "Cross Creek Ranch Community Center",
          city: "Fulshear",
          state: "TX",
          zipCode: "77441",
        },
        contact: {
          phone: "(713) 547-8607",
          website: "https://www.houstonfoodbank.org",
        },
        hours: {
          saturday: "10:00 AM - 12:00 PM",
        },
        eligibility: "All families in need, no income verification required",
        services: ["Weekly Food Distribution", "Fresh Produce", "Dairy Products"],
        languages: ["English", "Spanish", "Vietnamese"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransportation: false,
          parking: true,
        },
        distance: 3.5,
        lastUpdated: "2026-01-28",
      },
      {
        id: "211tx-003",
        name: "Fort Bend County Medical Assistance Program",
        description: "Provides financial assistance for medical bills, prescriptions, and healthcare services for low-income residents.",
        category: "Healthcare",
        subcategory: "Financial Assistance",
        address: {
          street: "4520 Reading Rd",
          city: "Rosenberg",
          state: "TX",
          zipCode: "77471",
        },
        contact: {
          phone: "(281) 341-3718",
          email: "medassist@fortbendcountytx.gov",
        },
        hours: {
          monday: "8:00 AM - 5:00 PM",
          tuesday: "8:00 AM - 5:00 PM",
          wednesday: "8:00 AM - 5:00 PM",
          thursday: "8:00 AM - 5:00 PM",
          friday: "8:00 AM - 5:00 PM",
        },
        eligibility: "Fort Bend County residents at or below 200% of federal poverty level",
        services: ["Medical Bill Assistance", "Prescription Assistance", "Dental Care Vouchers"],
        languages: ["English", "Spanish"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransportation: true,
          parking: true,
        },
        distance: 10.1,
        lastUpdated: "2026-02-05",
      },
      {
        id: "211tx-004",
        name: "Fort Bend Senior Services Transportation",
        description: "Door-to-door transportation for seniors 60+ to medical appointments, grocery shopping, and social activities.",
        category: "Transportation",
        subcategory: "Senior Transportation",
        address: {
          street: "4520 Reading Rd",
          city: "Rosenberg",
          state: "TX",
          zipCode: "77471",
        },
        contact: {
          phone: "(281) 633-7058",
          website: "https://www.fortbendseniors.org/transportation",
        },
        hours: {
          monday: "8:00 AM - 4:00 PM",
          tuesday: "8:00 AM - 4:00 PM",
          wednesday: "8:00 AM - 4:00 PM",
          thursday: "8:00 AM - 4:00 PM",
          friday: "8:00 AM - 4:00 PM",
        },
        eligibility: "Fort Bend County residents age 60+",
        services: ["Medical Appointments", "Grocery Shopping", "Social Activities", "Pharmacy Trips"],
        languages: ["English", "Spanish"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransportation: false,
          parking: true,
        },
        distance: 10.1,
        lastUpdated: "2026-01-30",
      },
      {
        id: "211tx-005",
        name: "RxAssist Prescription Assistance Program",
        description: "Helps low-income individuals access free or low-cost prescription medications through pharmaceutical company programs.",
        category: "Healthcare",
        subcategory: "Prescription Assistance",
        address: {
          street: "Online Service",
          city: "Houston",
          state: "TX",
          zipCode: "77001",
        },
        contact: {
          phone: "(713) 555-7927",
          website: "https://www.rxassist.org",
        },
        hours: {
          monday: "9:00 AM - 5:00 PM",
          tuesday: "9:00 AM - 5:00 PM",
          wednesday: "9:00 AM - 5:00 PM",
          thursday: "9:00 AM - 5:00 PM",
          friday: "9:00 AM - 5:00 PM",
        },
        eligibility: "Low-income individuals without prescription drug coverage",
        services: ["Prescription Assistance Applications", "Medication Cost Reduction", "Generic Alternatives"],
        languages: ["English", "Spanish"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransportation: false,
          parking: false,
        },
        distance: 28.5,
        lastUpdated: "2026-02-03",
      },
      {
        id: "211tx-006",
        name: "Fort Bend County Senior Meals Program",
        description: "Provides nutritious meals to seniors 60+ at community centers and home delivery for homebound seniors.",
        category: "Senior Services",
        subcategory: "Meal Services",
        address: {
          street: "4520 Reading Rd",
          city: "Rosenberg",
          state: "TX",
          zipCode: "77471",
        },
        contact: {
          phone: "(281) 633-7058",
          website: "https://www.fortbendseniors.org/meals",
        },
        hours: {
          monday: "11:30 AM - 12:30 PM",
          tuesday: "11:30 AM - 12:30 PM",
          wednesday: "11:30 AM - 12:30 PM",
          thursday: "11:30 AM - 12:30 PM",
          friday: "11:30 AM - 12:30 PM",
        },
        eligibility: "Fort Bend County residents age 60+",
        services: ["Congregate Meals", "Home-Delivered Meals", "Nutrition Education"],
        languages: ["English", "Spanish"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransportation: true,
          parking: true,
        },
        distance: 10.1,
        lastUpdated: "2026-02-02",
      },
    ];

    // Filter by category if specified
    let filtered = allResources;
    if (params.category) {
      filtered = filtered.filter((r) => r.category === params.category);
    }

    // Filter by keyword if specified
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          r.description.toLowerCase().includes(keyword) ||
          r.services.some((s) => s.toLowerCase().includes(keyword))
      );
    }

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));

    // Apply limit
    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  /**
   * Get cached search results
   */
  private async getCachedResults(params: ResourceSearchParams): Promise<Texas211Resource[] | null> {
    try {
      const cacheData = await AsyncStorage.getItem(this.cacheKey);
      if (!cacheData) return null;

      const cache = JSON.parse(cacheData);
      const key = JSON.stringify(params);
      const cached = cache[key];

      if (!cached) return null;

      // Check expiration
      if (Date.now() - cached.timestamp > this.cacheExpiration) {
        return null;
      }

      return cached.results;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  }

  /**
   * Cache search results
   */
  private async cacheResults(params: ResourceSearchParams, results: Texas211Resource[]): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem(this.cacheKey);
      const cache = cacheData ? JSON.parse(cacheData) : {};

      const key = JSON.stringify(params);
      cache[key] = {
        timestamp: Date.now(),
        results,
      };

      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error("Error caching results:", error);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(this.cacheKey);
  }
}

export default new Texas211APIService();
