// Functions
import React, { Component } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, Image, Animated } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeRouter, Route, Link } from "react-router-native"
import { withTheme } from 'react-native-paper'

// Components
import LoginScreen from './screens/Login'
import LoaderBar from './components/LoaderBar'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      redirect: true,
      slideDown: new Animated.Value(-600),
    }
  }

  componentDidMount(){
    setTimeout(async ()=>{
      try {
        const user = await AsyncStorage.getItem('@user')
        user !== null ? this.setState({loading: false, redirect: false}) : this.setState({loading: false, redirect: true})
      } catch(e) {
        this.setState({loading: false, redirect: true})
      }
    },1000)
  }





  render(){
    const { slideDown } = this.state
    const theme = this.props.theme
    if (this.state.loading) {
      return (
        <View style={[styles.background, {backgroundColor: theme.colors.background}]}>
            <LoaderBar/>
        </View>
        )
    } else if (this.state.redirect){
      return (
        <View style={[styles.background, {backgroundColor: theme.colors.background}]}>
          <LoginScreen/>
        </View>
      )
    } else {
      return (
        <NativeRouter>
          <View style={styles.container}>
            <View style={styles.nav}>
              <Link to="/" underlayColor="#f0f4f7" style={styles.navItem}>
                <Text>Home</Text>
              </Link>
              <Link
                to="/about"
                underlayColor="#f0f4f7"
                style={styles.navItem}
              >
                <Text>About</Text>
              </Link>
              <Link
                to="/topics"
                underlayColor="#f0f4f7"
                style={styles.navItem}
              >
                <Text>Topics</Text>
              </Link>
            </View>
  
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/topics" component={Topics} />
          </View>
        </NativeRouter>
      )
    }
  }
}

export default withTheme(App)

const styles = StyleSheet.create({
  loadBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    padding: 10
  },
  subNavItem: {
    padding: 5
  },
  topic: {
    textAlign: "center",
    fontSize: 15
  }
})

  

const Home = () => <Text style={styles.header}>Home</Text>;

const About = () => <Text style={styles.header}>About</Text>;

const Topic = ({ match }) => (
  <Text style={styles.topic}>{match.params.topicId}</Text>
);

const Topics = ({ match }) => (
  <View>
    <Text style={styles.header}>Topics</Text>
    <View>
      <Link
        to={`${match.url}/rendering`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Rendering with React</Text>
      </Link>
      <Link
        to={`${match.url}/components`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Components</Text>
      </Link>
      <Link
        to={`${match.url}/props-v-state`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Props v. State</Text>
      </Link>
    </View>

    <Route path={`${match.path}/:topicId`} component={Topic} />
    <Route
      exact
      path={match.path}
      render={() => (
        <Text style={styles.topic}>Please select a topic.</Text>
      )}
    />
  </View>
);



