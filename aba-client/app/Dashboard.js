import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native';

export default function Dashboard() {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    // You can reload or navigate back to login screen
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to the dashboard!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
