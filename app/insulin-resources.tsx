/**
 * Low-Income Resource Finder — Insulin & Diabetes Supply Assistance
 *
 * For families who cannot afford insulin, CGM supplies, or pump consumables.
 * Every child with Type 1 diabetes deserves access to life-saving insulin.
 *
 * Sources: Lilly, Novo Nordisk, Sanofi, JDRF, ADA, NeedyMeds (2024)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

interface Resource {
  id: string;
  category: "insulin" | "cgm" | "pump" | "supplies" | "financial" | "education";
  name: string;
  org: string;
  description: string;
  eligibility: string;
  savings: string;
  phone?: string;
  website?: string;
  urgent: boolean;
}

const RESOURCES: Resource[] = [
  // INSULIN PROGRAMS
  {
    id: "lilly-insulin",
    category: "insulin",
    name: "Lilly Insulin Value Program",
    org: "Eli Lilly",
    description: "Humalog, Basaglar, and Lyumjev insulin capped at $35/month for uninsured and underinsured patients.",
    eligibility: "US residents, uninsured or underinsured. No income limit.",
    savings: "Up to $400/month savings",
    phone: "1-800-545-5979",
    website: "https://insulinaffordability.com",
    urgent: true,
  },
  {
    id: "novo-pap",
    category: "insulin",
    name: "Novo Nordisk Patient Assistance Program",
    org: "Novo Nordisk",
    description: "Free NovoLog, Levemir, Tresiba, and Victoza for qualifying patients who cannot afford their medication.",
    eligibility: "Income at or below 400% of federal poverty level. No insurance or Medicare/Medicaid.",
    savings: "Free insulin — $0 cost",
    phone: "1-866-310-7549",
    website: "https://www.novonordisk-us.com/patients/patient-assistance.html",
    urgent: true,
  },
  {
    id: "sanofi-vap",
    category: "insulin",
    name: "Sanofi Insulins VAP",
    org: "Sanofi",
    description: "Lantus, Toujeo, Admelog, and Soliqua at $99/month for uninsured patients.",
    eligibility: "US residents without insurance coverage for Sanofi insulins.",
    savings: "Insulin capped at $99/month",
    phone: "1-888-847-4877",
    website: "https://www.insulinhelp.com",
    urgent: true,
  },
  {
    id: "walmart-insulin",
    category: "insulin",
    name: "Walmart ReliOn Insulin",
    org: "Walmart",
    description: "Over-the-counter NPH and Regular insulin (R) at $25/vial. No prescription needed. Available at all Walmart pharmacies.",
    eligibility: "Anyone. No prescription required. Available nationwide.",
    savings: "$25/vial vs $300+ brand name",
    website: "https://www.walmart.com/pharmacy",
    urgent: true,
  },
  {
    id: "civica-rx",
    category: "insulin",
    name: "CivicaRx Biosimilar Insulin",
    org: "CivicaRx / Mark Cuban Cost Plus Drugs",
    description: "Biosimilar insulin glargine (Basaglar equivalent) at $30/vial or $55/5-pack pens.",
    eligibility: "Anyone with a prescription. Available at Cost Plus Drugs pharmacy.",
    savings: "Up to 90% off brand name",
    website: "https://costplusdrugs.com",
    urgent: false,
  },

  // CGM PROGRAMS
  {
    id: "dexcom-access",
    category: "cgm",
    name: "Dexcom Access Program",
    org: "Dexcom",
    description: "Financial assistance for Dexcom G6 and G7 CGM systems for patients who cannot afford them.",
    eligibility: "US residents with Type 1 or Type 2 diabetes. Income-based qualification.",
    savings: "Free or reduced-cost CGM",
    phone: "1-888-738-3646",
    website: "https://www.dexcom.com/access-program",
    urgent: false,
  },
  {
    id: "libre-access",
    category: "cgm",
    name: "FreeStyle Libre Patient Assistance",
    org: "Abbott",
    description: "Free FreeStyle Libre 2 and 3 sensors for qualifying patients without insurance coverage.",
    eligibility: "Uninsured or underinsured US residents. Income verification required.",
    savings: "Free CGM sensors ($150+/month value)",
    phone: "1-855-632-8658",
    website: "https://www.freestylelibre.us/support/patient-assistance.html",
    urgent: false,
  },

  // PUMP PROGRAMS
  {
    id: "omnipod-access",
    category: "pump",
    name: "Omnipod Patient Assistance Program",
    org: "Insulet Corporation",
    description: "Free or reduced-cost Omnipod DASH and Omnipod 5 systems for qualifying patients.",
    eligibility: "US residents. Income at or below 400% federal poverty level.",
    savings: "Free pump system ($800+ value)",
    phone: "1-800-591-3455",
    website: "https://www.omnipod.com/patient-support",
    urgent: false,
  },
  {
    id: "medtronic-access",
    category: "pump",
    name: "Medtronic Access Program",
    org: "Medtronic",
    description: "Financial assistance for MiniMed insulin pumps and CGM supplies.",
    eligibility: "US residents with financial hardship. Insurance verification required.",
    savings: "Up to 100% of pump cost",
    phone: "1-800-646-4633",
    website: "https://www.medtronicdiabetes.com/customer-support/financial-assistance",
    urgent: false,
  },

  // FINANCIAL ASSISTANCE
  {
    id: "jdrf-advocacy",
    category: "financial",
    name: "JDRF Advocacy & Resources",
    org: "JDRF (Juvenile Diabetes Research Foundation)",
    description: "Connects families with local resources, insurance advocacy, and financial assistance programs for Type 1 diabetes.",
    eligibility: "Anyone with Type 1 diabetes or a family member with T1D.",
    savings: "Insurance advocacy + resource navigation",
    phone: "1-800-533-2873",
    website: "https://www.jdrf.org/t1d-resources",
    urgent: false,
  },
  {
    id: "ada-helpline",
    category: "financial",
    name: "ADA Diabetes Helpline",
    org: "American Diabetes Association",
    description: "Free helpline connecting patients with local resources, food assistance, medication programs, and diabetes education.",
    eligibility: "Anyone with diabetes in the US.",
    savings: "Free navigation service",
    phone: "1-800-342-2383",
    website: "https://www.diabetes.org",
    urgent: false,
  },
  {
    id: "needymeds",
    category: "financial",
    name: "NeedyMeds Drug Assistance",
    org: "NeedyMeds",
    description: "Free database of 10,000+ patient assistance programs for medications, including all diabetes drugs and supplies.",
    eligibility: "Varies by program. Most require income below 200-400% poverty level.",
    savings: "Varies — can cover 100% of costs",
    website: "https://www.needymeds.org",
    urgent: false,
  },
  {
    id: "rxassist",
    category: "financial",
    name: "RxAssist Patient Assistance",
    org: "RxAssist",
    description: "Comprehensive database of pharmaceutical company patient assistance programs, including all major insulin manufacturers.",
    eligibility: "Varies by program.",
    savings: "Free or deeply discounted medications",
    website: "https://www.rxassist.org",
    urgent: false,
  },

  // SUPPLIES
  {
    id: "beyond-type1",
    category: "supplies",
    name: "Beyond Type 1 Supply Drive",
    org: "Beyond Type 1",
    description: "Community-driven program connecting people with excess diabetes supplies to those in need. Free test strips, lancets, and CGM sensors.",
    eligibility: "Anyone with Type 1 diabetes in need of supplies.",
    savings: "Free supplies from community donors",
    website: "https://beyondtype1.org",
    urgent: false,
  },
  {
    id: "strip-safely",
    category: "supplies",
    name: "Spare a Rose Campaign",
    org: "Diabetes Online Community",
    description: "Annual fundraiser providing insulin to children with Type 1 diabetes in developing countries through Life for a Child program.",
    eligibility: "International — children in low-income countries.",
    savings: "Life-saving insulin for children globally",
    website: "https://sparearose.org",
    urgent: false,
  },

  // EDUCATION
  {
    id: "childrens-congress",
    category: "education",
    name: "JDRF Children's Congress",
    org: "JDRF",
    description: "Advocacy program for children with T1D to meet with Congress members and advocate for diabetes research funding.",
    eligibility: "Children ages 4-17 with Type 1 diabetes.",
    savings: "Free advocacy training + Washington DC trip",
    website: "https://www.jdrf.org/childrens-congress",
    urgent: false,
  },
  {
    id: "ada-camp",
    category: "education",
    name: "ADA Diabetes Camp",
    org: "American Diabetes Association",
    description: "Summer camps specifically for children with diabetes, with medical staff on-site. Financial assistance available.",
    eligibility: "Children with diabetes. Scholarships available for low-income families.",
    savings: "Scholarships up to 100% of camp cost",
    phone: "1-800-342-2383",
    website: "https://www.diabetes.org/tools-support/diabetes-camp",
    urgent: false,
  },
];

const CATEGORIES = [
  { key: "all", label: "All", icon: "🔍" },
  { key: "insulin", label: "Insulin", icon: "💉" },
  { key: "cgm", label: "CGM", icon: "📡" },
  { key: "pump", label: "Pump", icon: "⚙️" },
  { key: "supplies", label: "Supplies", icon: "🩹" },
  { key: "financial", label: "Financial", icon: "💰" },
  { key: "education", label: "Education", icon: "🎓" },
];

const CATEGORY_COLORS: Record<string, string> = {
  insulin: "#DC2626",
  cgm: "#7C3AED",
  pump: "#1D4ED8",
  supplies: "#059669",
  financial: "#D97706",
  education: "#0891B2",
};

export default function InsulinResources() {
  const colors = useColors();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = RESOURCES.filter(r => {
    const matchCat = activeCategory === "all" || r.category === activeCategory;
    const matchSearch = search.length === 0 ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.org.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const urgent = filtered.filter(r => r.urgent);
  const regular = filtered.filter(r => !r.urgent);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, "")}`);
  };

  const handleWeb = (url: string) => {
    Linking.openURL(url);
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[resource.category] || "#6B7280" }]}>
          <Text style={styles.categoryBadgeText}>{resource.category.toUpperCase()}</Text>
        </View>
        {resource.urgent && (
          <View style={[styles.urgentBadge, { backgroundColor: "#DC2626" }]}>
            <Text style={styles.urgentText}>URGENT HELP</Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardName, { color: colors.foreground }]}>{resource.name}</Text>
      <Text style={[styles.cardOrg, { color: colors.muted }]}>{resource.org}</Text>
      <Text style={[styles.cardDesc, { color: colors.foreground }]}>{resource.description}</Text>

      <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.muted }]}>Eligibility</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{resource.eligibility}</Text>
      </View>

      <View style={[styles.savingsBox, { backgroundColor: "#064E3B" }]}>
        <Text style={styles.savingsText}>💰 {resource.savings}</Text>
      </View>

      <View style={styles.actions}>
        {resource.phone && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#22C55E" }]}
            onPress={() => handleCall(resource.phone!)}
          >
            <Text style={styles.actionBtnText}>📞 Call Now</Text>
          </TouchableOpacity>
        )}
        {resource.website && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#1D4ED8", flex: 1 }]}
            onPress={() => handleWeb(resource.website!)}
          >
            <Text style={styles.actionBtnText}>🌐 Apply Online</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#064E3B" }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Insulin Assistance</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: "#064E3B" }]}>
        <Text style={styles.heroTitle}>No Child Should Go Without Insulin</Text>
        <Text style={styles.heroSub}>
          {RESOURCES.length} assistance programs • Free & reduced-cost insulin, CGM, and pump supplies
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search programs..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.catBtn,
              activeCategory === cat.key
                ? { backgroundColor: "#22C55E" }
                : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catLabel, { color: activeCategory === cat.key ? "#fff" : colors.foreground }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {urgent.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: "#DC2626" }]}>
              🚨 Urgent Assistance — Get Help Today
            </Text>
            {urgent.map(r => <ResourceCard key={r.id} resource={r} />)}
          </>
        )}

        {regular.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Additional Programs
            </Text>
            {regular.map(r => <ResourceCard key={r.id} resource={r} />)}
          </>
        )}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No programs found. Try a different search.</Text>
          </View>
        )}

        <View style={[styles.disclaimer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.disclaimerText, { color: colors.muted }]}>
            Program details and eligibility requirements may change. Always verify directly with the program provider. Last updated March 2024.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  backText: { color: "#6EE7B7", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  hero: { padding: 20, paddingTop: 0 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 28 },
  heroSub: { color: "#6EE7B7", fontSize: 13, marginTop: 6, lineHeight: 18 },
  searchBar: { margin: 16, marginBottom: 0, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { fontSize: 15 },
  categoryScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 13, fontWeight: "600" },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: "row", gap: 8, marginBottom: 10 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  urgentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  urgentText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  cardName: { fontSize: 17, fontWeight: "800", marginBottom: 2 },
  cardOrg: { fontSize: 13, marginBottom: 8 },
  cardDesc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  infoBox: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
  infoLabel: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
  infoValue: { fontSize: 13, lineHeight: 18 },
  savingsBox: { borderRadius: 10, padding: 10, marginBottom: 12 },
  savingsText: { color: "#6EE7B7", fontSize: 14, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: "center" },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  disclaimer: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 8 },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
});
