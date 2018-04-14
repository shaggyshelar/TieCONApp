import React from 'react';
import { RkAvoidKeyboard, RkStyleSheet,RkText } from 'react-native-ui-kitten';
import { Tabs, Tab, Icon, Text, TabHeading } from "native-base";
import { Platform, View ,NetInfo} from 'react-native';
import { AttendeeProfile } from './AttendeeProfile';
import { SpeakerSessionList } from './SpeakerSessionList';

export class SpeakerDetailsTabs extends React.Component {
  static navigationOptions = {
    title: "speaker details".toUpperCase()
  };
  constructor (props){
    super(props);
    this.state = {
      isOffline : false
    }
  }
  componentWillMount() {
    if(Platform.OS !== 'ios'){
      NetInfo.isConnected.fetch().then(isConnected => {
        if(isConnected) {
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
  render() {
    return (
      <Tabs style={{ elevation: 3 }} style={styles.tabContent}>
        <Tab
          heading={
            <TabHeading style={{ backgroundColor: '#fff' }} ><Icon style={[styles.textColor]} name="ios-people" /><Text style={[styles.textColor]} >Profile</Text></TabHeading>
          }
        >
          <AttendeeProfile navigation={this.props.navigation} />
          <View style={[styles.footerOffline]}>
            {
              (!this.state.isLoading && this.state.isOffline) ? <RkText rkType="small" style={[styles.footerText]}>The Internet connection appears to be offline. </RkText> : null
            }
          </View>
          <View style={[styles.footer]}>
            <RkText rkType="small" style={[styles.footerText]}>Powered by</RkText>
            <RkText rkType="small" style={[styles.companyName]}> Eternus Solutions Pvt. Ltd. </RkText>
          </View>

        </Tab>
        <Tab
          heading={
            <TabHeading style={{ backgroundColor: '#fff' }}><Icon style={[styles.textColor]} name="calendar" /><Text style={[styles.textColor]} >Sessions</Text></TabHeading>
          }
        >
          <SpeakerSessionList navigation={this.props.navigation} />
          <View style={[styles.footerOffline]}>
            {
              (!this.state.isLoading && this.state.isOffline) ? <RkText rkType="small" style={[styles.footerText]}>The Internet connection appears to be offline. </RkText> : null
            }
          </View>
          <View style={[styles.footer]}>
            <RkText rkType="small" style={[styles.footerText]}>Powered by</RkText>
            <RkText rkType="small" style={[styles.companyName]}> Eternus Solutions Pvt. Ltd. </RkText>
          </View>
        </Tab>
      </Tabs>

    );
  }
}
let styles = RkStyleSheet.create(theme => ({
  screen: {
    backgroundColor: theme.colors.screen.base
  },
  tabContent: {
    backgroundColor: 'red',
  },
  textColor: {    
    color: '#ed1b24'
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