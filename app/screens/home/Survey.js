import React from 'react';
import {ScrollView, Platform} from 'react-native';
import { Text, View, Icon, Container, Label } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity, Keyboard, Alert, AsyncStorage ,ActivityIndicator} from 'react-native';
import { RkComponent, RkTheme,RkStyleSheet, RkText, RkAvoidKeyboard, RkButton, RkCard, RkChoice, RkTextInput, RkChoiceGroup } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';
import ReactMoment from 'react-moment';
import firebase from './../../config/firebase'
import {GradientButton} from '../../components/gradientButton';

var firestoreDB = firebase.firestore();

export class Survey extends RkComponent {
    static navigationOptions = {
        title: 'Feedback'.toUpperCase()
      };
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.state = {
            questionsForm: [],
            user: {},
            responses : [],
            queArray : [],
           sessionId : this.props.navigation.state.params.sessionDetails.key,
           session :this.props.navigation.state.params.sessionDetails
        }
        this.onFormSelectValue = this.onFormSelectValue.bind(this);
        this.onMultiChoiceChange = this.onMultiChoiceChange.bind(this);
    }
    componentWillMount() {
        this.getForm();
        let thisRef = this;
        AsyncStorage.getItem("USER_DETAILS").then((userDetails) => {
            let user = JSON.parse(userDetails)
            thisRef.setState({
                user: user,
            })
        })
        .catch(err => {
            console.warn('Errors');
        });
    }
    getForm = () => {
        let thisRef = this;
        firestoreDB.collection("QuestionsForm").doc("feedbackForm").get().then(function (doc) {
            if( doc.data()  == undefined){
                thisRef.props.navigation.goBack();
            }
            else{
                let form = doc.data();
                thisRef.setState({
                    questionsForm: form.Questions
                })
           }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }
    onSubmitResponse = () => {
        let blankResponse = false;
        this.state.queArray.forEach(fItem => {
            if (fItem.Answer.size >= 1){
                fItem.Answer = Array.from(fItem.Answer);
            }
            if(fItem.Answer == "" || fItem.Answer.size == 0){
                blankResponse = true
            }       
        })
        if (blankResponse == true) {
            Alert.alert("Please fill all the fields");
        }
        else {
             let thisRef = this;
            firestoreDB.collection('SessionSurvey').add({
                Responses: thisRef.state.queArray,
                ResponseBy: thisRef.state.user.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                SessionId: thisRef.state.sessionId
            })
                .then(function (docRef) {
                    Alert.alert("Thanks for your response");
                    thisRef.setState({
                        responses : [],
                        queArray : [],
                    })
                    thisRef.props.navigation.pop();
                    thisRef.props.navigation.navigate('SessionDetails',{session : thisRef.state.session});
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                });
        }
    }
    onFormSelectValue = (questionsForm) => {
        let renderQuestions = this.state.questionsForm.map(Fitem => {
            this.state.queArray.push({ Question: Fitem.QuestionTitle, Answer: new Set() });
            return (
                    <View style={{ marginLeft: 10 ,marginBottom :10}}>
                        <Label style={{ flexDirection: 'row', fontFamily: RkTheme.current.fonts.family.regular, alignItems: 'center', marginTop: 3, marginBottom: 2, fontSize: 14 }}> {Fitem.QuestionTitle}</Label>
                        {this.renderAnswerField(Fitem)}
                    </View>
            )
        });
        return  renderQuestions;
    }
    renderAnswerField = (item) => {
        let answerInput = [];
        if (item.AnswerFeild == "Input Text") {

           answerInput :
            return (
                <RkTextInput type="text" placeholder="Answer" name="Answer" onChangeText={(text) => this.onTextChange(text, item.QueId)} id={item.QueId} />
            )
        } else if (item.AnswerFeild == "Mulitple Choice") {

            answerInput:
            return (
                <RkChoiceGroup radio style={{ marginTop: 3, marginBottom: 3 }} onChange={(id) => { this.onMultiChoiceChange(item.value, item.QueId, id) }} >
                    {this.onRenderMultiChoice(item.value, item.QueId)}
                </RkChoiceGroup>
            )
        }
        else if (item.AnswerFeild == "Check Box") {

            answerInput:
            return (
                <RkChoiceGroup style={{ marginTop: 0, marginBottom: 3 }}>
                    {this.onRenderCheckBox(item.value, item.QueId)}
                </RkChoiceGroup >
            )
        }
       return  answerInput;
    }
    onRenderMultiChoice = (value, Qid) => {
        let MultiChoice = value.map(fItem => {
            return (
                <TouchableOpacity choiceTrigger >
                    <View style={{ flexDirection: 'row',marginBottom: 3,marginRight :15 ,alignItems: 'center' }}>
                        <RkChoice rkType='radio'
                            style = {{ borderWidth : 2 , borderRadius : 70 ,borderColor : '#c2c4c6'}}
                            id={Qid} value={fItem.Value}
                            />
                        <Text style={{fontSize: 13 ,marginLeft : 5}}>{fItem.Value}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
        return MultiChoice;
    }
    onRenderCheckBox = (value, Qid) => {
        let CheckBox1 = value.map(fItem => {
            return (
                <View style={{ flexDirection: 'row', marginBottom: 3,marginRight :15 ,marginTop: 1, alignItems: 'center' }}>
                    <RkChoice rkType='clear'
                        style = {{  borderWidth : 2 ,borderColor : '#c2c4c6' }}
                        id={Qid} value={fItem.Value} 
                        onChange={(id) => {this.onCheckBoxChange(id ,fItem.Value,Qid)}} />
                    <Text style={{fontSize: 13 ,marginLeft : 5}}>{fItem.Value}</Text>
                </View>
            )
        })
        return CheckBox1;
    }
    onCheckBoxChange = (eventValue , value, Qid) => {
        let label = value;
        if(this.state.queArray[Qid].Answer.has(label)){
            this.state.queArray[Qid].Answer.delete(label);
        }
        else{
            this.state.queArray[Qid].Answer.add(label);
        }
    }
    onMultiChoiceChange = (values, Qid, eventId) => {
        this.state.queArray[Qid].Answer = values[eventId].Value;
    }
    onTextChange(text, Qid) {
        this.state.queArray[Qid].Answer = text;
    }
    render() {
        if (this.state.questionsForm.length == 0 ){
            return (
                <Container style={[styles.screen]}>
                <View style={[styles.loading]} >
                    <ActivityIndicator size='large' />
                </View>
                </Container>
            );
        }
        else{
            return (
                <Container style={[styles.screen]}>
                    <ScrollView>
                        <RkCard style={[styles.Card]}>
                            {this.onFormSelectValue(this.state.questionsForm)}
                            <GradientButton colors={['#f20505', '#f55050']} text='Submit'
                                style={[styles.Gradbtn]}
                                onPress={() => this.onSubmitResponse()}
                            />
                        </RkCard>
                    </ScrollView>
                </Container>
            );
        } 
    }
}

let styles = RkStyleSheet.create(theme => ({
    screen: {
        padding: 10,
        flex: 1,
        backgroundColor: theme.colors.screen.base
      },
      Card: {
        width : Platform.OS === 'ios' ? 320 : 350, 
        alignSelf:'center'
      },
    loading: {
        marginTop: 250,
        left: 0,
        opacity: 0.5,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
      },
      Gradbtn :{
          alignSelf: 'center',
          width: Platform.OS === 'ios' ? 280 : 340,
          marginTop: 3,
          marginBottom: 3
      }
    }));
