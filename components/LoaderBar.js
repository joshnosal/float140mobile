import React, { useState } from 'react'
import { Animated, Easing, View, StyleSheet } from 'react-native'

export default function LoaderBar(props){
  const [deg, setDeg] = useState(new Animated.Value(0))
  const [deg2, setDeg2] = useState(new Animated.Value(0))

  Animated.loop(
    Animated.timing(deg, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start()

  Animated.loop(
    Animated.timing(deg2, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start()

  return (
    <Animated.View
      style={{
        width: 200,
        transform: [{rotate: deg2.interpolate({inputRange: [0,1], outputRange: ['0deg', '360deg']})}]
      }}
    >
      <Animated.View style={[styles.topLeft, {
        width: props.size || 40,
        borderBottomColor: props.color || 'white',
        borderBottomWidth: 1,
        transform: [{rotate: deg.interpolate({inputRange: [0,1], outputRange: ['0deg', '360deg']})}]
      }]}/>
      <Animated.View style={[styles.bottomRight, {
        width: props.size || 40,
        borderBottomColor: props.color || 'white',
        borderBottomWidth: 1,
        transform: [{rotate: deg.interpolate({inputRange: [0,1], outputRange: ['0deg', '360deg']})}]
      }]}/>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
    container: {
      position: 'absolute'
    },
    topLeft: {
      position: 'absolute',
      top: 0,
      left: 0
    },
    bottomRight: {
      position: 'absolute',
      bottom: 0,
      right: 0
    }
})