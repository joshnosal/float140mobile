import React, { useEffect, useState } from 'react'
import { View, Text, Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native'

export default function RootMain(props){
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
      <TouchableWithoutFeedback onPress={()=>props.display('main')}>
        <Text style={{color: 'white', fontSize: 24}}>Reset Password</Text>
      </TouchableWithoutFeedback>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
})