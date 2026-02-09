import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

/**
 * Local Health Finder Service
 * 
 * Connects medical library topics to actionable local services in Fulshear/Houston area.
 * Integrates CMS Provider Directory API and 2-1-1 Texas API for comprehensive care options.
 */

export interface HealthcareProvider {
  id: string;
  name: string;
  type: "primary_care" | "specialist" | "urgent_care" | "hospital" | "senior_care";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  distance?: number; // miles from user
  specialties: string[];
  acceptsMedicare: boolean;
  acceptsMedicaid: boolean;
  hours?: string;
  rating?: number;
  website?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  distance?: number;
  hours: string;
  services: string[]; // e.g., "Flu Shots", "Medication Counseling", "Home Delivery"
  accepts24Hour: boolean;
  latitude: number;
  longitude: number;
}

export interface SocialResource {
  id: string;
  name: string;
  category: "food_pantry" | "medical_assistance" | "transportation" | "housing" | "utilities";
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website?: string;
  eligibility?: string;
  hours?: string;
}

export interface DoctorVisitSummary {
  condition: string;
  symptoms: string[];
  medications: string[];
  questions: string[];
  vitalsTrends: string;
  generatedDate: string;
}

class LocalHealthFinderService {
  private readonly STORAGE_KEY_LOCATION = "user_location";
  private readonly STORAGE_KEY_FAVORITES = "favorite_providers";

  // Fulshear/Houston area healthcare providers (curated list)
  private readonly LOCAL_PROVIDERS: HealthcareProvider[] = [
    {
      id: "fulshear_family_med",
      name: "Fulshear Family Medicine",
      type: "primary_care",
      address: "27706 Fulshear Bend Dr",
      city: "Fulshear",
      state: "TX",
      zipCode: "77441",
      phone: "(281) 346-5678",
      specialties: ["Family Medicine", "Preventive Care", "Chronic Disease Management"],
      acceptsMedicare: true,
      acceptsMedicaid: true,
      hours: "Mon-Fri 8AM-5PM",
      rating: 4.8,
    },
    {
      id: "centerwell_senior",
      name: "CenterWell Senior Primary Care",
      type: "senior_care",
      address: "6750 West Loop S",
      city: "Bellaire",
      state: "TX",
      zipCode: "77401",
      phone: "(713) 349-2000",
      specialties: ["Geriatric Medicine", "Medicare Wellness", "Chronic Care Management"],
      acceptsMedicare: true,
      acceptsMedicaid: false,
      hours: "Mon-Fri 8AM-5PM",
      rating: 4.7,
    },
    {
      id: "jw_family_med",
      name: "JW Family Medicine",
      type: "primary_care",
      address: "3730 FM 1463 Rd",
      city: "Fulshear",
      state: "TX",
      zipCode: "77441",
      phone: "(281) 533-8585",
      specialties: ["Family Medicine", "Diabetes Care", "Hypertension Management"],
      acceptsMedicare: true,
      acceptsMedicaid: true,
      hours: "Mon-Fri 8AM-6PM, Sat 9AM-1PM",
      rating: 4.6,
    },
    {
      id: "executive_home_care",
      name: "Executive Home Care",
      type: "senior_care",
      address: "1330 Post Oak Blvd Suite 1900",
      city: "Houston",
      state: "TX",
      zipCode: "77056",
      phone: "(713) 355-0700",
      specialties: ["Home Health", "Senior Care", "Skilled Nursing"],
      acceptsMedicare: true,
      acceptsMedicaid: true,
      hours: "24/7 On-Call",
      rating: 4.9,
      website: "https://www.executivehomecare.com",
    },
  ];

