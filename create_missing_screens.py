import os

screens = {
    "emergency-contacts": {
        "title": "Emergency Contacts",
        "description": "Manage your emergency contacts and quick-dial numbers",
        "icon": "phone.fill"
    },
    "health-conditions": {
        "title": "Health Conditions",
        "description": "Track and manage your health conditions and diagnoses",
        "icon": "heart.text.square.fill"
    },
    "privacy-settings": {
        "title": "Privacy Settings",
        "description": "Control your data privacy and sharing preferences",
        "icon": "lock.shield.fill"
    },
    "connected-devices": {
        "title": "Connected Devices",
        "description": "Manage devices synced with HealthMate",
        "icon": "watch.analog"
    },
    "medical-library": {
        "title": "Medical Library",
        "description": "Access health articles, guides, and educational resources",
        "icon": "book.fill"
    },
    "communication-log": {
        "title": "Communication Log",
        "description": "View your communication history with care team",
        "icon": "message.fill"
    },
    "hospice-compliance-tracker": {
        "title": "Hospice Compliance Tracker",
        "description": "Track compliance metrics and regulatory requirements",
        "icon": "checkmark.shield.fill"
    }
}

base_path = "/home/ubuntu/health_companion/app"

for filename, data in screens.items():
    function_name = "".join(word.capitalize() for word in filename.split("-"))
    
    content = f'''import {{ ScrollView, Text, TouchableOpacity, View }} from "react-native";
import {{ router }} from "expo-router";
import {{ ScreenContainer }} from "@/components/screen-container";
import {{ useColors }} from "@/hooks/use-colors";
import {{ IconSymbol }} from "@/components/ui/icon-symbol";

export default function {function_name}Screen() {{
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <TouchableOpacity onPress={{() => router.back()}} className="mb-4">
        <IconSymbol name="chevron.left.forwardslash.chevron.right" size={{24}} color={{colors.primary}} />
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        <View
          className="mb-6 h-24 w-24 items-center justify-center rounded-full"
          style={{{{{{ backgroundColor: colors.primary + "20" }}}}}}
        >
          <IconSymbol name="{data['icon']}" size={{48}} color={{colors.primary}} />
        </View>

        <Text className="mb-2 text-center text-3xl font-bold text-foreground">
          {data['title']}
        </Text>
        <Text className="mb-8 text-center text-base text-muted">
          {data['description']}
        </Text>

        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
          <Text className="text-center text-lg font-semibold text-foreground">
            Coming Soon
          </Text>
          <Text className="mt-2 text-center text-sm text-muted">
            This feature is under development and will be available in a future update.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}}
'''
    
    filepath = os.path.join(base_path, f"{filename}.tsx")
    with open(filepath, "w") as f:
        f.write(content)
    print(f"Created: {filepath}")

print(f"\nSuccessfully created {len(screens)} missing screens")
