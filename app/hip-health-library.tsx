import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Hip Health Library
 * 
 * Educational content for hip disease and hip replacement:
 * - Osteoarthritis causes, symptoms, treatment
 * - Hip dysplasia and FAI
 * - Hip replacement options
 * - Prevention tips
 * - Post-surgery care guides
 * - FAQs
 */

interface Article {
  id: string;
  title: string;
  category: "Conditions" | "Treatment" | "Prevention" | "Recovery";
  summary: string;
  content: string;
  icon: string;
}

const ARTICLES: Article[] = [
  {
    id: "osteoarthritis",
    title: "Understanding Hip Osteoarthritis",
    category: "Conditions",
    summary: "Learn about the most common cause of hip pain in adults over 50.",
    content: "Hip osteoarthritis occurs when the cartilage cushioning your hip joint wears down over time. Symptoms include pain, stiffness, reduced range of motion, and difficulty walking. Risk factors include age, obesity, previous hip injuries, and genetics. Treatment options range from physical therapy and medications to hip replacement surgery.",
    icon: "🦴",
  },
  {
    id: "hip-dysplasia",
    title: "Hip Dysplasia & FAI",
    category: "Conditions",
    summary: "Congenital hip conditions that can lead to early arthritis.",
    content: "Hip dysplasia is a condition where the hip socket doesn't fully cover the ball portion of the upper thighbone. Femoroacetabular Impingement (FAI) occurs when extra bone grows along the hip joint, causing friction. Both conditions can cause pain and may require surgical correction to prevent arthritis.",
    icon: "⚠️",
  },
  {
    id: "replacement-options",
    title: "Hip Replacement Options",
    category: "Treatment",
    summary: "Total vs Partial, Anterior vs Posterior surgical approaches.",
    content: "Total Hip Replacement replaces both the ball and socket, while Partial replaces only the ball. Anterior approach (front of hip) offers faster recovery and lower dislocation risk. Posterior approach (back of hip) provides better visibility for complex cases. Your surgeon will recommend the best option based on your anatomy and condition.",
    icon: "🏥",
  },
  {
    id: "prevention-tips",
    title: "Hip Health Prevention",
    category: "Prevention",
    summary: "Exercises, weight management, and lifestyle tips to protect your hips.",
    content: "Maintain a healthy weight to reduce hip joint stress. Strengthen hip muscles with exercises like clamshells, bridges, and leg lifts. Avoid high-impact activities if you have hip pain. Use proper ergonomics when sitting and lifting. Wear supportive shoes. Stay active with low-impact exercises like swimming and cycling.",
    icon: "🏃",
  },
  {
    id: "post-surgery-care",
    title: "Post-Surgery Care Guide",
    category: "Recovery",
    summary: "Wound care, infection signs, and activity restrictions after hip replacement.",
    content: "Keep incision clean and dry. Watch for infection signs: increased pain, redness, swelling, drainage, or fever over 101°F. Follow hip precautions: no bending past 90 degrees, no crossing legs, no twisting. Use assistive devices as directed. Attend all follow-up appointments. Report any concerns immediately.",
    icon: "🩹",
  },
  {
    id: "physical-therapy",
    title: "Physical Therapy After Hip Replacement",
    category: "Recovery",
    summary: "What to expect from PT and how to maximize your recovery.",
    content: "PT typically starts the day after surgery. Early exercises focus on circulation and preventing stiffness. Week 2-6: strengthening and increasing range of motion. Week 6-12: advanced exercises and return to activities. Consistency is key—do your home exercises daily. Progress gradually and communicate with your therapist.",
    icon: "💪",
  },
  {
    id: "pain-management",
    title: "Managing Hip Pain",
    category: "Treatment",
    summary: "Medications, ice/heat therapy, and non-surgical pain relief options.",
    content: "Over-the-counter NSAIDs (ibuprofen, naproxen) reduce inflammation. Acetaminophen helps with pain. Ice reduces swelling (use 20 min every 2-3 hours). Heat relaxes muscles (after swelling subsides). Corticosteroid injections provide temporary relief. Physical therapy strengthens supporting muscles. Weight loss reduces joint stress.",
    icon: "💊",
  },
  {
    id: "faq-recovery-time",
    title: "FAQ: How Long is Recovery?",
    category: "Recovery",
    summary: "Timeline for returning to normal activities after hip replacement.",
    content: "Most patients walk with a walker within 24 hours. Transition to cane by Week 4. Drive by Week 6 (if cleared). Return to desk work by Week 6-8. Light activities by Week 12. Full recovery takes 6-12 months. Everyone heals differently—follow your surgeon's specific timeline.",
    icon: "⏱️",
  },
  {
    id: "faq-dislocation-risk",
    title: "FAQ: What is Dislocation Risk?",
    category: "Recovery",
    summary: "Understanding and preventing hip dislocation after surgery.",
    content: "Hip dislocation occurs in 2-5% of patients, usually in first 3 months. Risk is highest with posterior approach. Prevent by following hip precautions: no bending past 90°, no crossing legs, no twisting. Use raised toilet seat, reacher, and sock aid. Sleep with pillow between legs. Risk decreases significantly after 3 months.",
    icon: "⚠️",
  },
  {
    id: "faq-implant-lifespan",
    title: "FAQ: How Long Do Implants Last?",
    category: "Treatment",
    summary: "Expected lifespan of hip replacement implants.",
    content: "Modern hip implants last 15-20+ years in 85-90% of patients. Factors affecting lifespan: patient age, activity level, weight, implant type, and surgical technique. Younger, more active patients may need revision surgery. Ceramic and highly cross-linked polyethylene implants last longer. Regular follow-ups help monitor implant wear.",
    icon: "🔧",
  },
];

