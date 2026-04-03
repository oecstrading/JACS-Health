import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Glucose Notes Service
 * 
 * Allows users to log exercise, stress, illness, medication changes, and other factors
 * that may affect their glucose levels. Helps identify patterns and triggers.
 */

export type NoteCategory = "exercise" | "stress" | "illness" | "medication" | "sleep" | "other";

export interface GlucoseNote {
  id: string;
  timestamp: Date;
  category: NoteCategory;
  text: string;
  glucoseAtTime?: number; // mg/dL
  tags?: string[]; // e.g., ["cardio", "30min"], ["work stress"], ["flu"]
}

// Quick note templates for common scenarios
export const NOTE_TEMPLATES: Record<NoteCategory, string[]> = {
  exercise: [
    "Walked 30 minutes",
    "Jogged 20 minutes",
    "Strength training 45 minutes",
    "Yoga 30 minutes",
    "Biked 40 minutes",
    "Swam 30 minutes",
    "Light housework",
    "Gardening",
  ],
  stress: [
    "Work stress - high",
    "Work stress - moderate",
    "Family stress",
    "Financial stress",
    "Felt anxious",
    "Felt overwhelmed",
    "Had argument",
    "Stressful meeting",
  ],
  illness: [
    "Cold symptoms",
    "Flu symptoms",
    "Fever",
    "Stomach upset",
    "Headache",
    "Sore throat",
    "Allergies",
    "Not feeling well",
  ],
  medication: [
    "Took extra insulin",
    "Missed insulin dose",
    "Changed insulin timing",
    "Started new medication",
    "Stopped medication",
    "Adjusted basal rate",
    "Changed insulin-to-carb ratio",
    "Took pain reliever",
  ],
  sleep: [
    "Slept well (8+ hours)",
    "Poor sleep (<6 hours)",
    "Woke up frequently",
    "Couldn't fall asleep",
    "Overslept",
    "Napped during day",
    "Jet lag",
    "Changed sleep schedule",
  ],
  other: [
    "Menstrual cycle started",
    "Alcohol consumption",
    "Skipped meal",
    "Ate out at restaurant",
    "Traveled",
    "Changed routine",
    "Hot weather",
    "Cold weather",
  ],
};

class GlucoseNotesService {
  private static instance: GlucoseNotesService;
  private notes: GlucoseNote[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): GlucoseNotesService {
    if (!GlucoseNotesService.instance) {
      GlucoseNotesService.instance = new GlucoseNotesService();
    }
    return GlucoseNotesService.instance;
  }

