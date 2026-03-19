import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface FamilyMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "text" | "alert" | "vitals";
  isPinned: boolean;
  isUrgent: boolean;
  timestamp: string;
}

const MESSAGES_KEY = "jacs_family_messages";
const USER_KEY = "jacs_user_profile";

export default function FamilyChatScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState({ id: "user_1", name: "You" });
  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Seed with a welcome message
        const welcome: FamilyMessage[] = [
          {
            id: "msg_welcome",
            senderId: "system",
            senderName: "JACS Health",
            content: "Welcome to Family Circle Chat. Share health updates and stay connected with your care team.",
            type: "text",
            isPinned: true,
            isUrgent: false,
            timestamp: new Date().toISOString(),
          },
        ];
        setMessages(welcome);
        await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(welcome));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadMessages();
    // 5-second polling as per migration spec
    pollRef.current = setInterval(loadMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadMessages]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const newMsg: FamilyMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: inputText.trim(),
      type: "text",
      isPinned: false,
      isUrgent: false,
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText("");
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText, messages, currentUser]);

  const togglePin = useCallback(
    async (msgId: string) => {
      const updated = messages.map((m) =>
        m.id === msgId ? { ...m, isPinned: !m.isPinned } : m,
      );
      setMessages(updated);
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [messages],
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const pinnedMessages = messages.filter((m) => m.isPinned);

  const renderMessage = ({ item }: { item: FamilyMessage }) => {
    const isOwn = item.senderId === currentUser.id;
    const isSystem = item.senderId === "system";
    return (
      <TouchableOpacity
        onLongPress={() =>
          Alert.alert("Message Options", "", [
            { text: item.isPinned ? "Unpin" : "Pin", onPress: () => togglePin(item.id) },
            { text: "Cancel", style: "cancel" },
          ])
        }
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : isSystem ? styles.systemBubble : styles.otherBubble,
          item.isPinned && styles.pinnedBubble,
          item.isUrgent && styles.urgentBubble,
          { backgroundColor: isOwn ? colors.primary : isSystem ? colors.surface : colors.surface },
        ]}
      >
        {!isOwn && !isSystem && (
          <Text style={[styles.senderName, { color: colors.primary }]}>{item.senderName}</Text>
        )}
        {item.isPinned && (
          <Text style={[styles.pinnedLabel, { color: colors.warning }]}>📌 Pinned</Text>
        )}
        <Text style={[styles.messageText, { color: isOwn ? "#fff" : colors.foreground }]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, { color: isOwn ? "rgba(255,255,255,0.7)" : colors.muted }]}>
          {formatTime(item.timestamp)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Family Circle Chat</Text>
          <View style={styles.onlineIndicator}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.onlineText, { color: colors.muted }]}>Live</Text>
          </View>
        </View>

        {/* Pinned messages banner */}
        {pinnedMessages.length > 0 && (
          <View style={[styles.pinnedBanner, { backgroundColor: colors.warning + "20", borderColor: colors.warning }]}>
            <Text style={[styles.pinnedBannerText, { color: colors.foreground }]}>
              📌 {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? "s" : ""} — long-press to unpin
            </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: { marginRight: 12 },
  backText: { fontSize: 16, fontWeight: "600" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700" },
  onlineIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontSize: 12 },
  pinnedBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pinnedBannerText: { fontSize: 13 },
  messageList: { padding: 16, gap: 8 },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  ownBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  otherBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  systemBubble: { alignSelf: "center", borderRadius: 12 },
  pinnedBubble: { borderWidth: 1.5, borderColor: "#F59E0B" },
  urgentBubble: { borderWidth: 2, borderColor: "#EF4444" },
  senderName: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  pinnedLabel: { fontSize: 11, marginBottom: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 11, marginTop: 4, alignSelf: "flex-end" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: 0.5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
