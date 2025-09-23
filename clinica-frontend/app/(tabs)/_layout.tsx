import { Tabs } from "expo-router";
import React from "react";
import { BlurView } from "expo-blur";
import { Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { HapticTab } from "@/components/haptic-tab";

const AnimatedIcon = ({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) => {
  const scale = React.useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaterialIcons name={name as any} size={32} color={color} />
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView
            intensity={20}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              backgroundColor: "rgba(243, 242, 242, 1)",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pacientes",
          tabBarActiveTintColor: "#0ea5e9",
          tabBarInactiveTintColor: "#c9b0e0ff",
          tabBarItemStyle: { borderRightWidth: 2, borderRightColor: "#ccc" },
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name="person-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Citas",
          tabBarActiveTintColor: "#8A2BE2",
          tabBarInactiveTintColor: "#add1e1ff",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="event-note" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
