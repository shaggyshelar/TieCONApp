import React from 'react';
import { RkStyleSheet, RkText } from 'react-native-ui-kitten';
import { Text, View, Container } from 'native-base';


function renderIf(condition, content) {
  if (condition) {
      return content;
  } else {
      return null;
  }
}

export class VenueMap extends React.Component {
  static navigationOptions = {
    title: 'Venue Map'.toUpperCase()
  };

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {
  }

  render() {
    return (
      <Container style={[styles.root]}>
          <View>
              {/* {speakerTile} */}
              <Text style={{fontSize :20}}>Coming Soon</Text>
          </View>
      </Container>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
      backgroundColor: theme.colors.screen.base
  }
}));