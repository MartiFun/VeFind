import React, { useState, useEffect } from 'react';
import MapView, { PolyUtil } from 'react-native-maps';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
  Button,
  TouchableOpacity,
  Modal
} from 'react-native';
import {DOMParser} from 'xmldom';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import {  FontAwesome5  } from '@expo/vector-icons';
import Polyline from '@mapbox/polyline';



class About extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      load: false,
      geocode: null,
      errorMessage: "",
      lat: null,
      long: null,
      record: [],
      coords: [{"latitude":45.76964,"longitude":4.90117},{"latitude":45.76906,"longitude":4.89937},{"latitude":45.76869,"longitude":4.8996},{"latitude":45.76765,"longitude":4.90035},{"latitude":45.76734,"longitude":4.90052},{"latitude":45.76715,"longitude":4.90054}],
      cordStart: null,
      cordEnd: null,
      distance: " :(",
      duree: " :(",
      loadDest: false,
      isLoggedIn: false,
      respJSON: null,
      DestDef: false,
      instruction: "avance",
      doc: null,
    }
    this.getLocationAsync();
    this.velovSearch()
  }

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
    const { latitude , longitude } = location.coords
    this.setState({ lat: latitude, long: longitude});
  };

  velovSearch(){
    fetch("https://public.opendatasoft.com/api/records/1.0/search/?dataset=station-velov-grand-lyon&q=&rows=1000&facet=name&facet=commune&facet=bonus&facet=status&facet=available&facet=availabl_1&facet=availabili&facet=availabi_1&facet=last_upd_1")
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({record:result.records,load: true});
      },
      (error) => {
        alert(error);
        this.setState({load: false});
      }
      );
  }

  direction(lat1, lat2, long1, long2){
    this.state.cordStart = JSON.stringify(lat1)+', '+JSON.stringify(long1);
    this.state.cordEnd = JSON.stringify(lat2)+', '+JSON.stringify(long2);
    this.setState({});
    this.RouteToPoint(this.state.cordStart, this.state.cordEnd)
  }

  direction2(){
    this.setState({loadDest: true});
    this.RouteToPoint(this.state.cordStart, this.state.cordEnd)
  }

  async RouteToPoint(locDepart, locFin) {
    let i = 0;
    try{
      const resp = await fetch('https://maps.googleapis.com/maps/api/directions/json?origin='+locDepart+'&destination='+locFin+'&key=AIzaSyBOQAM6GRyLRXeOZVlmuLl5eY-isehFccY&mode=walking')
      const respJson = await resp.json();
      const points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      const coords = points.map(point => {
        return{
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ distance:respJson.routes[0].legs[0].distance.text, duree:respJson.routes[0].legs[0].duration.text , isLoggedIn: true, respJSON:respJson.routes[0].legs[0]})
      if (this.state.loadDest === true) {
        this.setState({ coords: coords, loadDest: false, DestDef: true})
      }
    }
    catch(error) {
      alert(error);
    }
    const interval = setInterval( async () => {
      if (i == this.state.respJSON.steps.length) {
        clearInterval(interval);
      }
      let cordStart = JSON.stringify(this.state.lat)+', '+JSON.stringify(this.state.long);
      let cordEnd = JSON.stringify(this.state.respJSON.steps[i].end_location.lat)+', '+JSON.stringify(this.state.respJSON.steps[i].end_location.lng);
        try{
          const resp = await fetch('https://maps.googleapis.com/maps/api/directions/json?origin='+cordStart+'&destination='+cordEnd+'&key=AIzaSyBOQAM6GRyLRXeOZVlmuLl5eY-isehFccY&mode=walking')
          const respJsoN = await resp.json();
          if (respJsoN.routes[0].legs[0].distance.value < 100 && this.state.DestDef === true) {
            let xmlString = this.state.respJSON.steps[i].html_instructions;
            let respDoc = new DOMParser().parseFromString(xmlString, "text/html");
            this.setState({instruction:this.state.respJSON.steps[i].html_instructions, doc:respDoc})
            //console.log(this.state.doc);
            i++;
          }
        }
        catch(error) {
          alert(error);
        }
    }, 3000);
  }

  render(){
    let {load, isLoggedIn} = this.state;
    if (!load) {
      var page = (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="white" />
        </View>
      );
    }
    else {
      var page = (
        <View>
          <StatusBar hidden={true}/>
          <MapView showsUserLocation style={styles.mapStyle} initialRegion={{latitude: this.state.lat, longitude: this.state.long, latitudeDelta: 0.006, longitudeDelta: 0.007,}}>
            {this.state.record.map((item, i) => {
              if (this.state.record[i].fields.available == 0) {
                return <MapView.Marker onPress={() => this.direction(this.state.lat, this.state.record[i].fields.geo_point_2d[0], this.state.long, this.state.record[i].fields.geo_point_2d[1])} key={i} coordinate={{latitude: this.state.record[i].fields.geo_point_2d[0], longitude: this.state.record[i].fields.geo_point_2d[1]}} title={this.state.record[i].fields.name} description={"Vélo dispo : "+this.state.record[i].fields.available}/>
              }else {
                return <MapView.Marker onPress={() => this.direction(this.state.lat, this.state.record[i].fields.geo_point_2d[0], this.state.long, this.state.record[i].fields.geo_point_2d[1])} key={i} coordinate={{latitude: this.state.record[i].fields.geo_point_2d[0], longitude: this.state.record[i].fields.geo_point_2d[1]}} title={this.state.record[i].fields.name} description={"Vélo dispo : "+this.state.record[i].fields.available} pinColor={"#00FF00"}/>
              }
            })}
            {isLoggedIn ? (
                  <MapView.Polyline coordinates={this.state.coords} strokeWidth={5} strokeColor="red"/>
                ) : (
                  <MapView.Polyline coordinates={this.state.coords} strokeWidth={0} strokeColor="red"/>
                )}
            </MapView>
            <View visible={false} style={styles.destyle}>
                <Text>{this.state.instruction}</Text>
            </View>
            <View style={styles.destyle}>
              <Text style={styles.destyleElement}>Distance: {this.state.distance}</Text>
              <Text style={styles.destyleElement}>duree: {this.state.duree}</Text>
              <TouchableOpacity style={styles.destyleElementButt} onPress={() => this.direction2()}><Text style={styles.destyleElementButtText}>destination</Text><FontAwesome5 name='paper-plane' size={24} color={"tomato"}/></TouchableOpacity>
            </View>
        </View>
      );
    }
    return page
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "tomato",
    color: "white"
  },
  mapStyle: {
    height: '86%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  destyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '7%',
    backgroundColor: 'tomato',
  },
  destyleElement: {
    color: 'white',
    width: "25%",
    textAlign: 'center',
  },
  destyleElementButt: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    color: 'tomato',
    width: "33%",
    height: '80%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  destyleElementButtText: {
    color: 'tomato',
    fontSize: 15,
    marginRight: '5%'
  },
});

export default About;
