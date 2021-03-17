import React, { useEffect, useState, useContext } from 'react'
import { Image, Text, View, Animated, StyleSheet, TouchableWithoutFeedback, TouchableHighlight } from 'react-native'
import { AppContext } from '../../components/Context'
import Button from '../../components/Button'

// Styles
import {colors, fontSizes} from '../../styles/Theme'

export default function RootMain(props){
  const [position, setPosition] = useState(new Animated.Value(0))
  const { theme } = useContext(AppContext)

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
      <View style={styles.row}>  
        <Text style={[theme.header1, {color: colors.white}]}>Start moving the markets!</Text>
      </View>
      <View style={styles.row}>  
        <Text style={{color: colors.accent, fontSize: fontSizes.sm}}>Sign in with account</Text>
      </View>
      <View style={{alignItems: 'center', paddingTop: 40}}>
          <Button 
            activeOpacity={0.6} 
            size='lg' 
            text='Get Started' 
            underlayColor={colors.background} 
            backgroundColor={colors.primary} 
            width={200} 
            round={true} 
            action={()=>props.display('login')}
          />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  logo: {
    height: 70,
    maxHeight: 70,
    maxWidth: 300,
  },
  logoRow: {
    marginBottom: 80
  },
  row: {
    padding: 10,
    paddingLeft: 20,
  },
})