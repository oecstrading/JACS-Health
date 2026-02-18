import { View, Text, ScrollView, Pressable, TextInput, FlatList } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { LabTestTrendModal } from "@/components/LabTestTrendModal";

interface LabResult {
  testDate: string;
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: "Normal" | "High" | "Low";
  category: string;
}

export default function LabResultsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LabResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showTrendModal, setShowTrendModal] = useState(false);

  // Load lab results from CSV
  useEffect(() => {
    loadLabResults();
  }, []);

  const loadLabResults = async () => {
    try {
      const response = await fetch("/medical-data/janice_complete_lab_database.csv");
      const csvText = await response.text();
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",");
      
      const results: LabResult[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        results.push({
          testDate: values[0]?.trim() || "",
          testName: values[1]?.trim() || "",
          result: values[2]?.trim() || "",
          unit: values[3]?.trim() || "",
          referenceRange: values[4]?.trim() || "",
          status: (values[5]?.trim() || "Normal") as "Normal" | "High" | "Low",
          category: values[6]?.trim() || "Other",
        });
      }
      
      setLabResults(results);
      setFilteredResults(results);
    } catch (error) {
      console.error("Error loading lab results:", error);
    }
  };

  // Filter and sort results
  useEffect(() => {
    let results = [...labResults];

    // Apply search filter
    if (searchQuery) {
      results = results.filter(
        (r) =>
          r.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      results = results.filter((r) => r.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== "All") {
      results = results.filter((r) => r.status === selectedStatus);
    }

    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.testDate).getTime() - new Date(b.testDate).getTime();
      } else if (sortBy === "name") {
        comparison = a.testName.localeCompare(b.testName);
      } else if (sortBy === "status") {
        const statusOrder = { High: 0, Low: 1, Normal: 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredResults(results);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder, labResults]);

  const categories = ["All", ...Array.from(new Set(labResults.map((r) => r.category)))];
  const statuses = ["All", "High", "Low", "Normal"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "High":
        return "#F44336";
      case "Low":
        return "#FF9800";
      case "Normal":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const toggleSort = (field: "date" | "name" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleTestClick = (testName: string) => {
    setSelectedTest(testName);
    setShowTrendModal(true);
  };

  const renderLabResult = ({ item }: { item: LabResult }) => (
    <Pressable
      onPress={() => handleTestClick(item.testName)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="bg-white border border-border rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-foreground flex-1">
          {item.testName}
        </Text>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(item.status) + "20" }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">
            {item.result} <Text className="text-sm text-muted">{item.unit}</Text>
          </Text>
        </View>
        <Text className="text-xs text-muted">
          {new Date(item.testDate).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row justify-between items-center pt-2 border-t border-border">
        <Text className="text-xs text-muted">
          Reference: {item.referenceRange}
        </Text>
        <Text className="text-xs text-muted bg-surface px-2 py-1 rounded">
          {item.category}
        </Text>
      </View>
    </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href={`/medical-records/${id}`} asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Dashboard</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Lab Results
          </Text>
          <Text className="text-base text-white/90">
            {filteredResults.length} of {labResults.length} results
          </Text>
        </View>

        {/* Search Bar */}
        <View className="p-4 bg-white border-b border-border">
          <TextInput
            className="bg-surface p-4 rounded-lg text-foreground text-base"
            placeholder="Search by test name or category..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View className="bg-surface/50 border-b border-border p-4">
          {/* Category Filter */}
          <Text className="text-sm font-semibold text-foreground mb-2">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedCategory === category
                      ? "bg-primary"
                      : "bg-white border border-border"
                  }`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === category ? "text-white" : "text-foreground"
                    }`}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Status Filter */}
          <Text className="text-sm font-semibold text-foreground mb-2">Status</Text>
          <View className="flex-row">
            {statuses.map((status) => (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                className={`px-4 py-2 mr-2 rounded-full ${
                  selectedStatus === status
                    ? "bg-primary"
                    : "bg-white border border-border"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedStatus === status ? "text-white" : "text-foreground"
                  }`}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sort Controls */}
        <View className="bg-white border-b border-border p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-semibold text-foreground">Sort By:</Text>
            <View className="flex-row">
              <Pressable
                onPress={() => toggleSort("date")}
                className={`px-3 py-2 mr-2 rounded ${
                  sortBy === "date" ? "bg-primary" : "bg-surface"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "date" ? "text-white" : "text-foreground"
                  }`}
                >
                  Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => toggleSort("name")}
                className={`px-3 py-2 mr-2 rounded ${
                  sortBy === "name" ? "bg-primary" : "bg-surface"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "name" ? "text-white" : "text-foreground"
                  }`}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => toggleSort("status")}
                className={`px-3 py-2 rounded ${
                  sortBy === "status" ? "bg-primary" : "bg-surface"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "status" ? "text-white" : "text-foreground"
                  }`}
                >
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredResults}
          renderItem={renderLabResult}
          keyExtractor={(item, index) => `${item.testDate}-${item.testName}-${index}`}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-muted text-center">
                No lab results found matching your filters
              </Text>
            </View>
          }
        />
      </View>

      {/* Trend Modal */}
      {selectedTest && (
        <LabTestTrendModal
          visible={showTrendModal}
          onClose={() => setShowTrendModal(false)}
          testName={selectedTest}
          allResults={labResults.map((r) => ({
            test_name: r.testName,
            result: r.result,
            unit: r.unit,
            test_date: r.testDate,
            reference_range: r.referenceRange,
            status: r.status,
            category: r.category,
          }))}
        />
      )}
    </ScreenContainer>
  );
}
