import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        loadSearchHistory();
    }, []);

    const loadSearchHistory = async () => {
        const history = await AsyncStorage.getItem('searchHistory');
        if (history) setSearchHistory(JSON.parse(history));
    };

    const saveToHistory = async (place) => {
        
        const updatedHistory = [place, ...searchHistory].slice(0, 10);
        console.log("place", updatedHistory);

        setSearchHistory(updatedHistory);
        await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        try {
            await axios.post('http://localhost:5000/history', place);
        } catch (error) {
            console.error('Error saving history:', error);
        }
    };

    return (
        <SearchContext.Provider value={{ searchHistory, saveToHistory }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    return useContext(SearchContext);
};
