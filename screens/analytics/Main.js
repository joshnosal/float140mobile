import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, View, TouchableWithoutFeedback, TouchableHighlight, LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native'
import { colors, fontSizes, hexToRGBA, sizes } from '../../styles/Theme'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useLocation, useHistory } from 'react-router-native'

export default function Main(props) {
  const history = useHistory()
  const [coreOpen, setCoreOpen] = useState(true)
  const [userDataOpen, setUserDataOpen] = useState(false)
  if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental(true)

  const toggleCore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCoreOpen(!coreOpen)
  }

  const toggleUserData = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setUserDataOpen(!userDataOpen)
  }

  const navigateTo = (prop) => () =>{
    history.push(props.match.url + '/' + prop)
  }
  

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Analytics</Text>
      </View>
      <ScrollView style={styles.body}>
        <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.5)} activeOpacity={0.8} onPress={navigateTo('crypto')} style={styles.buttonContainer}>
          <View style={styles.button}>
            <FontAwesome5 name='coins' color={colors.white} size={26} style={styles.buttonIcon}/>
            <Text style={styles.buttonLabel}>Crypto</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.5)} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
          <View style={styles.button}>
            <Ionicons name='analytics' color={colors.white} size={26} style={styles.buttonIcon}/>
            <Text style={styles.buttonLabel}>Stocks</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.5)} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
          <View style={styles.button}>
            <FontAwesome5 name='building' color={colors.white} size={26} style={styles.buttonIcon}/>
            <Text style={styles.buttonLabel}>Companies</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.5)} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
          <View style={styles.button}>
            <FontAwesome5 name='dollar-sign' color={colors.white} size={26} style={styles.buttonIcon}/>
            <Text style={styles.buttonLabel}>Hedge Funds</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.5)} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
          <View style={styles.button}>
            <FontAwesome5 name='newspaper' color={colors.white} size={26} style={styles.buttonIcon}/>
            <Text style={styles.buttonLabel}>News</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.5)} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
          <View style={styles.button}>
            <FontAwesome5 name='share-alt' color={colors.white} size={26} style={styles.buttonIcon}/>
            <Text style={styles.buttonLabel}>Social Media</Text>
          </View>
        </TouchableHighlight>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    height: sizes.headerHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5
  },
  headerText: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600'
  },
  body: {
    flex: 1,
    paddingVertical: 10
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    margin: 10,
    borderBottomColor: colors.primary,
    borderBottomWidth: 0.5,
    paddingVertical: 5
  },
  categoryHeaderText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 10
  },
  categoryBody: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  buttonContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3)
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  buttonLabel: {
    color: colors.white,
    fontSize: fontSizes.xl,
    fontWeight: '400',
  },
  buttonIcon: {
    width: 60,
    textAlign: 'center'
  }
})