import React from 'react'
import { View, Text } from 'react-native'
import { Switch, Link, Route, useLocation, useHistory } from 'react-router-native'

import MyClubScreen from './Clubs'

export default function Router(props) {
  
  return(
    <Switch>
      <Route path={`${props.match.path}/profile`}>
        <Text style={{color: 'white'}}>Profile</Text>
      </Route>
      <Route path={`${props.match.path}/research`}>
        <Text style={{color: 'white'}}>Research</Text>
      </Route>
      <Route path={`${props.match.path}/clubs`} children={({ match })=>(
        <MyClubScreen match={match}/>
      )}/>
      <Route path={`${props.match.path}/stats`}>
        <Text style={{color: 'white'}}>Stats</Text>
      </Route>
    </Switch>
  )
}