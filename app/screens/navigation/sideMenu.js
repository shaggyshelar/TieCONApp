import React from 'react';
import { TouchableHighlight, View, ScrollView, Image, Platform, StyleSheet, Alert } from 'react-native';
import {NavigationActions} from 'react-navigation';
import { RkStyleSheet, RkText, RkTheme } from 'react-native-ui-kitten';
import {MainRoutes} from '../../config/navigation/routes';
import firebase from '../../config/firebase';
import { Icon } from "native-base";
import _ from 'lodash';
import {FontAwesome, FontIcons} from '../../assets/icons';
import { AsyncStorage } from 'react-native';

export class SideMenu extends React.Component {

  constructor(props) {
    super(props);
    this._navigateAction = this._navigate.bind(this);
    this.state = {
      userDetails: {}
    }
  }
  
  componentWillMount() {
    AsyncStorage.getItem("USER_DETAILS").then((userDetails)=>{
       this.setState({userDetails: JSON.parse(userDetails)});
      })
      .catch(err => {
        console.warn('Errors');
      });
  }

  _navigate(route) {
    let resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({routeName: route.id})
      ]
    });
    this.props.navigation.dispatch(resetAction)
  }

  _renderIcon() {
    if (RkTheme.current.name === 'light')
      return <Image style={styles.icon} source={require('../../assets/images/smallLogo.png')}/>;
    return <Image style={styles.icon} source={require('../../assets/images/smallLogo.png')}/>
  }

  _onLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Yes', onPress: () => {
            firebase.auth().signOut().then(function() {
              // Sign-out successful.
              let keysToRemove = ['USER_DETAILS', 'USER_LINKEDIN_TOKEN', 'SESSIONS'];
              AsyncStorage.multiRemove(keysToRemove, (err) => {
                // keys k1 & k2 removed, if they existed
                // do most stuff after removal (if you want)
              });
            }).catch(function(error) {
              // An error happened.
            });
          } 
        },
        { text: 'No', onPress: () => {} },
      ],
      { cancelable: false }
    );
  }

  render() {
    let menu = MainRoutes.map((route, index) => {
      if (this.state.userDetails && this.state.userDetails.roleName && route.roleNames) {
        let foundIndex = route.roleNames.indexOf(this.state.userDetails.roleName);
        if(foundIndex == -1){
          return null;
        }
      }

      return (
          <TouchableHighlight
            style={styles.container}
            key={route.id}
            underlayColor={RkTheme.current.colors.button.underlay}
            activeOpacity={1}
            onPress={() => this._navigateAction(route)}>
            <View style={styles.content}>
              <View style={styles.content}>
                <RkText style={[styles.icon, styles.sidebarIcon]}
                        rkType='moon primary xlarge'><Icon name={route.icon}/></RkText>
                <RkText style={styles.sidebarMenuName}>{route.title}</RkText>
              </View>
              <RkText rkType='awesome secondaryColor small' style={styles.rightIcon}>{FontAwesome.chevronRight}</RkText>
            </View>
          </TouchableHighlight>
      )
    });

    return (
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <View style={[styles.container, styles.content]}>
            {this._renderIcon()}
            <RkText style={styles.tieName}>TiE Pune Events</RkText>
          </View>
          {menu}
          

          <TouchableHighlight
            style={styles.container}
            key={'Logout'}
            underlayColor={RkTheme.current.colors.button.underlay}
            activeOpacity={1}
            onPress={ this._onLogout.bind(this) }>
            <View style={styles.content}>
              <View style={styles.content}>
                <RkText style={[styles.icon, styles.sidebarIcon]}
                        rkType='moon primary xlarge'><Icon name="ios-exit"/></RkText>
                <RkText style={styles.sidebarMenuName}>Logout </RkText>
                <RkText style={styles.sidebarMenuName}> {this.state.userDetails.firstName}  {this.state.userDetails.lastName}</RkText>

              </View>
              <RkText rkType='awesome secondaryColor small' style={styles.rightIcon}>{FontAwesome.chevronRight}</RkText>
            </View>
          </TouchableHighlight>


        </ScrollView>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    height: 40,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base
  },
  root: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor: theme.colors.screen.base
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 13,
  },
   tieName: {
    fontSize: 16,    
  },
  sidebarIcon:{
    fontSize: 13,
    color: '#607B8C',
    width:30,
  },
  sidebarMenuName: {
    fontSize: 14,
    color: '#607B8C',
  },
  rightIcon:{
     color: '#607B8C',
  }
}));