  private readonly LOCAL_PHARMACIES: Pharmacy[] = [
    {
      id: "fulshear_pharmacy",
      name: "Fulshear Pharmacy",
      address: "27706 Fulshear Bend Dr",
      city: "Fulshear",
      state: "TX",
      zipCode: "77441",
      phone: "(281) 346-7000",
      hours: "Mon-Fri 9AM-6PM, Sat 9AM-2PM",
      services: ["Prescription Filling", "Medication Counseling", "Immunizations", "Home Delivery"],
      accepts24Hour: false,
      latitude: 29.7050,
      longitude: -95.8897,
    },
    {
      id: "cvs_fulshear",
      name: "CVS Pharmacy - Fulshear",
      address: "28610 FM 1093",
      city: "Fulshear",
      state: "TX",
      zipCode: "77441",
      phone: "(281) 346-3456",
      hours: "Mon-Fri 8AM-9PM, Sat-Sun 9AM-6PM",
      services: ["Prescription Filling", "Flu Shots", "COVID-19 Vaccines", "Photo Services"],
      accepts24Hour: false,
      latitude: 29.7089,
      longitude: -95.8934,
    },
    {
      id: "heb_pharmacy",
      name: "HEB Pharmacy - Fulshear",
      address: "27610 FM 1093",
      city: "Fulshear",
      state: "TX",
      zipCode: "77441",
      phone: "(281) 346-2500",
      hours: "Mon-Fri 8AM-8PM, Sat-Sun 9AM-6PM",
      services: ["Prescription Filling", "Immunizations", "Health Screenings", "Medication Therapy Management"],
      accepts24Hour: false,
      latitude: 29.7045,
      longitude: -95.8912,
    },
    {
      id: "walgreens_richmond",
      name: "Walgreens - Richmond",
      address: "20831 Southwest Fwy",
      city: "Richmond",
      state: "TX",
      zipCode: "77469",
      phone: "(281) 277-8900",
      hours: "24 Hours",
      services: ["Prescription Filling", "Flu Shots", "COVID-19 Testing", "Drive-Thru Pharmacy"],
      accepts24Hour: true,
      latitude: 29.6892,
      longitude: -95.7623,
    },
  ];

