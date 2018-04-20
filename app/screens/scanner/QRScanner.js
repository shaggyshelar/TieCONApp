import React from 'react';
import { LayoutAnimation, Alert, Text, View, TouchableOpacity, Image, Dimensions, Keyboard, ActivityIndicator, AsyncStorage, NetInfo } from 'react-native';
import { RkButton, RkText, RkTextInput, RkStyleSheet, RkTheme, RkAvoidKeyboard } from 'react-native-ui-kitten';
import { FontAwesome } from '../../assets/icons';
import { GradientButton } from '../../components/gradientButton';
import { scale, scaleModerate, scaleVertical } from '../../utils/scale';
import { Platform, Vibration, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { BarCodeScanner, Permissions } from 'expo';
import { Container, Header, Title, Content, Button, Icon, Right, Body, Left, Picker, ListItem } from "native-base";

import firebase from '../../config/firebase';
var firestoreDB = firebase.firestore();

const Item = Picker.Item;

function renderIf(condition, content) {
  if (condition) {
    return content;
  } else {
    return null;
  }
}

export class QRScanner extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Scanner'.toUpperCase(),
  });

  constructor(props) {
    super(props);
    this.state = {
      hasCameraPermission: null,
      isErrorDisplayed: false,
      selectedItem: undefined,
      selectedSession: "",
      isLoading: true,
      sessions: [],
      lastScannedResult: '',
      lastScannedUserLabel: '',
      sessionUsers: [],
      isOffline: false,
      sessionCapacity: 0,
      sessionDelegateAttendance: 0,
      sessionOtherAttendance: 0,
      loggedInUser: {},
      subscriptionHandler: null,
      results: {
        items: []
      }
    };
    this._getCurrentSessionUsers = this._getCurrentSessionUsers.bind(this);
    this.subscribeToSessionUpdate = this.subscribeToSessionUpdate.bind(this);
    this._getSessions = this._getSessions.bind(this);
    this._getSesssionsFromServer = this._getSesssionsFromServer.bind(this);
  }
  
  _getSesssionsFromServer() {
    let db = firebase.firestore();
    let thisRef = this;
    let sessions = [];    
    db.collection("Sessions").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        let sessionData = doc.data();
        sessionData['id'] = doc.id;
        if(sessionData.sessionType != 'break') {
          sessionData['eventName'] = sessionData.eventName + '(' + sessionData.room + ')';
          sessions.push(sessionData);
        }
      });
      if (sessions.length > 0) {
        let selectedSession = sessions[0];
        thisRef.setState({ sessions, selectedSession: selectedSession.id, sessionCapacity: selectedSession.sessionCapacity });
        //AsyncStorage.setItem("QR_SESSIONS", JSON.stringify(sessions));
        thisRef._getCurrentSessionUsers(selectedSession.id);
        thisRef.subscribeToSessionUpdate(selectedSession.id);
      } else {
        thisRef.setState({ error: 'No sessions configured on server. Please contact administrator.', isLoading: false });
      }
    }).catch(function (error) {
      thisRef.setState({ error: 'Error getting Sessions from server. Please contact adminstrator.', isLoading: false })
      Alert.alert(
        'Error',
        'Unable to get sessions information. Please try again.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    });
  }

  _getSessions() {
    let thisRef = this;
    thisRef._getSesssionsFromServer();
    // AsyncStorage.getItem("QR_SESSIONS").then((sessions) => {
    //   if (sessions != null){
    //     let sessionsObj = JSON.parse(sessions);
    //     thisRef.setState({ sessions: sessionsObj, selectedSession: sessionsObj[0].id });
    //     thisRef._getCurrentSessionUsers(sessionsObj[0].id);
    //   } else {
    //     thisRef._getSesssionsFromServer();
    //   }
    // })
    // .catch(err => {
    //   thisRef._getSesssionsFromServer();
    // });
  }

  componentDidMount() {
    this._requestCameraPermission();
    let thisRef = this;
    NetInfo.isConnected.fetch().then(isConnected => {
      if(isConnected) {
        this.setState({
          isLoading: true
        });
        this._getSessions();  
      } else {
        this.setState({
          isLoading: false
        });
      }
      this.setState({
        isOffline: !isConnected
      });
    });  
    AsyncStorage.getItem("USER_DETAILS").then((userDetails) => {
      if(userDetails) {
        let user = JSON.parse(userDetails)
        thisRef.setState({
          loggedInUser: user
        });  
      }
    })
    .catch(err => {
      console.warn('Error',err);
    }); 
    NetInfo.addEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange
    );
  }

  handleFirstConnectivityChange = (connectionInfo) => {
    if(connectionInfo.type != 'none') {
        this.setState({
          isLoading: true
        });
        this._getSessions();
    } else {
      this.setState({
        isLoading: false
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

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  _getSelectedSession = () => {
    let session = _.find(this.state.sessions, { 'id': this.state.selectedSession });
    return session;
  }

  _updateUserData(scannedData, userInfo) {
      if (this.state.lastScannedResult != scannedData && !this.state.isLoading) {
        let selectedSession = this._getSelectedSession();
        let parsedUserInfo = userInfo.split("-");
        if(parsedUserInfo.length == 1) {
          parsedUserInfo.push('');
        }
        this.setState({ isLoading: true, lastScannedResult: scannedData, lastScannedUserLabel: userInfo });
        if (selectedSession.sessionType == 'deepdive' && parsedUserInfo[0] == 'DEL' && this.state.sessionUsers.indexOf(scannedData) == -1) {
          Alert.alert(
            'Unregistered User',
            'This user is not registered for this session. Do you still want to continue?',
            [
              {
                text: 'Yes', onPress: () => {
                  firestoreDB.collection('Attendance').add({
                    userId: scannedData,
                    userType: parsedUserInfo[0],
                    userLabel: userInfo,
                    sessionId: this.state.selectedSession,
                    session: selectedSession,
                    userName: '',
                    userRole: '',
                    scannedBy: this.state.loggedInUser.uid,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                  })
                    .then((docRef) => {
                      this.setState({ isLoading: false });
                      Vibration.vibrate(200);      
                    })
                    .catch((error) => {
                      this.setState({ isLoading: false });
                      Alert.alert(
                        'Error',
                        'Unable to update attendance. Please try again.',
                        [
                          { text: 'Ok', onPress: () => { } },
                        ],
                        { cancelable: false }
                      );
                    });
                }
              },
              {
                text: 'No', onPress: () => {
                  this.setState({ isLoading: false });
                }
              },
            ],
            { cancelable: false }
          );
        } else {
          firestoreDB.collection('Attendance').add({
            userId: scannedData,
            userType: parsedUserInfo[0],
            userLabel: userInfo,
            sessionId: this.state.selectedSession,
            session: selectedSession,
            userName: '',
            userRole: '',
            scannedBy: this.state.loggedInUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          })
            .then((docRef) => {
              this.setState({ isLoading: false });
              Vibration.vibrate(500);
            })
            .catch((error) => {
              this.setState({ isLoading: false });
              Alert.alert(
                'Error',
                'Unable to update attendance. Please try again.',
                [
                  { text: 'Ok', onPress: () => { } },
                ],
                { cancelable: false }
              );
            });
        }
      } else {
        console.warn('already scanned');        
      }
  }

  _validateQRData(data) {
    if (data.startsWith('TIE:')) {
      let parsedData = data.split(":");
      if(parsedData.length == 3){
        this._updateUserData(parsedData[2], parsedData[1]);
      } else {
        this.setState({ isErrorDisplayed: true, isLoading: false });
        Alert.alert(
          'Invalid Data',
          'This QR code is not valid TiE QR Code.',
          [
            {
              text: 'Ok', onPress: () => {
                this.setState({ isErrorDisplayed: false });
              }
            },
          ],
          { cancelable: false }
        );
      }
    } else {
      this.setState({ isErrorDisplayed: true, isLoading: false });
      Alert.alert(
        'Invalid Data',
        'This QR code is not valid TiE QR Code.',
        [
          {
            text: 'Ok', onPress: () => {
              this.setState({ isErrorDisplayed: false });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  _handleBarCodeRead = result => {
    if (this.state.isErrorDisplayed == false) {
      LayoutAnimation.spring();
      this._validateQRData(result.data);
    }
  };

  _getCurrentSessionUsers(selectedSessionId) {
    let thisRef = this;
    let sessionUsers = [];
    var db = firebase.firestore();
    db.collection("RegistrationResponse")
    .where("sessionId", "==", selectedSessionId)
    .onSnapshot((querySnapshot) => {
    // .get()
    // .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        let sessionData = doc.data();
        sessionUsers.push(sessionData.attendeeId);
        //console.warn(sessionUsers);
      });
      thisRef.setState({ sessionUsers, isLoading: false });
    },function(error){
      thisRef.setState({ isLoading: false });
      Alert.alert(
        'Error',
        'Unable to get users for selected session. Please try again.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    })

    // .catch(function (error) {
    //   thisRef.setState({ isLoading: false });
    //   Alert.alert(
    //     'Error',
    //     'Unable to get users for selected session. Please try again.',
    //     [
    //       { text: 'Ok', onPress: () => { } },
    //     ],
    //     { cancelable: false }
    //   );
    // });
  }

  subscribeToSessionUpdate(selectedSessionId) {
    if(this.state.subscriptionHandler) {
      this.state.subscriptionHandler();      
    }
    let db = firebase.firestore();
    let thisRef = this;
    let subscriptionHandler = db.collection("Attendance").where("sessionId", "==", selectedSessionId)
    .onSnapshot(function(querySnapshot) {
      var attendance = [], delegateAttedance = 0, otherAttendance = 0;
      querySnapshot.forEach(function(doc) {
        let attendanceDetails = doc.data();
        if(attendanceDetails.userType == "DEL"){
          delegateAttedance++;
        } else {
          otherAttendance++;
        }
        attendance.push(attendanceDetails);
      });
      thisRef.setState({sessionDelegateAttendance: delegateAttedance, sessionOtherAttendance: otherAttendance});
    });
    this.setState({subscriptionHandler});
  }

  onConfChange(selectedSessionId) {
    let session = _.find(this.state.sessions, { 'id': this.state.selectedSession });
    let sessionCapacity = session.sessionCapacity ? session.sessionCapacity : 'NA';
    this.setState({
      selectedSession: selectedSessionId,
      isLoading: true,
      lastScannedResult: '',
      sessionCapacity: sessionCapacity
    });
    this._getCurrentSessionUsers(selectedSessionId);
    this.subscribeToSessionUpdate(selectedSessionId);
  }

  getView = () => {
    if(this.state.hasCameraPermission === null){
      return (
        <RkText>Requesting for camera permission...</RkText>
      );
    } else {
      if(this.state.hasCameraPermission === false) {
        return (
          <RkText>
            Camera permission is not granted.
          </RkText>
        );
      } else {
        if(this.state.isOffline) {
          return (
            <RkText>
              The Internet connection appears to be offline.
            </RkText>
          );
        } else if(this.state.error) {
          return (
            <RkText>
              {this.state.error}
            </RkText>
          );
        } else {
          return (
            <View>
              <BarCodeScanner
                style={styles.barCode}
                onBarCodeRead={this._handleBarCodeRead}
                style={{
                  height: (Dimensions.get('window').height - (Platform.OS === 'ios' ? 190 : 220)),
                  width: (Dimensions.get('window').width - 20),
                }}
              />
              <View style={styles.scanResults}>
                <RkText>
                  {this.state.lastScannedUserLabel}
                </RkText>
              </View>
            </View>
          );
        }
      }
    }
  }

  renderPicker = (sessionItems) => {
    if(Platform.OS == 'ios') {
      return (
        <View style={styles.container}>
          <Picker
              note
              iosHeader="Select Session"
              placeholder="Select Session"
              headerStyle={{ backgroundColor: "#ed1b24" }}
              headerBackButtonTextStyle={{ color: "#fff" }}
              headerTitleStyle={{ color: "#fff" }}
              iosIcon={<Icon name="ios-arrow-down-outline" />}
              mode="dropdown"
              selectedValue={this.state.selectedSession}
              onValueChange={this.onConfChange.bind(this)}
            >
                {sessionItems}
          </Picker>
        </View>
      )
    } else {
      return (
        <ListItem icon>
            <Left>
              <Text>Select Session</Text>
            </Left>
            <Body>
              <Picker
                note
                mode="dropdown"
                selectedValue={this.state.selectedSession}
                onValueChange={this.onConfChange.bind(this)}
              >
                {sessionItems}
              </Picker>
            </Body>
        </ListItem>
      );
    }
  }

  renderSessionDropdown = () => {
    if(this.state.isOffline || this.state.error) {
      return null;
    }

    let sessionItems = this.state.sessions.map(function (session, index) {
      return (
        // <Item key={index} label={session.eventName} value={session.id} />
        <Text ellipsizeMode='tail' style={styles.text} numberOfLines={1} key={index} label={session.eventName} value={session.id} />
      )
    });

    return (
      <View>
        { this.renderPicker(sessionItems)}
        <View style={[styles.userInfo, styles.bordered]}>
          <View style={styles.section}>
            <RkText rkType='header3' style={styles.space}> {this.state.sessionDelegateAttendance} / {this.state.sessionCapacity}</RkText>
            <RkText rkType='secondary1 hintColor'>Attendance</RkText>
          </View>
          <View style={styles.section}>
            <RkText rkType='header3' style={styles.space}> {this.state.sessionOtherAttendance} </RkText>
            <RkText rkType='secondary1 hintColor'>Others</RkText>
          </View>
        </View>
      </View>
    );
  }

  render() {
    return (
      <RkAvoidKeyboard
        style={styles.screen}
        onStartShouldSetResponder={(e) => true}
        onResponderRelease={(e) => Keyboard.dismiss()}>
        {this.renderSessionDropdown()}
        <View>
          {this.getView()}
        </View>
        {renderIf(this.state.isLoading,
          <View style={styles.loading}>
            <ActivityIndicator size='large' />
          </View>
        )}
      </RkAvoidKeyboard>
    );
  }
}

let styles = RkStyleSheet.create(theme => ({
  section: {
    flex: 1,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base,
    alignItems: 'center'
  },
  userInfo: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  bordered: {
    borderBottomWidth: 1,
    borderColor: theme.colors.border.base
  },
  space: {
    marginBottom: 1
  },
  screen: {
    padding: 10,
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  container: {
    flexDirection: 'row',
    padding: 0
  },
  text: {
    flex: 1
  },
  barCode: {
    padding: 10,
  },
  scanResults:{
    alignItems: 'center'
  },
  loading: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'black',
    opacity: 0.8,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
}));