import React, { Component } from 'react'
import About from './src/about/index.js'
import Search from './src/search/search.js'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {FontAwesome5} from '@expo/vector-icons';



const Tab = createBottomTabNavigator();

class App extends Component {

 render() {
    return (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'setting') {
                return <FontAwesome5 name='cog' size={size} color={color}/>;
              } else if (route.name === 'Map') {
                return <FontAwesome5 name='map-marked-alt' size={size} color={color}/>;
              }
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
        }}>
            <Tab.Screen name="Map" component={About} />
          </Tab.Navigator>
        </NavigationContainer>

    )
  }
}

const styles = StyleSheet.create({

})

export default App;
