import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as NavigationBar from 'expo-navigation-bar';

import Home from '../screens/Home';
import Outfit from '../screens/Outfit';
import Saved from '../screens/Saved';
import Settings from '../screens/Settings';

import { useTheme } from '../theme/ThemeProvider';
import { use$ } from '@legendapp/state/react';
import theme$ from '../stores/theme';

const Tab = createBottomTabNavigator();
const TAB_BAR_HEIGHT = 90;
const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 30 : 15;

export default function AppTabs() {
  NavigationBar.setBackgroundColorAsync('transparent');
  const theme = useTheme()
  const isDark = use$(theme$.isDark)

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          paddingTop: 15,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <View style={styles.blurWrapper}>
            <BlurView
              experimentalBlurMethod='dimezisBlurView'
              tint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
              intensity={90}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarButton: props => <TouchableOpacity {...props} activeOpacity={1} />,
        tabBarIcon: ({ focused }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Outfit': iconName = focused ? 'shirt' : 'shirt-outline'; break;
            case 'Saved': iconName = focused ? 'bookmark' : 'bookmark-outline'; break;
            case 'Settings': iconName = focused ? 'settings' : 'settings-outline'; break;
          }
          return (
            <Ionicons
              name={iconName}
              size={26}
              color={focused ? theme.colors.textPrimary : theme.colors.tabBarIcon}
              style={{ alignSelf: 'center' }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Outfit" component={Outfit} />

      <Tab.Screen
        name="Saved"
        component={Saved}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerBackground: () => (
            <BlurView
              experimentalBlurMethod='dimezisBlurView'
              tint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
              intensity={80}
              style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
            />
          ),
          headerTitleStyle: {
            color: isDark ? theme.colors.textPrimary : theme.colors.tabBarIcon,
            fontWeight: '600',
          },
        }}
      />

      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  blurWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});
