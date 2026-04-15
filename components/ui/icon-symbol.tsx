// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Partial<Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "mic.fill": "mic",
  "stop.fill": "stop",
  "folder.fill": "folder",
  "chart.bar.fill": "bar-chart",
  "fork.knife": "restaurant",
  "drop.fill": "water-drop",
  "heart.fill": "favorite",
  "person.2.fill": "people",
  "gearshape.fill": "settings",
  "pills.fill": "medication",
  "checkmark.circle.fill": "check-circle",
  "plus.circle.fill": "add-circle",
  "figure.walk": "directions-walk",
  "bell.fill": "notifications",
  "calendar.fill": "event",
  "clock.fill": "schedule",
  "location.fill": "location-on",
  "exclamationmark.triangle.fill": "warning",
  "phone.fill": "phone",
  "chevron.left": "chevron-left",
  "trash": "delete",
  "envelope.fill": "email",
  "checkmark": "check",
  "info.circle.fill": "info",
  "shield.fill": "shield",
  "shield.checkmark.fill": "verified-user",
  "trash.fill": "delete-forever",
  "document.fill": "description",
  "sparkles": "auto-awesome",
  "doc.text.fill": "description",
  "calendar.badge.clock": "event",
  "dollarsign.circle.fill": "attach-money",
  "cross.fill": "local-hospital",
  "chart.line.uptrend.xyaxis": "trending-up",
  "book.fill": "menu-book",
  "antenna.radiowaves.left.and.right": "wifi",
  "arrow.down.circle.fill": "download",
  "waveform.path.ecg": "monitor-heart",
  "syringe.fill": "vaccines",
  "star.fill": "star",
  "megaphone.fill": "campaign",
  "globe": "public",
  "heart.text.square.fill": "health-and-safety",
} as IconMapping;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
