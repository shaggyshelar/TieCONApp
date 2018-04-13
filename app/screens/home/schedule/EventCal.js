import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {Agenda} from 'react-native-calendars';
import Moment from 'moment';

import {Service} from '../../../services';
import ScheduleTile from './Schedule-tile';
import styleConstructor from './styles';

const SESSIONS_TABLE = 'Sessions';
const REGISTRATION_RESPONSE_TABLE = "RegistrationResponse";

export default class EventCal extends Component {
    constructor(props) {
        super(props);
        this.styles = styleConstructor();
        this.state = Object.assign(...props, {
            sessions: {},
            user: {},
            event: {
                startDate: '2018-04-20',
                endDate: '2018-04-21'
            }
        });
    }

    /**
     * Extract Session data from snapshot object
     */
    extractSession = (sessionObj) => {
        const {
            eventName,
           // extraServices,
            isRegrequired,
            room,
            startTime,
            speakers,
            endTime,
            description,
            isBreak,
            sessionType,
        } = sessionObj.data();
        return {
            key: sessionObj.id,
            eventName,
           // extraServices,
            isRegrequired:!!isRegrequired,
            room,
            speakers,
            speakersDetails: [],
            startTime,
            endTime,
            description,
            isBreak : !!isBreak,
            sessionType
        }
    }
    
    /**
     * Database Query for Fetching Sessions
     */
    fetchSessions = (currentDate, successFn) => {
        Service
            .getDocRef(SESSIONS_TABLE)
            .where("startTime", ">=", currentDate.toDate())
            .where("startTime", "<=", currentDate.add(1, 'day').toDate())
            .orderBy("startTime")
            .orderBy("room")
            .get()
            .then(successFn)
            .catch(err =>{
                console.warn(err);
            });
    }
    
    /**
     *  Post mounting data fetch
     */
    componentDidMount() {
        let __self = this;
        Service.getCurrentUser((userObj) => {
            __self.setState((prevState) => ({
                ...prevState,
                user: userObj
            }));
        });
    }
    
    /**
     * Hide date displayed on left side of panel
     */
    renderDay = (day, item) => {
        return (<View/>)
    }
    
    /**
     * Fetch Sessions for selected date
     */
    loadSessions = (day) => {
        // This hardcoding Can be removed after below bug fix in react-native-calendars library
        // [https://github.com/wix/react-native-calendars/issues/24] 
        if(day.dateString == '2018-03-20'){
            return;
        }

         // Dynamically fetch Event start and end dates
        const currentDate = Moment(day.dateString);
        let index = 0;
        this.fetchSessions(currentDate, (snapshot) => {
            var sessions = [];
            let allSpeakers = [];
            let index = 0;
            snapshot.forEach((sessionObj) => {
                let __sessionObj = this.extractSession(sessionObj);
                sessions.push(__sessionObj);
            });
            let newSessions = {};
            newSessions[day.dateString] = sessions;
            this.setState((prevState) => ({
                ...prevState,
                sessions: newSessions
            }));
        });
    }
    
    /**
     * Session Rendering
     */
    renderSession = (item) => {
        return (<ScheduleTile
            navigation={this.props.navigation}
            user={this.state.user}
            session={item}/>);
    }
    
    /**
     * Handle Session Rendering
     * when no event is present on selected date
     */
    renderEmptyDate = (day) => {
        return (
            <View style={this.styles.emptyDate}>
                <Text>No sessions for this date</Text>
            </View>
        );
    }
    
    /**
     */
    rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    }

    /**
     * get the time in string format
     */
    timeToString = (time) => {
        const date = new Date(time);
        return date
            .toISOString()
            .split('T')[0];
    }
    
    /**
     * Render method for component
     */
    render() {
        const __startDate = Moment(this.state.event.startDate).format("YYYY-MM-DD");
        const __endDate = Moment(this.state.event.endDate).format("YYYY-MM-DD");
        return (<Agenda
            items={this.state.sessions}
            hideKnob={true}
            loadItemsForMonth={this.loadSessions}
            selected={__startDate.toString()}
            renderItem={this.renderSession}
            renderEmptyDate={this.renderEmptyDate}
            rowHasChanged={this.rowHasChanged}
            minDate={__startDate}
            maxDate={__endDate}
            firstDay={3}
            monthFormat={'yyyy'}
            theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#F0F0F0',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#E7060E',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#00adf5',
                dayTextColor: '#2d4150',
                textDisabledColor: '#CFCFCF',
                dotColor: '#FFFFFF',
                selectedDotColor: '#E7060E',
                monthTextColor: '#E7060E'
            }}
            renderDay={this.renderDay}/>);
    }
}