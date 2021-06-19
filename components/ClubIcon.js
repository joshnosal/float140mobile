import React, { useState, useEffect } from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, fontSizes, hexToRGBA } from '../styles/Theme'
import { Feather } from '@expo/vector-icons'
import { useHistory } from 'react-router-native'

export default function ClubIcon(props){
  const history = useHistory()
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState()
  const tokenSource = axios.CancelToken.source()
  
  useEffect(()=>{
    getClub()
    return ()=>tokenSource.cancel()
  }, [])

  const getClub = async () => {
    axios.post('http://192.168.86.22:5000/club/club', {id: props.id}, {})
    .then(res=>{
      setClub(res.data)
      setLoading(false)
    }).catch(err=>{console.log(err)})
  }

  const getRole = () => {
    if (club.founder === props.user._id) {
      return 'Founder'
    } else if (club.owner === props.user._id) {
      return 'Owner'
    } else if (club.admin.includes(props.user._id)) {
      return 'Admin'
    } else {
      return 'Member'
    }
  }
  const getAcitivity = () => {
    let date = new Date(club.updatedAt)
    let now = new Date()
    let age = now.getTime() - date.getTime()
    if (age < 1000 * 60 * 60) {
      return Math.round(age / (1000 * 60)) + 'm'
    } else if (age < 1000 * 60 * 60 * 24) {
      return Math.round(age / (1000 * 60 * 60)) + 'h'
    } else if (age < 1000 * 60 * 60 * 24 * 365) {
      return Math.round(age / (1000 * 60 * 60 * 24)) + 'd'
    } else {
      return Math.round(age / (1000 * 60 * 60 * 24 * 365)) + 'y'
    }
  }
  
  const selectClub = () => {
    history.push({
      pathname: '/club',
      state: {
        id: club._id,
        name: club.name
      }
    })
  }

  if (loading) {
    return <View/>
  } else {
    return(
      <TouchableHighlight onPress={selectClub} underlayColor={hexToRGBA(colors.background, colors.primary, 0.4)}>
        <View>
          <View style={{flexDirection: 'row', paddingTop: 10, paddingHorizontal: 10}}>
            <Text style={{color: colors.primary, fontSize: fontSizes.md, fontWeight: '600'}}>{club.name}</Text>
            <View style={{flex: 1}}/>
            <Text style={{color: colors.white, fontSize: fontSizes.md, fontStyle: 'italic'}}>{getRole()}</Text>
          </View>
          <View style={{flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, alignItems: 'center'}}>
            <Feather name='activity' color={colors.accent} size={14}/>
            <Text style={{color: colors.white, marginLeft: 5}}>{getAcitivity()}</Text>
            <View style={{width: 20}}/>
            <Feather name='users' color={colors.accent} size={14}/>
            <Text style={{color: colors.white, marginLeft: 5}}>{club.members.length}</Text>
            <View style={{flex: 1}}/>
            {!club.public ? <Feather name='lock' color={colors.accent} size={14}/> : null}
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}