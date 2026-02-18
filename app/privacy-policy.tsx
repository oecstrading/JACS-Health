import { ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

/**
 * HIPAA-Compliant Privacy Policy Screen
 * 
 * Explicitly outlines how voice logs and wearable data are encrypted
 * and protected according to medical-grade security standards
 */
export default function PrivacyPolicyScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-3xl font-bold text-foreground mb-4">
          Privacy Policy & Security Framework
        </Text>

        <Text className="text-sm text-muted mb-6">
          Last Updated: February 8, 2026
        </Text>

        {/* Introduction */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            1. Introduction
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            JACS Medical Monitoring System is committed to protecting your health information and privacy. This Privacy Policy explains how we collect, use, store, and protect your personal health information (PHI) in compliance with the Health Insurance Portability and Accountability Act (HIPAA), the General Data Protection Regulation (GDPR), and Texas data privacy laws.
          </Text>
        </View>

        {/* Data Protection & Encryption */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            2. Data Protection & Encryption
          </Text>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            2.1 Encryption at Rest
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            All health data stored on your device and our servers is protected using <Text className="font-bold">AES-256 bit encryption</Text>, the same military-grade encryption used by banks and government agencies. This includes:
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Vital signs (blood pressure, heart rate, oxygen saturation, weight)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Voice logs and AI assistant conversations</Text>
            <Text className="text-base text-foreground leading-relaxed">• Medical history and health records</Text>
            <Text className="text-base text-foreground leading-relaxed">• Medication lists and adherence data</Text>
            <Text className="text-base text-foreground leading-relaxed">• Wearable device data (Apple Watch, Omron devices)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Personal identifiers (name, date of birth, contact information)</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            2.2 Encryption in Transit
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            All data transmitted between your device, wearables, and our servers is protected using <Text className="font-bold">TLS 1.3 (Transport Layer Security)</Text>, the latest and most secure encryption protocol. This ensures that:
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Data from Apple Watch to the app is encrypted</Text>
            <Text className="text-base text-foreground leading-relaxed">• Data from Omron devices to the app is encrypted</Text>
            <Text className="text-base text-foreground leading-relaxed">• Data shared with the Caregiver Dashboard is encrypted</Text>
            <Text className="text-base text-foreground leading-relaxed">• Voice recordings sent to AI processing are encrypted</Text>
            <Text className="text-base text-foreground leading-relaxed">• No data can be intercepted or read by unauthorized parties</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            2.3 No Plaintext Storage
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            We never store personally identifiable information (PII) in plaintext. All sensitive data is encrypted before being written to storage, and decrypted only when needed for display to authorized users.
          </Text>
        </View>

        {/* AI Data Ethics & Anonymization */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            3. AI Data Ethics & Anonymization
          </Text>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            3.1 De-identification Before AI Processing
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            Before your health data is processed by AI models for trend analysis and recommendations, we remove all personal identifiers including:
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Name, email address, and phone number</Text>
            <Text className="text-base text-foreground leading-relaxed">• Exact date of birth (converted to age range, e.g., "65-70")</Text>
            <Text className="text-base text-foreground leading-relaxed">• Precise timestamps (converted to dates only)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Address and emergency contact information</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            3.2 AI Data Sharing Control
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            You have complete control over whether your health data is used for AI processing and trend analysis. In the Security Settings menu, you can:
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Toggle "AI Data Sharing" on or off at any time</Text>
            <Text className="text-base text-foreground leading-relaxed">• Opt out of AI features while keeping manual tracking</Text>
            <Text className="text-base text-foreground leading-relaxed">• Request deletion of all AI-processed data</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            3.3 Immediate Data Deletion
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            You can delete your entire health history immediately at any time using the "Delete My Account" function in Security Settings. This permanently removes all data from our servers and your device within 24 hours.
          </Text>
        </View>

        {/* Caregiver Access Control */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            4. Caregiver Access Control
          </Text>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            4.1 Multi-Factor Authentication (MFA)
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            All caregivers must use Multi-Factor Authentication to access your health data. This requires two forms of verification:
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Password or PIN</Text>
            <Text className="text-base text-foreground leading-relaxed">• SMS verification code, email code, or biometric authentication (fingerprint/Face ID)</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            4.2 Audit Logs
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            Every time a caregiver accesses your health data, a permanent, time-stamped audit log is created. These logs include:
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Who accessed your data (caregiver name and ID)</Text>
            <Text className="text-base text-foreground leading-relaxed">• When they accessed it (exact date and time)</Text>
            <Text className="text-base text-foreground leading-relaxed">• What they viewed (vitals, medications, activities, etc.)</Text>
            <Text className="text-base text-foreground leading-relaxed">• IP address and device information</Text>
          </View>
          <Text className="text-base text-foreground leading-relaxed">
            You can review all caregiver access logs at any time in the Caregiver Access History screen. Audit logs are retained for 7 years to comply with HIPAA requirements.
          </Text>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            4.3 Granular Permissions
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            You control exactly what each caregiver can see. Permission levels include View-Only (read health data only), Limited (view data and send messages), and Full (view data, send messages, and manage settings).
          </Text>
        </View>

        {/* Data Collection */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            5. Data We Collect
          </Text>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            5.1 Health Data
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Vital signs (blood pressure, heart rate, weight, oxygen saturation, temperature)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Medication information (names, dosages, schedules, adherence)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Activity data (steps, exercise, sleep)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Symptoms and health notes</Text>
            <Text className="text-base text-foreground leading-relaxed">• Voice recordings for AI assistant interactions</Text>
            <Text className="text-base text-foreground leading-relaxed">• Wearable device data (Apple Watch, Omron blood pressure monitors)</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            5.2 Personal Information
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Name, date of birth, and contact information</Text>
            <Text className="text-base text-foreground leading-relaxed">• Emergency contact details</Text>
            <Text className="text-base text-foreground leading-relaxed">• Healthcare provider information</Text>
            <Text className="text-base text-foreground leading-relaxed">• Insurance information (if provided)</Text>
          </View>

          <Text className="text-base font-semibold text-foreground mt-4 mb-2">
            5.3 Technical Data
          </Text>
          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Device type and operating system</Text>
            <Text className="text-base text-foreground leading-relaxed">• App usage statistics (for improving features)</Text>
            <Text className="text-base text-foreground leading-relaxed">• Error logs and crash reports</Text>
          </View>
        </View>

        {/* Your Rights */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            6. Your Rights
          </Text>

          <Text className="text-base text-foreground leading-relaxed mb-3">
            Under HIPAA, GDPR, and Texas data privacy laws, you have the following rights:
          </Text>

          <View className="ml-4 mb-3">
            <Text className="text-base font-semibold text-foreground">Right to Access:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              You can view all your health data at any time in the app. Use the "Download My Data" button to export a complete copy in JSON or PDF format.
            </Text>

            <Text className="text-base font-semibold text-foreground">Right to Correction:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              You can edit or correct any health data entries directly in the app.
            </Text>

            <Text className="text-base font-semibold text-foreground">Right to Deletion:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              You can delete individual entries or your entire account using the "Delete My Account" function. All data is permanently removed from our servers and your device within 24 hours.
            </Text>

            <Text className="text-base font-semibold text-foreground">Right to Restrict Processing:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              You can disable AI processing of your data by toggling off "AI Data Sharing" in Security Settings.
            </Text>

            <Text className="text-base font-semibold text-foreground">Right to Data Portability:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              You can export your data in machine-readable formats (JSON) to transfer to other health apps.
            </Text>

            <Text className="text-base font-semibold text-foreground">Right to Object:</Text>
            <Text className="text-base text-foreground leading-relaxed">
              You can object to any data processing activity by contacting us at privacy@healthmate.app.
            </Text>
          </View>
        </View>

        {/* Data Sharing */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            7. Data Sharing
          </Text>

          <Text className="text-base text-foreground leading-relaxed mb-3">
            We never sell your health data. We only share your data in the following circumstances:
          </Text>

          <View className="ml-4 mb-3">
            <Text className="text-base font-semibold text-foreground">With Your Caregivers:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              Only caregivers you explicitly invite can access your health data, subject to the permissions you grant.
            </Text>

            <Text className="text-base font-semibold text-foreground">With Healthcare Providers:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              Only when you explicitly share health reports or use the telemedicine feature.
            </Text>

            <Text className="text-base font-semibold text-foreground">For Legal Compliance:</Text>
            <Text className="text-base text-foreground leading-relaxed mb-2">
              If required by law, court order, or to protect your safety in an emergency.
            </Text>

            <Text className="text-base font-semibold text-foreground">With Service Providers:</Text>
            <Text className="text-base text-foreground leading-relaxed">
              We use HIPAA-compliant cloud hosting and AI services. All service providers sign Business Associate Agreements (BAAs) and are contractually required to protect your data.
            </Text>
          </View>
        </View>

        {/* Security Measures */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            8. Security Measures
          </Text>

          <Text className="text-base text-foreground leading-relaxed mb-3">
            In addition to encryption, we implement the following security measures:
          </Text>

          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">• Regular security audits and penetration testing</Text>
            <Text className="text-base text-foreground leading-relaxed">• Automatic session timeouts for caregiver accounts</Text>
            <Text className="text-base text-foreground leading-relaxed">• Suspicious activity detection and alerts</Text>
            <Text className="text-base text-foreground leading-relaxed">• Rate limiting to prevent brute force attacks</Text>
            <Text className="text-base text-foreground leading-relaxed">• Secure key management with automatic key rotation</Text>
            <Text className="text-base text-foreground leading-relaxed">• Breach notification system (you will be notified within 24 hours if a breach occurs)</Text>
          </View>
        </View>

        {/* Data Retention */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            9. Data Retention
          </Text>

          <Text className="text-base text-foreground leading-relaxed">
            We retain your health data for as long as your account is active. If you delete your account, all data is permanently removed within 24 hours, except for audit logs which are retained for 7 years to comply with HIPAA requirements. Audit logs contain only access records, not your actual health data.
          </Text>
        </View>

        {/* Contact Information */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-foreground mb-3">
            10. Contact Us
          </Text>

          <Text className="text-base text-foreground leading-relaxed mb-3">
            If you have questions about this Privacy Policy or your data rights, please contact us:
          </Text>

          <View className="ml-4 mb-3">
            <Text className="text-base text-foreground leading-relaxed">Email: privacy@healthmate.app</Text>
            <Text className="text-base text-foreground leading-relaxed">Privacy Officer: compliance@healthmate.app</Text>
            <Text className="text-base text-foreground leading-relaxed">Phone: 1-800-HEALTHMATE</Text>
          </View>

          <Text className="text-base text-foreground leading-relaxed">
            For data breach notifications or security concerns, email security@healthmate.app immediately.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
