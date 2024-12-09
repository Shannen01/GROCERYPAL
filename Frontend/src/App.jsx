import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import HomeScreen from './screens/HomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import ListScreen from './screens/ListScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import CreateListScreen from './screens/CreateListScreen';
import NotificationScreen from './screens/NotificationScreen';
import ListDetailsScreen from './screens/ListDetailsScreen';
import StartScreen from './screens/StartScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import CreateNewPasswordScreen from './screens/CreateNewPasswordScreen';
import CategoriesScreen from './screens/CategoriesScreen';

const App = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/list" element={<ListScreen />} />
          <Route path="/list/create" element={<CreateListScreen />} />
          <Route path="/notifications" element={<NotificationScreen />} />
          <Route path="/list/:id" element={<ListDetailsScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/create-new-password" element={<CreateNewPasswordScreen />} />
          <Route path="/categories" element={<CategoriesScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;