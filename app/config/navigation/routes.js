import React from 'react';
import { Image, ScrollView, View, StyleSheet, Alert, AsyncStorage, ActivityIndicator, NetInfo, Platform } from 'react-native';
import { RkText, RkStyleSheet } from 'react-native-ui-kitten';
import { Container } from 'native-base';
import { FontIcons } from '../../assets/icons';
import * as Screens from '../../screens/index';
import { HomePage } from '../../screens/index';
import { Questions } from '../../screens/index';
import _ from 'lodash';
import { data } from '../../data';
import { Avatar } from '../../components/avatar';
import { Service } from './../../services';

export class HomePageMenuScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let renderAvatar = () => {
      return (
        // <Avatar style={styles.avatar} rkType='small' img={require('../../assets/images/eternusThumbWhite.png')}/>
        <Image style={styles.avatar} source={require('../../assets/images/eternusThumbWhite.png')} />
      );
    };

    let renderTitle = () => {
      return (
        <View style={styles.header}>
          {/* <RkText style={{color: 'white'}}>TiE Pune 2018</RkText> */}
          <Image style={styles.TieLOGO} source={require('../../assets/images/TiECon-Pune-2018-logo.png')} />
        </View>
      )
    };

    let rightButton = renderAvatar();
    let title = renderTitle();
    return (
      {
        headerTitle: title,
        headerRight: rightButton
      });
  };

  constructor(props) {
    super(props)
    let params = this.props.navigation.state.params || {};
    let show = params.showHome || false;
    this.state = {
      showQuestions: false,
      showHomepage: false,
      userId: "",
      showHome: show,
      isLoading: false,
      isOffline: false
    }
  }
  /**check */
  componentWillMount() {
    if (Platform.OS !== 'ios') {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected) {
          this.getCurrentUser();
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
    this.getCurrentUser();
    NetInfo.addEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange
    );
  }

  handleFirstConnectivityChange = (connectionInfo) => {
    if (connectionInfo.type != 'none') {
      this.getCurrentUser();
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
  getCurrentUser() {
    Service.getCurrentUser((userDetails) => {
      let Uid = userDetails.uid;
      this.setState({
        userId: Uid
      })
      if (this.state.showHome == false) {
        this.getQuestionsData(Uid);
      }
      else {
        this.setState({
          showQuestions: false,
          showHomepage: true
        })
      }
    });
  }
  getQuestionsData = (Uid) => {
    Service.getDocRef("QuestionsHome")
      .where("ResponseBy", "==", Uid)
      .get()
      .then((snapshot) => {
        if (snapshot.size == 0) {
          this.setState({
            showQuestions: true,
            showHomepage: false
          })
        }
        else {
          this.setState({
            showQuestions: false,
            showHomepage: true
          })
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  }
  render() {
    if (this.state.showQuestions == true && this.state.showHomepage == false) {
      return (
        <Questions navigation={this.props.navigation} userId={this.state.userId} />
      );
    }
    else if (this.state.showQuestions == false && this.state.showHomepage == true) {
      return (
        <View style={styles.mainView}>
          <HomePage navigation={this.props.navigation} />
          <View style={styles.footerOffline}>
            {
              (!this.state.isLoading && this.state.isOffline) ? <RkText rkType="small" style={styles.footerText}>The Internet connection appears to be offline. </RkText> : null
            }
          </View>
          <View style={styles.footer}>
            <RkText rkType="small" style={styles.footerText}>Powered by</RkText>
            <RkText rkType="small" style={styles.companyName}> Eternus Solutions Pvt. Ltd. </RkText>
          </View>
        </View>
      );
    }
    else if (!this.state.isLoading && this.state.isOffline) {
      return (
        <Container style={styles.root}>
          <ScrollView>
            <View style={styles.loading} >
              <RkText>The Internet connection appears to be offline.</RkText>
            </View>
          </ScrollView>
        </Container>
      );
    }
    else {
      return (
        <Container style={styles.root}>
          <ScrollView>
            <View style={styles.loading} >
              <ActivityIndicator size='large' />
            </View>
          </ScrollView>
        </Container>
      );
    }
  }
}

export const MainRoutes = [
  {
    id: 'HomeMenu',
    title: 'Home',
    icon: 'md-home',
    screen: HomePageMenuScreen,
    children: [
      {
        id: 'SpeakerDetailsTabs',
        title: 'Speaker DetailsTabs',
        screen: Screens.SpeakerDetailsTabs,
        children: []
      },
      {
        id: 'SessionDetails',
        title: 'Session Details',
        screen: Screens.SessionDetails,
        children: []
      },
      {
        id: 'QueTab',
        title: 'Ask Questions',
        screen: Screens.QueTab,
        children: []
      },
      {
        id: 'Survey',
        title: 'Survey',
        screen: Screens.Survey,
        children: []
      }
    ]
  },
  {
    id: 'QRScanner',
    title: 'QR Scanner',
    icon: 'md-qr-scanner',
    screen: Screens.QRScanner,
    children: [],
    roleNames: ['Admin', 'Volunteer']
  },
  {
    id: 'RegisterUsers',
    title: 'Register Users',
    icon: 'md-qr-scanner',
    screen: Screens.RegisterUserToSession,
    children: [],
    roleNames: ['Admin', 'Volunteer']
  },
  // {
  //   id: 'MyProfile',
  //   title: 'My Profile',
  //   icon: 'ios-person',
  //   screen: Screens.ProfileSettings,
  //   children: [],
  // },
  {
    id: 'Speakers',
    title: 'Speakers',
    icon: 'ios-people',
    screen: Screens.Speakers,
    children: []
  },
  {
    id: 'Sponsors',
    title: 'Sponsors',
    icon: 'ios-people',
    screen: Screens.Sponsors,
    children: []
  },
   {
    id: 'VenueMap',
    title: 'Location Map',
    icon: 'md-navigate',
    screen: Screens.VenueMap,
    children: []
  },
   {
     id: 'HelpDesk',
     title: 'Helpdesk',
     icon: 'md-help',
     screen: Screens.HelpDesk,
     children: []
   },
   {
    id: 'AboutUs',
    title: 'About Tie',
    icon: 'md-information-circle',
    screen: Screens.AboutUs,
    children: []
  },
  {
    id: 'AboutEternus',
    title: 'About Eternus',
    icon: 'md-information-circle',
    screen: Screens.AboutEternus,
    children: []
  },
];

let menuRoutes = _.cloneDeep(MainRoutes);
menuRoutes.unshift({
  id: 'GridV2',
  title: 'Start',
  screen: HomePageMenuScreen,
  children: []
}, );

export const MenuRoutes = menuRoutes;

const styles = RkStyleSheet.create(theme => ({
  mainView: {
    backgroundColor: theme.colors.screen.base,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
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
  avatar: {
    marginRight: 12,
    height: 30,
    width: 35,
    borderRadius: 4,

  },
  header: {
    alignItems: 'center'
  },
  TieLOGO: {
    height: 40,
    width: 85,
  },
  root: {
    backgroundColor: theme.colors.screen.base
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
}));