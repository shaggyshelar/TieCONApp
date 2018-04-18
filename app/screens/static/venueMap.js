import React from 'react';
import { RkCard, RkStyleSheet, RkText, RkButton } from 'react-native-ui-kitten';
import { Text, View, Container } from 'native-base';
import { ScrollView, Platform, NetInfo, ActivityIndicator, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import getDirections from 'react-native-google-maps-directions';
import { Button } from 'react-native';


function renderIf(condition, content) {
  if (condition) {
    return content;
  } else {
    return null;
  }
}

export class VenueMap extends React.Component {
  static navigationOptions = {
    title: 'Location Map'.toUpperCase()
  };

  constructor(props) {
    super(props);
    this.state = {
      isOffline: false,
      initialRegion: {
        latitude: 18.5392208,
        longitude: 73.9063,
        latitudeDelta:  0.0922,
        longitudeDelta: 0.0421
      }
    }
  }

  handleGetDirections = () => {
    const data = {
      destination: {
        latitude: 18.5392208,
        longitude: 73.9063,
        latitudeDelta:  0.0922,
        longitudeDelta: 0.0421
      },
      params: [
        {
          key: "travelmode",
          value: "driving"        // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "dir_action",
          value: "navigate"       // this instantly initializes navigation using the given travel mode 
        }
      ]
    }
 
    getDirections(data)
  }
  componentWillMount() {
    if (Platform.OS !== 'ios') {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected) {
          this.setState({
            isLoading: true
          });
        } else {
          this.setState({
            isLoading: false,
            isOffline: true
          });
        }
        this.setState({
          isOffline: !isConnected
        });
      });
    }
    NetInfo.addEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange
    );
  }

  handleFirstConnectivityChange = (connectionInfo) => {
    if (connectionInfo.type != 'none') {
      this.setState({
        isLoading: true
      });
    } else {
      this.setState({
        isLoading: false,
        isOffline: true
      });
    }
    this.setState({
      isOffline: connectionInfo.type === 'none',
    });
  };

  componentWillUnmount() {
    NetInfo.removeEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange
    );
  }
  render() {
    return (
      <Container style={[styles.root]}>
        
        <RkCard rkType='shadowed' style={[styles.card]}>
           
            <Text style={{ fontSize: 16, fontWeight: 'bold',marginBottom:6 }}>TiECon Pune 2018</Text> 
            <Text style={{ fontSize: 15, }}>The Westin Pune Koregaon Park, 36/3-B, Mundhwa Rd, Pingale Wasti, Koregaon Park Annexe, Ghorpadi, Pune, Maharashtra 411001</Text>
           
        </RkCard>
        <Button onPress={this.handleGetDirections} title="Get Directions">
        </Button>
        
        <MapView style={styles1.map}
          initialRegion={this.state.initialRegion}>
          <Marker
            coordinate={{latitude:18.5392208,longitude:73.90626109999994}}
            title={'TiECon Pune 2018'}
            description={'The Westin Pune Koregaon Park, 36/3-B, Mundhwa Rd, Pingale Wasti, Koregaon Park Annexe, Ghorpadi, Pune, Maharashtra 411001'}
          />
        </MapView>
        
        <View style={styles.footerOffline}>
          {
            this.state.isOffline ? <RkText rkType="small" style={styles.footerText}>The Internet connection appears to be offline. </RkText> : null
          }
        </View>
        
        <View style={styles.footer} style={{ flexDirection: 'row',justifyContent: 'center',  position:'absolute', backgroundColor:'red',bottom:0, alignSelf: 'stretch', width: '100%'}}>
          <RkText rkType="small" style={styles.footerText}>Powered by</RkText>
          <RkText rkType="small" style={styles.companyName}> Eternus Solutions Pvt. Ltd. </RkText>
        </View>
      
      </Container>
     
      
    )
  }
}
const styles1 = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'relative',
    top: '0%',
    left: 0,
    right: 0,
    bottom: 0,
    height:'90%'
  },
});

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#E7060E'
  },
  footerOffline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#545454'
  },
  footerText: {
    color: '#f0f0f0',
    fontSize: 11,
  },
  companyName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  card: {
    margin: 2,
    padding: 6,
    justifyContent:'flex-start'
}
}));