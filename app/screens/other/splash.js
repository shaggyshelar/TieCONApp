import React from 'react';
import { StyleSheet, Image, View, Dimensions, StatusBar, AsyncStorage, Alert } from 'react-native';
import { RkText, RkStyleSheet, RkButton, RkTheme } from 'react-native-ui-kitten'
import {ProgressBar} from '../../components';
import {
  KittenTheme
} from '../../config/theme';
import {NavigationActions} from 'react-navigation';
import {scale, scaleModerate, scaleVertical} from '../../utils/scale';
import firebase from '../../config/firebase';
import { Toast } from 'native-base';

let timeFrame = 500;

export class SplashScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    }
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    let navigation = this.props.navigation;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        AsyncStorage.getItem("USER_DETAILS").then((userDetails)=>{
          if(userDetails) {
            navigation.navigate('App');
          } else {
            var db = firebase.firestore();
            var docRef = db.collection("Attendee").doc(user.uid);
            docRef.get().then(function(doc) {
              if (doc.exists) {
                  let data = doc.data();
                  data.uid = user.uid;
                  let userInfo = JSON.stringify(data);
                  AsyncStorage.setItem("USER_DETAILS", userInfo);
                  navigation.navigate('App');
              } else {
                Alert.alert(
                  'Error',
                  'Unable to get user information. Please contact system administrator.',
                  [
                    { text: 'Ok', onPress: () => { } },
                  ],
                  { cancelable: false }
                );
                let keysToRemove = ['USER_DETAILS', 'USER_LINKEDIN_TOKEN', 'SESSIONS'];
                AsyncStorage.multiRemove(keysToRemove, (err) => {});
                navigation.navigate('Auth');
              }
            }).catch(function(error) {
              Alert.alert(
                'Error',
                error,
                [
                  { text: 'Ok', onPress: () => { } },
                ],
                { cancelable: false }
              );
              let keysToRemove = ['USER_DETAILS', 'USER_LINKEDIN_TOKEN', 'SESSIONS'];
              AsyncStorage.multiRemove(keysToRemove, (err) => {});
              navigation.navigate('Auth');
            });
          }
        }).catch(function(error) {
          console.warn('Error reading local storage.');
        });
        //navigation.navigate('App');
      } else {
        navigation.navigate('Auth');
      }
    });
  };

  componentDidMount() {
    StatusBar.setHidden(true, 'none');
    RkTheme.setTheme(KittenTheme);

    this.timer = setInterval(() => {
      if (this.state.progress == 1) {
        clearInterval(this.timer);
        setTimeout(() => {
          StatusBar.setHidden(false, 'slide');
          // let toHome = NavigationActions.reset({
          //   index: 0,
          //   actions: [NavigationActions.navigate({routeName: 'Auth'})]
          // });
          // this.props.navigation.dispatch(toHome)
          this._bootstrapAsync();
        }, timeFrame);
      } else {
        let random = Math.random() * 0.5;
        let progress = this.state.progress + random;
        if (progress > 1) {
          progress = 1;
        }
        this.setState({progress});
      }
    }, timeFrame)

  }

  render() {
    let width = Dimensions.get('window').width;
    return (
      <View style={styles.container}>
        <View>
          <Image style={[styles.image, {width}]} source={require('../../assets/images/splashBack.png')}/>
          <View style={[styles.text, styles.tieTitle]}>
            {/* <RkText rkType='light' style={styles.hero}>TiE</RkText> */}
            <RkText rkType='logo' style={styles.appName}>Events</RkText>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.textRow}>
            <RkText rkType='primary3'>Powered by:</RkText>
          </View>
        </View>
        <View style={styles.buttons}>
          <RkButton style={styles.button} rkType='sponsorsSplashScreen' style={{marginTop: 5}}>
            <Image style={styles.sponsorsImage} source={require('../../assets/images/eternusLogoMain.png')}/>;
            
          </RkButton>
          {/* <RkButton style={styles.button} rkType='sponsorsSplashScreen' style={{marginTop: 5}}>
            <Image style={styles.sponsorsImage} source={require('../../assets/images/bajajLogo.png')}/>;            
          </RkButton> */}
        </View>
        <ProgressBar
          color={RkTheme.current.colors.accent}
          style={styles.progress}
          progress={this.state.progress} width={scale(320)}/>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    backgroundColor: KittenTheme.colors.screen.base,
    justifyContent: 'space-between',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: scaleVertical(24),
    marginHorizontal: 24,
    justifyContent: 'space-around',
  },
  button: {
    borderColor: theme.colors.border.solid
  },
  sponsorsImage: {
    /*resizeMode: 'cover',
    height: scaleVertical(430),*/
    //width: 210,
   // height:32

   height: scaleVertical(25),
    resizeMode: 'contain'
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  image: {
    resizeMode: 'cover',
    height: scaleVertical(430),
  },
  text: {
    alignItems: 'center'
  },
  hero: {
    fontSize: 37,
  },
  appName: {
    fontSize: 62,
  },
  progress: {
    alignSelf: 'center',
    marginBottom: 35,
    backgroundColor: '#e5e5e5'
  },
  tieTitle:{
    marginTop: -80,
    marginBottom:50,
  }
}));