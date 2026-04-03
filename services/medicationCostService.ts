import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PharmacyPrice {
  pharmacyName: string;
  address: string;
  distance: number; // miles
  price: number;
  hasDiscount: boolean;
  discountPrice?: number;
  couponAvailable: boolean;
  couponCode?: string;
  inNetwork: boolean;
}

export interface MedicationPriceComparison {
  medicationName: string;
  dosage: string;
  quantity: number;
  prices: PharmacyPrice[];
  genericAlternative?: {
    name: string;
    prices: PharmacyPrice[];
  };
  patientAssistancePrograms: string[];
}

class MedicationCostService {
  private static instance: MedicationCostService;
  private searchHistory: MedicationPriceComparison[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): MedicationCostService {
    if (!MedicationCostService.instance) {
      MedicationCostService.instance = new MedicationCostService();
    }
    return MedicationCostService.instance;
  }

  private async loadData() {
    try {
      const historyData = await AsyncStorage.getItem("medication_cost_history");
      if (historyData) {
        this.searchHistory = JSON.parse(historyData);
      }
    } catch (error) {
      console.error("Error loading medication cost data:", error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem(
        "medication_cost_history",
        JSON.stringify(this.searchHistory)
      );
    } catch (error) {
      console.error("Error saving medication cost data:", error);
    }
  }

  // Search Medication Prices
  async searchMedicationPrices(
    medicationName: string,
    dosage: string,
    quantity: number,
    zipCode: string
  ): Promise<MedicationPriceComparison> {
    // In production, this would call pharmacy price APIs (GoodRx, RxSaver, etc.)
    // For now, we'll return mock data
    const mockPrices: PharmacyPrice[] = [
      {
        pharmacyName: "CVS Pharmacy",
        address: "123 Main St",
        distance: 0.5,
        price: 45.99,
        hasDiscount: true,
        discountPrice: 32.50,
        couponAvailable: true,
        couponCode: "SAVE30",
        inNetwork: true,
      },
      {
        pharmacyName: "Walgreens",
        address: "456 Oak Ave",
        distance: 1.2,
        price: 52.00,
        hasDiscount: false,
        couponAvailable: true,
        couponCode: "RXSAVE",
        inNetwork: true,
      },
      {
        pharmacyName: "Walmart Pharmacy",
        address: "789 Elm St",
        distance: 2.0,
        price: 28.99,
        hasDiscount: false,
        couponAvailable: false,
        inNetwork: true,
      },
      {
        pharmacyName: "Costco Pharmacy",
        address: "321 Pine Rd",
        distance: 3.5,
        price: 25.50,
        hasDiscount: false,
        couponAvailable: false,
        inNetwork: false,
      },
    ];

    const genericAlternative = {
      name: `${medicationName} (Generic)`,
      prices: mockPrices.map((p) => ({
        ...p,
        price: p.price * 0.4, // Generic is typically 40% of brand price
        discountPrice: p.discountPrice ? p.discountPrice * 0.4 : undefined,
      })),
    };

    const result: MedicationPriceComparison = {
      medicationName,
      dosage,
      quantity,
      prices: mockPrices,
      genericAlternative,
      patientAssistancePrograms: [
        "Partnership for Prescription Assistance",
        "NeedyMeds",
        "RxAssist",
      ],
    };

    this.searchHistory.unshift(result);
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(0, 20);
    }
    await this.saveData();

    return result;
  }

  // Get Lowest Price
  getLowestPrice(comparison: MedicationPriceComparison): PharmacyPrice {
    let lowest = comparison.prices[0];
    for (const price of comparison.prices) {
      const effectivePrice = price.hasDiscount && price.discountPrice 
        ? price.discountPrice 
        : price.price;
      const lowestEffectivePrice = lowest.hasDiscount && lowest.discountPrice
        ? lowest.discountPrice
        : lowest.price;
      
      if (effectivePrice < lowestEffectivePrice) {
        lowest = price;
      }
    }
    return lowest;
  }

  // Calculate Savings
  calculateSavings(comparison: MedicationPriceComparison): {
    maxSavings: number;
    percentSaved: number;
    bestOption: PharmacyPrice;
    worstOption: PharmacyPrice;
  } {
    const prices = comparison.prices.map((p) =>
      p.hasDiscount && p.discountPrice ? p.discountPrice : p.price
    );
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    const bestOption = this.getLowestPrice(comparison);
    const worstOption = comparison.prices.reduce((worst, current) => {
      const currentPrice = current.hasDiscount && current.discountPrice
        ? current.discountPrice
        : current.price;
      const worstPrice = worst.hasDiscount && worst.discountPrice
        ? worst.discountPrice
        : worst.price;
      return currentPrice > worstPrice ? current : worst;
    });

    return {
      maxSavings: maxPrice - minPrice,
      percentSaved: ((maxPrice - minPrice) / maxPrice) * 100,
      bestOption,
      worstOption,
    };
  }

  // Search History
  getSearchHistory(): MedicationPriceComparison[] {
    return this.searchHistory;
  }

  async clearHistory(): Promise<void> {
    this.searchHistory = [];
    await this.saveData();
  }

  // Patient Assistance Programs
  getPatientAssistancePrograms(medicationName: string): string[] {
    // In production, this would query a database of assistance programs
    return [
      "Partnership for Prescription Assistance (PPARx)",
      "NeedyMeds",
      "RxAssist",
      "Patient Access Network Foundation",
      "HealthWell Foundation",
      "Manufacturer Patient Assistance Programs",
    ];
  }

  // Coupon Management
  async saveCoupon(pharmacyName: string, couponCode: string): Promise<void> {
    const coupons = await this.getSavedCoupons();
    coupons[pharmacyName] = couponCode;
    await AsyncStorage.setItem("saved_coupons", JSON.stringify(coupons));
  }

  async getSavedCoupons(): Promise<{ [pharmacyName: string]: string }> {
    try {
      const data = await AsyncStorage.getItem("saved_coupons");
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }
}

// Lazy singleton — defers AsyncStorage/window access until first use (fixes SSR build errors)
let _instance: MedicationCostService | null = null;
const _lazy = new Proxy({} as MedicationCostService, {
  get(_: MedicationCostService, prop: string | symbol) {
    if (!_instance) _instance = MedicationCostService.getInstance();
    return (_instance as any)[prop];
  },
  set(_: MedicationCostService, prop: string | symbol, value: unknown) {
    if (!_instance) _instance = MedicationCostService.getInstance();
    (_instance as any)[prop] = value;
    return true;
  },
});
export default _lazy;
