import React from 'react';
import { RkAvoidKeyboard, RkStyleSheet } from 'react-native-ui-kitten';
import { Tabs, Tab, Icon, Text, TabHeading } from "native-base";
import { Platform, View } from 'react-native';
import { AttendeeProfile } from './AttendeeProfile';
import { SpeakerSessionList } from './SpeakerSessionList';

export class SpeakerDetailsTabs extends React.Component {
  static navigationOptions = {
    title: "speaker details".toUpperCase()
  };

  render() {
    return (
      <Tabs style={{ elevation: 3 }} style={styles.tabContent}>
        <Tab
          heading={
            <TabHeading style={{ backgroundColor: '#fff' }} ><Icon style={[styles.textColor]} name="ios-people" /><Text style={[styles.textColor]} >Profile</Text></TabHeading>
          }
        >
          <AttendeeProfile navigation={this.props.navigation} />
        </Tab>
        <Tab
          heading={
            <TabHeading style={{ backgroundColor: '#fff' }}><Icon style={[styles.textColor]} name="calendar" /><Text style={[styles.textColor]} >Sessions</Text></TabHeading>
          }
        >
          <SpeakerSessionList navigation={this.props.navigation} />
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
  tabContent: {
    backgroundColor: 'red',
  },
  textColor: {    
    color: '#ed1b24'
  }
}));