import {StyleSheet} from 'react-native';
import {RkStyleSheet} from 'react-native-ui-kitten';

export default function styleConstructor() {
    return RkStyleSheet.create(theme =>({
        card: {
            margin: 1,
            padding: 4,
            height : 80,
            borderLeftWidth: 2,
        },
        header: {
            flex: 1,
            flexDirection: 'column'
        },
        mainHeader: {
            flexDirection: 'column',
            flex :3,
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
        actionBtn: {
            flex: 1,
            width: 65,
            height: 20,
            alignSelf: 'flex-end'
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
        speaker: {
            margin: 0,
            padding: 0,
            flexDirection: 'row'
        },
        speakerName: {
            textAlignVertical: 'center',
            fontStyle: 'italic',
            fontSize: 14
        },
        duration: {
            fontSize: 15,
            marginLeft : 5,
            marginRight: 10
        },
        item: {
            backgroundColor: 'white',
            flex: 1,
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
            marginTop: 17
        },
        emptyDate: {
            height: 15,
            flex: 1,
            paddingTop: 30
        },
        tileIcons : {
            paddingLeft: 4,
            paddingTop: 4,
            fontSize:16
        },
        tileFooter : {
            flexDirection: 'row',
            alignContent: 'space-between'
        }
    }));
}

export function getStatusStyle(regStatus) {
    switch (regStatus) {
        case "Going":
            {
                return {color: '#336633'}
            }
        case "Pending":
            {
                return {color: '#FFCC33'}
            }
        case "Denied":
            {
                return {color: '#CC6633'}
            }
    }
}