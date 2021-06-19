import React, {useContext, useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Platform, LayoutAnimation, TouchableOpacity, UIManager } from 'react-native'
import { AppContext } from '../components/Context'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSizes, hexToRGBA } from '../styles/Theme'
import { Switch, Link, Route, useLocation, useHistory } from 'react-router-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'

// Screens
import ClubsScreen from './clubs/Main'
import AccountRouter from './account/Router'
import AnalyticsRouter from './analytics/Router'
import FloatScreen from './float/Router'
import FloatsScreen from './floats/Main'
import ClubScreen from './club/Router'

const footerHeight = 50,
      drawerWidth = 200

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    maxHeight: footerHeight,
    zIndex: 100,
    elevation: 100,
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
      <View style={{flex: 1, borderRightColor: colors.primary, borderRightWidth: 1}}>
        <TouchableOpacity activeOpacity={0.9} onPress={()=>{
          drawer.current.closeDrawer()
          history.push('/account/profile')}}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/profile' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Profile
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.1} onPress={()=>{
          drawer.current.closeDrawer()
          history.push('/account/clubs')}}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/clubs' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Clubs
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.1} onPress={()=>{
          drawer.current.closeDrawer()
          history.push('/account/stats')}}>
          <View style={styles.drawerItem}>
            <Text style={location.pathname==='/account/stats' ? [styles.drawerItemText, styles.drawerItemSelected] : [styles.drawerItemText, styles.drawerItemUnselected]}>
              Notifications
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
      </View>
    )
  }

  useEffect(()=>history.push('/analytics'), [])

  

  return(
  <>
  <DrawerLayout
    ref={e => drawer.current = e}
    drawerWidth={200}
    drawerPosition={DrawerLayout.positions.Left}
    drawerType="front"
    drawerBackgroundColor={colors.background}
    renderNavigationView={renderDrawer}
  >
    <View style={styles.container}>
      <View style={styles.body}>
        <Switch>
          <Route path='/account' children={({ match })=>(<AccountRouter match={match}/>)}/>            
          <Route path='/clubs' >
            <ClubsScreen />
          </Route>
          <Route path='/analytics'  children={({ match })=>(<AnalyticsRouter match={match}/>)}/>
          <Route path='/floats'  children={({ match }) => (<FloatsScreen match={match}/>)}/>
          <Route path='/floating' children={({ match }) => (<FloatScreen match={match}/>)}/>
          <Route path='/club' children={({ match }) => (<ClubScreen match={match}/>)}/>
        </Switch>
      </View>
      <View style={styles.footer}>
        <Link to='/clubs'>
          <Ionicons name="home" size={30} color={location.pathname.includes('/clubs') && !location.pathname.includes('account/clubs') ? colors.primary : colors.white}></Ionicons>
        </Link>
        <Link to='/analytics'>
          <Ionicons name="analytics" size={30} color={location.pathname.includes('/analytics') ? colors.primary : colors.white}/>
        </Link>
        <Link to='/floating/free'>
          <Ionicons name="cloud-upload-outline" size={40} color={location.pathname.includes('/floating') ? colors.primary : colors.white}/>
        </Link>
        <Link to='/floats'>
          <Ionicons name="pulse" size={30} color={location.pathname.includes('/floats') ? colors.primary : colors.white}/>
        </Link>
        <TouchableWithoutFeedback onPress={() => drawer.current.openDrawer()}>
          <Ionicons name="person" size={30} color={location.pathname.includes('/account') ? colors.primary : colors.white}/>
        </TouchableWithoutFeedback>
      </View>
    </View>
  </DrawerLayout>
  </>
  )
}

