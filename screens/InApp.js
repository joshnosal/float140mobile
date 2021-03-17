import React, {useContext, useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, TouchableHighlight, TouchableOpacity } from 'react-native'
import { AppContext } from '../components/Context'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSizes, hexToRGBA } from '../styles/Theme'
import { Switch, Link, Route, useLocation, useHistory } from 'react-router-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'

const footerHeight = 50,
      drawerWidth = 200

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  body: {
    flex: 1,
    flexBasis: 'auto',
    // flexBasis: 40,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    maxHeight: footerHeight,
  },
  drawer: {
    position: 'absolute',
    width: drawerWidth,
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.background,
    elevation: 5,
    zIndex: 5,
    borderRightColor: colors.primary,
    borderRightWidth: 1,
    flex: 1,
  },
  drawerItem: {
    padding: 10,
    justifyContent: 'center'
  },
  drawerItemText: {
    fontSize: fontSizes.lg
  },
  drawerItemUnselected: {
    color: colors.white
  },
  drawerItemSelected: {
    color: colors.primary
  }
})

export default function InAppScreen(props){
  const { theme, signOut } = useContext(AppContext)
  const [display, setDisplay] = useState('clubs')
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const history = useHistory()
  const drawer = useRef()

  const renderDrawer = () => {
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={()=>history.push('/account/profile')}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/profile' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Profile
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.1} onPress={()=>history.push('/account/research')}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/research' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Research
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.1} onPress={()=>history.push('/account/clubs')}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/clubs' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Clubs
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.1} onPress={()=>history.push('/account/stats')}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/stats' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Stats
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{borderBottomColor: colors.gray, borderBottomWidth: 0.5, margin: 10}}/>
        <TouchableOpacity underlayColor={colors.primary} activeOpacity={0.1} onPress={()=>{signOut()}}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/action/profile' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Log Out
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{flexGrow: 1}}/>
        <TouchableOpacity onPress={()=>drawer.current.closeDrawer()}>
          <View style={[styles.drawerItem, {flexDirection: 'row', justifyContent:'flex-end'}]}>
            <Ionicons name='caret-back' size={30} color={colors.white}/>
          </View>
        </TouchableOpacity>
      </>
    )
  }
  

  return(
  <>
  <DrawerLayout
    ref={e => drawer.current = e}
    drawerWidth={200}
    drawerPosition={DrawerLayout.positions.Left}
    drawerType="front"
    drawerBackgroundColor={colors.background}
    renderNavigationView={renderDrawer}
    // onDrawerSlide={this.handleDrawerSlide}
  >
    <View style={styles.container}>
      <View style={styles.body}>
        <Switch>
          <Route path='/account' >
            <Text style={{color: 'white'}}>Account</Text>
          </Route>
          <Route exact path='/' >
            <Text style={{color: 'white'}}>Clubs</Text>
          </Route>
          <Route path='/analytics' >
            <Text style={{color: 'white'}}>Analytics</Text>
          </Route>
          <Route path='/floats' >
            <Text style={{color: 'white'}}>Floats</Text>
          </Route>
          <Route path='/feed' >
            <Text style={{color: 'white'}}>Feed</Text>
          </Route>
        </Switch>
      </View>
      <View style={styles.footer}>
        <TouchableWithoutFeedback onPress={() => drawer.current.openDrawer()}>
          <Ionicons name="person" size={30} color={location.pathname==='/account' ? colors.primary : colors.white}/>
        </TouchableWithoutFeedback>
        <Link to='/'>
          <Ionicons name="home" size={30} color={location.pathname==='/' ? colors.primary : colors.white}></Ionicons>
        </Link>
        <Link to='/analytics'>
          <Ionicons name="analytics" size={30} color={location.pathname==='/analytics' ? colors.primary : colors.white}/>
        </Link>
        <Link to='/floats'>
          <Ionicons name="pulse" size={30} color={location.pathname==='/floats' ? colors.primary : colors.white}/>
        </Link>
        <Link to='/feed'>
          <Ionicons name="chatbubbles" size={30} color={location.pathname==='/feed' ? colors.primary : colors.white}/>
        </Link>
      </View>
    </View>
  </DrawerLayout>
  </>
  )
}

