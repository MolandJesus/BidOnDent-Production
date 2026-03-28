# Google OAuth Setup Guide for Clerk

Last updated: March 28, 2026
Status: Active setup guide

Parallel security-track note: if auth/security passes update Clerk or provider boundaries, update this guide additively and keep `CLAUDE_AI_MASTER_CONTEXT.md` synchronized in the same documentation pass.

## ⚠️ **Google Sign-In Not Working?**

If the "Sign up with Google" button does nothing, it's because **Google OAuth hasn't been configured** in your Clerk dashboard yet. This is a required step to enable Google authentication.

---

## 🔧 **How to Enable Google Sign-In**

### **Step 1: Go to Clerk Dashboard**

1. Visit: https://dashboard.clerk.com
2. Select your application (`joint-oarfish-23`)
3. Click on **"SSO Connections"** or **"Social Connections"** in the sidebar

### **Step 2: Enable Google Provider**

1. Find **"Google"** in the list of providers
2. Click **"Configure"** or toggle it ON
3. Clerk will provide you with:
   - **Redirect URI** (needed for Google Console)
   - Instructions for obtaining Google OAuth credentials

### **Step 3: Create Google OAuth Credentials**

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project (or select existing one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure the OAuth consent screen if prompted:
   - User type: **External**
   - App name: **Bidondent**
   - Support email: Your email
   - Add authorized domain (your Clerk domain)

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Bidondent - Clerk**
   - **Authorized JavaScript origins**: Add your Clerk domain
   - **Authorized redirect URIs**: Copy the redirect URI from Clerk dashboard

7. Click **"Create"** and copy:
   - **Client ID**
   - **Client Secret**

### **Step 4: Add Credentials to Clerk**

1. Return to Clerk Dashboard → Google configuration
2. Paste the **Client ID**
3. Paste the **Client Secret**
4. Click **"Save"**

### **Step 5: Test Google Sign-In**

1. Hard refresh your Bidondent app (`Ctrl+Shift+R`)
2. Click **"Get Started"**
3. Select an account type (Customer/Shop/Insurer)
4. Click the **"Sign up as..."** button
5. In Clerk's modal, click **"Continue with Google"**
6. You should now be redirected to Google's authentication page

---

## ✅ **Testing Checklist**

After setup, verify:

- [ ] Google button appears in Clerk's sign-in modal
- [ ] Clicking Google button opens Google's authentication page
- [ ] After Google auth, you return to Bidondent
- [ ] Account type is set correctly
- [ ] You're redirected to the appropriate dashboard

---

## 🔍 **Troubleshooting**

### **Issue: "Error 400: redirect_uri_mismatch"**

**Solution**: Make sure the redirect URI in Google Console EXACTLY matches the one provided by Clerk.

### **Issue: "Access blocked: Authorization Error"**

**Solution**: Your app needs to be verified by Google or you need to add test users in the OAuth consent screen.

### **Issue: Google button doesn't appear**

**Solution**:

1. Check Clerk Dashboard → Make sure Google is enabled
2. Hard refresh the browser
3. Check browser console for errors

### **Issue: "The OAuth client was not found"**

**Solution**: Double-check that you entered the correct Client ID and Client Secret in Clerk.

---

## 📖 **Additional Resources**

- **Clerk Google OAuth Docs**: https://clerk.com/docs/authentication/social-connections/google
- **Google OAuth Setup**: https://support.google.com/cloud/answer/6158849
- **Clerk Dashboard**: https://dashboard.clerk.com
- **BidOnDent Getting Started**: ./GETTING_STARTED.md

---

## 🎯 **Quick Summary**

**Google OAuth requires 3 things:**

1. ✅ Enable Google in Clerk Dashboard
2. ✅ Create OAuth credentials in Google Cloud Console
3. ✅ Add credentials to Clerk

**Total setup time**: ~10 minutes

After completing these steps, the "Sign up with Google" button will work perfectly! 🚀
