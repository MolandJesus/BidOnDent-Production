// Quick test file to verify adminConfig exports work
import { ADMIN_EMAIL, TEST_ACCOUNTS, canSwitchToAdmin, isAdmin } from './adminConfig';

// Test exports
console.log('Admin Email:', ADMIN_EMAIL);
console.log('Test Accounts:', TEST_ACCOUNTS.length);
console.log('Can switch test:', canSwitchToAdmin('molalign5+shop@gmail.com'));
console.log('Is admin:', isAdmin('molalign5@gmail.com'));

export {};
