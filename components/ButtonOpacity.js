import React from 'react'
import {TouchableOpacity, View, Text, ActivityIndicator} from 'react-native'

// Styles
import styles, {colors, fontSizes} from '../styles/Theme'

export default function Button(props){
  // activeOpacity: 0 to 1
  // size: sm, md, lg 
  // backgroundColor: hex
  // action: onPress function 
  // textColor: hex 
  // text: string
  // round: true | false (default: false)
  // width: number (optional)

  const getViewStyle = () => {
    let style = {}
    if (props.size === 'lg') {
      style.height = 40
      props.round ? style.borderRadius = 20 : style.boderRadius = 3
    } else if (props.size === 'md') {
      style.height = 30
      props.round ? style.borderRadius = 14 : style.boderRadius = 3
    } else {
      style.height = 20
      props.round ? style.borderRadius = 10 : style.boderRadius = 3
    }
    if (props.width) style.width = props.width
    style.justifyContent = 'center'
    style.alignItems = 'center'
    style.paddingLeft = 10
    style.paddingRight = 10

    style.backgroundColor = props.backgroundColor || 'transparent'
    return style
  }

  const getTextStyle = () => {
    let style = {}
    style.color = props.textColor || 'white'
    style.fontWeight = '500'
    if (props.size === 'lg') {
      style.fontSize = fontSizes.md
    } else if (props.size === 'md') {
      style.fontSize = fontSizes.md
    }
    return style
  }

  return(
    // <Text>Thing</Text>
    <TouchableOpacity 
      activeOpacity={props.activeOpacity}
      onPress={props.action}
    >
      <View style={getViewStyle()}>
        {props.loading ? (
          <ActivityIndicator size="small" color={colors.background}/>
        ) : (
          <Text style={getTextStyle()}>{props.text}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}