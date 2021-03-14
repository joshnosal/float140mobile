import React, {useState, useEffect, useRef} from 'react'
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, TextInput } from 'react-native'
import { useTheme, Title } from 'react-native-paper'
import { useFonts, Dosis_SemiBold } from '@expo-google-fonts/dosis'


export default function FancyInput(props){
  const theme = useTheme()
  const [state, setState] = useState({
    focus: props.focus,
    error: false,
  })
  const inputEl = useRef()

  useEffect(()=>{
    inputEl.current.blur()
  }, [props.focus])
  const getStyles = () => {
    let styles = {
      color: theme.colors.white,
      fontSize: 18
    }
    return styles
  }
  const getContainerStyles = () => {
    let styles = {
      borderColor: theme.colors.white,
      borderWidth: 0.5,
      borderRadius: 5,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
      width: 250
    }
    if (state.focus) {styles.borderColor = theme.colors.primary}
    if (state.error) {styles.borderColor = theme.colors.error}
    return styles
  }

  return (
      <View 
        style={getContainerStyles()}
      >
          <TextInput
            {...props}
            mode='flat'
            dense={true}
            style={getStyles()}
            ref={ele => inputEl.current = ele}
            placeholderTextColor="gray"
            onFocus={()=>setState({...state, focus: true})}
            onKeyPress={(e)=>setState({...state, error: false})}
          />
      </View>
  )
}