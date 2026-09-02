import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.log('Error saving data:', error);
  }
};

export const getData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);

    if (data) {
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    console.log('Error getting data:', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('Error removing data:', error);
  }
};