import React from 'react';
import { Image, ScrollView, View, StyleSheet, Alert, AsyncStorage, ActivityIndicator ,Text} from 'react-native';
import { RkText,RkComponent, RkTextInput, RkAvoidKeyboard, RkTheme, RkStyleSheet } from 'react-native-ui-kitten';
import {data} from '../../../data';
import {Avatar} from '../../../components';
import {FontAwesome} from '../../../assets/icons';
import {GradientButton} from '../../../components';
import LinkedInModal from 'react-native-linkedin';
import firebase from '../../../config/firebase'
var firestoreDB = firebase.firestore();

export class AttendeeProfile extends RkComponent {
    constructor(props) {
        super(props);
        let {params} = this.props.navigation.state;
        this.speaker = params.speakerDetails;
        
        this.state = {
            speaker : this.speaker,
            pictureUrl: this.speaker.profileImageURL
        }
         
    }
      render() {
        let avatar;
        if (this.state.pictureUrl) {
            avatar = <Avatar  rkType='big'  imagePath={this.state.pictureUrl} />
        } else {
            //let firstLetter = this.state.speaker.firstName ?  this.state.speaker.firstName[0]: '?';
            //avatar = <RkText rkType='big'  style={styles.avatar}>{firstLetter}</RkText>

            avatar = <Image style={{width: 100,height: 100, marginLeft:'auto', marginRight:'auto'}} source={require('../../../assets/images/defaultUserImg.png')}/>
        }
        return (
            <ScrollView>
               <View style={styles.header}>
                {avatar}
              </View>
              <View style={styles.section} pointerEvents='none'>
                <View style={[styles.column, styles.heading]}>
                  <RkText rkType='header6 primary'>{this.state.speaker.fullName}</RkText>
                  <RkText style={{fontSize : 15, textAlign: 'center'}} rkType="small">{this.state.speaker.briefInfo}</RkText>
                </View>
                <View style={[styles.row]}>
                  <Text style={{fontSize : 15, textAlign: 'justify'}}>
                    {this.state.speaker.info}
                  </Text>
                </View>
              </View>   
          </ScrollView>
        )
      }
}

let styles = RkStyleSheet.create(theme => ({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    root: {
      backgroundColor: theme.colors.screen.base
    },
    header: {
      backgroundColor: theme.colors.screen.neutral,
      paddingVertical: 25
    },
    section: {
     marginTop : 1
    },
    loading: {
      position: 'absolute',
      left: 0,
      backgroundColor: 'black',
      opacity: 0.8,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    heading: {
      paddingBottom: 12.5
    },
    column:{
      flexDirection : 'column',
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
    button: {
      marginHorizontal: 16,
      marginBottom: 32
    },
    avatar: {
      backgroundColor: '#C0C0C0',
      width: 100,
      height: 100,
      borderRadius: 60,
      textAlign: 'center',
      fontSize: 40,
      textAlignVertical: 'center',
      marginRight: 5,
      alignSelf: 'center'
  }
  }));
