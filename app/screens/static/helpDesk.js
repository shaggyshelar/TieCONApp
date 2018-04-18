import React from 'react';
import { RkCard, RkStyleSheet, RkText } from 'react-native-ui-kitten';
import { Text, View, Container } from 'native-base';
import { ScrollView,Platform,NetInfo, ActivityIndicator } from 'react-native';
import Autolink from 'react-native-autolink';


function renderIf(condition, content) {
  if (condition) {
      return content;
  } else {
      return null;
  }
}

export class HelpDesk extends React.Component {
  static navigationOptions = {
    title: 'Help Desk'.toUpperCase()
  };

  constructor(props) {
    super(props);
    this.state = {
      isOffline :false
    }
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
        <ScrollView>
          <View>
            {/* {speakerTile} */}
            
            <RkCard rkType='shadowed' style={[styles.card]}>
           
            <Text style={{ fontSize: 19, fontWeight: 'bold',marginBottom:6 }}>TiECon Support</Text> 
            <Text style={{ fontSize: 16, color:'grey' }}>Phone: <Autolink text="+91-9673806519"></Autolink></Text>      
            <Text style={{ fontSize: 16, color:'grey' }}>Email: <Autolink text="tieoffice.pune@gmail.com"></Autolink></Text> 
           
            </RkCard>

            <RkCard rkType='shadowed' style={[styles.card]}>
           
            <Text style={{ fontSize: 19, fontWeight: 'bold',justifyContent: 'center', marginBottom:6}}>Technical Support</Text>
            {/* <Text style={{ fontSize: 20 }}>Eternus Solutions Pvt. Ltd.</Text> */}
            <Text style={{ fontSize: 16, color:'grey' }}>Phone: <Autolink text="+91-9168883355"></Autolink></Text> 
            <Text style={{ fontSize: 16, color:'grey' }}>Email: <Autolink text="tieappsupport@eternussolutions.com"></Autolink></Text>          
           
            </RkCard>


            <Text/>
            <Text/>
            
                                                              
          </View>
        </ScrollView>
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
}

let styles = RkStyleSheet.create(theme => ({
  root: {
      backgroundColor: theme.colors.screen.base
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