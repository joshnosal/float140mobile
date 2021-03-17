import React, { useContext } from 'react'
import {View, Image, Text, StyleSheet} from 'react-native'

// Styles
import {colors, fontSizes} from '../styles/Theme'

export default function NoInternet(props) {

  return(
    <View style={styles.container}>
      <Image source={require('../assets/img/LogoWhite.png')} style={styles.logo} resizeMode="contain"/>
      <Text style={styles.message}>Please refresh your internet</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 80,
  },
  message: {
    paddingTop: 40,
    fontSize: fontSizes.md,
    color: colors.white
  }
})