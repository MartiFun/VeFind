import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  Button,
  Image,
  Vibration,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {  FontAwesome5  } from '@expo/vector-icons';
import { Video } from 'expo-av';




class Search extends Component{

  constructor(props){
    super(props)
    this.state = {

    }
  }

  searchCity(){
    fetch("https://api.openweathermap.org/data/2.5/forecast?q="+this.state.city+"&APPID=5d7f2b961deccaa90e359e321c37d7ab")
    .then(res => res.json())
    .then(
      (result) => {
      },
      (error) => {}
      );
      Vibration.vibrate(this.state.duration);
  }


  render(){
    return(
      <View style={styles.view}>

      </View>
    )
  }
}

const styles = StyleSheet.create({

})

export default Search;
