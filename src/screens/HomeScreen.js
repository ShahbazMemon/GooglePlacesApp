import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

const DEBOUNCE_DELAY = 500; // 500ms delay

const HomeScreen = () => {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const searchDebounceTimeout = useRef(null);

  useEffect(() => {
    loadSearchHistory();
    // Cleanup timeout on component unmount
    return () => {
      if (searchDebounceTimeout.current) {
        clearTimeout(searchDebounceTimeout.current);
      }
    };
  }, []);

  const animateToRegion = (targetRegion) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(targetRegion, 1500);
    }
  };

  const handleRegionChange = (newRegion) => {
    setMapRegion(newRegion);
  };

  const moveToLocation = (latitude, longitude) => {
    try {
      const targetRegion = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

      animateToRegion(targetRegion);
    } catch (error) {
      console.error('Error moving to location:', error);
    }
  };

  const toggleHistory = () => {
    const toValue = isHistoryVisible ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
    setIsHistoryVisible(!isHistoryVisible);
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToHistory = async (place) => {
    try {
      const historyItem = {
        name: place.display_name,
        placeId: place.place_id || place.osm_id,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        timestamp: new Date().toISOString(),
        address: place.display_name,
        type: place.type,
        importance: place.importance,
        fullDetails: place
      };

      // Check if place already exists in history
      const existingIndex = searchHistory.findIndex(
        item => item.latitude === historyItem.latitude && 
                item.longitude === historyItem.longitude
      );

      let newHistory;
      if (existingIndex !== -1) {
        // If place exists, remove it from current position
        newHistory = [
          // Update the existing item with new timestamp
          { ...historyItem },
          ...searchHistory.slice(0, existingIndex),
          ...searchHistory.slice(existingIndex + 1)
        ];
      } else {
        // If place doesn't exist, add it to the beginning
        newHistory = [historyItem, ...searchHistory];
      }

      // Keep only last 10 searches
      newHistory = newHistory.slice(0, 10);
      
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const debouncedSearch = useCallback((text) => {
    if (searchDebounceTimeout.current) {
      clearTimeout(searchDebounceTimeout.current);
    }

    searchDebounceTimeout.current = setTimeout(async () => {
      if (text.length < 2) {
        setPlaces([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${text}&limit=5`,
          {
            headers: {
              'User-Agent': 'MyPlacesApp/1.0'
            }
          }
        );
        setPlaces(res.data);
      } catch (error) {
        console.error("Error fetching places", error);
        setPlaces([]);
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const handleSearchInput = (text) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const selectPlace = async (place) => {
    try {
      const latitude = parseFloat(place.lat);
      const longitude = parseFloat(place.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error("Invalid coordinates:", place);
        return;
      }

      setSelectedPlace({
        name: place.display_name,
        address: place.display_name,
        latitude: latitude,
        longitude: longitude,
        type: place.type,
      });

      moveToLocation(latitude, longitude);
      await saveToHistory(place);
      setPlaces([]);
      setQuery("");
    } catch (error) {
      console.error("Error selecting place:", error);
    }
  };

  const selectFromHistory = (historyItem) => {
    try {
      const latitude = parseFloat(historyItem.latitude);
      const longitude = parseFloat(historyItem.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error("Invalid coordinates in history item:", historyItem);
        return;
      }

      setSelectedPlace({
        name: historyItem.name,
        address: historyItem.address,
        latitude: latitude,
        longitude: longitude,
        type: historyItem.type,
      });

      moveToLocation(latitude, longitude);
      toggleHistory();
    } catch (error) {
      console.error("Error selecting from history:", error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        region={mapRegion}
        onRegionChangeComplete={handleRegionChange}
      >
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            }}
            title={selectedPlace.name.split(',')[0]}
            description={selectedPlace.address}
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search places"
          value={query}
          onChangeText={handleSearchInput}
        />
        {places.length > 0 && (
          <FlatList
            style={styles.list}
            data={places}
            keyExtractor={(item) => item.place_id || item.osm_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => selectPlace(item)}
              >
                <Text style={styles.itemName}>{item.display_name.split(',')[0]}</Text>
                <Text style={styles.itemAddress} numberOfLines={1}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.historyToggle}
        onPress={toggleHistory}
      >
        <Text style={styles.historyToggleText}>
          {isHistoryVisible ? "Hide Recent Searches" : "Show Recent Searches"}
        </Text>
      </TouchableOpacity>

      <Animated.View 
        style={[
          styles.historyContainer,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0]
              })
            }]
          }
        ]}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={styles.historyList}
          data={searchHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => selectFromHistory(item)}
            >
              <Text style={styles.historyName}>{item.name.split(',')[0]}</Text>
              <Text style={styles.historyAddress} numberOfLines={1}>
                {item.address}
              </Text>
              <Text style={styles.historyTime}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  list: {
    maxHeight: height * 0.3,
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  historyToggle: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyToggleText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  historyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: height * 0.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    color: "red",
    fontSize: 14,
  },
  historyList: {
    maxHeight: height * 0.45,
  },
  historyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: 'white',
  },
  historyName: {
    fontSize: 16,
    fontWeight: "500",
  },
  historyAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  historyTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
});

export default HomeScreen;
