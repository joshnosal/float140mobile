import React, { useEffect, useState } from 'react'
import { View, Image, Text, Animated, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import MainScreen from './root/Main'
import LoginScreen from './root/Login'
import SignupScreen from './root/Signup'
import ResetPasswordScreen from './root/ResetPassword'
import SuccessScreen from './root/Success'

export default function Root(props){
  const [display, setDisplay] = useState('login')

  const toggleDisplay = (disp) => {
    console.log('now here')
    setDisplay(disp)
  }

  const getContent = () => {
    switch (display){
      default:
        return <MainScreen display={toggleDisplay}/>
      case 'login':
        return <LoginScreen display={toggleDisplay}/>
      case 'signup':
        return <SignupScreen display={toggleDisplay}/>
      case 'reset':
        return <ResetPasswordScreen display={toggleDisplay}/>
      case 'success':
        return <SuccessScreen display={toggleDisplay}/>
    }
  }

  return (
    <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.outer}
      >
        <Animated.View style={styles.innerTop}>
          <Image source={require('../assets/img/LogoWhite.png')} style={styles.logo} resizeMode="contain"/>
        </Animated.View>
        <View style={styles.innerBottom}>
          {getContent()}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexBasis: 1
  },
  innerTop: {
    flexBasis: 1,
    flexGrow: 1,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerBottom: {
    flexBasis: 1,
    flexGrow: 2,
  },
  logo: {
    height: 70,
    maxHeight: 70,
    maxWidth: 300,
  },
})