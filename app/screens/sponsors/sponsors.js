import React from 'react';
import { ScrollView, Platform, Image } from 'react-native';
import { Text, View, Icon, Container, Label } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity, Keyboard, Alert, AsyncStorage, ActivityIndicator, Linking } from 'react-native';
import { RkComponent, RkTheme, RkStyleSheet, RkText, RkAvoidKeyboard, RkButton, RkCard, RkChoice, RkTextInput, RkChoiceGroup } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';
import ReactMoment from 'react-moment';
import { GradientButton } from '../../components/gradientButton';
import { Service } from '../../services';
import Moment from 'moment';
import firebase from './../../config/firebase';
import { Avatar } from '../../components';
var firestoreDB = firebase.firestore();

export class Sponsors extends RkComponent {
    static navigationOptions = {
        title: 'Sponsors'.toUpperCase()
    };
    constructor(props) {
        super(props);

        this.state = {
            Sponsers: [],
            isLoaded: false
        }
    }
    componentWillMount() {
        let thisRef = this;
        let sponserCollection = [];
        firestoreDB.collection("Sponsor").orderBy("orderNumber", "asc")
            .get()
            .then(function (doc) {
                doc.forEach(fItem => {
                    let itemData = fItem.data();
                    let itemId = fItem.id;
                    sponserCollection.push({ sponserData: itemData, sponserId: itemId });
                })
                thisRef.setState({
                    Sponsers: sponserCollection,
                    isLoaded: true
                })
                thisRef.displaySponsers();
            })
            .catch(function (error) {
                // console.log("error",error);
            });
    }

    viewWebsite = (url) => {
        return (
            <View style={[styles.attendBtn]}>
                <TouchableOpacity>
                    <RkButton rkType='outline' onPress={() => Linking.openURL(url)}
                        style={{ borderColor: '#f20505', borderRadius: 30, width: 100, height: 25 }}
                        contentStyle={{ fontSize: 10, color: '#f20505' }}
                    >
                        View Website
            </RkButton>
                </TouchableOpacity>
            </View>
        )
    }

    getBorderColor(orderNumber) {
        let displayColor = '#ffffff';
        switch (orderNumber) {
            case 1:
                displayColor = '#1E90FF';
                break;
            case 2:
                displayColor = '#DAA520';
                break;
            case 3:
                displayColor = '#808080';
                break;
            case 4:
                displayColor = '#8B0000';
                break;
            case 5:
                displayColor = '#008B8B';
                break;
            case 6:
                displayColor = '#000000';
                break;
            case 7:
                displayColor = '#2F4F4F';
                break;
            case 8:
                displayColor = '#808080';
                break;
        }
        return displayColor;
    }

    displaySponsers = () => {
        return this.state.Sponsers.map((sponser, index) => {
            let avatar;
            let displayColor;
            displayColor = this.getBorderColor(sponser.sponserData.orderNumber)
            if (sponser.sponserData.imageURL) {
                avatar = <Image style={{ width: 50, height: 50 }} source={{ uri: sponser.sponserData.imageURL }} />
            } else {
                avatar = <Image style={{ width: 50, height: 40 }} source={require('../../assets/images/defaultSponsorImg.png')} />
            }
            return (
                <RkCard rkType='shadowed' style={[styles.card, { borderLeftColor: displayColor, borderLeftWidth: 3 }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginVertical: 10, marginLeft: 5, flex: 4 }}>
                            {avatar}
                        </View>
                        <View style={{ flexDirection: 'column', marginVertical: 10, flex: 4 }}>
                            <Text style={styles.headerText}>{sponser.sponserData.category}</Text>
                            <Text style={styles.infoText}>{sponser.sponserData.name}</Text>
                        </View >

                        <View style={{ alignItems: 'center' }}>
                            {this.viewWebsite(sponser.sponserData.websiteURL)}
                        </View>
                    </View >
                </RkCard>
            )
        });
    }
    render() {
        let sponserList = this.displaySponsers();
        if (this.state.isLoaded) {
            return (
                <Container style={[styles.root]}>
                    <ScrollView>
                        <View>
                            {sponserList}
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
    attendBtn: {
        flexDirection: 'column',
        alignItems: 'center',
        marginVertical: 10
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
        alignItems: 'center'
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
    }
}));