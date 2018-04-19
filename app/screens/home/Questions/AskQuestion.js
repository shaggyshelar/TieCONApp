import React from 'react';
import {  View,Icon,Tab,TabHeading,Tabs,Container } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity, Keyboard, Platform ,Alert, AsyncStorage,ScrollView,Text,Image ,ActivityIndicator} from 'react-native';
import { RkComponent, RkTheme, RkText, RkAvoidKeyboard,RkStyleSheet, RkButton, RkCard, RkTextInput } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';
import { Service } from '../../../services';
import ReactMoment from 'react-moment';
import Moment from 'moment';
import { Avatar } from '../../../components';
import firebase from '../../../config/firebase';
import {GradientButton} from '../../../components/gradientButton';
import styleConstructor,{getStatusStyle}  from '../schedule/styles.js'
const questionTable = 'AskedQuestions';
var firestoreDB = firebase.firestore();
export default class AskQuestion extends RkComponent {
    constructor(props) {
        super(props);
        this.styles = styleConstructor();
        this.sessionDetails = this.props.navigation.state.params.sessionDetails;
        this.state = {
            Question: "",
            sessionDetails: this.sessionDetails,
            currentUser: {},
            sessionId: this.sessionDetails.key,
            topQueView: false,
            recentQueView: true,
            questionData: [],
            orderBy: 'timestamp',
            currentUid: "",
            queAccess: "",
            questionStatus: false,
            AskQFlag: true,
            isLoaded : false,
            componentLoaded : true
        }
    }
    componentWillMount() {
        let thisRef = this;
        Service.getCurrentUser((userDetails) => {
            thisRef.setState({
                currentUser: userDetails,
                currentUid: userDetails.uid
            });
        },function(error){
            console.warn(error);
        });
        this.checkSessionTime();
        this.getQuestions();
    }

