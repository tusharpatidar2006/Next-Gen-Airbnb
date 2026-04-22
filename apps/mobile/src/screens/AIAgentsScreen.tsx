import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  lavender: '#d4e4f7',
  steelBlue: '#8faec8',
  darkNavy: '#1a2742',
  white: '#ffffff',
  background: '#f2f4f8',
};

const TRAVEL_AGENT = {
  id: 'trip-planner',
  name: 'Travel Agent',
  icon: '🧳',
  description:
    'Get one simple travel assistant for destination ideas, stay suggestions, itineraries, and top experiences across India.',
};

export default function AIAgentsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerLogo}>✨</Text>
          <Text style={styles.headerTitle}>AI Agents</Text>
        </View>
        <Text style={styles.headerSubtitle}>One travel planning interface for smart suggestions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.featuredCard}>
          <View style={styles.featuredGradient} />

          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.agentIcon}>{TRAVEL_AGENT.icon}</Text>
            </View>
          </View>

          <Text style={styles.agentName}>{TRAVEL_AGENT.name}</Text>
          <Text style={styles.agentDescription}>{TRAVEL_AGENT.description}</Text>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { agent: TRAVEL_AGENT })}
            activeOpacity={0.8}
          >
            <Text style={styles.chatButtonText}>Start Travel Planning</Text>
            <Text style={styles.chatButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLogo: {
    fontSize: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.steelBlue,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: COLORS.lavender,
    opacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  agentIcon: {
    fontSize: 32,
  },
  agentName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 12,
  },
  agentDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.darkNavy,
    opacity: 0.8,
    marginBottom: 24,
  },
  chatButton: {
    backgroundColor: COLORS.darkNavy,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  chatButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  chatButtonIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
