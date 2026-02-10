import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import {
  getCommunicationLog,
  addCommunicationEntry,
  deleteCommunicationEntry,
  generateBillingSupportStatement,
  type CommunicationEntry,
  type CommunicationMode,
} from '@/lib/communication-log';

export default function CommunicationLogScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<CommunicationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [mode, setMode] = useState<CommunicationMode>('phone');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getCommunicationLog();
      setEntries(data);
    } catch (error) {
      console.error('Error loading communication log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!duration || isNaN(Number(duration))) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    try {
      await addCommunicationEntry({
        date: new Date(),
        mode,
        duration: Number(duration),
        notes,
        doctorName: doctorName || undefined,
        clinicName: clinicName || undefined,
      });

      // Reset form
      setMode('phone');
      setDuration('');
      setNotes('');
      setDoctorName('');
      setClinicName('');
      setShowAddForm(false);

      // Reload entries
      await loadEntries();

      Alert.alert('Success', 'Communication logged successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to log communication');
    }
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this communication log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCommunicationEntry(id);
              await loadEntries();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const handleGenerateStatement = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const now = new Date();
      const statement = await generateBillingSupportStatement(
        now.getMonth(),
        now.getFullYear()
      );

      Alert.alert(
        'Monthly Billing Statement',
        `${statement.month} ${statement.year}\n\n` +
        `Total Communications: ${statement.totalCommunications}\n` +
        `Real-Time Interactions: ${statement.realTimeInteractions}\n` +
        `Total Duration: ${statement.totalDuration} minutes\n\n` +
        `CPT 99470 (10 min): ${statement.eligibleForCPT99470 ? '✅ Eligible' : '❌ Not Eligible'}\n` +
        `CPT 99457 (20 min): ${statement.eligibleForCPT99457 ? '✅ Eligible' : '❌ Not Eligible'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate billing statement');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getModeIcon = (mode: CommunicationMode) => {
    switch (mode) {
      case 'phone':
        return '📞';
      case 'video':
        return '📹';
      case 'portal':
        return '💬';
    }
  };

  const getModeLabel = (mode: CommunicationMode) => {
    switch (mode) {
      case 'phone':
        return 'Phone Call';
      case 'video':
        return 'Video Chat';
      case 'portal':
        return 'Portal Message';
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-foreground">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-primary text-base">← Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">
            Doctor Communication Log
          </Text>
          <Text className="text-base text-muted">
            Track interactions for Medicare billing compliance (CPT 99470/99457)
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => setShowAddForm(!showAddForm)}
            className="flex-1 bg-primary py-3 px-4 rounded-xl"

          >
            <Text className="text-background text-center font-semibold text-base">
              {showAddForm ? 'Cancel' : '+ Log Communication'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGenerateStatement}
            className="flex-1 bg-surface py-3 px-4 rounded-xl border border-border"

          >
            <Text className="text-foreground text-center font-semibold text-base">
              📊 Billing Statement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Entry Form */}
        {showAddForm && (
          <View className="bg-surface p-4 rounded-xl mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">
              Log New Communication
            </Text>

            {/* Mode Selection */}
            <Text className="text-base text-foreground mb-2">Mode *</Text>
            <View className="flex-row gap-2 mb-4">
              {(['phone', 'video', 'portal'] as CommunicationMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMode(m)}
                  className={`flex-1 py-3 px-4 rounded-xl border ${
                    mode === m ? 'bg-primary border-primary' : 'bg-background border-border'
                  }`}

                >
                  <Text
                    className={`text-center font-semibold ${
                      mode === m ? 'text-background' : 'text-foreground'
                    }`}
                  >
                    {getModeIcon(m)} {getModeLabel(m).split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration */}
            <Text className="text-base text-foreground mb-2">Duration (minutes) *</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 15"
              keyboardType="numeric"
              className="bg-background border border-border rounded-xl p-4 text-foreground text-base mb-4"
              placeholderTextColor={colors.muted}
            />

            {/* Doctor Name */}
            <Text className="text-base text-foreground mb-2">Doctor Name (Optional)</Text>
            <TextInput
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="e.g., Dr. Smith"
              className="bg-background border border-border rounded-xl p-4 text-foreground text-base mb-4"
              placeholderTextColor={colors.muted}
            />

            {/* Clinic Name */}
            <Text className="text-base text-foreground mb-2">Clinic Name (Optional)</Text>
            <TextInput
              value={clinicName}
              onChangeText={setClinicName}
              placeholder="e.g., Houston Medical Center"
              className="bg-background border border-border rounded-xl p-4 text-foreground text-base mb-4"
              placeholderTextColor={colors.muted}
            />

            {/* Notes */}
            <Text className="text-base text-foreground mb-2">Notes *</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Discussed BP medication adjustment"
              multiline
              numberOfLines={4}
              className="bg-background border border-border rounded-xl p-4 text-foreground text-base mb-4"
              placeholderTextColor={colors.muted}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAddEntry}
              className="bg-primary py-4 px-6 rounded-xl"
            >
              <Text className="text-background text-center font-bold text-base">
                Save Communication Log
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Entries List */}
        <Text className="text-xl font-bold text-foreground mb-4">
          Communication History ({entries.length})
        </Text>

        {entries.length === 0 ? (
          <View className="bg-surface p-6 rounded-xl items-center">
            <Text className="text-6xl mb-4">📞</Text>
            <Text className="text-lg text-foreground font-semibold mb-2">
              No Communications Logged
            </Text>
            <Text className="text-base text-muted text-center">
              Start logging your doctor communications to maintain Medicare compliance
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {entries.map((entry) => (
              <View
                key={entry.id}
                className="bg-surface p-4 rounded-xl border border-border"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">{getModeIcon(entry.mode)}</Text>
                    <View>
                      <Text className="text-base font-semibold text-foreground">
                        {getModeLabel(entry.mode)}
                      </Text>
                      <Text className="text-sm text-muted">
                        {formatDate(entry.date)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-primary">
                      {entry.duration} min
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntry(entry.id)}
    
                    >
                      <Text className="text-sm text-error">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {(entry.doctorName || entry.clinicName) && (
                  <View className="mb-2">
                    {entry.doctorName && (
                      <Text className="text-sm text-muted">
                        👨‍⚕️ {entry.doctorName}
                      </Text>
                    )}
                    {entry.clinicName && (
                      <Text className="text-sm text-muted">
                        🏥 {entry.clinicName}
                      </Text>
                    )}
                  </View>
                )}

                <Text className="text-base text-foreground">
                  {entry.notes}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
