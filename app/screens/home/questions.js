import React from 'react';
import {ScrollView ,Platform,NetInfo} from 'react-native';
import { Text, View, Icon, Container, Label } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity, Keyboard, Alert, AsyncStorage,ActivityIndicator } from 'react-native';
import { RkComponent, RkTheme,RkStyleSheet, RkText, RkAvoidKeyboard, RkButton, RkCard, RkChoice, RkTextInput, RkChoiceGroup } from 'react-native-ui-kitten';
import { NavigationActions } from 'react-navigation';
import ReactMoment from 'react-moment';
import firebase from '../../config/firebase';
import {GradientButton} from '../../components/gradientButton';

var firestoreDB = firebase.firestore();

export class Questions extends React.Component {
    static navigationOptions = {
        title: 'Questions'.toUpperCase()
      };
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.state = {
            questionsForm: [],
            userId: this.props.userId,
            responses : [],
            queArray : [],
            isOffline :false,
            isLoading : true
        }
        this.onFormSelectValue = this.onFormSelectValue.bind(this);
        this.onMultiChoiceChange = this.onMultiChoiceChange.bind(this);
    }
    componentWillMount() {
        if(Platform.OS !== 'ios'){
          NetInfo.isConnected.fetch().then(isConnected => {
            if(isConnected) {
              this.getForm();
              this.setState({
                isLoading: true
              });
            } else {
              this.setState({
                isLoading: false,
                isOffline : true
              });
            }         
            this.setState({
              isOffline: !isConnected
            });
          });  
        }
        this.getForm();
        NetInfo.addEventListener(
          'connectionChange',
          this.handleFirstConnectivityChange
        );
      }

      handleFirstConnectivityChange = (connectionInfo) => {
        if(connectionInfo.type != 'none') {
          this.getForm();
            this.setState({
              isLoading: true
            });
        } else {
          this.setState({
            isLoading: false,
            isOffline : true
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
    
    getForm = () => {
        let thisRef = this;
        firestoreDB.collection("QuestionsForm").doc("landingQuestions").get().then(function (doc) {
            if( doc.data()  == undefined){
                thisRef.resetNavigation(thisRef.props.navigation, 'HomeMenu');
            }
            else{
                let form = doc.data();
                thisRef.setState({
                    questionsForm: form.Questions,
                    isLoading :false
                })
                let questionSet = [];
                form.Questions.forEach(question => {
                   questionSet.push({ Question: question.QuestionTitle, Answer: new Set() });
                })
                thisRef.setState({
                    queArray: questionSet
                })
           }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }

    resetNavigation =(navigation, targetRoute) => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: targetRoute, params:{ showHome : true }}),
          ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    onSubmitResponse = () => {
        this.setState({
            isLoading : true
        })
        let blankResponse = false;
        this.state.queArray.forEach(fItem => {
            if (fItem.Answer.size >= 1){
                fItem.Answer = Array.from(fItem.Answer);
            }
            if(fItem.Answer == "" || fItem.Answer.size == 0){
                blankResponse = true;
            }
        });
        if(blankResponse == true){
            this.setState({
                isLoading : false
            })
            Alert.alert("Please fill all the fields");
            
        }
        else{
            let thisRef = this;
            firestoreDB.collection('QuestionsHome').add({
                Responses: thisRef.state.queArray,
                ResponseBy: thisRef.state.userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(function (docRef) {
                thisRef.setState({
                    isLoading : false
                })
                Alert.alert("Thanks for your response");
                thisRef.resetNavigation(thisRef.props.navigation, 'HomeMenu');
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
        }
    }
    onFormSelectValue = (questionsForm) => {
        if (this.state.questionsForm.length == 0) {
            this.resetNavigation(thisRef.props.navigation, 'HomeMenu');
        }
        else {
            let renderQuestions = this.state.questionsForm.map(Fitem => {
              //  this.state.queArray.push({ Question: Fitem.QuestionTitle, Answer: new Set() });
                return (
                    <View style={{ marginLeft: 10, marginBottom: 10 }}>
                        <Label style={{ flexDirection: 'row', fontFamily: RkTheme.current.fonts.family.regular, alignItems: 'center', marginTop: 3, marginBottom: 2, fontSize: 14 }}>{Fitem.QuestionTitle}</Label>
                        {this.renderAnswerField(Fitem)}
                    </View>
                );
            });
            return renderQuestions;
        }
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
                    <RkChoice rkType='clear' style = {{  borderWidth : 2 ,borderColor : '#c2c4c6' }}
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
        if (this.state.isLoading == true ){
            return (
                <Container style={[styles.screen]}>
                    <ScrollView>
                        <View style={[styles.loading]} >
                            <ActivityIndicator size='large' />
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
            );
        }
        else{
            return (
                <Container style={[styles.screen]}> 
                    <ScrollView>
                        {this.onFormSelectValue(this.state.questionsForm)}
                        <GradientButton colors={['#f20505', '#f55050']} text='Submit'
                            style={[styles.Gradbtn]}
                            onPress={() => this.onSubmitResponse()}
                        />
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
            );
        }      
    }
}

let styles = RkStyleSheet.create(theme => ({
    screen: {
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
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch', 
        backgroundColor : '#E7060E'
      },
      footerOffline : {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch', 
        backgroundColor : '#545454'
      },
      footerText: {
        color : '#f0f0f0',
        fontSize: 11,
      },
      companyName:{
        color : '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
      },
}));