import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { Switch, Link, Route, useLocation, useHistory } from 'react-router-native'
import { AppContext } from '../../components/Context'

import MyClubScreen from './Clubs'
import ProfileScreen from './Profile'

export default function Router(props) {
  const { user } = useContext(AppContext)
  
  return(
    <Switch>
      <Route path={`${props.match.path}/profile`} children={({ match })=>(
        <ProfileScreen match={match} user={user}/>
      )}/>
      <Route path={`${props.match.path}/research`}>
        <Text style={{color: 'white'}}>Research</Text>
      </Route>
      <Route path={`${props.match.path}/clubs`} children={({ match })=>(
        <MyClubScreen match={match} user={user}/>
      )}/>
      <Route path={`${props.match.path}/stats`}>
        <Text style={{color: 'white'}}>Stats</Text>
      </Route>
    </Switch>
  )
}