export default function HipHealthLibrary() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Conditions", "Treatment", "Prevention", "Recovery"];

  const filteredArticles = ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleArticlePress = (article: Article) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In production, navigate to article detail screen
    alert(`${article.title}\n\n${article.content}`);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Hip Health Library
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Educational resources and expert guidance
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-6 mb-6">
          <View
            className="flex-row items-center px-4 py-3 rounded-2xl"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-base text-foreground"
              placeholder="Search articles..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ lineHeight: 22 }}
            />
          </View>
        </View>

        {/* Category Filter */}
        <View className="px-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category);
                }}
                style={({ pressed }) => ({
                  backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: selectedCategory === category ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  className="text-base font-bold"
                  style={{
                    color: selectedCategory === category ? "#ffffff" : colors.foreground,
                    lineHeight: 22,
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Articles */}
        <View className="px-6 pb-8">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            {selectedCategory === "All" ? "All Articles" : selectedCategory}
          </Text>
          {filteredArticles.length === 0 ? (
            <View className="bg-surface rounded-3xl p-8 items-center border border-border">
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
              <Text className="text-xl font-bold text-foreground mb-2 text-center" style={{ lineHeight: 28 }}>
                No Articles Found
              </Text>
              <Text className="text-base text-muted text-center" style={{ lineHeight: 22 }}>
                Try a different search or category
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {filteredArticles.map((article) => (
                <Pressable
                  key={article.id}
                  onPress={() => handleArticlePress(article)}
                  style={({ pressed }) => ({
                    backgroundColor: colors.surface,
                    borderRadius: 24,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View className="flex-row items-start gap-4">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}20` }}
                    >
                      <Text style={{ fontSize: 32 }}>{article.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <View
                        className="px-3 py-1 rounded-full self-start mb-2"
                        style={{ backgroundColor: `${colors.muted}20` }}
                      >
                        <Text className="text-sm font-bold text-muted" style={{ lineHeight: 20 }}>
                          {article.category}
                        </Text>
                      </View>
                      <Text className="text-xl font-bold text-foreground mb-2" style={{ lineHeight: 28 }}>
                        {article.title}
                      </Text>
                      <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                        {article.summary}
                      </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={24} color={colors.muted} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
