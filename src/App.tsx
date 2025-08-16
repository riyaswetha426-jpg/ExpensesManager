import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<div className="p-8 text-center text-gray-500">Transactions page coming soon...</div>} />
            <Route path="analytics" element={<div className="p-8 text-center text-gray-500">Analytics page coming soon...</div>} />
            <Route path="budgets" element={<div className="p-8 text-center text-gray-500">Budgets page coming soon...</div>} />
            <Route path="export" element={<div className="p-8 text-center text-gray-500">Export page coming soon...</div>} />
            <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings page coming soon...</div>} />
          </Route>
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#374151' : '#363636',
              color: theme === 'dark' ? '#f9fafb' : '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;