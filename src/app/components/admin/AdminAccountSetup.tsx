import React, { useState, useEffect } from "react";
import { Shield, Check, AlertCircle } from "lucide-react";
import { supabase } from "../../services/supabaseService";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { ADMIN_EMAIL } from "../../config/adminConfig";

/**
 * Admin Account Setup Component
 * 
 * This component helps create or fix the admin account (bidondent@gmail.com)
 * Only shows when not logged in and admin account doesn't exist.
 * Once the admin account exists, this button disappears permanently.
 */

export default function AdminAccountSetup() {
  const [show, setShow] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Check if admin account already exists using a direct query
  useEffect(() => {
    const checkAdminAccount = async () => {
      try {
        const adminEmail = ADMIN_EMAIL;
        
        console.log('🔍 Checking if admin account exists...');
        
        // Check if we're currently signed in as admin
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.email === adminEmail) {
          console.log('✅ Currently signed in as admin - hiding setup button');
          setAdminExists(true);
          setCheckingAdmin(false);
          return;
        }
        
        // Check via the Edge Function admin endpoint
        try {
          const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/check-admin-exists`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Admin check result from server:', data);
            
            if (data.exists) {
              console.log('✅ Admin account exists - hiding setup button');
              setAdminExists(true);
            } else {
              console.log('⚠️ Admin account not found - showing setup button');
              setAdminExists(false);
            }
          } else {
            console.log(`⚠️ Server check failed with status ${response.status} - falling back to local check`);
            // Fallback: Try to check using profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email')
              .eq('email', adminEmail)
              .limit(1);
            
            if (profileError) {
              console.log('⚠️ Profile check also failed:', profileError.message);
              console.log('ℹ️ Showing setup button (will fail gracefully if admin exists)');
              setAdminExists(false);
            } else if (profileData && profileData.length > 0) {
              console.log('✅ Admin found in profiles table - hiding setup button');
              setAdminExists(true);
            } else {
              console.log('⚠️ No admin found - showing setup button');
              setAdminExists(false);
            }
          }
        } catch (fetchError) {
          console.log('⚠️ Network error checking admin:', fetchError);
          // On any error, assume admin doesn't exist and show setup button
          setAdminExists(false);
        }
      } catch (error) {
        console.log('ℹ️ Error checking admin account:', error);
        setAdminExists(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAccount();
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const createAdminAccount = async () => {
    if (!password || password.length < 6) {
      setResult({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const adminEmail = ADMIN_EMAIL;
      const adminName = 'Admin User';

      // FIRST: Try to just sign in (admin might already exist)
      console.log('🔍 Attempting to sign in first (admin may already exist)...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password
      });

      if (!signInError && signInData.session) {
        console.log('✅ Admin already exists - signed in successfully!');
        setResult({ 
          type: 'success', 
          message: '✅ Admin account exists! Signed in successfully. Reloading...' 
        });
        
        setTimeout(() => {
          setShow(false);
          window.location.reload();
        }, 1500);
        return;
      }

      // If sign in failed, try to create the account
      console.log('📝 Sign in failed - attempting to create admin account via Edge Function...');
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/setup-admin?t=${timestamp}`;
      console.log('🌐 Endpoint URL:', url);
      console.log('🔑 Auth token preview:', publicAnonKey.substring(0, 20) + '...');
      console.log('📧 Admin email:', adminEmail);
      console.log('🔑 Password length:', password.length);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: adminEmail,
          password: password
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Try to parse JSON, but handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📡 Response data:', data);
      } else {
        const text = await response.text();
        console.log('📡 Response text (not JSON):', text);
        throw new Error(`Edge Function returned non-JSON response (status ${response.status}). The function may still have JWT verification enabled. Please deploy with --no-verify-jwt flag.`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log('✅ Admin account created:', data);

      // Now sign in with the new credentials
      console.log('📝 Signing in...');
      const { error: finalSignInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password
      });

      if (finalSignInError) {
        throw new Error(`Sign in failed: ${finalSignInError.message}`);
      }

      console.log('✅ Signed in successfully');

      setResult({ 
        type: 'success', 
        message: '✅ Admin account created and logged in! The page will reload...' 
      });
      
      // Reload the page to reflect the new session
      setTimeout(() => {
        setShow(false);
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error creating admin account:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Handle specific error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setResult({ 
          type: 'error', 
          message: '⚠️ Edge Function not responding. Please ensure the Edge Function is deployed in Supabase Dashboard > Edge Functions.' 
        });
      } else if (error.message && error.message.includes('you can only request this after')) {
        // Extract the number of seconds from the error message
        const match = error.message.match(/after (\d+) seconds/);
        const seconds = match ? parseInt(match[1]) + 1 : 15; // Add 1 second buffer
        
        setCooldownSeconds(seconds);
        setResult({ 
          type: 'error', 
          message: `⏱️ Rate limit reached. Please wait ${seconds} seconds before trying again.` 
        });
      } else if (error.message && error.message.includes('already been registered')) {
        setResult({ 
          type: 'error', 
          message: `⚠️ Admin account exists but wrong password. Try logging in normally or use correct password.` 
        });
      } else {
        setResult({ 
          type: 'error', 
          message: `Error: ${error.message || 'Failed to create account'}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if:
  // - Still checking if admin exists
  // - Admin account already exists
  if (checkingAdmin || adminExists) {
    console.log('🔍 AdminAccountSetup render decision:', { checkingAdmin, adminExists });
    return null;
  }

  console.log('✅ AdminAccountSetup: Showing reminder message!', { checkingAdmin, adminExists });

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-4 left-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50 text-sm"
      >
        ℹ️ Admin Info
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">📋 Admin Account Not Created Yet</h3>
        <button
          onClick={() => setShow(false)}
          className="text-white hover:text-gray-200 ml-2"
        >
          ✕
        </button>
      </div>
      <p className="text-sm mb-2">
        The main admin account <strong>{ADMIN_EMAIL}</strong> hasn't been created yet.
      </p>
      <p className="text-sm">
        To create it, use the <strong>Sign Up</strong> button with email <strong>{ADMIN_EMAIL}</strong> and it will automatically be recognized as the admin account.
      </p>
    </div>
  );
}