  private async loadData() {
    try {
      const data = await AsyncStorage.getItem("glucose_notes");
      if (data) {
        this.notes = JSON.parse(data).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
      }
    } catch (error) {
      console.error("Error loading glucose notes:", error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem("glucose_notes", JSON.stringify(this.notes));
    } catch (error) {
      console.error("Error saving glucose notes:", error);
    }
  }

  // Add a note
  async addNote(note: Omit<GlucoseNote, "id">): Promise<GlucoseNote> {
    const newNote: GlucoseNote = {
      ...note,
      id: `note_${Date.now()}`,
    };

    this.notes.push(newNote);

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    this.notes = this.notes.filter((n) => n.timestamp >= ninetyDaysAgo);

    await this.saveData();
    return newNote;
  }

  // Update a note
  async updateNote(noteId: string, updates: Partial<Omit<GlucoseNote, "id" | "timestamp">>): Promise<void> {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      Object.assign(note, updates);
      await this.saveData();
    }
  }

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    this.notes = this.notes.filter((n) => n.id !== noteId);
    await this.saveData();
  }

  // Get notes by date range
  getNotesByDateRange(startDate: Date, endDate: Date): GlucoseNote[] {
    return this.notes.filter(
      (note) => note.timestamp >= startDate && note.timestamp <= endDate
    );
  }

  // Get notes for today
  getTodaysNotes(): GlucoseNote[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getNotesByDateRange(today, tomorrow);
  }

  // Get notes by category
  getNotesByCategory(category: NoteCategory, days: number = 30): GlucoseNote[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.notes.filter(
      (note) => note.category === category && note.timestamp >= startDate
    );
  }

  // Get notes by tag
  getNotesByTag(tag: string, days: number = 30): GlucoseNote[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.notes.filter(
      (note) => note.tags?.includes(tag) && note.timestamp >= startDate
    );
  }

  // Get note by ID
  getNoteById(noteId: string): GlucoseNote | null {
    return this.notes.find((n) => n.id === noteId) || null;
  }

  // Get all notes
  getAllNotes(): GlucoseNote[] {
    return this.notes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get templates for a category
  getTemplates(category: NoteCategory): string[] {
    return NOTE_TEMPLATES[category] || [];
  }

  // Search notes
  searchNotes(query: string): GlucoseNote[] {
    const lowerQuery = query.toLowerCase();
    return this.notes.filter(
      (note) =>
        note.text.toLowerCase().includes(lowerQuery) ||
        note.category.toLowerCase().includes(lowerQuery) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get notes near a specific glucose reading
  getNotesNearGlucose(glucose: number, timestamp: Date, windowMinutes: number = 60): GlucoseNote[] {
    const startTime = new Date(timestamp.getTime() - windowMinutes * 60 * 1000);
    const endTime = new Date(timestamp.getTime() + windowMinutes * 60 * 1000);
    
    return this.notes.filter(
      (note) => note.timestamp >= startTime && note.timestamp <= endTime
    );
  }

  // Analyze correlation between notes and glucose
  analyzeCorrelation(category: NoteCategory, days: number = 30): {
    averageGlucoseWithNote: number;
    averageGlucoseWithoutNote: number;
    correlation: "positive" | "negative" | "neutral";
    noteCount: number;
  } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const categoryNotes = this.getNotesByCategory(category, days);
    const notesWithGlucose = categoryNotes.filter((n) => n.glucoseAtTime !== undefined);
    
    if (notesWithGlucose.length === 0) {
      return {
        averageGlucoseWithNote: 0,
        averageGlucoseWithoutNote: 0,
        correlation: "neutral",
        noteCount: 0,
      };
    }
    
    const totalGlucoseWithNote = notesWithGlucose.reduce(
      (sum, note) => sum + (note.glucoseAtTime || 0),
      0
    );
    const averageGlucoseWithNote = totalGlucoseWithNote / notesWithGlucose.length;
    
    // For simplicity, assume baseline is 120 mg/dL
    // In a real implementation, calculate from all glucose readings
    const averageGlucoseWithoutNote = 120;
    
    const difference = averageGlucoseWithNote - averageGlucoseWithoutNote;
    let correlation: "positive" | "negative" | "neutral" = "neutral";
    
    if (difference > 10) {
      correlation = "positive"; // This factor tends to raise glucose
    } else if (difference < -10) {
      correlation = "negative"; // This factor tends to lower glucose
    }
    
    return {
      averageGlucoseWithNote: Math.round(averageGlucoseWithNote),
      averageGlucoseWithoutNote: Math.round(averageGlucoseWithoutNote),
      correlation,
      noteCount: notesWithGlucose.length,
    };
  }

  // Get most common tags
  getMostCommonTags(limit: number = 10): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();
    
    this.notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Get category statistics
  getCategoryStats(days: number = 30): Record<NoteCategory, number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const recentNotes = this.notes.filter((note) => note.timestamp >= startDate);
    
    const stats: Record<NoteCategory, number> = {
      exercise: 0,
      stress: 0,
      illness: 0,
      medication: 0,
      sleep: 0,
      other: 0,
    };
    
    recentNotes.forEach((note) => {
      stats[note.category]++;
    });
    
    return stats;
  }

  // Export notes to text
  exportNotesToText(startDate: Date, endDate: Date): string {
    const notes = this.getNotesByDateRange(startDate, endDate);
    
    let text = `Glucose Notes Export\n`;
    text += `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n`;
    text += `Total Notes: ${notes.length}\n\n`;
    
    notes.forEach((note) => {
      text += `${note.timestamp.toLocaleString()}\n`;
      text += `Category: ${note.category}\n`;
      text += `Note: ${note.text}\n`;
      if (note.glucoseAtTime) {
        text += `Glucose: ${note.glucoseAtTime} mg/dL\n`;
      }
      if (note.tags && note.tags.length > 0) {
        text += `Tags: ${note.tags.join(", ")}\n`;
      }
      text += `\n`;
    });
    
    return text;
  }
}

// Lazy singleton — defers AsyncStorage/window access until first use (fixes SSR build errors)
let _instance: GlucoseNotesService | null = null;
const _lazy = new Proxy({} as GlucoseNotesService, {
  get(_: GlucoseNotesService, prop: string | symbol) {
    if (!_instance) _instance = GlucoseNotesService.getInstance();
    return (_instance as any)[prop];
  },
  set(_: GlucoseNotesService, prop: string | symbol, value: unknown) {
    if (!_instance) _instance = GlucoseNotesService.getInstance();
    (_instance as any)[prop] = value;
    return true;
  },
});
export default _lazy;
