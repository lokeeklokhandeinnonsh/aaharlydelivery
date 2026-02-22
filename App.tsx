import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GlobalFont from 'react-native-global-font';

import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  useEffect(() => {
    const fontName = 'PlusJakartaSans-Regular';
    GlobalFont.applyGlobal(fontName);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
