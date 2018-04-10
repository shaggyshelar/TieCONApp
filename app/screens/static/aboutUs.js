import React from 'react';
import {RkText, RkStyleSheet} from 'react-native-ui-kitten';
import { Image, ScrollView, View, StyleSheet, Alert, AsyncStorage, ActivityIndicator ,Text} from 'react-native';

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
    this.state = {}
  }

  componentWillMount() {}

  render() {
    return (
      <ScrollView style={styles.root}>
        <View style={styles.header}>
          <Image style={{width: 159,height: 78, marginLeft:'auto', marginRight:'auto'}} source={require('../../assets/images/tie-pune-logo.jpg')}/>
        </View>
        <View style={styles.section} pointerEvents='none'>
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
        </View>
      </ScrollView>
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
}));
