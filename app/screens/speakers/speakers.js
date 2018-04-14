import React from 'react';
import { ScrollView, Platform, Image, NetInfo } from 'react-native';
import { Text, View, Icon, Container, Label } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity, Keyboard, Alert, AsyncStorage, ActivityIndicator } from 'react-native';
import { RkComponent, RkTheme, RkStyleSheet, RkText, RkAvoidKeyboard, RkButton, RkCard, RkChoice, RkTextInput, RkChoiceGroup } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';
import ReactMoment from 'react-moment';
import { GradientButton } from '../../components/gradientButton';
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
            Speakers: [],
            isLoaded: false,
            isOffline: false
        }
    }
    componentWillMount() {
        if (Platform.OS !== 'ios') {
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    this.getSpeakersList();
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
        this.getSpeakersList();
        NetInfo.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange
        );
    }

    handleFirstConnectivityChange = (connectionInfo) => {
        if (connectionInfo.type != 'none') {
            this.getSpeakersList();
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
    getSpeakersList() {
        let thisRef = this;
        let speakerCollection = [];
        firestoreDB.collection("Attendee").orderBy("firstName", "asc")
            .get()
            .then(function (doc) {
                doc.forEach(fItem => {
                    let itemData = fItem.data();
                    let itemId = fItem.id;
                    if (itemData.profileServices != undefined) {
                        itemData.profileServices.forEach(tItem => {
                            if (tItem == 'Speaker') {
                                speakerCollection.push({ speakerData: itemData, speakerId: itemId });
                            }
                        })
                    }
                })
                thisRef.setState({
                    Speakers: speakerCollection,
                    isLoaded: true
                })
                thisRef.displaySpeakers();
            })
            .catch(function (error) {
                console.log("error", error);
            });
    }
    displaySpeakers = () => {
        return this.state.Speakers.map((speaker, index) => {
            let avatar;
            if (speaker.speakerData.profileImageURL) {
                avatar = <Avatar rkType='small' style={{ width: 44, height: 44, borderRadius: 60 }} imagePath={speaker.speakerData.profileImageURL} />
            } else {
                avatar = <Image style={{ width: 34, height: 34 }} source={require('../../assets/images/defaultUserImg.png')} />
            }
            return (
                <TouchableOpacity
                    key={index} onPress={() => this.props.navigation.navigate('SpeakerDetailsTabs', { speakerDetails: speaker.speakerData, speakersId: [speaker.speakerId] })}
                >
                    <RkCard rkType='shadowed' style={styles.card}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginVertical: 10, marginLeft: 5, width: 50, flex: 2 }}>
                                {avatar}
                            </View>
                            <View style={{ flexDirection: 'column', marginVertical: 10, flex: 7, marginLeft: 5 }}>
                                <Text style={styles.headerText}>{speaker.speakerData.fullName}</Text>
                                <Text style={styles.infoText}>{speaker.speakerData.briefInfo}</Text>
                            </View >
                            <View style={{ flexDirection: 'column', alignContent: 'flex-end', marginRight: 5, marginVertical: 15, flex: 3 }}>
                                <RkText style={{ alignSelf: 'flex-end' }} ><Icon name="ios-arrow-forward" /></RkText>
                            </View>
                        </View >
                    </RkCard>
                </TouchableOpacity>
            )
        });
    }
    render() {
        let speakerList = this.displaySpeakers();
        if (this.state.isLoaded) {
            return (
                <Container style={[styles.root]}>
                    <ScrollView>
                        <View>
                            {speakerList}
                        </View>
                    </ScrollView>
                    <View style={[styles.footerOffline]}>
                        {
                            this.state.isOffline ? <RkText rkType="small" style={[styles.footerText]}>The Internet connection appears to be offline. </RkText> : null
                        }
                    </View>
                    <View style={[styles.footer]}>
                        <RkText rkType="small" style={[styles.footerText]}>Powered by</RkText>
                        <RkText rkType="small" style={[styles.companyName]}> Eternus Solutions Pvt. Ltd. </RkText>
                    </View>
                </Container>
            )
        }
        else {
            return (
                <Container style={[styles.root]}>
                    <ScrollView>
                    <View style={[styles.loading]}>
                        <ActivityIndicator size='small' />
                    </View>
                    </ScrollView>
                    <View style={[styles.footerOffline]}>
                        {
                            this.state.isOffline ? <RkText rkType="small" style={[styles.footerText]}>The Internet connection appears to be offline. </RkText> : null
                        }
                    </View>
                    <View style={[styles.footer]}>
                        <RkText rkType="small" style={[styles.footerText]}>Powered by</RkText>
                        <RkText rkType="small" style={[styles.companyName]}> Eternus Solutions Pvt. Ltd. </RkText>
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
    infoText: {
        fontSize: 12
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