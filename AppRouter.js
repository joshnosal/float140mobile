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
  const [user, setUser] = useState(null)
  useEffect(()=>setInternet(props.internet), [props.internet])

  useEffect(()=>{
    appContext.checkUser(()=>{setLoading(false)})
  }, [])


  const appContext = useMemo(()=>({
    fontSizes: fontSizes,
    colors: colors,
    theme: styles,
    user: user,
    updateUser: async (updates, cb) => {

      async.waterfall([
        (done) => {
          const getToken = async () =>{
            try {
              let token = await AsyncStorage.getItem('@userToken')
              done(null, token)
            } catch(e) {
              done(e)
            }
          }
          getToken()
        },
        (token, done) => {
          const storeUser = async (val) => {
            try {
              let data = JSON.stringify(val)
              await AsyncStorage.setItem('@userData', data)
              done(null, val)
            } catch(e) {
              done(e)
            }
          }
          axios.post('http://192.168.86.22:5000/user/update_user', updates, {
            headers: {Authorization: `JWT ${token}`},
          })
          .then((res)=>{
            storeUser(res.data)
          }).catch(err=>{
            done(err)
          })
        },
        (userInfo, done) => {
          setUser(userInfo)
          done(null, userInfo)
        }
      ], (err, result)=>{
        err ? cb(undefined) : cb(result)
      })

    },
    signIn: (username, password, remember, cb) => {
      const storeToken = async (val) => {
        try {
          await AsyncStorage.setItem('@userToken', val)
          setUserToken(val)
        } catch(e) {
          setUserToken(null)
        }
      }
      const storeUser = async (val) => {
        let data = JSON.stringify(val)
        try {
          await AsyncStorage.setItem('@userData', data)
          setUser(val)
        } catch(e) {
          setUser(null)
        }
      }
      axios.post('https://cryptic-castle-23141.herokuapp.com/user/login', {login: username, password: password, remember: remember})
      .then(res=>{
        if (res.data.token) {
          storeToken(res.data.token)
          storeUser(res.data.user)
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
      AsyncStorage.removeItem('@userData')
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
          const storeUser = async (val) => {
            try {
              let data = JSON.stringify(val)
              await AsyncStorage.setItem('@userData', data)
              done(null, token, val)
            } catch(e) {
              done(e)
            }
          }
          axios.get('http://192.168.86.22:5000/user/check', {
            headers: {Authorization: `JWT ${token}`},
          })
          .then((res)=>{
            storeUser(res.data)
          }).catch(err=>{
            done(err)
          })
        }
      ], (err, token, userData)=>{
        if (err || !token) {
          setUserToken(null)
        } else {
          setUserToken(token)
          setUser(userData)
        }
        cb(token)
      })
    }
  }))



  return (
    <SafeAreaView style={[styles.AndroidSafeArea]}>
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



  




