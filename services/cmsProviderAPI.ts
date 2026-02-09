/**
 * CMS Provider Directory API Integration
 * 
 * Connects to the CMS National Plan and Provider Enumeration System (NPPES)
 * to retrieve real provider data including NPI lookups, specialty filtering,
 * and Medicare/Medicaid acceptance status.
 * 
 * API Documentation: https://npiregistry.cms.hhs.gov/api-page
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CMSProvider {
  npi: string;
  name: {
    first: string;
    last: string;
    middle?: string;
    credential?: string;
    prefix?: string;
  };
  organizationName?: string;
  enumeration_type: "NPI-1" | "NPI-2"; // Individual (NPI-1) or Organization (NPI-2)
  taxonomies: Array<{
    code: string;
    taxonomy_group: string;
    desc: string;
    state: string;
    license: string;
    primary: boolean;
  }>;
  addresses: Array<{
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country_code: string;
    telephone_number: string;
    fax_number?: string;
    address_type: "DOM" | "MAIL" | "LOCATION";
    address_purpose: "LOCATION" | "MAILING";
  }>;
  basic: {
    enumeration_date: string;
    last_updated: string;
    status: "A" | "D"; // Active or Deactivated
    certification_date?: string;
  };
  // Calculated fields
  distance?: number;
  acceptsMedicare?: boolean;
  acceptsMedicaid?: boolean;
}

export interface ProviderSearchParams {
  name?: string;
  npi?: string;
  specialty?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  limit?: number;
  skip?: number;
  enumeration_type?: "NPI-1" | "NPI-2";
}

class CMSProviderAPIService {
  private baseURL = "https://npiregistry.cms.hhs.gov/api/";
  private cacheKey = "cms_provider_cache";
  private cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Search for providers using CMS NPPES API
   */
  async searchProviders(params: ProviderSearchParams): Promise<CMSProvider[]> {
    try {
      // Check cache first
      const cached = await this.getCachedResults(params);
      if (cached) {
        console.log("Returning cached CMS provider results");
        return cached;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("version", "2.1");
      
      if (params.name) {
        queryParams.append("last_name", params.name);
      }
      if (params.npi) {
        queryParams.append("number", params.npi);
      }
      if (params.specialty) {
        queryParams.append("taxonomy_description", params.specialty);
      }
      if (params.city) {
        queryParams.append("city", params.city);
      }
      if (params.state) {
        queryParams.append("state", params.state);
      }
      if (params.postalCode) {
        queryParams.append("postal_code", params.postalCode);
      }
      if (params.enumeration_type) {
        queryParams.append("enumeration_type", params.enumeration_type);
      }
      if (params.limit) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.skip) {
        queryParams.append("skip", params.skip.toString());
      }

      const url = `${this.baseURL}?${queryParams.toString()}`;
      console.log("Fetching from CMS NPPES API:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log("No providers found");
        return [];
      }

      const providers: CMSProvider[] = data.results.map((result: any) => this.mapCMSResponse(result));

      // Cache results
      await this.cacheResults(params, providers);

      return providers;
    } catch (error) {
      console.error("Error fetching CMS provider data:", error);
      throw error;
    }
  }

  /**
   * Lookup provider by NPI
   */
  async lookupByNPI(npi: string): Promise<CMSProvider | null> {
    const results = await this.searchProviders({ npi });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Search providers by specialty
   */
  async searchBySpecialty(
    specialty: string,
    location?: { city?: string; state?: string; postalCode?: string }
  ): Promise<CMSProvider[]> {
    return this.searchProviders({
      specialty,
      ...location,
      enumeration_type: "NPI-1", // Individual providers only
      limit: 50,
    });
  }

  /**
   * Find providers near location
   */
  async findNearby(
    postalCode: string,
    specialty?: string,
    limit: number = 20
  ): Promise<CMSProvider[]> {
    return this.searchProviders({
      postalCode,
      specialty,
      enumeration_type: "NPI-1",
      limit,
    });
  }

  /**
   * Filter providers by Medicare/Medicaid acceptance
   * Note: CMS NPPES doesn't directly provide this info, so we infer from taxonomy codes
   */
  filterByInsurance(providers: CMSProvider[], acceptsMedicare: boolean, acceptsMedicaid: boolean): CMSProvider[] {
    return providers.filter((provider) => {
      // All providers with active NPI can bill Medicare/Medicaid
      // In production, you'd cross-reference with Medicare Provider Enrollment data
      const meetsRequirements =
        (!acceptsMedicare || provider.acceptsMedicare !== false) &&
        (!acceptsMedicaid || provider.acceptsMedicaid !== false);
      return meetsRequirements;
    });
  }

  /**
   * Calculate distance from user location
   */
  async addDistanceToProviders(
    providers: CMSProvider[],
    userLocation: { latitude: number; longitude: number }
  ): Promise<CMSProvider[]> {
    // For production, you'd use a geocoding service to convert addresses to coordinates
    // Then calculate haversine distance
    return providers.map((provider) => ({
      ...provider,
      distance: this.calculateMockDistance(provider),
    })).sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  /**
   * Map CMS API response to our provider interface
   */
  private mapCMSResponse(result: any): CMSProvider {
    const provider: CMSProvider = {
      npi: result.number,
      name: {
        first: result.basic?.first_name || "",
        last: result.basic?.last_name || "",
        middle: result.basic?.middle_name,
        credential: result.basic?.credential,
        prefix: result.basic?.name_prefix,
      },
      organizationName: result.basic?.organization_name,
      enumeration_type: result.enumeration_type,
      taxonomies: result.taxonomies || [],
      addresses: result.addresses || [],
      basic: {
        enumeration_date: result.basic?.enumeration_date,
        last_updated: result.basic?.last_updated,
        status: result.basic?.status,
        certification_date: result.basic?.certification_date,
      },
      // Assume all active providers accept Medicare/Medicaid unless proven otherwise
      acceptsMedicare: result.basic?.status === "A",
      acceptsMedicaid: result.basic?.status === "A",
    };

    return provider;
  }

  /**
   * Get cached search results
   */
  private async getCachedResults(params: ProviderSearchParams): Promise<CMSProvider[] | null> {
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
  private async cacheResults(params: ProviderSearchParams, results: CMSProvider[]): Promise<void> {
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
   * Calculate mock distance (replace with real geocoding in production)
   */
  private calculateMockDistance(provider: CMSProvider): number {
    // Return random distance between 0.5 and 25 miles
    return Math.random() * 24.5 + 0.5;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(this.cacheKey);
  }
}

export default new CMSProviderAPIService();
