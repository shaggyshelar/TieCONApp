import React from 'react';
import {
  DrawerNavigator,
  StackNavigator, SwitchNavigator
} from 'react-navigation';
import {withRkTheme} from 'react-native-ui-kitten';
import {AppRoutes} from './config/navigation/routesBuilder';
import * as Screens from './screens';
import {bootstrap} from './config/bootstrap';
import track from './config/analytics';
import {data} from './data'
import {AppLoading, Font} from 'expo';
import {View, Text, Alert, AsyncStorage, Platform} from "react-native";
import { Permissions, Notifications } from 'expo';
import firebase, {firestoreDB} from './config/firebase';

bootstrap();
data.populateData();

function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

let SideMenu = withRkTheme(Screens.SideMenu);
const AppStack = DrawerNavigator({
  ...AppRoutes,
},
{
  drawerOpenRoute: 'DrawerOpen',
  drawerCloseRoute: 'DrawerClose',
  drawerToggleRoute: 'DrawerToggle',
  contentComponent: (props) => <SideMenu {...props}/>
});
const AuthStack = StackNavigator({ SignIn: { screen: Screens.LoginV2 } });

const SwitchStack = SwitchNavigator(
  {
    AuthLoading: Screens.SplashScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
);

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();
  // console.warn('Token', token);
  if(token) {
    AsyncStorage.getItem("USER_DETAILS").then((userDetails)=>{
      if(userDetails) {
        let userObject = JSON.parse(userDetails);
        firestoreDB.collection('Tokens').doc(token).set({
          userId: userObject.uid,
          roleName: userObject.roleName,
          isLoggedIn: true,
          platform: Platform.OS,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then((docRef) => {
          // Store in local storage
        })
        .catch((error) => {
        });
      } else {
        firestoreDB.collection('Tokens').doc(token).set({
          userId: '',
          roleName: '',
          isLoggedIn: false,
          platform: Platform.OS,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then((docRef) => {
          // Store in local storage
        })
        .catch((error) => {
        });
      }
    }).catch(function(error) {
      console.warn('Error reading local storage.');
    });
    
  }
}


export default class App extends React.Component {
  state = {
    loaded: false,
    signedIn: false,
    checkedSignIn: false,
    notification: {},
  };

  componentWillMount() {
    this._loadAssets();
    registerForPushNotificationsAsync();
  
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = (notification) => {
    Alert.alert(
      'Token',
      'Some Notification Received.',
      [
        { text: 'Ok', onPress: () => {} },
      ],
      { cancelable: false }
    );
  };

  _loadAssets = async() => {
    await Font.loadAsync({
      'fontawesome': require('./assets/fonts/fontawesome.ttf'),
      'icomoon': require('./assets/fonts/icomoon.ttf'),
      'Righteous-Regular': require('./assets/fonts/Righteous-Regular.ttf'),
      'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
      'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
      'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      'Ionicons': require("@expo/vector-icons/fonts/Ionicons.ttf")
    });
    this.setState({loaded: true});
  };

  render() {
    if (!this.state.loaded) {
      return <AppLoading />;
    }

    return (
      <SwitchStack />
    );
  }
}

Expo.registerRootComponent(App);
