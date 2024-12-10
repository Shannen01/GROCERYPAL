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
import ProtectedRoute from './components/ProtectedRoute';
import AddItemsToListScreen from './screens/AddItemsToListScreen';
import AddSpecificItemsScreen from './screens/AddSpecificItemsScreen';

const App = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StartScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/create-new-password" element={<CreateNewPasswordScreen />} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><ListScreen /></ProtectedRoute>} />
          <Route path="/list/create" element={<ProtectedRoute><CreateListScreen /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationScreen /></ProtectedRoute>} />
          <Route path="/list/:id" element={<ProtectedRoute><ListDetailsScreen /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoriesScreen /></ProtectedRoute>} />
          <Route 
            path="/add-items-to-list" 
            element={
              <ProtectedRoute>
                <AddItemsToListScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-specific-items" 
            element={
              <ProtectedRoute>
                <AddSpecificItemsScreen />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;