# Places Search App

A React Native mobile application built with Expo that allows users to search for places worldwide, view them on an interactive map, and maintain a search history. Built with React Native and uses OpenStreetMap for place search functionality.

## Features

- 🔍 Real-time place search with debouncing
- 🗺️ Interactive map with smooth animations
- 📍 Place markers with detailed information
- 📝 Search history with recent searches (no duplicates)
- 💾 Persistent storage using AsyncStorage
- 🎯 Quick navigation from search history
- 🔄 Smooth transitions between locations

## Setup Instructions

### Prerequisites

1. **Node.js and npm**
   - Install Node.js (version 14 or higher)

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Expo Go App**
   - Install Expo Go on your iOS or Android device
   - Available on [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Project Setup

1. **Clone the Repository**
   ```bash
   git clone <https://github.com/ShahbazMemon/GooglePlacesApp.git>
   cd GooglePlacesApp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Specific Dependencies**
   ```bash
   npm install @react-native-async-storage/async-storage
   npm install react-native-maps
   npm install axios
   npm install @react-navigation/native
   npm install @react-navigation/stack
   npm install react-native-screens
   npm install react-native-safe-area-context
   ```

4. **iOS Setup (Mac only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Running the Application

1. **Start the Development Server**
   ```bash
   npx expo start -c
   ```

2. **Running on Physical Device**
   - Scan the QR code with your device's camera (iOS) or Expo Go app (Android)
   - Make sure your device is on the same network as your development machine

3. **Running on Emulator/Simulator**
   - Press 'a' in the terminal to open on Android emulator
   - Press 'i' in the terminal to open on iOS simulator (Mac only)

## Using the App

1. **Search for Places**
   - Type in the search bar (minimum 3 characters)
   - Search is debounced (500ms delay)
   - Select from the dropdown list

2. **View on Map**
   - Map automatically centers on selected location
   - Smooth animation between locations
   - Marker shows place name and details

3. **Search History**
   - Recent searches shown at the bottom
   - Tap to show/hide history panel
   - Click on history item to revisit location
   - No duplicate entries (updates existing entries)

## Troubleshooting Common Issues

### Development Server Issues
```bash
# Clear Expo cache and restart
npx expo start -c
```

### Key Features Implementation
- Uses OpenStreetMap API for place search
- Implements debouncing for search optimization
- Uses AsyncStorage for persistent history
- Prevents duplicate entries in history
- Implements smooth map animations

## Performance Optimizations

- Search debouncing (500ms)
- Efficient history management
- Optimized map rendering
- Smooth animations
- No duplicate history entries