    checkSessionTime = () => {
        let session = this.state.sessionDetails;
        let today = Moment(new Date()).format();
        let sessionStart = Moment(session.startTime).format();
        let sessionEnd = Moment(session.endTime).format();
        let buffered = Moment(sessionEnd).add(2, 'hours');
        let bufferedEnd = Moment(buffered).format();
        if (sessionStart <= today && today <= bufferedEnd) {
            this.setState({
                queAccess: 'auto',
                AskQFlag: true
            })
        }
        else {
            this.setState({
                queAccess: 'none',
                AskQFlag: false
            })
        }
    }
    getQuestions = (order) => {
        if (order == undefined) {
            order = 'timestamp';
        }
        let sessionId = this.state.sessionId;
        let orderByObj = order;
        let thisRef = this;
        let Data = [];
        Service.getDocRef(questionTable)
            .where("SessionId", "==", sessionId)
            .orderBy(orderByObj, 'desc')
            .get()
            .then(function (docRef) {
                if (docRef.size > 0) {
                    docRef.forEach(doc => {
                        Data.push({ questionSet: doc.data(), questionId: doc.id });
                    })
                    thisRef.setState({ questionData: Data, questionStatus: false  ,isLoaded : true})
                }
                else {
                    thisRef.setState({ questionStatus: true ,isLoaded : true})
                }
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
    }
    onSubmit = () => {
        this.setState({
            componentLoaded : false
        });
        let thisRef = this;
        let que = this.state.Question;
        let user = this.state.currentUser;
        let sessionId = this.state.sessionId;
        if (que.length !== 0) {
            firestoreDB.collection(questionTable)
                .add({
                    Question: que,
                    askedBy: user,
                    SessionId: sessionId,
                    timestamp: new Date(),
                    voters: [],
                    voteCount: 0
                })
                .then(function (docRef) {
                    thisRef.setState({
                        Question: "",
                        componentLoaded : true
                    })
                    Alert.alert("Question submitted successfully");
                    thisRef.getQuestions();
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                });
        }
        else {
            Alert.alert("Please fill the question field...");
            thisRef.setState({
                componentLoaded : true
            })
        }
    }
    onChangeInputText = (text) => {
        let Question = text;
        this.setState({
            Question: Question
        })
    }
    displayQuestions = () => {
        let questionList = this.state.questionData.map(question => {
            let pictureUrl
            let avatar;

            if (question.questionSet.askedBy.pictureUrl != undefined) {
                avatar = <Image style={this.styles.avatarImage} source={{ uri: question.questionSet.askedBy.pictureUrl }} />
            } else {
                let firstLetter = question.questionSet.askedBy.firstName ? question.questionSet.askedBy.firstName[0] : '?';
                avatar = <RkText rkType='big' style={styles.avatar}>{firstLetter}</RkText>
            }
            let askedBy = question.questionSet.askedBy;
            let fullName = askedBy.firstName + " " + askedBy.lastName;
            var votesCount = question.questionSet.voteCount.toString();

            return (
                <View >
                    <RkCard style={{ marginLeft: 5, marginRight: 5 }}>
                        <View style={{ flexDirection: 'row', marginLeft: 3, marginTop: 5 }}>

                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                {avatar}
                            </View>
                            <View style={{ flex: 8, flexDirection: 'column', marginLeft: 8 }}>
                                <Text style={{ fontStyle: 'italic', fontSize: 12 }}>{fullName}</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    <View style={{ flex: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 15 }} >{question.questionSet.Question}</Text>
                                    </View>
                                    <View style={{ flex: 2, justifyContent: 'center' }} >{this.checkLikeStatus(question)}
                                        {/* <Text style={{ fontSize: 10 }}>{votesCount}</Text> */}
                                    </View>
                                </View>

                                <View style={{ flex: 8, flexDirection: 'row' }}>
                                    <View>{this.getDateTime(question.questionSet.timestamp)}</View>
                                </View>
                            </View>
                        </View>
                    </RkCard>
                </View>
            )
        })
        return questionList;
    }
    getDateTime = (queDateTime) => {
        let queDate = Moment(queDateTime).format("DD MMM,YYYY");
        let queTime = Moment(queDateTime).format("hh:mm A");
        return (
            <View>
                <Text style={{ fontSize: 10 }}>{queDate} {queTime}</Text>
            </View>
        );
    }
    checkLikeStatus = (question) => {
        
        let thisRef = this;
        let votes = question.questionSet.voteCount;
        let votersList = question.questionSet.voters;
        let voterStatus = false;
        votersList.forEach(voterId => {
            if (voterId == thisRef.state.currentUid) {
                voterStatus = true;
            }
        })
        if (voterStatus == true) {
            return (
                //bl
                <Text style={{ fontSize: 25, width: 36, height: 36 }} ><Icon name="md-thumbs-up" style={{ color: '#3872d1' }} /></Text>
            );
        }
        else {
            return (
                //gr
                <Text style={{ fontSize: 25, width: 36, height: 36 }} onPress={() => this.onLikeQuestion(question)} ><Icon name="md-thumbs-up" style={{ color: '#8c8e91' }} /></Text>
            )
        }
    }

    onLikeQuestion = (question) => {
       let count = 0; 
       question.questionSet.voters.forEach(
            voter=>{
              if(this.state.currentUid===voter)
                count++;
            }        
        )
        let voteCount;
        if(count===0)
        {
            question.questionSet.voters.push(this.state.currentUid);
            voteCount = question.questionSet.voters.length;
        }
        else
         return;

        let thisRef = this;

        Service.getDocRef(questionTable)
            .doc(question.questionId)
            .update({
                "voters": question.questionSet.voters,
                "voteCount": voteCount
            })
            .then(function (dofRef) {
                thisRef.getQuestions();
            })
            .catch(function (err) {
                console.log("err" + err);
            })
    }

    onUnikeQuestion = (question) => {
        let thisRef = this;
        let questionId = question.questionId;
        let likedBy = question.questionSet.voters;
        likedBy.pop(this.state.currentUid);
        let voteCount = likedBy.length;
        Service.getDocRef(questionTable)
            .doc(questionId)
            .update({
                "voters": likedBy,
                "voteCount": voteCount
            })
            .then(function (dofRef) {
                thisRef.getQuestions();
            })
            .catch(function (err) {
                console.log("err" + err);
            })
    }


    onTopQueSelect = () => {
        let order = 'voteCount';
        if (this.state.topQueView == false) {
            this.setState({
                topQueView: true,
                recentQueView: false,
                orderBy: order
            })
            this.getQuestions(order);
        }
    }
    onRecentQueSelect = () => {
        if (this.state.recentQueView == false) {
            let order = 'timestamp';
            this.setState({
                topQueView: false,
                recentQueView: true,
                orderBy: order
            })
            this.getQuestions(order);
        }
    }
    checkIfLoaded = () => {
        if(this.state.isLoaded == true){
            return (
                <View>
                    <View style={{ alignItems: 'center', flexDirection: 'row', width: Platform.OS === 'ios' ? 320 : 380, marginBottom: 3, marginLeft: 2, marginRight: 2 }}>
                        <View style={{ width: Platform.OS === 'ios' ? 160 : 180 }} >
                            <GradientButton colors={['#f20505', '#f55050']} text='Recent'
                                contentStyle={{ fontSize: 12 }}
                                style={{ fontSize: 15, flexDirection: 'row', width: Platform.OS === 'ios' ? 150 : 170, marginLeft: 2, marginRight: 1 }}
                                onPress={this.onRecentQueSelect}
                            />
                        </View>
                        <View style={{ width: Platform.OS === 'ios' ? 160 : 180 }} >
                            <GradientButton colors={['#f20505', '#f55050']} text='Top'
                                contentStyle={{ fontSize: 12 }}
                                style={{ fontSize: 15, flexDirection: 'row', width: Platform.OS === 'ios' ? 150 : 170, marginLeft: 1, marginRight: 2 }}
                                onPress={this.onTopQueSelect}
                            />
                        </View>
                    </View>
                    <View>
                        <View style={styles.section}>
                            <View style={[styles.row, styles.heading]}>
                                {
                                    this.state.topQueView ? <RkText style={{ fontSize: 18 }} rkType='header6 primary'>Top</RkText> : null
                                }
                            </View>
                            <View style={[styles.row, styles.heading]}>
                                {
                                    this.state.recentQueView ? <RkText style={{ fontSize: 18 }} rkType='header6 primary'>Recent</RkText> : null
                                }
                            </View>
                        </View>
                        {this.displayQuestions()}
                        <View style={[styles.row, styles.heading]}>
                            {
                                this.state.questionStatus ? <Text style={{ fontSize: 18 }}>No Questions Found...</Text> : null
                            }
                        </View>
                    </View>
                </View>
            );
        }
        else {
            return (
                <View style={[styles.loading]} >
                    <ActivityIndicator size='large' />
                </View>
            );
        }
    }
    render() {
        if(this.state.componentLoaded){
            return (
                <ScrollView>
                    <RkAvoidKeyboard
                        onStartShouldSetResponder={(e) => true}
                        onResponderRelease={(e) => Keyboard.dismiss()}>
    
                        {this.state.AskQFlag &&
                            <View style={{ flexDirection: 'row' }} pointerEvents={this.state.queAccess}>
                                <RkTextInput type="text" style={{ width: 300,alignItems :'flex-start'  }} placeholder="Enter your question here..." value={this.state.Question} name="Question" onChangeText={(text) => this.onChangeInputText(text)} maxLength = {250}/>
                                <TouchableOpacity onPress={() => this.onSubmit()}>
                                <RkText style={{ fontSize: 35, width: 46, height: 46,alignItems :'flex-end'}} ><Icon name="md-send" /> </RkText>
                                </TouchableOpacity>
                            </View>
                        }
                        {!this.state.AskQFlag &&
                            <View style={{ flexDirection: 'row' }}>
                                <RkText style={{ fontSize: 15, height: 46, marginRight: 10, marginLeft: 4 }}> Questions can be asked only when session is active... </RkText>
                            </View>
                        }
                        <View>
                            {this.checkIfLoaded()}
                        </View>
                    </RkAvoidKeyboard>
                </ScrollView>
            );
        }
        else{
            return (
                <Container style={styles.root}>
                <View style={styles.loading} >
                    <ActivityIndicator size='large' />
                </View>
                </Container>
            );
        }   
    }
}

let styles = RkStyleSheet.create(theme => ({
    root: {
        backgroundColor: theme.colors.screen.base
    },
    section: {
        marginVertical: 5,
        marginBottom: 4
    },
    descSection: {
        marginVertical: 25,
        marginBottom: 10,
        marginTop: 5
    },
    subSection: {
        marginTop: 5,
        marginBottom: 10
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 17.5,
        borderColor: theme.colors.border.base,
        alignItems: 'center'
    },
    text: {
        marginBottom: 5,
        fontSize: 15,
        marginLeft: 20
    },
    surveButton: {
        alignItems: 'baseline',
        flexDirection: 'row',
        width: 380,
        marginTop: 8,
        marginBottom: 3,
        marginLeft: 5,
        marginRight: 5
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
    loading: {
        marginTop: 200,
        left: 0,
        opacity: 0.5,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
      }
}));
