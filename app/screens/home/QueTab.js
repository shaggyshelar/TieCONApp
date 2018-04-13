import React from 'react';
import { RkAvoidKeyboard, RkStyleSheet,RkText } from 'react-native-ui-kitten';
import { View,Tabs, Tab, Icon, Text, TabHeading } from "native-base";
import { AsyncStorage ,Platform ,NetInfo} from "react-native";
import AskQuestion from './Questions/AskQuestion';
import PollSession from './Questions/PollSession';

export  class QueTab extends React.Component {
  static navigationOptions = {
    title: 'Panel Q&A'.toUpperCase()
  };
  constructor(props) {
    super(props);
    this.state ={
      sessionId : this.props.navigation.state.params.sessionId,
      isOffline : false,
      isLoading: false
    }
  }
  componentWillMount() {
    if(Platform.OS !== 'ios'){
      NetInfo.isConnected.fetch().then(isConnected => {
        if(isConnected) {
         // this.getCurrentUser();
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
   // this.getCurrentUser();
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
      <Tabs style={{ elevation: 3 }}>
        <Tab
          heading={
            <TabHeading style={{backgroundColor : '#ed1b24' }}><Icon style={[styles.textColor]} name="md-help"/><Text style={[styles.textColor]}>Panel Q&A</Text></TabHeading>
          }
        >
         <AskQuestion  navigation={this.props.navigation} sessionId = {this.state.sessionId}  />
         <View style={styles.footerOffline}>
            {
              this.state.isOffline ? <RkText rkType="small" style={styles.footerText}>The Internet connection appears to be offline. </RkText> : null
            }
          </View> 
          <View style={styles.footer}>
            <RkText rkType="small" style={styles.footerText}>Powered by</RkText>
            <RkText rkType="small" style={styles.companyName}> Eternus Solutions Pvt. Ltd. </RkText>
          </View>
        
        </Tab>
        <Tab
          heading={
            <TabHeading style={{backgroundColor : '#ed1b24' }}><Icon style={[styles.textColor]} name="ios-stats"/><Text style={[styles.textColor]}>Poll Session </Text></TabHeading>
          }
        >
          <PollSession navigation={this.props.navigation} sessionId = {this.state.sessionId}  UserName = {this.state.UserName}/>
          {/* <View style={styles.footerOffline}>
            {
              this.state.isOffline ? <RkText rkType="small" style={styles.footerText}>The Internet connection appears to be offline. </RkText> : null
            }
          </View> 
          <View style={styles.footer}>
            <RkText rkType="small" style={styles.footerText}>Powered by</RkText>
            <RkText rkType="small" style={styles.companyName}> Eternus Solutions Pvt. Ltd. </RkText>
          </View> */}
        </Tab>
      </Tabs>
    );
  }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  textColor : {
    color: Platform.OS === 'ios' ? 'white' :  'white'
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