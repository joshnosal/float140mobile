import React, { useEffect } from 'react'
import { View, Text, Platform, LayoutAnimation, UIManager } from 'react-native'
import { Switch, Link, Route, useLocation, useHistory } from 'react-router-native'

import MainScreen from './Main'
import CryptoScreen from './Crypto'
import CryptoCoinScreen from './Coin'

export default function Router(props) {
  const location = useLocation()
  if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental(true)


  useEffect(()=>{
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [location])
  
  return(
    <Switch>
      <Route exact path={`${props.match.path}/`} children={({ match })=>(
        <MainScreen match={match}/>
      )}/>
      <Route path={`${props.match.path}/crypto`} children={({ match })=>(
        <CryptoScreen match={match}/>
      )}/>        
      <Route path={`${props.match.path}/coin`} children={({ match })=>(
        <CryptoCoinScreen match={match}/>
      )}/>
    </Switch>
  )
}