import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Animated, Dimensions, ActivityIndicator, 
  TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, TouchableWithoutFeedback, Keyboard, TouchableHighlight,
  FlatList } from 'react-native'
import { colors, fontSizes, hexToRGBA } from '../../styles/Theme'
import { useHistory } from 'react-router-native'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import ClubIcon from '../../components/ClubIcon'


export default function MyClubs(props){
  const history = useHistory()
  const windowWidth = Dimensions.get('window').width
  const [loading, setLoading] = useState(true)
  const [display, setDisplay] = useState('clubs')
  const [displayPos, setDisplayPos] = useState(new Animated.Value(0))
  const [clubs, setClubs] = useState([])
  const [newClub, setNewClub] = useState({name: '', public: true, open: true})
  const [filter, setFilter] = useState()
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    Keyboard.dismiss()
    if (display === 'clubs') {
      Animated.timing(displayPos, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    } else {
      Animated.timing(displayPos, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start()
    }
  }, [display])


  useEffect(()=>{
    getClubs()
    return ()=>tokenSource.cancel()
  }, [])

  const getClubs = async () => {
    let token = await AsyncStorage.getItem('@userToken')
    axios.get('http://192.168.86.22:5000/club/get_my_clubs', {headers: {Authorization: `JWT ${token}`}})
    .then(res=>{
      if (!res.data.length) {
        setDisplay('new')
      } else {
        setClubs(res.data)
      }
      setLoading(false)
    }).catch(err=>{console.log(err)})
  }

  const createClub = async () => {
    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/club/create', {club: newClub}, {headers: {Authorization: `JWT ${token}`}})
    .then(res=>{
      setDisplay('clubs')
      setNewClub({name: '', public: true, open: true})
      getClubs()
    }).catch(err=>{
      console.log(err)
      alert('Apologies! Something went wrong saving the club.')
    })
  }


  return(
    <>
    <View style={styles.header}>
      <View style={{width: 50}}>
        {display === 'new' ? (
          <TouchableOpacity onPress={()=>{setDisplay('clubs')}}>
            <MaterialIcons name='chevron-left' color={colors.primary} size={24}/>
          </TouchableOpacity>
        ): null}
      </View>
      <Text style={{fontSize: fontSizes.lg, fontWeight: '600', color: colors.primary, flex: 1, textAlign: 'center'}}>My Clubs</Text>
      <View style={{width: 50}}/>
    </View>
    {loading ? (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator color={colors.primary} size='large'/>
    </View>
    ): (
    <Animated.View style={{
      flex: 1,
      flexDirection: 'row',
      width: windowWidth * 2,
      transform: [{translateX: displayPos.interpolate({
        inputRange: [0,1],
        outputRange: [0, -windowWidth]
      })}]
    }}>
      <View style={{width: windowWidth}}>
        <TouchableOpacity 
          onPress={()=>setDisplay('new')} 
          style={{
            backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
            paddingVertical: 10,
            paddingHorizontal: 40,
            alignItems: 'center'
          }}
        >
          <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>NEW CLUB</Text>
        </TouchableOpacity>
        <FlatList
          data={clubs}
          renderItem={({item})=><ClubIcon id={item} user={props.user}/>}
          keyExtractor={item => item}
        />
      </View>
      {/* NEW CLUB SCREEN */}
      <View style={{width: windowWidth, flex: 1, alignItems: 'flex-end'}}>
        <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%'}}
          keyboardVerticalOffset={50}
        >
          <View style={{width: '80%', maxWidth: '80%'}}>
            {clubs.length ? (
            <Text style={{color: colors.white, fontSize: fontSizes.xl, fontWeight: '600'}}>
              New club!
            </Text>
            ) : (
            <>
            <Text style={{color: colors.white, fontSize: fontSizes.xl, fontWeight: '600', paddingBottom: 10}}>
              It looks like you don't have any clubs.
            </Text>
            <Text style={{color: colors.white, fontSize: fontSizes.xl, fontWeight: '600'}}>
              Let's create one!
            </Text>
            </>
            )}
            <TextInput
              onChangeText={text=>setNewClub({...newClub, name: text})}
              value={newClub.name}
              style={{
                color: colors.white, 
                fontSize: fontSizes.md, 
                fontWeight: '500',
                borderColor: colors.white,
                borderWidth: 0.5,
                borderRadius: 10,
                padding: 10,
                marginVertical: 20
              }}
              maxLength={30}
              placeholder='Club name...'
              placeholderTextColor={colors.gray}
            />
            <TouchableOpacity 
              onPress={()=>setNewClub({...newClub, public: !newClub.public})}
              style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            >
              <MaterialIcons name={newClub.public ? 'check-box-outline-blank' : 'check-box'} color={colors.white} size={28}/>
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', marginLeft: 10}}>
                {newClub.public ? 'Public (all can join)' : 'Private (invite only)'}
              </Text>
            </TouchableOpacity>
            {newClub.public ? (
            <TouchableOpacity 
              onPress={()=>setNewClub({...newClub, open: !newClub.open})}
              style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            >
              <MaterialIcons name={newClub.open ? 'check-box-outline-blank' : 'check-box'} color={colors.white} size={28}/>
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', marginLeft: 10}}>
                {newClub.open ? 'Open (anyone can join)' : 'Closed (members must apply)'}
              </Text>
            </TouchableOpacity>
            ) : null}
            <View 
              style={{
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5),
                width: 160,
                alignSelf: 'center',
                borderRadius: 10,
                overflow: 'hidden',
                marginTop: 20
              }}
            >
              <TouchableHighlight 
                underlayColor={colors.primary}
                style={{padding: 10, width: '100%', alignItems: 'center'}}
                onPress={createClub}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.lg, fontWeight: '600'}}>Create</Text>
              </TouchableHighlight>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </Animated.View>
    )}
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    minHeight: 40,
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    
  },
  body: {
    flex: 1,
  }
})
