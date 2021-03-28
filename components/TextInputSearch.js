import React, {useState, useEffect, useRef} from 'react'
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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
      borderBottomColor: colors.white,
      flexGrow: 1,
    }
    if (props.width) style.width = props.width
    if (focus || error) style.borderBottomWidth = 1.5
    if (error) style.borderBottomColor = colors.error
    return style
  }

  return (
    <View style={getContainerStyle()}>
      <Ionicons name='filter' size={20} color={colors.white}/>
      <TextInput 
        {...props}
        placeholder="Filter..."
        style={styles.input} 
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