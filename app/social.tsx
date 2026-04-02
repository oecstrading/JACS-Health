import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  getActiveChallenges,
  getUserAchievements,
  getGlobalLeaderboard,
  getForumPosts,
  joinChallenge,
  type HealthChallenge,
  type Achievement,
  type LeaderboardEntry,
  type ForumPost,
  formatChallengeDuration,
  formatRelativeTime,
} from "@/lib/social";

type TabType = "challenges" | "achievements" | "leaderboard" | "forum";

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("challenges");
  const [challenges, setChallenges] = useState<HealthChallenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [challengesData, achievementsData, leaderboardData, forumData] = await Promise.all([
      getActiveChallenges(),
      getUserAchievements("current-user"),
      getGlobalLeaderboard(),
      getForumPosts(),
    ]);

    setChallenges(challengesData);
    setAchievements(achievementsData);
    setLeaderboard(leaderboardData);
    setForumPosts(forumData);
  }

  async function handleJoinChallenge(challenge: HealthChallenge) {
    try {
      await joinChallenge("current-user", challenge.id);
      Alert.alert(
        "Challenge Joined!",
        `You've joined "${challenge.name}". Good luck!`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to join challenge");
    }
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Community
          </Text>
          <Text className="text-lg text-muted">
            Connect, compete, and stay motivated together
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-6 bg-surface rounded-2xl p-2">
          {(["challenges", "achievements", "leaderboard", "forum"] as TabType[]).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className={`flex-1 py-3 rounded-xl ${
                activeTab === tab ? "bg-primary" : ""
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  activeTab === tab ? "text-white" : "text-muted"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <View>
            <Text className="text-xl font-bold text-foreground mb-4">
              Active Challenges
            </Text>
            {challenges.map(challenge => (
              <View key={challenge.id} className="bg-surface p-5 rounded-2xl mb-4">
                <View className="flex-row items-start mb-3">
                  <Text className="text-4xl mr-3">{challenge.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-foreground mb-1">
                      {challenge.name}
                    </Text>
                    <Text className="text-base text-muted">
                      {challenge.description}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-sm text-muted">Duration</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {formatChallengeDuration(challenge.duration)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-muted">Participants</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {challenge.participants}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-muted">Reward</Text>
                    <Text className="text-base font-semibold text-primary">
                      {challenge.reward} pts
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleJoinChallenge(challenge)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                  })}
                  className="bg-primary py-3 rounded-xl items-center"
                >
                  <Text className="text-white text-base font-bold">Join Challenge</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <View>
            <Text className="text-xl font-bold text-foreground mb-4">
              Your Achievements
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {achievements.map(achievement => (
                <View
                  key={achievement.id}
                  className="bg-surface p-5 rounded-2xl items-center"
                  style={{ width: "47%" as any }}
                >
                  <Text className="text-5xl mb-3">{achievement.icon}</Text>
                  <Text className="text-lg font-bold text-foreground text-center mb-1">
                    {achievement.name}
                  </Text>
                  <Text className="text-sm text-muted text-center mb-2">
                    {achievement.description}
                  </Text>
                  <Text className="text-base font-semibold text-primary">
                    {achievement.points} points
                  </Text>
                  {achievement.unlockedDate && (
                    <Text className="text-xs text-muted mt-2">
                      Unlocked {achievement.unlockedDate.toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <View>
            <Text className="text-xl font-bold text-foreground mb-4">
              Top Community Members
            </Text>
            {leaderboard.map((entry, index) => (
              <View
                key={entry.userId}
                className="bg-surface p-5 rounded-2xl mb-3 flex-row items-center"
              >
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
                  <Text className="text-white text-xl font-bold">
                    #{entry.rank}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {entry.userName}
                  </Text>
                  <Text className="text-sm text-muted">
                    {entry.challengesCompleted} challenges completed
                  </Text>
                </View>
                <Text className="text-xl font-bold text-primary">
                  {entry.points}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Forum Tab */}
        {activeTab === "forum" && (
          <View>
            <Text className="text-xl font-bold text-foreground mb-4">
              Community Forum
            </Text>
            {forumPosts.map(post => (
              <View key={post.id} className="bg-surface p-5 rounded-2xl mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                    <Text className="text-white text-lg font-bold">
                      {post.authorName.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {post.authorName}
                    </Text>
                    <Text className="text-sm text-muted">
                      {formatRelativeTime(post.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text className="text-lg font-bold text-foreground mb-2">
                  {post.title}
                </Text>
                <Text className="text-base text-foreground mb-3">
                  {post.content}
                </Text>

                <View className="flex-row items-center pt-3 border-t border-border">
                  <Pressable
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                    })}
                    className="flex-row items-center mr-4"
                  >
                    <Text className="text-xl mr-1">❤️</Text>
                    <Text className="text-base text-muted">{post.likes}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                    })}
                    className="flex-row items-center"
                  >
                    <Text className="text-xl mr-1">💬</Text>
                    <Text className="text-base text-muted">
                      {post.comments.length}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
