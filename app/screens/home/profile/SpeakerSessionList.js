import React from 'react';
import { FlatList, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View } from 'native-base';
import { RkText, RkComponent, RkTextInput, RkAvoidKeyboard, RkTheme, RkStyleSheet } from 'react-native-ui-kitten';
import { data } from '../../../data';
import { Avatar } from '../../../components';
import { FontAwesome } from '../../../assets/icons';
import { GradientButton } from '../../../components';
import LinkedInModal from 'react-native-linkedin';
import ScheduleTile from '../schedule/Schedule-tile';
import firebase from '../../../config/firebase'
import { Service } from '../../../services';
var firestoreDB = firebase.firestore();

const TABLE = "Sessions";
export class SpeakerSessionList extends RkComponent {
  static navigationOptions = {
    title: "speaker".toUpperCase()
  };

  constructor(props) {
    super(props);
    this.state = Object.assign(props, {
      sessionList: [],
    });
  }

  componentDidMount() {
    this.fetchSessionList();
  }

  fetchSessionList() {
    Service.getDocRef(TABLE)
      .orderBy('startTime')
      .onSnapshot((snapshot) => {
        var sessions = [];
        snapshot.forEach((request) => {
          const session = request.data();
          let id = request.id;
          let { params } = this.props.navigation.state;
          let speakerId = params.speakersId;
          if (request.data().speakers != undefined) {
            let speakerArray = request.data().speakers;
            let i;
            for (i = 0; i < speakerArray.length; i++) {
              if (speakerArray[i] == speakerId) {
                sessions.push({
                  key: id,
                  eventName: session.eventName,
                  room: session.room,
                  speakers: session.speakers,
                  startTime: session.startTime,
                  endTime: session.endTime,
                  description: session.description,
                  speakersDetails: [],
                  sessionType : session.sessionType
                });
              }
            }
          }
        });
        let newSessions = [];
        newSessions = [...sessions];
        this.setState((prevState) => ({
          ...prevState,
          sessionList: newSessions
        }));
      }, function (error) {
        //console.warn(error);
      });
  }

  render() {
    let sessionsList;
    if (this.state.sessionList && this.state.sessionList.length > 0) {
      sessionList = (<FlatList
        data={this.state.sessionList}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <ScheduleTile navigation={this.props.navigation} session={item} />}
      />)
    }
    else if (this.state.sessionList && this.state.sessionList.length == 0) {
      sessionList = (<View style={styles.loading} >
        <Text>No Sessions found...</Text>
      </View>)
    }
    else {
      sessionList = (<View style={styles.loading} >
        <ActivityIndicator size='large' />
      </View>)
    }
    return (
      <View style={styles.listContainer}>
        {sessionList}
      </View >
    );
  }
}
const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  loading: {
    marginTop: 250,
    left: 0,
    opacity: 0.5,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
});