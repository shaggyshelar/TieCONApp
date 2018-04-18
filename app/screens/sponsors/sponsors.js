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

    displaySponsers = () => {
        return this.state.Sponsers.map((sponser, index) => {
            let avatar;
            if (sponser.sponserData.imageURL) {
                avatar = <Image style={{ width: 60, height: 60 }} source={{ uri: sponser.sponserData.imageURL }} />
            } else {
                avatar = <Image style={{ width: 60, height: 60 }} source={require('../../assets/images/defaultSponsorImg.png')} />
            }
            return (
                <TouchableOpacity onPress={() => Linking.openURL(sponser.sponserData.websiteURL)}>
                    <RkCard rkType='shadowed' style={[styles.card]}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginVertical: 10, flex: 3, alignSelf: 'center', marginLeft: 10 }}>
                                {avatar}
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginVertical: 10, flex: 6, marginLeft: -10 }}>
                                <Text style={styles.headerText}>{sponser.sponserData.category}</Text>
                                <Text style={styles.infoText}>{sponser.sponserData.name}</Text>
                            </View >
                        </View >
                    </RkCard>
                </TouchableOpacity>
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
        padding: 4
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