import React from 'react';
import { RkText, RkStyleSheet } from 'react-native-ui-kitten';
import { Container } from 'native-base';
import { Image, ScrollView, View, StyleSheet, Alert, AsyncStorage, ActivityIndicator, Text, Linking, TouchableOpacity,Platform,NetInfo } from 'react-native';
import { scale, scaleModerate, scaleVertical } from '../../utils/scale';

function renderIf(condition, content) {
  if (condition) {
    return content;
  } else {
    return null;
  }
}

export class AboutEternus extends React.Component {
  static navigationOptions = {
    title: 'About Eternus'.toUpperCase()
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
            <Image style={styles.eternusLogo} source={require('../../assets/images/eternusLogoMain.png')} />
          </View>
          <View style={styles.section} pointerEvents='auto'>
            <View style={[styles.row]}>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify'
                }}>
                Eternus Solutions is an IT Consulting Services and outsourcing company providing a range of IT Services to enterprises across various domains globally.
             Eternus Solutions has carved a niche for itself in the IT industry and cemented its place as India’s leading IT services provider by acquiring elite clientele.
             The organization has made a mark for itself in the industry in a relatively short span of time through its ability and adherence to commitments to its clients.
             </Text>
            </View >
            <TouchableOpacity onPress={() => Linking.openURL('https://www.eternussolutions.com/')}>
              <Text style={{ color: 'blue', fontSize: 15, textAlign: 'center', marginTop: 10 }}>
                https://www.eternussolutions.com/
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
  eternusLogo: {
    height: 80,
    width: 180,
    /*height: scaleVertical(55),*/
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 'auto',
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
