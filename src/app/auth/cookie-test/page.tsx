'use client';

import { useEffect, useState } from 'react';

export default function CookieTestPage() {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({});
  const [rawCookieString, setRawCookieString] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Read cookies
      const cookieObj = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          acc[name] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      setCookies(cookieObj);
      setRawCookieString(document.cookie);
      
      // Read localStorage
      const localStorageObj: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          localStorageObj[key] = window.localStorage.getItem(key) || '';
        }
      }
      setLocalStorage(localStorageObj);
    }
  }, []);

  const handleTestCookies = () => {
    if (typeof window !== 'undefined') {
      // Test setting cookies
      document.cookie = `testToken=test123; Path=/; Max-Age=86400; SameSite=Lax`;
      document.cookie = `testUserType=user; Path=/; Max-Age=86400; SameSite=Lax`;
      
      console.log('Test cookies set');
      
      // Re-read cookies
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cookie & Storage Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <div className="space-y-2">
              {Object.entries(cookies).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{key}:</span>
                  <span className="text-sm text-gray-600 max-w-xs truncate">{value}</span>
                </div>
              ))}
              {Object.keys(cookies).length === 0 && (
                <p className="text-gray-500">No cookies found</p>
              )}
            </div>
            
            <button
              onClick={handleTestCookies}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Test Set Cookies
            </button>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // Manually set auth cookies to test
                  document.cookie = `accessToken=manual-test-token; Path=/; Max-Age=86400`;
                  document.cookie = `userType=user; Path=/; Max-Age=86400`;
                  console.log('Manual auth cookies set');
                  setTimeout(() => window.location.reload(), 1000);
                }
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Auth Cookies
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
            <div className="space-y-2">
              {Object.entries(localStorage).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{key}:</span>
                  <span className="text-sm text-gray-600 max-w-xs truncate">{value}</span>
                </div>
              ))}
              {Object.keys(localStorage).length === 0 && (
                <p className="text-gray-500">No localStorage items found</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw Cookie String</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {rawCookieString || 'No cookies'}
          </pre>
        </div>
      </div>
    </div>
  );
}
