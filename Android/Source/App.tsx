import React from 'react';
import {AppRegistry} from 'react-native';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';

import AppReducer from './src/reducers';
import AppNavigator from './src/navigations/AppNavigation';
import {LogBox} from 'react-native'


const store = createStore(AppReducer, applyMiddleware(thunk));

LogBox.ignoreAllLogs(true)

function StarterApp() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

AppRegistry.registerComponent('EmotionDetection', () => StarterApp);

export default StarterApp;