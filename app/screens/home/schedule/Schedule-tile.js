import React from 'react';
import { Text, View, Icon } from 'native-base';
import { AsyncStorage, FlatList, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { RkComponent, RkTheme, RkText, RkButton, RkCard, RkStyleSheet } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';

import styleConstructor, { getStatusStyle } from './styles';
import { Service } from '../../../services';
import ReactMoment from 'react-moment';
import Moment from 'moment';
import { Avatar } from '../../../components';

const REGISTRATION_RESPONSE_TABLE = "RegistrationResponse";

export default class ScheduleTile extends RkComponent {

    constructor(props) {
        super(props);
        this.styles = styleConstructor();
        let __props = this.props;
        __props.session.displayColor = '#ffffff';
        switch (__props.session.sessionType) {
            case 'break': {
                __props.session.displayColor = 'gray';
                break;
            }
            case 'keynote':
                __props.session.displayColor = 'green';
                break;
            case 'deepdive':
                __props.session.displayColor = 'orange';
                break;
            case 'panel':
                __props.session.displayColor = 'purple';
                break;
            case 'breakout':
                __props.session.displayColor = 'blue';
                break;
        }
        this.state = __props;

    }
    /**
     *  Get Speaker Details
     */
    componentDidMount() {
        Service.getCurrentUser((userObj) => {
            this.setState({
                user: userObj
            });
        });
        this.fetchSpeakers();
        this.fetchRegistrationStatus();
    }
    /**
     * Fetch Registration Status
     */

    fetchRegistrationStatus = () => {
        const baseObj = this;
        if (this.state.user) {
            const attendeeId = this.state.user.uid;
            Service.getDocRef(REGISTRATION_RESPONSE_TABLE)
                .where("sessionId", "==", this.state.session.key)
                .where("attendeeId", "==", attendeeId)
                .onSnapshot((snapshot) => {
                    if (snapshot.size > 0) {
                        snapshot.forEach((doc) => {
                            let regResponse = doc.data();
                            let newSession = Object.assign(this.state.session, { regStatus: regResponse.status, regId: doc.id });
                            baseObj.setState((prevState) => ({
                                ...prevState,
                                session: newSession
                            }));
                        });
                    }
                }, function (error) {
                    console.warn(error);
                });
        } else {
            //console.warn("User object is undefined");
        }
    }
    /**
     * Fetch Speaker Details
     */
    fetchSpeakers = () => {
        let speakerArray = [];
        if (this.props.session.speakers) {
            this.props.session.speakers.forEach((speaker, index) => {
                Service.getDocument("Attendee", speaker, (data, id) => {
                    data.id = id;
                    //const prevSpeakersDetails = this.state.session.speakersDetails ? this.state.session.speakersDetails : {};
                    speakerArray[index] = data;
                    //const prevSpeakersDetails = this.state.session.speakersDetails;
                    let newSession = Object.assign(this.state.session, {
                        speakersDetails: speakerArray
                    });
                    // let newSession = Object.assign(this.state.session, {
                    //     speakersDetails: [
                    //         ...prevSpeakersDetails,
                    //         data
                    //     ]
                    // });
                    this.setState((prevState) => ({
                        ...prevState,
                        session: newSession
                    }));
                }, function (error) {
                    console.warn(error);
                });
            });
        }
    }
    /**
    * On Cancel Request
    */
    onCancelRequest = (event) => {
        Service.getDocRef("RegistrationResponse").doc(this.state.session.regId).delete().then((req) => {
            let newSession = Object.assign({}, this.state.session);
            delete newSession['regStatus'];
            delete newSession['regId'];
            this.setState((prevState) => ({
                ...prevState,
                session: newSession
            }));
        }).catch((error) => {
            console.warn(error);
        });
    }
    /**
    * Session Attend Request raised by Attendee
    *
    */
    onAttendRequest = (event) => {
        const attendeeId = this.state.user.uid;
        let attendRequest = {
            sessionId: this.state.session.key,
            session: this.state.session,
            registeredAt: new Date(),
            status: this.state.session.isRegrequired ? "Pending" : "Going",
            attendee: {},
            attendeeId: attendeeId
        }
        Service.getDocRef("RegistrationResponse").add(attendRequest).then((req) => {
            let newSession = Object.assign(this.state.session, { regStatus: attendRequest.status, regId: req.id });
            this.setState((prevState) => ({
                ...prevState,
                session: newSession
            }));
        }).catch((error) => {
            console.warn(error);
        });
    }
    /**
     * Fetch Speaker Details
     */
    getSpeakers = () => {
        return this.props.session.speakersDetails
            .map((speaker, index) => {
                let avatar;
                if (speaker.profileImageURL) {
                    avatar = <Image style={this.styles.avatarImage} source={{ uri: speaker.profileImageURL }} />
                } else {
                    let firstLetter = speaker.firstName ? speaker.firstName[0] : '?';
                    avatar = <Text style={this.styles.avatar}>{firstLetter}</Text>
                }
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => this.props.navigation.navigate('AttendeeProfile', { speaker: speaker })}
                        style={this.styles.speaker}>
                        {avatar}
                        <Text style={this.styles.speakerName}>{speaker.firstName + ' ' + speaker.lastName}</Text>
                    </TouchableOpacity>
                )
            });

    }
    /**
    * Duration Details
    */
    getDuration = () => {
        return (
            <View style={{ flexDirection: 'row', alignSelf: 'flex-start' }}>
                <Icon name="md-time" style={this.styles.tileIcons} style={{ color: '#5d5e5f', fontSize: 16, marginTop: 2, marginRight: 5 }} />
                <Text style={this.styles.duration} style={{ color: '#5d5e5f', fontSize: 14 }}>{Moment(this.props.session.startTime).format("HH:mm")} - {Moment(this.props.session.endTime).format("HH:mm")}</Text>
            </View>
        );
    }
    /**
    * Location Details
    */
    getLocation = () => {
        return (
            <View style={{ marginLeft: 20, flexDirection: 'row', alignSelf: 'flex-end' }}>
                <Icon name="md-pin" style={this.styles.tileIcons} style={{ color: '#5d5e5f', fontSize: 16, marginTop: 2, marginRight: 5 }} />
                <Text style={this.styles.roomName} style={{ color: '#5d5e5f', fontSize: 14 }}>{this.props.session.room}</Text>
            </View>
        );
    }
    /**
    * Attend request Status
    */
    attendRequestStatus = () => {
        if (this.state.session.regStatus) {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <Text style={getStatusStyle(this.state.session.regStatus)}>{this.state.session.regStatus}</Text>
                    <TouchableOpacity onPress={this.onCancelRequest}>
                        <Icon name="md-close" style={this.styles.tileIcons} />
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (
                <RkButton
                    rkType='success small'
                    style={this.styles.actionBtn}
                    onPress={this.onAttendRequest}>
                    Attend
                </RkButton>
            );
        }
    }

    applyTouchOpacity = (shouldApplyOpacity) => {
        if (!shouldApplyOpacity) {
            return <TouchableOpacity
                onPress={() => this.props.navigation.navigate('SessionDetails', { session: this.props.session })}
                style={{
                    flexDirection: 'row',
                    flex: 3,
                }}>
                <Text style={{ fontSize: 16, fontWeight: '600', width: 300 }} numberOfLines={1}>{this.props.session.eventName}</Text>
            </TouchableOpacity>;
        } else {
            return <Text style={{ fontSize: 16, fontWeight: '600', width: 300 }} numberOfLines={1}>{this.props.session.eventName}</Text>;
        }

    }
    applyTouchOpacityArrow = (shouldApplyOpacity) => {
        if (!shouldApplyOpacity) {
            return (
                <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 3 }}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('SessionDetails', { session: this.props.session })}
                    >
                        <RkText style={{ marginTop: 5 }}><Icon name="ios-arrow-forward" /></RkText>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return <Text style={{ fontSize: 16, fontWeight: '600', width: 300 }} numberOfLines={1}>   </Text>;
        }

    }
    checkDeepDiveSession = (session) => {
        if (session.sessionType == 'deepdive') {
            return <Text style={this.styles.speaker} style={{ fontSize: 10, color: 'red' }}>**Pre-registration required**</Text>;
        }
        else if(session.sessionType == 'invite'){
            return <Text style={this.styles.speaker} style={{ fontSize: 10, color: 'red' }}>**By invitation only**</Text>;            
        }
        else {
            return <View></View>;
        }
    }
    /**
    * Render Schedule Tile
    */
    render() {
        if (this.props.session) {
            return (
                <TouchableOpacity disabled={this.props.session.isBreak}
                    onPress={() => this.props.navigation.navigate('SessionDetails', { session: this.props.session })}
                >
                    <RkCard rkType='shadowed' style={[this.styles.card, { borderLeftColor: this.props.session.displayColor }]}>
                        <View style={this.styles.header} style={{ height: 30 }}>
                            <View style={this.styles.mainHeader} style={{ flexDirection: 'column', alignItems: 'flex-start', flex: 7 }}>
                                {this.applyTouchOpacity(this.props.session.isBreak)}
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 3 }}>
                                {this.applyTouchOpacityArrow(this.props.session.isBreak)}
                            </View>
                        </View >
                        <View style={this.styles.content} >
                            {/* {this.checkDeepDiveSession(this.props.session)} */}
                            <View style={this.styles.tileFooter}>
                                {this.getDuration()}
                                {this.getLocation()}
                            </View>
                        </View>
                        {this.checkDeepDiveSession(this.props.session)}
                    </RkCard>
                </TouchableOpacity>
            );
        } else {
            return (
                <Text>
                    Unable to fetch detailis
                </Text>
            );
        }
    }
}


let styles = RkStyleSheet.create(theme => ({
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
        flex: 1,
        flexDirection: 'column'
    },
    mainHeader: {
        flexDirection: 'column',
        flex: 3,
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
