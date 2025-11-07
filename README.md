# 🚀 SUPER30 Mobile App

A React Native mobile application with authentication built using Expo and Supabase.

## ✨ Features

- 🔐 **User Authentication** - Login and Registration with secure password hashing
- 🔑 **Token-based Sessions** - 24-hour session tokens with device tracking
- 💾 **Persistent Login** - Stay logged in across app restarts
- 👤 **User Profiles** - Display user information on dashboard
- 🔒 **Protected Routes** - Dashboard only accessible when authenticated
- 📱 **Mobile-First Design** - Beautiful UI optimized for mobile devices

## 📁 Project Structure

```
my-app/
├── App.js                      # Main app entry with navigation
├── utils/
│   ├── supabase.js            # Supabase client configuration
│   └── auth_context.js        # Authentication context (login, register, logout)
├── pages/
│   ├── LoginPage.js           # Login screen
│   ├── RegisterPage.js        # Registration screen
│   └── DashboardPage.js       # Protected dashboard
└── components/                 # Reusable components (to be added)
```

## 🛠️ Installation

All dependencies have been installed. If you need to reinstall:

```bash
cd my-app
npm install
```

## 🚦 Running the App

Start the Expo development server:

```bash
cd my-app
npm start
```

Then:
- Press `a` to run on **Android**
- Press `i` to run on **iOS** 
- Scan the QR code with **Expo Go** app on your phone

## 🔐 Authentication Flow

1. **First Launch** → Login Screen
2. **Register** → Create new account with:
   - Full Name
   - Email
   - Password
   - Gender (optional)
   - Age (optional)
3. **Auto-Login** → After registration, automatically logs in
4. **Dashboard** → View profile and stats
5. **Logout** → Return to login screen

## 🗄️ Database Schema

### Users Table
- `id` - Unique user identifier
- `email` - User email (unique)
- `password` - SHA-256 hashed password
- `full_name` - User's full name
- `gender` - Optional gender field
- `age` - Optional age field
- `role` - ADMIN or EDITOR
- `created_at` - Account creation timestamp

### User Tokens Table
- `uuid` - Token identifier
- `user_id` - Reference to user
- `token` - Authentication token
- `expired_at` - Token expiration time
- `login_time` - When user logged in
- `logout_time` - When user logged out
- `device_info` - Device information (JSON)

## 🔒 Security Features

- ✅ SHA-256 password hashing
- ✅ 24-hour token expiration
- ✅ Device tracking per login
- ✅ Secure token storage with AsyncStorage
- ✅ Logout time tracking
- ✅ Session validation on app restart

## 📦 Dependencies

- `@supabase/supabase-js` - Supabase client
- `@react-native-async-storage/async-storage` - Persistent storage
- `expo-crypto` - Cryptographic functions
- `@react-navigation/native` - Navigation
- `@react-navigation/native-stack` - Stack navigator
- `react-native-screens` - Native screens
- `react-native-safe-area-context` - Safe area handling

## 🎯 Next Steps

- [ ] Add profile editing functionality
- [ ] Implement password reset
- [ ] Add more dashboard features
- [ ] Create reusable UI components
- [ ] Add form validation components
- [ ] Implement role-based access control
- [ ] Add image upload for profile pictures

## 🐛 Troubleshooting

If you encounter issues:

1. **Clear cache**: `npm start -- --clear`
2. **Reinstall dependencies**: `rm -rf node_modules && npm install`
3. **Reset Expo**: `expo start -c`

## 📝 Notes

- Default role for new users is **EDITOR**
- Tokens expire after **24 hours**
- Password must be at least **6 characters**
- All user data is stored in Supabase

---

**SUPER30 STUDENTS ARE SUPERHUMANS! 🎓**