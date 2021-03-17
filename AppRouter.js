// Functions
import React, { useState, useEffect, useMemo } from 'react'
import { StyleSheet, Text, SafeAreaView, ActivityIndicator, Image, Animated, TouchableWithoutFeedback } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeRouter, Route, Link } from "react-router-native"
import { AppContext } from './components/Context'
import async from 'async'
import axios from 'axios'

// Components
import RootScreen from './screens/Root'
import LoaderBar from './screens/Loading'
import NoInternetScreen from './screens/NoInternet'
import InAppScreen from './screens/InApp'

// Styles
import styles, {colors, fontSizes} from './styles/Theme'


export default function App(props) {
  const [internet, setInternet] = useState(props.internet)
  const [loading, setLoading] = useState(true)
  const [userToken, setUserToken] = useState(null)
  useEffect(()=>setInternet(props.internet), [props.internet])

  useEffect(()=>{
    

    appContext.checkUser(()=>{setLoading(false)})
  }, [])


  const appContext = useMemo(()=>({
    fontSizes: fontSizes,
    colors: colors,
    theme: styles,
    signIn: (username, password, remember, cb) => {
      const storeToken = async (val) => {
        try {
          await AsyncStorage.setItem('@userToken', val)
          setUserToken(val)
        } catch(e) {
          setUserToken(null)
        }
      }
      axios.post('https://cryptic-castle-23141.herokuapp.com/user/login', {login: username, password: password, remember: remember})
      .then(res=>{
        if (res.data.token) {
          storeToken(res.data.token)
        } else {
          cb(res.data)
        }
      }).catch(err=>{
        console.log(err)
        cb('Appologies but something went wrong on our end. Please try again.')
      })
    },
    signOut: () => {
      axios.get('/user/logout').then().catch(err=>console.log('logout error', err))
      console.log('made it here')
      AsyncStorage.removeItem('@userToken')
      setUserToken(null)
    },
    signUp: (email, username, password, confirmation, cb) => {
      axios.post('https://cryptic-castle-23141.herokuapp.com/user/signup', { email: email, username: username, password: password, confirmation: confirmation})
      .then(res=>{
        cb(res.data)
      })
      .catch(err=>{
        console.log(err)
        cb('Appologies but something went wrong on our end. Please try again.')
      })
    },
    checkUser: (cb) => {
      async.waterfall([
        (done) => {
          const checkLocal = async () => {
            try {
              let token = await AsyncStorage.getItem('@userToken')
              done(null, token)
            } catch(e) {
              done(e)
            }
          }
          checkLocal()
        },
        (token, done)=>{
          axios.get('https://cryptic-castle-23141.herokuapp.com/user/check', {
            headers: {Authorization: `JWT ${token}`},
          })
          .then((res)=>{
            done(null, token)
          }).catch(err=>{
            done(err)
          })
        }
      ], (err, token)=>{
        err ? setUserToken(null) : !token ? setUserToken(null) : setUserToken(token)
        cb(token)
      })
    }
  }))



  return (
    <SafeAreaView style={styles.AndroidSafeArea}>
      <AppContext.Provider value={appContext}>
      {!internet ? (
        <NoInternetScreen/>
      ) : loading ? (
        <LoaderBar/>
      ) : userToken ? (
        <InAppScreen />
      ) : (
        <RootScreen />
      )}
      </AppContext.Provider>
    </SafeAreaView>
  )
}



  




