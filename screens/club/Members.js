import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, SectionList } from 'react-native'
import axios from 'axios'
import { colors } from '../../styles/Theme'

export default function MembersDisplay(props){
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    if (!props.club) {
      setLoading(false)
      setData([
        { title: 'Owner', data: [] }, 
        { title: 'Founder', data: [] },
        { title: 'Admin', data: [] },
        { title: 'Members', data: [] }
      ])
    }
    axios.post('http://192.168.86.22:5000/club/get_club_users', {id: props.club._id}, {cancelToken: tokenSource.token})
    .then(res=>{
      let users = res.data.users
      setData([
        { title: 'Owner', data: users.filter(item => item.role === 'owner') }, 
        { title: 'Founder', data: users.filter(item => item.role === 'founder') },
        { title: 'Admin', data: users.filter(item => item.role === 'admin') },
        { title: 'Members', data: users.filter(item => item.role === 'member') }
      ])
      setLoading(false)
    })
    .catch(err=>console.log(err))
  }, [props.club])

  useEffect(()=>{
    // console.log(data)
  }, [data])

  if (loading) {
    return(
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={colors.primary} size='large'/>
      </View>
    )
  } else {
    return (
      <View style={{flex: 1}}>
        <SectionList 
          sections={data}
          keyExtractor={item => item._id + item.username}
          renderItem={({item})=>{
            console.log(item.firstName)
            return <Text style={{color: colors.white, fontSize: 20}}>{item.username}</Text>
          }}
          renderSectionHeader={({section: {title} })=>(
            <Text style={{color: colors.primary}}>{title}</Text>
          )}
        />
      </View>
    )
  }
}