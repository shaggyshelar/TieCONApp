import React, { Component } from 'react';
import { Image,Platform,Text, Button, View, TouchableOpacity, StyleSheet, AsyncStorage, ScrollView,ActivityIndicator,Alert,NetInfo } from 'react-native';
import { RkButton, RkStyleSheet, RkText, RkCard } from 'react-native-ui-kitten';
import { Icon, Container, Tabs, Tab, TabHeading } from 'native-base';
import { NavigationActions, TabNavigator, TabView } from 'react-navigation';
import { Service } from '../../../services';
import Moment from 'moment';
import { Avatar } from '../../../components';
import styleConstructor, { getStatusStyle } from './styles';
import { GradientButton } from '../../../components/gradientButton';

const REGISTRATION_RESPONSE_TABLE = "RegistrationResponse";
export class SessionDetails extends Component {
  static navigationOptions = {
    title: 'Session Details'.toUpperCase()
  };
  constructor(props) {
    super(props);
    this.styles = styleConstructor();
    this.sessionDetails = this.props.navigation.state.params.session,
      this.state = {
        sessionDetails: this.props.navigation.state.params.session,
        speakerDetails: this.sessionDetails.speakersDetails,
        speakers: this.sessionDetails.speakers,
        sessionId: this.props.navigation.state.params.session.key,
        user: "",
        description: this.sessionDetails.description ? this.sessionDetails.description : "No details found...",
        sessionName: this.sessionDetails.eventName,
        sesssionDuration: this.sessionDetails.duration,
        sessionVenue: this.sessionDetails.room ? this.sessionDetails.room : "TBD",
        showPanelButton: false,
        showFeedbackButton: false,
        startTime: this.sessionDetails.startTime,
        endTime: this.sessionDetails.endTime,
        userObj: {},
        regStatus: "",
        regId: "",
        currentSessionStart : Moment(this.sessionDetails.startTime).format(),
        currentSessionEnd  :  Moment(this.sessionDetails.endTime).format(),
        sameTimeRegistration : false,
        isOffline : false
      }
  }
/**check */
componentWillMount() {
  if(Platform.OS !== 'ios'){
    NetInfo.isConnected.fetch().then(isConnected => {
      if(isConnected) {
        this.getCurrentUser();
        this.setState({
          isLoading: true
        });
      } else {
        this.setState({
          isLoading: false,
          isOffline : true
        });
      }
      
      this.setState({
        isOffline: !isConnected
      });
    });  
  }
  this.getCurrentUser();
  NetInfo.addEventListener(
    'connectionChange',
    this.handleFirstConnectivityChange
  );
}

handleFirstConnectivityChange = (connectionInfo) => {
  if(connectionInfo.type != 'none') {
    this.getCurrentUser();
      this.setState({
        isLoading: true
      });
  } else {
    this.setState({
      isLoading: false,
      isOffline : true
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
getCurrentUser() {
    Service.getCurrentUser((userDetails) => {
      this.setState({
        user: userDetails.firstName + " " + userDetails.lastName,
        userObj: userDetails
      });
      this.checkSurveyResponse();
      this.fetchRegistrationStatus();
    });
  }
  checkSurveyResponse = () => {
    Service.getDocRef("SessionSurvey")
      .where("SessionId", "==", this.state.sessionId)
      .where("ResponseBy", "==", this.state.userObj.uid)
      .get().then((snapshot) => {
        if (snapshot.size == 0) {
          this.setState({
            showPanelButton: true,
            showFeedbackButton: true
          })
        }
        else {
          this.setState({
            showPanelButton: true
          })
        }
        this.getSurveyAccess();
      })
      .catch(function (err) {
        console.log("err", err);
      });
  }

  onSurvey= ()=> {
    if(this.state.sessionDetails.startTime.getTime() < (new Date()).getTime()){
      this.props.navigation.navigate('Survey', { sessionDetails: this.state.sessionDetails });
    }else{
      Alert.alert("Its too early to give feedback for this session");
    }
  }
  getSurveyAccess = () => {
    if (this.state.showPanelButton == true && this.state.showFeedbackButton == true) {
      return (
        <View style={{ width:Platform.OS === 'ios' ? 320 : 380 ,alignItems:'center' , flexDirection : 'row'}}>
          <View style={{ width: Platform.OS === 'ios' ? 160 : 180 ,alignItems:'center'}} >
            <GradientButton colors={['#f20505', '#f55050']} text='Panel Q&A' style={{width: Platform.OS === 'ios' ? 150 :170 , alignSelf : 'center'}}
              onPress={() => this.props.navigation.navigate('QueTab', { sessionDetails: this.state.sessionDetails })}
            />
          </View>
          <View style={{  width: Platform.OS === 'ios' ? 160 : 180 ,alignItems:'center'}} >
            <GradientButton colors={['#f20505', '#f55050']} text='Feedback' style={{  width: Platform.OS === 'ios' ? 150 :170 ,alignSelf : 'center'}}
              onPress={this.onSurvey}
            />
          </View>
        </View>
      );
    }
    else if (this.state.showPanelButton == true) {
      return (
        <View style={{width:Platform.OS === 'ios' ? 320 : 360, alignItems : 'center' }} >
          <GradientButton colors={['#f20505', '#f55050']} text='Panel Q&A' style={{ width: Platform.OS === 'ios' ? 300 : 340 , alignSelf : 'center'}}
            onPress={() => this.props.navigation.navigate('QueTab', { sessionDetails: this.state.sessionDetails })}
          />
        </View>
      );
    }
    else {
      return null;
    }
  }
  getDuration = () => {
    let endTime = Moment(this.state.endTime).format("hh:mm A");
    let startTime = Moment(this.state.startTime).format("hh:mm A");
    let sessionDate = Moment(this.state.startTime).format("ddd, MMM DD, YYYY");
    return (<Text>{startTime} - {endTime} | {sessionDate} </Text>);
  }
  getSpeakers = () => {
    return this.state.speakerDetails
      .map((speaker, index) => {
        let avatar;
        if (speaker.profileImageURL) {
          avatar = <Avatar rkType='small' style={{width: 44,height: 44,borderRadius: 20}} imagePath={speaker.profileImageURL} />
        } else {
          //let firstLetter = speaker.firstName ? speaker.firstName[0] : '?';
          //avatar = <RkText rkType='small' style={styles.avatar}>{firstLetter}</RkText>
         // avatar = <Avatar rkType='small' style={{width: 44,height: 44,borderRadius: 20}} imagePath={require('../../../assets/images/defaultUserImg.png')} />
          avatar = <Image style={{width: 44,height: 44,borderRadius: 20}} source={require('../../../assets/images/defaultUserImg.png')}/>
        }
        return (
          <TouchableOpacity key={index} onPress={() => this.props.navigation.navigate('SpeakerDetailsTabs', { speakerDetails: speaker,speakersId : this.state.speakers})}>
            <View style={[styles.row, styles.heading, styles.speakerView]} >
              {avatar}
              <View style={styles.column}>
                <RkText rkType='small'>{speaker.firstName + ' ' + speaker.lastName}</RkText>
                <Text style={[styles.text, styles.speaker]} rkType='header6'>{speaker.briefInfo}</Text>
              </View>
              <RkText style={[styles.attendeeScreen]} ><Icon name="ios-arrow-forward" /></RkText>              
            </View>
          </TouchableOpacity>
        )
      });
  }

  attendRequestStatus = () => {
    if (this.state.regStatus) {
      return (
        <View style = {[styles.attendBtn]}>
          <RkButton rkType='outline'
            onPress={this.onCancelRequest}
            style ={{borderColor : '#f20505',borderRadius : 30 , width : 150 ,height :30}}
            contentStyle={{ fontSize: 12 , color: '#f20505' }}
          >
            {this.state.regStatus}
            </RkButton>
        </View>
      )
    }
     else {
      return (
        <View style = {[styles.attendBtn]} >
          <RkButton
            rkType='outline'
            style ={{borderColor : '#f20505', borderRadius : 30 , width : 150 ,height :30}}
            contentStyle={{ fontSize: 12 , color :'#f20505' }}
            onPress={this.onAttendRequest}>
            Add to My Agenda
            </RkButton>
        </View>
      );
    }
  }
  onAttendRequest = (event) => {
    if(this.state.sameTimeRegistration == true){
      Alert.alert("Already registered for same time in other session");
    }
    else{
      const attendeeId = this.state.userObj.uid;
      let attendRequest = {
        sessionId: this.state.sessionDetails.key,
        session: this.state.sessionDetails,
        registeredAt: new Date(),
        status: this.state.sessionDetails.isRegrequired ? "Pending" : "Remove From Agenda",
        attendee: {},
        attendeeId: attendeeId
      }
      Service.getDocRef("RegistrationResponse").add(attendRequest).then((req) => {
        this.setState({
          regId: req.id,
          regStatus: attendRequest.status,
        });
      }).catch((error) => {
        console.warn(error);
      });
    }
  }
  onCancelRequest = (event) => {
    Service.getDocRef("RegistrationResponse").doc(this.state.regId).delete().then((req) => {
        this.setState({
          regStatus: "",
          regId: ""
        })
    }).catch((error) => {
        console.warn(error);
    });
}

  fetchRegistrationStatus = () => {
    const baseObj = this;
    if (this.state.userObj) {
      const attendeeId = this.state.userObj.uid;
      Service.getDocRef(REGISTRATION_RESPONSE_TABLE)
        .where("sessionId", "==", this.state.sessionDetails.key)
        .where("attendeeId", "==", attendeeId)
        .onSnapshot(function (snapshot) {
          if (snapshot.size > 0) {
            snapshot.forEach((doc) => {
              let regResponse = doc.data();
                baseObj.setState({
                  regStatus: regResponse.status,
                  regId: doc.id
                })
            });
          }
          else{
            baseObj.checkAlreadyRegistered();
          }
        },function (error){
          console.warn(error);
        });
    } else {
      console.warn("User object is undefined");
    }
  }

  checkAlreadyRegistered = () => {
    const attendeeId = this.state.userObj.uid;
    let baseObj = this;
    Service.getDocRef(REGISTRATION_RESPONSE_TABLE)
      .where("attendeeId", "==", attendeeId)
      .get()
      .then((snapshot) => {
          snapshot.forEach(doc => {
            let RegSession = doc.data();
            let start = Moment(RegSession.session.startTime).format();
            let end = Moment(RegSession.session.endTime).format();
            if ( baseObj.state.currentSessionStart <= start && end <= baseObj.state.currentSessionEnd && RegSession.sessionId !== baseObj.state.sessionId) {
              baseObj.setState({
                sameTimeRegistration: true
              });
            }
            else {
              baseObj.setState({
                regStatus: "",
                regId: ""
              })
            }
          })  
      })
      .catch((error) => {
        console.warn(error);
      })
  }
  render() {
    const speakers = this.getSpeakers();
    
    const displaySpeakers = (this.state.speakerDetails.length>0)? (
        <View style={styles.speakerSection}>
              <View style={[styles.heading]}>
                <View style={[styles.row]}>
                  <RkText style={{ marginLeft: 5, fontSize: 16 }} ><Icon name="md-people" /> </RkText>
                  <RkText style={{ marginLeft: 5, fontSize: 16 }} rkType='header6 primary' >Speakers </RkText>
                </View>
              </View>
              {speakers}
        </View>
      ): (<View></View>);
      
    const surveyButton = this.getSurveyAccess();
    if(this.state.showPanelButton == true || this.state.showFeedbackButton == true){
      return (
        <Container style={styles.root}>
        <ScrollView style={styles.root}>
          {/* <RkCard> */}
            <View style={styles.section}>
              <View style={[styles.row, styles.heading]}>
                <RkText style={{ fontSize: 20 }} rkType='header6 primary'>{this.state.sessionName}</RkText>
              </View>
            </View>
            <View style={styles.subSection}>
              <View style={[styles.row, styles.heading]}>
                <Text style={{flexDirection : 'column',width: 25, fontSize: 12, marginTop:1, color: '#5d5e5f' }}><Icon name="md-time" style={{fontSize: 18, color: '#5d5e5f'}}/></Text>
                <Text style={{flexDirection : 'column'}} rkType='header6' style={{color: '#5d5e5f'}}> {this.getDuration()} </Text> 
              </View>
              <View style={[styles.row, styles.heading]}>
                <RkText style={{flexDirection : 'column',width: 25, fontSize: 12, marginTop:10 }}><Icon name="md-pin" style={{fontSize: 18, marginTop:5, color: '#5d5e5f'}}/></RkText>
                <Text style={{flexDirection : 'column'}} rkType='header6' style={{marginTop:10, marginLeft:3, color: '#5d5e5f'}}>{this.state.sessionVenue}</Text>
              </View>
              <View>
                {this.attendRequestStatus()}
              </View>
            </View>
            <View style={styles.descSection}>
              <View style={[styles.row, styles.heading]}>
                <RkText rkType='header6'>Summary: </RkText>
            </View>
              <View style={[styles.row]}>
                <Text style={[styles.text, styles.justify]}>{this.state.description}</Text>
              </View>
            </View>
            {displaySpeakers}
          {/* </RkCard> */}
        </ScrollView>
        <View style={[styles.surveButton]}>
        {surveyButton}
      </View>
      <View style={styles.footerOffline}>
            {
              this.state.isOffline ? <RkText rkType="small" style={styles.footerText}>The Internet connection appears to be offline. </RkText> : null
            }
          </View> 
          <View style={styles.footer}>
            <RkText rkType="small" style={styles.footerText}>Powered by</RkText>
            <RkText rkType="small" style={styles.companyName}> Eternus Solutions Pvt. Ltd. </RkText>
          </View>
      </Container>
      )
    }
    else{
      return (
        <Container style={[ styles.root]}>
        <View style={[styles.loading]} >
            <ActivityIndicator size='large' />
        </View>
        </Container>
    );
    }

  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base
  },
  section: {
    marginVertical: 25,
    marginBottom: 10
  },
  descSection: {
    marginVertical: 25,
    marginBottom: 10,
    marginTop: 5
  },
  speakerSection: {
    marginVertical: 25,
    marginBottom: 10,
    marginTop: 5
  },
  subSection: {
    marginTop: 5,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 17.5,
    borderColor: theme.colors.border.base,
    alignItems: 'center'
  },
  column:{
    flexDirection : 'column',
    marginLeft: 10
  },
  justify:{
    textAlign: 'justify'
  },
  text: {
    marginBottom: 5,
    fontSize: 15,
  },
  surveButton: {
    alignItems: 'center',
    flexDirection: 'column',
    width: Platform.OS === 'ios' ? 320 : 380,
    marginTop: 3,
    marginBottom: 3,
    alignSelf : 'center'
  },
  speakerView: {
    marginTop: 5,
    marginBottom: 5
  },
  speaker: {
    flexDirection: 'column',
    width: Platform.OS === 'ios' ? 225 : 250,
  },
  attendeeScreen: {
    flexDirection: 'column',
    fontSize: 25,
    marginRight: 5,
    alignItems : 'flex-end'
  },
  avatar: {
    backgroundColor: '#C0C0C0',
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 20,
    textAlignVertical: 'center',
    marginRight: 5
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 5
  },
  attendBtn : {
    flexDirection: 'column',
    alignItems : 'flex-end',
    marginRight : 10,
    marginTop : -10
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch', 
    backgroundColor : '#E7060E'
  },
  footerOffline : {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch', 
    backgroundColor : '#545454'
  },
  footerText: {
    color : '#f0f0f0',
    fontSize: 11,
  },
  companyName:{
    color : '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
}));
