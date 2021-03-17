import React, { useEffect, useState, useContext } from 'react'
import { View, Text, Animated, StyleSheet, KeyboardAvoidingView, 
  Platform, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { AppContext } from '../../components/Context'
import { Ionicons } from '@expo/vector-icons'
import async from 'async'

// Custom Components
import PasswordInput from '../../components/TextInputPassword'
import UsernameInput from '../../components/TextInputEmailandUsername'
import Button from '../../components/Button'

// Styles
import {colors, fontSizes} from '../../styles/Theme'

export default function RootMain(props){
  const { theme, signIn } = useContext(AppContext)
  const [position, setPosition] = useState(new Animated.Value(0))
  const [error, setError] = useState({
    loginid: false,
    loginpwd: false
  })
  const [state, setState] = useState({
    loginid: '',
    loginpwd: '',
    remember: false,
    loading: false
  })

  useEffect(()=>{
    Animated.timing(position, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const submitLogin = async () => {
    setState({...state, loading: true})
    let errors = { loginid: false, loginpwd: false}
    if (!state.loginid) errors.loginid = true
    if (!state.loginpwd) errors.loginpwd = true
    if (errors.loginid || errors.loginpwd) {
      alert ('Missing login information')
      setError(errors)
      setState({...state, loading: false})
      return
    } 
    signIn(state.loginid, state.loginpwd, state.remember, (message)=>{
      setState({...state, loading: false, loginid: '', loginpwd: ''})
      setError({loginid: true, loginpwd: true})
      alert(message)
    })
  }


  return (
    <Animated.View
      style={{
        transform: [{ translateX: position.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0]
        })}]
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.row}>
          <Text style={[theme.inputLabel1, {color: colors.primary, paddingBottom: 4}]}>Username</Text>
          <UsernameInput 
            value={state.loginid}
            error={error.loginid}
            onChangeText={text=>{
              setState({...state, loginid: text})
              setError({...error, loginid: false})
            }}
          />
        </View>
        <View style={{height: 20}}/>
        <View style={styles.row}>
          <Text style={[theme.inputLabel1, {color: colors.primary, paddingBottom: 4}]}>Password</Text>
          <PasswordInput 
            value={state.loginpwd}
            error={error.loginpwd}
            onChangeText={text=>{
              setState({...state, loginpwd: text})
              setError({...error, loginpwd: false})
            }}
          />
        </View>
        <View style={{height: 10}}/>
        <View style={styles.row}>
          <TouchableOpacity underlayColor={colors.primary} onPress={()=>props.display('reset')}>
            <Text style={{color: colors.primary, fontSize: fontSizes.sm}}>Reset my password</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 20}}/>
        <View style={[styles.row, {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}]}>
          <TouchableWithoutFeedback onPress={()=>setState({...state, remember: !state.remember})}>
            <Ionicons name={state.remember ? 'checkbox-outline' : 'square-outline'} size={24} color={state.remember ? colors.primary : colors.white} />
          </TouchableWithoutFeedback>
          <Text style={{color: colors.white, fontSize: fontSizes.md, paddingLeft: 8}}>Remember me</Text>
        </View>
        <View style={{height: 30}}/>
        <View style={[styles.row, {alignItems: 'center'}]}>
          <Button 
            activeOpacity={0.6} 
            size='lg' 
            text='LOG IN'
            loading={state.loading} 
            underlayColor={colors.background} 
            backgroundColor={colors.primary} 
            width={200} 
            round={true} 
            action={submitLogin}
          />
        </View>
        <View style={{height: 20}}/>
        <View style={[styles.row, {alignItems: 'center'}]}>
          <TouchableOpacity underlayColor={colors.primary} onPress={()=>props.display('signup')}>
            <Text style={{color: colors.white, fontSize: fontSizes.md}}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  row: {
    paddingLeft: 20,
    paddingRight: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontWeight: '500',
    fontSize: 24,
    alignSelf: 'flex-start',
  },
  button: {
    width: 150,
    borderRadius: 10,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  }
})