import React from 'react';
import { RkText, RkStyleSheet } from 'react-native-ui-kitten';
import { Image, ScrollView, View, StyleSheet, Alert, AsyncStorage,Platform,NetInfo, ActivityIndicator, Text, Linking, TouchableOpacity } from 'react-native';
import { Container } from 'native-base';
function renderIf(condition, content) {
  if (condition) {
    return content;
  } else {
    return null;
  }
}

export class AboutUs extends React.Component {
  static navigationOptions = {
    title: 'About Tie'.toUpperCase()
  };

  constructor(props) {
    super(props);
    this.state = {
      isOffline: false
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
      <Container>
      <ScrollView style={styles.root}>
        <View style={styles.header}>
          <Image style={{ width: 159, height: 78, marginLeft: 'auto', marginRight: 'auto' }} source={require('../../assets/images/tie-pune-logo.jpg')} />
        </View>
        <View style={styles.section} pointerEvents='auto'>
          <View style={[styles.row]}>
            <Text
              style={{
                fontSize: 15,
                textAlign: 'justify'
              }}>
              TiE Pune strives to foster entrepreneurs through mentoring, networking, education, inspiring, and funding programs and activities. With nearly 50 events held each year, TiE Pune brings together the entrepreneurial community to learn from local leaders as well as each other. Events include the popular ‘my story session’ series, in which an entrepreneur shares his/her journey; ‘interactive breakfast sessions’ and ‘workshops’ on topics such as taking your idea to market – sales – marketing – staffing – product development – selling to markets outside India as well as successful exits!
              Start-ups in Pune and nearby cities can enrol in TiE Pune’s programs to avail mentorship from our successful charter members, compete for angel funding, talk one-on-one with venture capitalists, attend inspiring and educating events, and more.
            </Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL('https://tie.org/')}>
            <Text style={{ color: 'blue', fontSize: 15, textAlign: 'center', marginTop: 10 }}>
              https://tie.org/
        </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://pune.tie.org/')}>
            <Text style={{ color: 'blue', fontSize: 15, textAlign: 'center', marginTop: 10 }}>
              https://pune.tie.org/
        </Text>
          </TouchableOpacity>
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
    );
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base
  },
  header: {
    backgroundColor: theme.colors.screen.base,
    paddingVertical: 25
  },
  section: {
    backgroundColor: theme.colors.screen.base,
    marginTop: 1
  },
  column: {
    flexDirection: 'column',
    borderColor: theme.colors.border.base,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 17.5,
    //borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base,
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
}));
