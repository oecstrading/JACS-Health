import { ScrollView, Text, View, TextInput, Pressable, Platform } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

/**
 * JACS Medical Monitoring System Marketing Landing Page
 * 
 * Professional landing page targeting hospice agency executives
 * Showcases Revenue Shield value proposition, pilot program, and ROI calculator
 * 
 * Accessible via: /marketing route (web only)
 */
export default function MarketingLandingPage() {
  const [annualRevenue, setAnnualRevenue] = useState("10000000");
  const [formData, setFormData] = useState({
    name: "",
    agency: "",
    email: "",
    phone: "",
    census: "",
  });

  const calculateROI = () => {
    const revenue = parseFloat(annualRevenue) || 0;
    const penalty = revenue * 0.04; // 4% APU penalty
    const qaSavings = 39000; // QA Director time savings
    const nurseSavings = 180000; // Nurse productivity gains
    const totalValue = penalty + qaSavings + nurseSavings;
    const subscription = 32000; // Professional tier
    const roi = totalValue / subscription;
    
    return {
      penalty: penalty.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      totalValue: totalValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      subscription: subscription.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      roi: roi.toFixed(1),
    };
  };

  const handleSubmit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // In production, this would send to CRM/email
    console.log("Pilot inquiry submitted:", formData);
    alert(`Thank you, ${formData.name}! We'll contact you within 24 hours to discuss your pilot program.`);
    
    // Reset form
    setFormData({
      name: "",
      agency: "",
      email: "",
      phone: "",
      census: "",
    });
  };

  const roiData = calculateROI();

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-16 md:px-12 md:py-24">
        <View className="max-w-4xl mx-auto">
          <Text className="text-white text-5xl md:text-6xl font-bold mb-6">
            Your 4% Revenue Shield
          </Text>
          <Text className="text-blue-100 text-xl md:text-2xl mb-8 leading-relaxed">
            Protect your agency from $400K+ HQRP penalties with automated compliance tracking, 
            real-time deadline alerts, and one-click CMS reporting.
          </Text>
          <View className="flex-row gap-4">
            <Pressable 
              className="bg-white px-8 py-4 rounded-lg"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
              onPress={() => {
                // Scroll to contact form
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text className="text-blue-600 font-semibold text-lg">Start Pilot Program</Text>
            </Pressable>
            <Pressable 
              className="border-2 border-white px-8 py-4 rounded-lg"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Text className="text-white font-semibold text-lg">Calculate Your ROI</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Problem Statement */}
      <View className="px-6 py-16 md:px-12 md:py-20 bg-gray-50">
        <View className="max-w-4xl mx-auto">
          <Text className="text-red-600 font-semibold text-sm uppercase tracking-wide mb-4">
            The Compliance Crisis
          </Text>
          <Text className="text-gray-900 text-4xl font-bold mb-6">
            Is Your Agency Leaving 4% of Its Revenue on the Table?
          </Text>
          <Text className="text-gray-700 text-lg leading-relaxed mb-8">
            CMS penalizes hospice agencies 4% of their Annual Payment Update (APU) for failing to submit 
            HIS/HOPE assessments within 30 days. For a $10 million agency, that's <Text className="font-bold text-red-600">$400,000 in preventable penalties</Text>—money 
            that could fund patient care, staff training, or facility improvements.
          </Text>
          
          <View className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <View className="flex-row justify-between mb-6">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-2">Industry Average</Text>
                <Text className="text-3xl font-bold text-red-600">88-92%</Text>
                <Text className="text-gray-600 text-sm">HIS/HOPE Submission Rate</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-2">Required Threshold</Text>
                <Text className="text-3xl font-bold text-green-600">90%</Text>
                <Text className="text-gray-600 text-sm">To Avoid Penalties</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-2">Annual Industry Loss</Text>
                <Text className="text-3xl font-bold text-red-600">$1.8B</Text>
                <Text className="text-gray-600 text-sm">In Preventable Penalties</Text>
              </View>
            </View>
            <Text className="text-gray-700 text-base leading-relaxed">
              Most agencies fall just below the 90% threshold—not because they provide poor care, 
              but because they lack the tools to track submission deadlines and automate reporting workflows.
            </Text>
          </View>
        </View>
      </View>

      {/* Solution Overview */}
      <View className="px-6 py-16 md:px-12 md:py-20">
        <View className="max-w-4xl mx-auto">
          <Text className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4">
            The JACS Medical Monitoring System Solution
          </Text>
          <Text className="text-gray-900 text-4xl font-bold mb-6">
            Compliance at the Point of Care, Not the End of the Month
          </Text>
          <Text className="text-gray-700 text-lg leading-relaxed mb-12">
            JACS Medical Monitoring System's mobile-first compliance platform automates HQRP submissions, CAHPS reporting, 
            and Medicare Cost Report preparation—delivering $796,000 in annual ROI per agency while 
            reducing nurse documentation time by 42%.
          </Text>

          {/* Feature Cards */}
          <View className="gap-6">
            {/* Feature 1 */}
            <View className="bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
              <Text className="text-blue-600 text-2xl font-bold mb-3">📊 Real-Time Compliance Dashboard</Text>
              <Text className="text-gray-700 text-base leading-relaxed mb-4">
                Track HIS/HOPE submission status for every patient with color-coded alerts (Green: &lt;15 days, 
                Yellow: 15-20 days, Red: 21+ days). Our 20-day buffer alert gives your QA team 10 full days 
                to correct errors before the CMS deadline hits.
              </Text>
              <Text className="text-gray-600 text-sm italic">
                "We went from 89% to 97% submission rate in the first 30 days. The 20-day alerts are a game-changer." 
                — QA Director, Suburban Hospice Partners
              </Text>
            </View>

            {/* Feature 2 */}
            <View className="bg-green-50 rounded-xl p-8 border-l-4 border-green-600">
              <Text className="text-green-600 text-2xl font-bold mb-3">📱 Mobile-First Nurse Workflow</Text>
              <Text className="text-gray-700 text-base leading-relaxed mb-4">
                Nurses complete HIS/HOPE assessments on their smartphones during patient visits—no more 
                remembering details hours later or double-documenting in multiple systems. Reduces 
                documentation time by 42%, freeing nurses to spend more time with patients.
              </Text>
              <Text className="text-gray-600 text-sm italic">
                "I used to spend 3 hours a day on paperwork. Now it's 90 minutes. I actually have time to sit 
                with families." — RN, Rural Community Hospice Network
              </Text>
            </View>

            {/* Feature 3 */}
            <View className="bg-purple-50 rounded-xl p-8 border-l-4 border-purple-600">
              <Text className="text-purple-600 text-2xl font-bold mb-3">💰 One-Click Cost Report</Text>
              <Text className="text-gray-700 text-base leading-relaxed mb-4">
                Our Smart-Folder technology automatically categorizes every dollar of labor and equipment 
                expense as it occurs—turning the annual Medicare Cost Report (Form CMS-1984-14) from a 
                21-day accounting nightmare into a one-click export that takes less than one day to finalize.
              </Text>
              <Text className="text-gray-600 text-sm italic">
                "We used to pay our CPA $18,000 to prepare our Cost Report. Last year, we did it ourselves 
                in 4 hours." — CFO, Mid-Size Hospice Agency
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ROI Calculator */}
      <View className="px-6 py-16 md:px-12 md:py-20 bg-blue-50">
        <View className="max-w-4xl mx-auto">
          <Text className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4">
            Calculate Your Risk
          </Text>
          <Text className="text-gray-900 text-4xl font-bold mb-6">
            How Much Could Your Agency Save?
          </Text>
          <Text className="text-gray-700 text-lg leading-relaxed mb-8">
            Enter your annual Medicare revenue to see your potential savings with JACS Medical Monitoring System.
          </Text>

          <View className="bg-white rounded-xl p-8 shadow-lg">
            <Text className="text-gray-700 font-semibold mb-3">Annual Medicare Revenue</Text>
            <TextInput
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg mb-6"
              value={annualRevenue}
              onChangeText={setAnnualRevenue}
              keyboardType="numeric"
              placeholder="$10,000,000"
            />

            <View className="border-t border-gray-200 pt-6 gap-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">4% APU Penalty (if non-compliant)</Text>
                <Text className="text-red-600 font-bold text-lg">{roiData.penalty}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">QA Director Time Savings</Text>
                <Text className="text-green-600 font-bold text-lg">$39,000</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Nurse Productivity Gains (42% reduction)</Text>
                <Text className="text-green-600 font-bold text-lg">$180,000</Text>
              </View>
              <View className="border-t border-gray-300 pt-4 flex-row justify-between">
                <Text className="text-gray-900 font-bold text-xl">Total Annual Value</Text>
                <Text className="text-blue-600 font-bold text-2xl">{roiData.totalValue}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">JACS Medical Monitoring System Subscription (Professional Tier)</Text>
                <Text className="text-gray-900 font-semibold text-lg">{roiData.subscription}</Text>
              </View>
              <View className="bg-blue-100 rounded-lg p-4 flex-row justify-between items-center">
                <Text className="text-blue-900 font-bold text-xl">Your ROI</Text>
                <Text className="text-blue-600 font-bold text-3xl">{roiData.roi}:1</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Pilot Program */}
      <View className="px-6 py-16 md:px-12 md:py-20">
        <View className="max-w-4xl mx-auto">
          <Text className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4">
            90-Day Pilot Program
          </Text>
          <Text className="text-gray-900 text-4xl font-bold mb-6">
            Validate Results Before You Commit
          </Text>
          <Text className="text-gray-700 text-lg leading-relaxed mb-8">
            We're so confident in JACS Medical Monitoring System's value that we offer a 90-day pilot program with 20% discount. 
            Achieve 95%+ APU, reduce nurse documentation time by 40%, and see measurable ROI—or walk away 
            with no long-term commitment.
          </Text>

          <View className="bg-gray-50 rounded-xl p-8">
            <Text className="text-gray-900 font-bold text-2xl mb-6">Pilot Success Metrics</Text>
            <View className="gap-4">
              <View className="flex-row items-start">
                <Text className="text-green-600 text-2xl mr-3">✓</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">95%+ HIS/HOPE Submission Rate</Text>
                  <Text className="text-gray-600">vs. 88-92% industry average</Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-600 text-2xl mr-3">✓</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">&lt;3 Days Average Submission Time</Text>
                  <Text className="text-gray-600">vs. 5.2 days industry average</Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-600 text-2xl mr-3">✓</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">40%+ Nurse Documentation Time Reduction</Text>
                  <Text className="text-gray-600">from 42% to 25% of workday</Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-600 text-2xl mr-3">✓</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">80%+ Net Promoter Score</Text>
                  <Text className="text-gray-600">from nurses and administrators</Text>
                </View>
              </View>
            </View>

            <View className="mt-8 bg-blue-100 rounded-lg p-6">
              <Text className="text-blue-900 font-bold text-xl mb-2">Pilot Pricing</Text>
              <Text className="text-gray-700 text-base leading-relaxed">
                <Text className="font-semibold">$25,600/year</Text> (20% off standard $32,000 pricing) for 90-day pilot. 
                Upon successful completion, commit to 3-year subscription at standard pricing—or walk away with no penalty.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact Form */}
      <View className="px-6 py-16 md:px-12 md:py-20 bg-blue-600">
        <View className="max-w-2xl mx-auto">
          <Text className="text-white text-4xl font-bold mb-4 text-center">
            Ready to Protect Your Revenue?
          </Text>
          <Text className="text-blue-100 text-lg mb-8 text-center">
            Join two pilot agencies (180 combined census) already validating JACS Medical Monitoring System. 
            We'll contact you within 24 hours to discuss your pilot program.
          </Text>

          <View className="bg-white rounded-xl p-8 gap-4">
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Your Name *</Text>
              <TextInput
                className="border-2 border-gray-300 rounded-lg px-4 py-3"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="John Smith"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2">Agency Name *</Text>
              <TextInput
                className="border-2 border-gray-300 rounded-lg px-4 py-3"
                value={formData.agency}
                onChangeText={(text) => setFormData({ ...formData, agency: text })}
                placeholder="Acme Hospice Services"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2">Email Address *</Text>
              <TextInput
                className="border-2 border-gray-300 rounded-lg px-4 py-3"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="john.smith@acmehospice.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2">Phone Number *</Text>
              <TextInput
                className="border-2 border-gray-300 rounded-lg px-4 py-3"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2">Average Daily Census</Text>
              <TextInput
                className="border-2 border-gray-300 rounded-lg px-4 py-3"
                value={formData.census}
                onChangeText={(text) => setFormData({ ...formData, census: text })}
                placeholder="75"
                keyboardType="numeric"
              />
            </View>

            <Pressable
              className="bg-blue-600 py-4 rounded-lg mt-4"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
              onPress={handleSubmit}
            >
              <Text className="text-white font-bold text-lg text-center">
                Request Pilot Program
              </Text>
            </Pressable>

            <Text className="text-gray-500 text-sm text-center mt-2">
              By submitting, you agree to receive communications from JACS Medical Monitoring System. 
              We respect your privacy and will never share your information.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-12 bg-gray-900">
        <View className="max-w-4xl mx-auto">
          <View className="flex-row justify-between mb-8">
            <View className="flex-1">
              <Text className="text-white font-bold text-2xl mb-4">JACS Medical Monitoring System</Text>
              <Text className="text-gray-400 text-sm leading-relaxed">
                Your 4% Revenue Shield for hospice compliance automation.
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold mb-3">Contact</Text>
              <Text className="text-gray-400 text-sm mb-1">cuthbert@oecstrading.com</Text>
              <Text className="text-gray-400 text-sm mb-1">+1 (954) 478-6113</Text>
              <Text className="text-gray-400 text-sm">WhatsApp: +1 (758) 488-1429</Text>
            </View>
          </View>
          <View className="border-t border-gray-800 pt-6">
            <Text className="text-gray-500 text-sm text-center">
              © 2026 JACS Medical Monitoring System, Inc. All rights reserved. | Florida, USA
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
