import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './utils/auth_context';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Login');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show Dashboard if authenticated
  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <DashboardPage />
        <StatusBar style="auto" />
      </View>
    );
  }

  // Show Login or Register based on currentScreen state
  if (currentScreen === 'Register') {
    return (
      <View style={styles.container}>
        <RegisterPage onNavigateToLogin={() => setCurrentScreen('Login')} />
        <StatusBar style="auto" />
      </View>
    );
  }

  // Default: Show Login
  return (
    <View style={styles.container}>
      <LoginPage onNavigateToRegister={() => setCurrentScreen('Register')} />
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
