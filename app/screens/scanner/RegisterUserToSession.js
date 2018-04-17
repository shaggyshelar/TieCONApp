import React from 'react';
import { RkStyleSheet, RkText, RkButton, RkTextInput, RkAvoidKeyboard, RkTheme } from 'react-native-ui-kitten';
import { Text, Container, Header, Title, Content, Button, Icon, Right, Body, Left, Picker, ListItem } from "native-base";
import { ScrollView, Platform, NetInfo, ActivityIndicator, View, Image, Alert, Keyboard } from 'react-native';
import { GradientButton } from '../../components/gradientButton';
import { scale, scaleModerate, scaleVertical } from '../../utils/scale';
import firebase from '../../config/firebase';

function renderIf(condition, content) {
  if (condition) {
    return content;
  } else {
    return null;
  }
}

export class RegisterUserToSession extends React.Component {
  static navigationOptions = {
    title: 'Register User To Session'.toUpperCase()
  };

  constructor(props) {
    super(props);
    this.state = {
      isOffline: false,
      userId: '',
      sessions: [],
      isLoading: true
    }
    this._getSesssionsFromServer = this._getSesssionsFromServer.bind(this);
  }

  renderPicker = (sessionItems) => {
    if (Platform.OS == 'ios') {
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

  componentDidMount() {
    this._getSesssionsFromServer();
  }

  _getSesssionsFromServer() {
    let db = firebase.firestore();
    let thisRef = this;
    let sessions = [];
    db.collection("Sessions").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        let sessionData = doc.data();
        sessionData['id'] = doc.id;
        if (sessionData.sessionType == 'deepdive') {
          sessionData['eventName'] = sessionData.eventName + '(' + sessionData.room + ')';
          sessions.push(sessionData);
        }
      });
      if (sessions.length > 0) {
        let selectedSession = sessions[0];
        thisRef.setState({ sessions, selectedSession: selectedSession.id, isLoading: false });
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
        { cancellable: false }
      );
    });
  }

  _getSelectedSession = () => {
    let session = _.find(this.state.sessions, { 'id': this.state.selectedSession });
    return session;
  }

  onConfChange(selectedSessionId) {
    let session = _.find(this.state.sessions, { 'id': this.state.selectedSession });
    this.setState({
      selectedSession: selectedSessionId,
    });
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

  getSelectedUserUI = () => {
    console.warn('caling');
    var db = firebase.firestore();
    db.collection("Attendee")
    .where("attendeeLabel", "==", 'DEL')
    .where("attendeeCount", "==", '0206')
    .get()
    .then(function(doc) {
      let user = doc.data();
      console.warn('Found ID', user);
    })
    .catch( function ( error){
      console.warn("error", error);
    });
  }

  onRegisterUserClick() {
    if (!this.state.userId) {
      Alert.alert(
        'Invalid User ID',
        'Please enter valid User ID.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancellable: false }
      );
    } else if (this.state.userId.length != 8) {
      Alert.alert(
        'Invalid User ID',
        'Invalid length of user ID. Proper format is \'Del-2002\'.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancellable: false }
      );
    } else {
      let selectedSession = this._getSelectedSession();
      let message = 'User id=' + this.state.userId + ', SessionId= ' + this.state.selectedSession;
      this.getSelectedUserUI();
      Alert.alert(
        'Good',
        message,
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancellable: false }
      );
    }
  }

  renderSessionDropdown = () => {
    if (this.state.isOffline || this.state.error) {
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
        {this.renderPicker(sessionItems)}
      </View>
    );
  }

  renderPage = () => {
    return (
      <View style={styles.content}>
        {this.renderSessionDropdown()}
        <View>
          <RkTextInput rkType='rounded' onChangeText={(text) => this.setState({ userId: text })} placeholder='User ID' style={styles.loginInput} />
          <GradientButton colors={['#E7060E', '#f55050']} style={styles.save} rkType='large' text='Register User' onPress={this.onRegisterUserClick.bind(this)} />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View
        style={styles.screen}>
        {this.renderPage()}
        <View>
          <View style={styles.footerOffline}>
            {
              this.state.isOffline ? <RkText rkType="small" style={styles.footerText}>The Internet connection appears to be offline. </RkText> : null
            }
          </View>
        </View>
        {renderIf(this.state.isLoading,
          <View style={styles.loading}>
            <ActivityIndicator size='large' />
          </View>
        )}
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base
  },
  screen: {
    padding: 10,
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  content: {
    justifyContent: 'space-between'
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
  },
  loginInput: {
    borderRadius: 0,
    borderWidth: 1,
    padding: 5,
  },
  companyName: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  save: {
    marginVertical: 20,
    borderRadius: 0,
    backgroundColor: '#ed1b24'
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