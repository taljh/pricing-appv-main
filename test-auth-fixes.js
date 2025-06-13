// Test script to verify authentication fixes
// Run this in your browser console to test authentication across tabs and browsers

const testAuthAcrossSessions = async () => {
  console.group('🧪 Testing Authentication System');
  
  // 1. Check current authentication state
  console.log('1️⃣ Current Authentication State:');
  const authState = localStorage.getItem('sb-pricing-app-auth-token');
  console.log('Auth token exists:', !!authState);
  
  if (authState) {
    try {
      // Parse basic info (non-sensitive) to show login state
      const parsed = JSON.parse(authState);
      console.log('User is logged in as:', parsed.user?.email || 'Unknown user');
      console.log('Session expiration:', new Date(parsed.expiresAt * 1000).toLocaleString());
    } catch (e) {
      console.error('Error parsing auth state:', e);
    }
  }
  
  // 2. Test LocalStorage Persistence
  console.log('\n2️⃣ Testing LocalStorage Persistence:');
  const testKey = 'test-auth-timestamp';
  const timestamp = new Date().toISOString();
  localStorage.setItem(testKey, timestamp);
  console.log(`Test timestamp stored: ${timestamp}`);
  console.log(`Test timestamp retrieved: ${localStorage.getItem(testKey)}`);
  console.log('LocalStorage working correctly:', timestamp === localStorage.getItem(testKey));

  // 3. Browser identification (to help with multi-browser testing)
  console.log('\n3️⃣ Browser Identification:');
  console.log('User Agent:', navigator.userAgent);
  console.log('This is: ', 
    navigator.userAgent.includes('Chrome') ? 'Chrome/Chromium based' :
    navigator.userAgent.includes('Firefox') ? 'Firefox' :
    navigator.userAgent.includes('Safari') ? 'Safari' :
    navigator.userAgent.includes('Edge') ? 'Edge' :
    'Unknown browser'
  );
  
  // 4. Cookie inspection
  console.log('\n4️⃣ Cookie Inspection:');
  const hasSbAuthCookie = document.cookie.includes('sb-auth-token');
  console.log('Has Supabase auth cookie:', hasSbAuthCookie);
  console.log('All cookies (count):', document.cookie.split(';').length);
  
  // 5. Instructions for multi-browser testing
  console.log('\n5️⃣ Multi-browser Testing Instructions:');
  console.log('1. Run this test in your primary browser');
  console.log('2. Copy the URL and open in a second browser');
  console.log('3. Run this test again in the second browser');
  console.log('4. Verify that authentication state is maintained');
  console.log('5. Try adding a product in both browsers to confirm data sync');
  
  console.groupEnd();
};

// Execute the test
testAuthAcrossSessions();

// Export for module usage (though typically run directly in console)
if (typeof module !== 'undefined') {
  module.exports = { testAuthAcrossSessions };
}
