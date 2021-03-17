import React, { useEffect, useState } from 'react'
import { View, Text, Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { colors } from '../../styles/Theme'

export default function RootSuccess(props){
  const [position, setPosition] = useState(new Animated.Value(0))

  useEffect(()=>{
    Animated.timing(position, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  return (
    <Animated.View
      style={{
        transform: [{ translateX: position.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0]
        })}]
      }}
    >
      <Text style={{color: 'white', fontSize: 36}}>Registration successful!</Text>
      <TouchableWithoutFeedback onPress={()=>props.display('login')}>
        <Text style={{color: colors.primary, fontSize: 24}}>Log in now</Text>
      </TouchableWithoutFeedback>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
})