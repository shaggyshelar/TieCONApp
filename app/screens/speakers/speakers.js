import React from 'react';
import {ScrollView, Platform} from 'react-native';
import { Text, View, Icon, Container, Label } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity, Keyboard, Alert, AsyncStorage ,ActivityIndicator} from 'react-native';
import { RkComponent, RkTheme,RkStyleSheet, RkText, RkAvoidKeyboard, RkButton, RkCard, RkChoice, RkTextInput, RkChoiceGroup } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';
import ReactMoment from 'react-moment';
import {GradientButton} from '../../components/gradientButton';
import { Service } from '../../services';
import Moment from 'moment';
import firebase from './../../config/firebase';
import { Avatar } from '../../components';

var firestoreDB = firebase.firestore();
export class Speakers extends RkComponent {
    static navigationOptions = {
        title: 'Speakers'.toUpperCase()
      };
      constructor(props) {
        super(props);
        
        this.state = {
           Speakers : [],
           isLoaded : false
        }
    }

      componentWillMount() {
          let thisRef = this;
          let speakerCollection = [];
        firestoreDB.collection("Attendee")
        .get()
        .then(function (doc) {
           doc.forEach(fItem => {
               fItem.data().profileServices.forEach(tItem =>{
                   if(tItem == 'Speaker'){
                       speakerCollection.push(fItem.data());
                   }
               })
           })
          thisRef.setState({
              Speakers : speakerCollection,
              isLoaded : true
          })
        //   thisRef.displaySpeakers();
        })
        .catch(function (error){
            console.log("error",error);
        });
    }
    displaySpeakers = () => {
     return this.state.Speakers.map(speaker => {
        let avatar;
        if (speaker.profileImageURL) {
          avatar = <Avatar rkType='small' style={{width: 44,height: 44,borderRadius: 20}} imagePath={speaker.profileImageURL} />
        } else {
          let firstLetter = speaker.firstName ? speaker.firstName[0] : '?';
          avatar = <RkText rkType='small' style={styles.avatar}>{firstLetter}</RkText>
        }
         return(
            <TouchableOpacity
            //onPress={() => this.props.navigation.navigate('SessionDetails', { session: session })}
        >
            <RkCard rkType='shadowed' style={styles.card}>
                <View style={styles.header}>
                    {avatar}
                    <Text style={styles.headerText}>{speaker.fullName}</Text>
                </View >
            </RkCard>
        </TouchableOpacity>
         )
        });        
    }
    render(){
        let speakerList = this.displaySpeakers();
        if(this.state.isLoaded){
            return (
                <Container style={[styles.root]}>
                    <ScrollView>
                    <View>
                        {speakerList}
                    </View>
                    </ScrollView>
                </Container>
            )
        }
        else {
            return (
                <Container style={[styles.root]}>
                    <View style={[styles.loading]}>
                        <ActivityIndicator size='small' />
                    </View>
                </Container>
            )
        }
        
    }
}
let styles = RkStyleSheet.create(theme => ({
    root: {
        backgroundColor: theme.colors.screen.base
    },
    listContainer: {
        flex: 1,
        flexDirection: 'column'
    },
    avatar: {
        backgroundColor: '#C0C0C0',
        width: 40,
        height: 40,
        borderRadius: 20,
        textAlign: 'center',
        fontSize: 20,
        textAlignVertical: 'center',
        marginRight: 5
      },
      avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 5
      },
    loading: {
        marginTop: 200,
        left: 0,
        opacity: 0.5,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        margin: 1,
        padding: 4,
        height: 75
    },
    header: {
        flexDirection: 'row'
    },
    mainHeader: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginLeft: 5
    },
    roomName: {
        fontSize: 15,
        marginLeft: 5,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    content: {
        margin: 2,
        padding: 2
    },
    duration: {
        fontSize: 15,
        marginLeft: 5,
        marginRight: 10
    },
    tileIcons: {
        paddingLeft: 4,
        paddingTop: 4,
        fontSize: 16
    },
    tileFooter: {
        flexDirection: 'row',
        alignContent: 'space-between'
    }
}));