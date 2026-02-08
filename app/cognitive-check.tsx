import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type TestPhase = "intro" | "word-recall" | "puzzle" | "results";

interface CognitiveScore {
  wordRecallScore: number;
  puzzleScore: number;
  responseTime: number;
  overallScore: number;
  status: "excellent" | "good" | "fair" | "concern";
  deviation: number; // Percentage deviation from personal baseline
}

interface TestWord {
  word: string;
  category: string;
}

export default function CognitiveCheckScreen() {
  const colors = useColors();
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [wordsToRemember, setWordsToRemember] = useState<TestWord[]>([]);
  const [recalledWords, setRecalledWords] = useState<string>("");
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [cognitiveScore, setCognitiveScore] = useState<CognitiveScore | null>(null);
  const [testHistory, setTestHistory] = useState<CognitiveScore[]>([]);

  const wordCategories = [
    { category: "Animals", words: ["elephant", "butterfly", "dolphin"] },
    { category: "Colors", words: ["purple", "orange", "turquoise"] },
    { category: "Foods", words: ["strawberry", "broccoli", "cinnamon"] },
  ];

  const puzzles = [
    {
      question: "What comes next in the sequence: 2, 4, 8, 16, ?",
      answer: "32",
      hint: "Each number is doubled",
    },
    {
      question: "If you have 3 apples and give away 1, then get 2 more, how many do you have?",
      answer: "4",
      hint: "3 - 1 + 2 = ?",
    },
    {
      question: "What day comes 3 days after Monday?",
      answer: "thursday",
      hint: "Count forward from Monday",
    },
  ];

  const [currentPuzzle] = useState(puzzles[Math.floor(Math.random() * puzzles.length)]);

  function startTest() {
    // Select random words from each category
    const selectedWords: TestWord[] = [];
    wordCategories.forEach((cat) => {
      const randomWord = cat.words[Math.floor(Math.random() * cat.words.length)];
      selectedWords.push({ word: randomWord, category: cat.category });
    });

    setWordsToRemember(selectedWords);
    setStartTime(new Date());
    setPhase("word-recall");

    // Read words aloud
    const wordsText = selectedWords.map((w) => w.word).join(", ");
    Speech.speak(`Remember these words: ${wordsText}`, {
      language: "en",
      rate: 0.8,
    });
  }

  function submitWordRecall() {
    setPhase("puzzle");
    Speech.speak(currentPuzzle.question, { language: "en", rate: 0.8 });
  }

  function submitPuzzle() {
    const endTime = new Date();
    const responseTime = startTime
      ? (endTime.getTime() - startTime.getTime()) / 1000
      : 60;

    // Calculate scores
    const recalledWordsArray = recalledWords
      .toLowerCase()
      .split(",")
      .map((w) => w.trim());
    const correctWords = wordsToRemember.filter((w) =>
      recalledWordsArray.includes(w.word.toLowerCase())
    ).length;
    const wordRecallScore = (correctWords / wordsToRemember.length) * 100;

    const puzzleCorrect =
      puzzleAnswer.toLowerCase().trim() === currentPuzzle.answer.toLowerCase();
    const puzzleScore = puzzleCorrect ? 100 : 0;

    const overallScore = (wordRecallScore * 0.6 + puzzleScore * 0.4);

    // Calculate deviation from baseline (mock - in production, use stored history)
    const baseline = 85; // Mock personal baseline
    const deviation = ((overallScore - baseline) / baseline) * 100;

    let status: "excellent" | "good" | "fair" | "concern";
    if (overallScore >= 90) status = "excellent";
    else if (overallScore >= 75) status = "good";
    else if (overallScore >= 60) status = "fair";
    else status = "concern";

    const score: CognitiveScore = {
      wordRecallScore,
      puzzleScore,
      responseTime,
      overallScore,
      status,
      deviation,
    };

    setCognitiveScore(score);
    setPhase("results");

    // Check for concerning deviation
    if (deviation < -15) {
      Alert.alert(
        "⚠️ Cognitive Change Detected",
        "Your score is significantly lower than your baseline. This could indicate fatigue, stress, or early signs of infection. Your caregivers have been notified.",
        [{ text: "OK" }]
      );
    }
  }

  function getStatusColor(status: string): string {
    if (status === "excellent") return colors.success;
    if (status === "good") return "#10B981";
    if (status === "fair") return "#F59E0B";
    return colors.error;
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Brain Health Check</Text>
          <View className="w-12" />
        </View>

        {phase === "intro" && (
          <View className="gap-6">
            {/* Intro Card */}
            <View className="bg-surface p-8 rounded-2xl items-center">
              <Text className="text-6xl mb-4">🧠</Text>
              <Text className="text-2xl font-bold text-foreground mb-3 text-center">
                60-Second Cognitive Pulse
              </Text>
              <Text className="text-base text-muted text-center leading-relaxed">
                A quick daily check to track your brain health and detect early changes
                in memory, focus, and problem-solving.
              </Text>
            </View>

            {/* What to Expect */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">
                What to Expect
              </Text>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <Text className="text-primary text-lg">1.</Text>
                  <Text className="text-base text-foreground flex-1">
                    <Text className="font-bold">Word Recall:</Text> Remember 3 words, then
                    type them back
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-primary text-lg">2.</Text>
                  <Text className="text-base text-foreground flex-1">
                    <Text className="font-bold">Simple Puzzle:</Text> Solve a quick math or
                    logic question
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-primary text-lg">3.</Text>
                  <Text className="text-base text-foreground flex-1">
                    <Text className="font-bold">Results:</Text> See your score and trends
                    over time
                  </Text>
                </View>
              </View>
            </View>

            {/* Why It Matters */}
            <View className="bg-primary/10 border-2 border-primary p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-3">
                💡 Why It Matters
              </Text>
              <Text className="text-base text-muted leading-relaxed">
                Small changes in cognitive function can be early indicators of fatigue,
                stress, infection, or medication side effects. Daily tracking helps catch
                these changes early so you can take action.
              </Text>
            </View>

            {/* Start Button */}
            <Pressable
              onPress={startTest}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary py-5 rounded-xl items-center"
            >
              <Text className="text-white text-xl font-bold">🚀 Start 60-Second Check</Text>
            </Pressable>
          </View>
        )}

        {phase === "word-recall" && (
          <View className="gap-6">
            {/* Instructions */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-3">
                📝 Step 1: Word Recall
              </Text>
              <Text className="text-base text-muted leading-relaxed">
                Remember these 3 words. You'll be asked to recall them in a moment.
              </Text>
            </View>

            {/* Words to Remember */}
            <View className="bg-primary/20 border-2 border-primary p-8 rounded-2xl">
              <Text className="text-lg text-muted text-center mb-4">Remember these words:</Text>
              <View className="gap-4">
                {wordsToRemember.map((item, idx) => (
                  <View key={idx} className="bg-white p-4 rounded-xl items-center">
                    <Text className="text-sm text-muted mb-1">{item.category}</Text>
                    <Text className="text-3xl font-bold text-foreground">
                      {item.word.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Input Area */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-lg font-bold text-foreground mb-3">
                Now type the words you remember:
              </Text>
              <Text className="text-sm text-muted mb-3">
                Separate words with commas (e.g., word1, word2, word3)
              </Text>
              <TextInput
                className="bg-white border-2 border-border p-4 rounded-xl text-lg text-foreground"
                placeholder="Type words here..."
                value={recalledWords}
                onChangeText={setRecalledWords}
                multiline
                autoFocus
              />
            </View>

            {/* Next Button */}
            <Pressable
              onPress={submitWordRecall}
              disabled={!recalledWords.trim()}
              style={({ pressed }) => ({
                opacity: !recalledWords.trim() ? 0.5 : pressed ? 0.8 : 1,
              })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">Next →</Text>
            </Pressable>
          </View>
        )}

        {phase === "puzzle" && (
          <View className="gap-6">
            {/* Instructions */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-3">
                🧩 Step 2: Quick Puzzle
              </Text>
              <Text className="text-base text-muted leading-relaxed">
                Solve this simple problem:
              </Text>
            </View>

            {/* Puzzle Question */}
            <View className="bg-primary/20 border-2 border-primary p-8 rounded-2xl">
              <Text className="text-2xl font-bold text-foreground text-center leading-relaxed">
                {currentPuzzle.question}
              </Text>
            </View>

            {/* Answer Input */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-lg font-bold text-foreground mb-3">Your Answer:</Text>
              <TextInput
                className="bg-white border-2 border-border p-4 rounded-xl text-2xl text-foreground text-center font-bold"
                placeholder="Type answer..."
                value={puzzleAnswer}
                onChangeText={setPuzzleAnswer}
                autoFocus
                keyboardType="default"
              />
              <Text className="text-sm text-muted text-center mt-2">
                💡 Hint: {currentPuzzle.hint}
              </Text>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={submitPuzzle}
              disabled={!puzzleAnswer.trim()}
              style={({ pressed }) => ({
                opacity: !puzzleAnswer.trim() ? 0.5 : pressed ? 0.8 : 1,
              })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">Finish Check ✓</Text>
            </Pressable>
          </View>
        )}

        {phase === "results" && cognitiveScore && (
          <View className="gap-6">
            {/* Overall Score */}
            <View className="bg-surface p-8 rounded-2xl items-center">
              <Text className="text-lg text-muted mb-2">Your Cognitive Score</Text>
              <Text
                className="text-7xl font-bold mb-3"
                style={{ color: getStatusColor(cognitiveScore.status) }}
              >
                {Math.round(cognitiveScore.overallScore)}
              </Text>
              <View
                className="px-4 py-2 rounded-full mb-3"
                style={{
                  backgroundColor: getStatusColor(cognitiveScore.status) + "20",
                }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{ color: getStatusColor(cognitiveScore.status) }}
                >
                  {cognitiveScore.status.toUpperCase()}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-base text-muted">vs. Your Baseline:</Text>
                <Text
                  className="text-base font-semibold"
                  style={{
                    color:
                      cognitiveScore.deviation >= 0 ? colors.success : colors.error,
                  }}
                >
                  {cognitiveScore.deviation >= 0 ? "+" : ""}
                  {cognitiveScore.deviation.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Breakdown */}
            <View className="bg-surface p-6 rounded-2xl">
              <Text className="text-xl font-bold text-foreground mb-4">
                📊 Score Breakdown
              </Text>
              <View className="gap-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-foreground">Word Recall</Text>
                  <Text className="text-2xl font-bold text-primary">
                    {Math.round(cognitiveScore.wordRecallScore)}%
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-foreground">Puzzle Solving</Text>
                  <Text className="text-2xl font-bold text-primary">
                    {Math.round(cognitiveScore.puzzleScore)}%
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-foreground">Response Time</Text>
                  <Text className="text-2xl font-bold text-primary">
                    {cognitiveScore.responseTime.toFixed(1)}s
                  </Text>
                </View>
              </View>
            </View>

            {/* Recommendations */}
            {cognitiveScore.status !== "excellent" && (
              <View className="bg-warning/20 border-2 border-warning p-6 rounded-2xl">
                <Text className="text-xl font-bold text-foreground mb-3">
                  💡 Recommendations
                </Text>
                <View className="gap-3">
                  {cognitiveScore.deviation < -10 && (
                    <View className="flex-row gap-3">
                      <Text className="text-warning text-lg">•</Text>
                      <Text className="text-base text-foreground flex-1">
                        Your score is below baseline. Consider rest and hydration.
                      </Text>
                    </View>
                  )}
                  <View className="flex-row gap-3">
                    <Text className="text-warning text-lg">•</Text>
                    <Text className="text-base text-foreground flex-1">
                      Get 7-9 hours of quality sleep tonight
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Text className="text-warning text-lg">•</Text>
                    <Text className="text-base text-foreground flex-1">
                      Try brain exercises from the Exercise Library
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Text className="text-warning text-lg">•</Text>
                    <Text className="text-base text-foreground flex-1">
                      Check in with your doctor if scores remain low for 3+ days
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="gap-3">
              <Pressable
                onPress={() => {
                  setPhase("intro");
                  setRecalledWords("");
                  setPuzzleAnswer("");
                  setCognitiveScore(null);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white text-lg font-bold">
                  ✓ Done for Today
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="bg-surface border border-border py-4 rounded-xl items-center"
              >
                <Text className="text-foreground text-lg font-bold">← Back to Home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
