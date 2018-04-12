import React from 'react';
import {RkText, RkStyleSheet} from 'react-native-ui-kitten';
import { Image, ScrollView, View, StyleSheet, Alert, AsyncStorage, ActivityIndicator ,Text} from 'react-native';
import {scale, scaleModerate, scaleVertical} from '../../utils/scale';
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
    this.state = {}
  }

  componentWillMount() {}

  render() {
    return (
      <ScrollView style={styles.root}>
        <View style={styles.header}>
          <Image style={styles.eternusLogo} source={require('../../assets/images/eternusLogoMain.png')}/>
        </View>
        <View style={styles.section} pointerEvents='none'>
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
  eternusLogo:{
    height:80,
    width: 180,
    /*height: scaleVertical(55),*/
    resizeMode: 'contain',
    marginLeft:'auto',
    marginRight:'auto',
  }
}));
