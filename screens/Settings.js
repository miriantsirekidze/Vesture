import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import AnimatedToggle from '../components/animations/AnimatedToggle';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme$ from '../stores/theme';
import { use$ } from '@legendapp/state/react';

import { useTheme } from "../theme/ThemeProvider";

const Settings = () => {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const [currency, setCurrency] = useState('Local');
  const [subscriptionPlan] = useState('Pro');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const isDark = use$(theme$.isDark)
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: headerHeight }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <View style={styles.header}>
            <Ionicons name="person-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>Account Details</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Email</Text>
            <Text style={styles.itemValue}>miriani.tsirekidze@example.com</Text>
          </View>
          <TouchableOpacity style={[styles.itemRow, { justifyContent: 'none' }]}>
            <Text style={styles.itemLabel}>Change Password</Text>
            <Ionicons name="pencil" size={18} style={styles.iconRight} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.itemRow, { justifyContent: 'none' }]}>
            <Text style={[styles.itemLabel, styles.deleteText]}>Delete Account</Text>
            <Ionicons name="trash-outline" size={18} style={[styles.iconRight, styles.deleteText]} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.section}>
          <View style={styles.header}>
            <Ionicons name="color-palette-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>Theme</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Dark Mode</Text>
            <AnimatedToggle
              value={isDark}
              onValueChange={() => theme$.changeTheme()}
              iconOff="moon"
              iconOn="sunny"
            />
          </View>
        </View>
        <View style={styles.separator} />

        <View style={styles.section}>
          <View style={styles.header}>
            <Ionicons name="cash-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>Default Currency</Text>
          </View>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={styles.itemLabel}>Currency</Text>
            <Text style={styles.itemValue}>{currency}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        {/* Subscription */}
        <View style={styles.section}>
          <View style={styles.header}>
            <Ionicons name="card-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>Subscription</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Current Plan</Text>
            <Text style={styles.itemValue}>{subscriptionPlan}</Text>
          </View>
        </View>
        <View style={styles.separator} />

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.header}>
            <Ionicons name="notifications-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>Push Notifications</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Price Drop Alerts</Text>
            <AnimatedToggle
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              iconOn="close"
              iconOff="checkmark"
            />
          </View>
        </View>
        <View style={styles.separator} />

        {/* TOS & PP */}
        <View style={styles.section}>
          <View style={styles.header}>
            <Ionicons name="document-text-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>TOS & Privacy Policy</Text>
          </View>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={styles.itemLabel}>View Documents</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        {/* Contact */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.header}>
            <Ionicons name="mail-outline" size={20} style={styles.icon} />
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={styles.itemLabel}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Settings;

const makeStyles = theme =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginVertical: 20,
      marginLeft: 5,
    },
    section: {
      marginBottom: 10,
    },
    lastSection: {
      marginBottom: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },
    icon: {
      marginRight: 8,
      color: theme.colors.textPrimary,
    },
    iconRight: {
      marginLeft: 5,
      color: theme.colors.textPrimary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    itemLabel: {
      fontSize: 16,
      fontWeight: '400',
      color: theme.colors.textSecondary,
    },
    itemValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    deleteText: {
      color: '#CC3333',
      fontWeight: '600',
    },
    separator: {
      height: 1,
      backgroundColor: '#E0E0E0',
      marginVertical: 8,
    },
  })

