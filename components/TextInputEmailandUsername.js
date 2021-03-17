import React, {useState, useEffect, useRef} from 'react'
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

// Styles
import {colors, fontSizes} from '../styles/Theme'



export default function FancyInput(props){
  const [focus, setFocus] = useState(props.focus)
  const [error, setError] = useState(props.error)

  useEffect(()=>setError(props.error),[props.error])


  const getContainerStyle = () => {
    let style = {
      height: 40,
      borderBottomWidth: 0.5,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      borderBottomColor: colors.white
    }
    if (focus || error) style.borderBottomWidth = 1.5
    if (error) style.borderBottomColor = colors.error
    return style
  }

  return (
    <View style={getContainerStyle()}>
      <FontAwesome name='user-o' size={24} color={focus ? colors.primary : error ? colors.error : colors.white}/>
      <TextInput 
        {...props}
        placeholder="Your email or username..."
        style={styles.input} 
        textContentType="emailAddress"
        placeholderTextColor={colors.gray}
        onEndEditing={()=>setFocus(false)}
        onFocus={()=>{
          setFocus(true)
          setError(false)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },
  input: {
    flexGrow: 1,
    color: colors.white,
    fontSize: fontSizes.md,
    paddingLeft: 10,
    paddingRight: 10,
  }
})