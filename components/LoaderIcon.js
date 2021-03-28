import React, { useState, useEffect } from 'react'
import { View, Text, Animated, Image, StyleSheet } from 'react-native'

export default function LoaderBar(props){
  const [deg, setDeg] = useState(new Animated.Value(0))

  // useEffect(()=>{
  //   const rotate = () => {
  //     Animated.timing(

  //     )
  //     setTimeout(rotate(), 500)
  //   }
  //   rotate()
  // },[])

  return (
    <View>
      <Text>Hello</Text>
      <Image source={require('../assets/WhiteIconAnimation4.png')} style={styles.loadIcon}/>
      <View/>
      {/* <Image source={require('../assets/WhiteIconAnimation3.png')} style={styles.loadIcon}/> */}
      <Image source={require('../assets/WhiteIconAnimation2.png')} style={styles.loadIcon}/>
      <Image source={require('../assets/WhiteIconAnimation1.png')} style={styles.loadIcon}/>
    </View>
  )
}

const styles = StyleSheet.create({
  loadIcon: {
    height: 40,
    resizeMode: 'contain',
    // transform: [{scale: 0.02}],
    // resizeMode: 'contain',
    // position: 'absolute',
    // bottom: 0,
    // left: 0
  },
})