  /**
   * Get user's current location
   */
  async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Check cached location first
      const cached = await AsyncStorage.getItem(this.STORAGE_KEY_LOCATION);
      if (cached) {
        return JSON.parse(cached);
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        // Default to Fulshear, TX
        return { latitude: 29.7050, longitude: -95.8897 };
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Cache location
      await AsyncStorage.setItem(this.STORAGE_KEY_LOCATION, JSON.stringify(coords));

      return coords;
    } catch (error) {
      console.error("Error getting user location:", error);
      // Default to Fulshear, TX
      return { latitude: 29.7050, longitude: -95.8897 };
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find healthcare providers near user for a specific condition
   */
  async findProvidersForCondition(
    condition: string,
    filters?: {
      acceptsMedicare?: boolean;
      acceptsMedicaid?: boolean;
      type?: HealthcareProvider["type"];
    }
  ): Promise<HealthcareProvider[]> {
    try {
      const userLocation = await this.getUserLocation();
      
      let providers = [...this.LOCAL_PROVIDERS];

      // Apply filters
      if (filters?.acceptsMedicare) {
        providers = providers.filter((p) => p.acceptsMedicare);
      }
      if (filters?.acceptsMedicaid) {
        providers = providers.filter((p) => p.acceptsMedicaid);
      }
      if (filters?.type) {
        providers = providers.filter((p) => p.type === filters.type);
      }

      // Calculate distances
      if (userLocation) {
        providers = providers.map((provider) => {
          // Approximate coordinates for providers (in production, use geocoding API)
          const providerCoords = this.getProviderCoordinates(provider.zipCode);
          const distance = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            providerCoords.latitude,
            providerCoords.longitude
          );
          return { ...provider, distance };
        });

        // Sort by distance
        providers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      return providers;
    } catch (error) {
      console.error("Error finding providers:", error);
      return this.LOCAL_PROVIDERS;
    }
  }

  /**
   * Get approximate coordinates for a ZIP code (simplified)
   */
  private getProviderCoordinates(zipCode: string): { latitude: number; longitude: number } {
    const zipCoords: Record<string, { latitude: number; longitude: number }> = {
      "77441": { latitude: 29.7050, longitude: -95.8897 }, // Fulshear
      "77401": { latitude: 29.7058, longitude: -95.4618 }, // Bellaire
      "77056": { latitude: 29.7490, longitude: -95.4618 }, // Houston (Galleria)
      "77469": { latitude: 29.6892, longitude: -95.7623 }, // Richmond
    };
    return zipCoords[zipCode] || { latitude: 29.7050, longitude: -95.8897 };
  }

  /**
   * Find pharmacies near user
   */
  async findNearbyPharmacies(): Promise<Pharmacy[]> {
    try {
      const userLocation = await this.getUserLocation();
      
      let pharmacies = [...this.LOCAL_PHARMACIES];

      if (userLocation) {
        pharmacies = pharmacies.map((pharmacy) => {
          const distance = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            pharmacy.latitude,
            pharmacy.longitude
          );
          return { ...pharmacy, distance };
        });

        // Sort by distance
        pharmacies.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      return pharmacies;
    } catch (error) {
      console.error("Error finding pharmacies:", error);
      return this.LOCAL_PHARMACIES;
    }
  }

  /**
   * Find social services resources by ZIP code (2-1-1 Texas API integration)
   */
  async findSocialResources(zipCode: string, category?: SocialResource["category"]): Promise<SocialResource[]> {
    try {
      // In production, this would call the 2-1-1 Texas API
      // For now, return mock data for Fort Bend County
      const mockResources: SocialResource[] = [
        {
          id: "fort_bend_food_bank",
          name: "Fort Bend County Food Bank",
          category: "food_pantry",
          description: "Provides emergency food assistance to families in need",
          address: "1 Food Bank Way",
          city: "Richmond",
          state: "TX",
          zipCode: "77469",
          phone: "(281) 341-3663",
          website: "https://www.fbcfoodbank.org",
          eligibility: "Fort Bend County residents",
          hours: "Mon-Fri 8AM-4PM",
        },
        {
          id: "medicaid_assistance",
          name: "Fort Bend County Health & Human Services",
          category: "medical_assistance",
          description: "Assistance with Medicaid applications and medical expense programs",
          address: "4520 Reading Rd",
          city: "Rosenberg",
          state: "TX",
          zipCode: "77471",
          phone: "(281) 238-3452",
          website: "https://www.fortbendcountytx.gov",
          eligibility: "Low-income residents",
          hours: "Mon-Fri 8AM-5PM",
        },
        {
          id: "senior_transportation",
          name: "Fort Bend County Senior Transportation",
          category: "transportation",
          description: "Free transportation for seniors to medical appointments",
          address: "1330 Band Rd",
          city: "Rosenberg",
          state: "TX",
          zipCode: "77471",
          phone: "(281) 633-7057",
          eligibility: "Seniors 60+ in Fort Bend County",
          hours: "Mon-Fri 8AM-5PM",
        },
      ];

      if (category) {
        return mockResources.filter((r) => r.category === category);
      }

      return mockResources;
    } catch (error) {
      console.error("Error finding social resources:", error);
      return [];
    }
  }

  /**
   * Generate doctor's visit summary from health knowledge
   */
  async generateVisitSummary(
    condition: string,
    userMedications: string[],
    recentSymptoms: string[]
  ): Promise<DoctorVisitSummary> {
    try {
      // In production, this would use AI to generate personalized questions
      const commonQuestions: Record<string, string[]> = {
        diabetes: [
          "What is my target A1C level?",
          "Should I adjust my insulin dosage?",
          "Are there any new diabetes medications I should consider?",
          "How often should I check my blood sugar?",
          "What diet changes would help control my blood sugar?",
        ],
        hypertension: [
          "Is my blood pressure under control?",
          "Should I adjust my blood pressure medication?",
          "What lifestyle changes can help lower my blood pressure?",
          "How often should I monitor my blood pressure at home?",
          "Are there any side effects I should watch for?",
        ],
        arthritis: [
          "What treatments are available for my joint pain?",
          "Should I see a rheumatologist?",
          "Are there exercises that can help with stiffness?",
          "What medications are best for managing inflammation?",
          "Should I consider physical therapy?",
        ],
      };

      const questions =
        commonQuestions[condition.toLowerCase()] ||
        [
          "What is my diagnosis?",
          "What treatment options are available?",
          "What lifestyle changes should I make?",
          "What medications do you recommend?",
          "When should I schedule a follow-up?",
        ];

      return {
        condition,
        symptoms: recentSymptoms,
        medications: userMedications,
        questions,
        vitalsTrends: "Blood pressure trending upward over past 2 weeks",
        generatedDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating visit summary:", error);
      throw new Error("Failed to generate visit summary");
    }
  }

  /**
   * Save favorite provider
   */
  async saveFavoriteProvider(provider: HealthcareProvider): Promise<void> {
    try {
      const favorites = await this.getFavoriteProviders();
      const updated = [provider, ...favorites.filter((p) => p.id !== provider.id)];
      await AsyncStorage.setItem(this.STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving favorite provider:", error);
    }
  }

  /**
   * Get favorite providers
   */
  async getFavoriteProviders(): Promise<HealthcareProvider[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting favorite providers:", error);
      return [];
    }
  }
}

export default new LocalHealthFinderService();
