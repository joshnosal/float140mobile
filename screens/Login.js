import React, {useState} from 'react'
import { 
  StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native'
import { useTheme, Title } from 'react-native-paper'
import { useFonts, Dosis_SemiBold } from '@expo-google-fonts/dosis'

import TextInput from '../components/TextInputTransparent'



export default function Login(props){
  const theme = useTheme()
  const [fontsLoaded] = useFonts({
    Dosis_SemiBold,
  })
  const [state, setState] = useState({
    display: 'login',
    loginid: '',
    loginpwd: '',
    focus: false,
    loading: false,
  })


  const submitLogin = () => {
    setState({...state, loading: true})
    setTimeout(()=>{
      setState({...state, loading: false})
    }, 3000)
  }

  return (
    <TouchableWithoutFeedback onPress={()=>{
      setState({...state, focus: !state.focus})
      Keyboard.dismiss()
    }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >

      {state.display==='login' ? (
        <View style={styles.inner}>
          <View style={styles.row}>
            <Text style={[styles.title, {color: theme.colors.text}]}>Log In</Text>
          </View>
          <View style={styles.row}>
            <TextInput
              placeholder="Username or Email..."
              textContentType="emailAddress"
              value={state.loginid}
              onChangeText={text=>setState({...state, loginid: text})}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              placeholder="Password..."
              textContentType="password"
              secureTextEntry={true}
              value={state.loginpwd}
              onChangeText={text=>setState({...state, loginpwd: text})}
            />
          </View>
          <View style={[styles.row , styles.center]}>
            <TouchableOpacity onPress={()=>submitLogin()}>
              <View style={[styles.button, {backgroundColor: theme.colors.white}]} >
              {state.loading ? (
                <ActivityIndicator size="small"/>
              ) : (
                <Text style={{fontWeight: '600', textTransform: 'uppercase', color: 'black', fontSize: 18}}>Enter</Text>
              )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.center]}>
            <TouchableOpacity onPress={()=>setState({...state, display: 'signup'})}>
              <View style={[styles.link]}>
                <Text style={{fontWeight: '400', color: theme.colors.accent, fontSize: 18}}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text>Signup</Text>
      )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  row: {
    padding: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
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