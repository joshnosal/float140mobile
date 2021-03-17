import React, { useEffect, useState, useContext } from 'react'
import { View, Text, Animated, StyleSheet, KeyboardAvoidingView, 
  Platform, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native'
import { AppContext } from '../../components/Context'
import { Ionicons } from '@expo/vector-icons'
import async from 'async'

// Custom Components
import PasswordInput from '../../components/TextInputPassword'
import UsernameInput from '../../components/TextInputUsername'
import EmailInput from '../../components/TextInputEmail'
import Button from '../../components/Button'

// Styles
import {colors, fontSizes} from '../../styles/Theme'
// import { ScrollView } from 'react-native-gesture-handler'

export default function SignupForm(props){
  const { theme, signUp } = useContext(AppContext)
  const [position, setPosition] = useState(new Animated.Value(0))
  const [error, setError] = useState({
    email: false,
    username: false,
    password: false,
    confirmation: false,
  })
  const [state, setState] = useState({
    email: '',
    username: '',
    password: '',
    confirmation: '',
    loading: false
  })

  useEffect(()=>{
    Animated.timing(position, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const submitSignup = async () => {
    setState({...state, loading: true})

    let errors = { email: false, username: false, password: false, confirmation: false}
    if (!state.email) errors.email = true
    if (!state.username) errors.username = true
    if (!state.password) errors.password = true
    if (!state.confirmation) errors.confirmation = true
    if (state.password !== state.confirmation) {
      errors.password = true
      errors.confirmation = true
    }
    if (errors.email || errors.username || errors.password || errors.confirmation) {
      alert ('Missing registration information')
      setError({...error, ...errors})
      setState({...state, loading: false})
      return
    }
    signUp(state.email, state.username, state.password, state.confirmation, (message)=>{
      if (message==='OK') {
        alert('Success! Please login to your new account')
        props.display('login')
      } else {
        setState({...state, email: '', password: '', username: '', confirmation: ''})
        setError({email: true, username: true, password: true, confirmation: true})
        alert(message)
      }
    })
  }


  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateX: position.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0]
        })}]
      }}
    >
      <ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.row}>
          <Text style={[theme.inputLabel1, {color: colors.primary, paddingBottom: 4}]}>Email</Text>
          <EmailInput 
            value={state.email}
            error={error.email}
            onChangeText={text=>{
              setState({...state, email: text})
              setError({...error, email: false})
            }}
          />
        </View>
        <View style={{height: 20}}/>
        <View style={styles.row}>
          <Text style={[theme.inputLabel1, {color: colors.primary, paddingBottom: 4}]}>Username</Text>
          <UsernameInput 
            value={state.username}
            error={error.username}
            onChangeText={text=>{
              setState({...state, username: text})
              setError({...error, username: false})
            }}
          />
        </View>
        <View style={{height: 20}}/>
        <View style={styles.row}>
          <Text style={[theme.inputLabel1, {color: colors.primary, paddingBottom: 4}]}>Password</Text>
          <PasswordInput 
            placeholder='Your password...'
            value={state.password}
            error={error.password}
            onChangeText={text=>{
              setState({...state, password: text})
              setError({...error, password: false})
            }}
          />
        </View>
        <View style={{height: 20}}/>
        <View style={styles.row}>
          <Text style={[theme.inputLabel1, {color: colors.primary, paddingBottom: 4}]}>Confirm</Text>
          <PasswordInput 
            placeholder='Confirm password...'
            value={state.confirmation}
            error={error.confirmation}
            onChangeText={text=>{
              setState({...state, confirmation: text})
              setError({...error, confirmation: false})
            }}
          />
        </View>
        <View style={{height: 30}}/>
        <View style={[styles.row, {alignItems: 'center'}]}>
          <Button 
            activeOpacity={0.6} 
            size='lg' 
            text='SIGN UP'
            loading={state.loading} 
            underlayColor={colors.background} 
            backgroundColor={colors.primary} 
            width={200} 
            round={true} 
            action={submitSignup}
          />
        </View>
        <View style={{height: 20}}/>
        <View style={[styles.row, {alignItems: 'center'}]}>
          <TouchableOpacity underlayColor={colors.primary} onPress={()=>props.display('login')}>
            <Text style={{color: colors.white, fontSize: fontSizes.md}}>LOG IN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </ScrollView>
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