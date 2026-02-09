/**
 * Speech Recognition Service
 * 
 * Provides real-time speech-to-text transcription using cloud speech APIs
 * with medical terminology support and high accuracy for patient intake forms.
 */

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface SpeechRecognitionConfig {
  language?: string;
  enableMedicalTerminology?: boolean;
  enablePunctuation?: boolean;
  enableInterimResults?: boolean;
  maxAlternatives?: number;
}

/**
 * Medical terminology vocabulary for improved recognition accuracy
 */
const MEDICAL_VOCABULARY = [
  // Common medications
  "metformin", "lisinopril", "atorvastatin", "levothyroxine", "amlodipine",
  "omeprazole", "losartan", "gabapentin", "hydrochlorothiazide", "sertraline",
  "simvastatin", "montelukast", "escitalopram", "rosuvastatin", "albuterol",
  
  // Medical conditions
  "hypertension", "diabetes", "hyperlipidemia", "hypothyroidism", "asthma",
  "copd", "arthritis", "osteoporosis", "atrial fibrillation", "neuropathy",
  "gastroesophageal reflux", "coronary artery disease", "congestive heart failure",
  
  // Medical terms
  "milligram", "microgram", "twice daily", "three times daily", "as needed",
  "before meals", "after meals", "at bedtime", "sublingual", "intravenous",
  "subcutaneous", "intramuscular", "topical", "oral", "inhaled",
];

class SpeechRecognitionService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private audioUri: string | null = null;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting microphone permissions:", error);
      return false;
    }
  }

  /**
   * Start recording audio for speech recognition
   */
  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Microphone permission denied");
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error("Failed to start recording");
    }
  }

  /**
   * Stop recording and return audio URI
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error("No active recording");
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.isRecording = false;
      this.recording = null;
      
      if (!uri) {
        throw new Error("Failed to get recording URI");
      }

      this.audioUri = uri;
      return uri;
    } catch (error) {
      console.error("Error stopping recording:", error);
      throw new Error("Failed to stop recording");
    }
  }

  /**
   * Transcribe audio using cloud speech API
   * 
   * In production, this would call a real cloud API like:
   * - Google Cloud Speech-to-Text
   * - Azure Speech Service
   * - AWS Transcribe
   * - AssemblyAI
   * 
   * For now, we'll simulate the API call with mock data
   */
  async transcribeAudio(
    audioUri: string,
    config: SpeechRecognitionConfig = {}
  ): Promise<SpeechRecognitionResult> {
    try {
      // In production, read audio file and send to cloud API
      // const audioData = await FileSystem.readAsStringAsync(audioUri, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });

      // Mock API call - in production, this would be:
      // const response = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${API_KEY}`,
      //   },
      //   body: JSON.stringify({
      //     config: {
      //       encoding: "LINEAR16",
      //       sampleRateHertz: 44100,
      //       languageCode: config.language || "en-US",
      //       enableAutomaticPunctuation: config.enablePunctuation !== false,
      //       model: config.enableMedicalTerminology ? "medical_dictation" : "default",
      //       maxAlternatives: config.maxAlternatives || 3,
      //       speechContexts: config.enableMedicalTerminology ? [{
      //         phrases: MEDICAL_VOCABULARY,
      //         boost: 20,
      //       }] : [],
      //     },
      //     audio: {
      //       content: audioData,
      //     },
      //   }),
      // });
      //
      // const data = await response.json();
      // return this.parseCloudResponse(data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock result
      return {
        transcript: "Sample transcription from speech recognition",
        confidence: 0.95,
        isFinal: true,
        alternatives: [
          {
            transcript: "Sample transcription from speech recognition",
            confidence: 0.95,
          },
          {
            transcript: "Sample transcription for speech recognition",
            confidence: 0.87,
          },
        ],
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  /**
   * Start continuous speech recognition with interim results
   * 
   * This would use streaming recognition in production:
   * - Google Cloud Speech-to-Text Streaming API
   * - Azure Speech Service Real-time API
   * - AWS Transcribe Streaming
   */
  async startContinuousRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    config: SpeechRecognitionConfig = {}
  ): Promise<void> {
    try {
      await this.startRecording();

      // In production, this would stream audio chunks to the API
      // and receive interim and final results in real-time
      
      // Simulate continuous recognition with interim results
      const simulateInterimResults = async () => {
        const interimTexts = [
          "I am taking",
          "I am taking met",
          "I am taking metformin",
          "I am taking metformin 500",
          "I am taking metformin 500 milligrams",
        ];

        for (let i = 0; i < interimTexts.length; i++) {
          if (!this.isRecording) break;

          await new Promise((resolve) => setTimeout(resolve, 500));
          
          onResult({
            transcript: interimTexts[i],
            confidence: 0.8 + (i * 0.03),
            isFinal: false,
          });
        }

        // Final result
        if (this.isRecording) {
          onResult({
            transcript: "I am taking metformin 500 milligrams twice daily.",
            confidence: 0.96,
            isFinal: true,
          });
        }
      };

      simulateInterimResults();
    } catch (error) {
      console.error("Error in continuous recognition:", error);
      throw new Error("Failed to start continuous recognition");
    }
  }

  /**
   * Stop continuous recognition
   */
  async stopContinuousRecognition(): Promise<void> {
    if (this.isRecording) {
      await this.stopRecording();
    }
  }

  /**
   * Verify medical terminology in transcript
   * Returns corrected transcript if medical terms are detected
   */
  verifyMedicalTerminology(transcript: string): {
    corrected: string;
    hasMedicalTerms: boolean;
    detectedTerms: string[];
  } {
    const lowerTranscript = transcript.toLowerCase();
    const detectedTerms: string[] = [];
    let corrected = transcript;

    // Check for medical terms
    for (const term of MEDICAL_VOCABULARY) {
      if (lowerTranscript.includes(term.toLowerCase())) {
        detectedTerms.push(term);
        
        // Ensure proper capitalization
        const regex = new RegExp(term, "gi");
        corrected = corrected.replace(regex, term);
      }
    }

    return {
      corrected,
      hasMedicalTerms: detectedTerms.length > 0,
      detectedTerms,
    };
  }

  /**
   * Get recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error("Error cleaning up recording:", error);
      }
      this.recording = null;
    }

    if (this.audioUri) {
      try {
        await FileSystem.deleteAsync(this.audioUri, { idempotent: true });
      } catch (error) {
        console.error("Error deleting audio file:", error);
      }
      this.audioUri = null;
    }

    this.isRecording = false;
  }

  /**
   * Parse cloud API response
   * (Helper method for production implementation)
   */
  private parseCloudResponse(data: any): SpeechRecognitionResult {
    // Example for Google Cloud Speech-to-Text response
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const alternative = result.alternatives[0];

      return {
        transcript: alternative.transcript,
        confidence: alternative.confidence || 0,
        isFinal: result.isFinal || false,
        alternatives: result.alternatives.map((alt: any) => ({
          transcript: alt.transcript,
          confidence: alt.confidence || 0,
        })),
      };
    }

    throw new Error("Invalid API response");
  }
}

export default new SpeechRecognitionService();
