import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, View, TouchableWithoutFeedback, TouchableHighlight, LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native'
import { colors, fontSizes, sizes } from '../../styles/Theme'
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
        <View style={styles.category}>
          <TouchableWithoutFeedback onPress={toggleCore}>
            <View style={styles.categoryHeader}>
              <Ionicons name={coreOpen ? 'caret-up' : 'caret-down'} color={colors.white} size={20}/>
              <Text style={styles.categoryHeaderText}>Core</Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={coreOpen ? [styles.categoryBody] : [styles.categoryBody, {height: 0}]}>
          {coreOpen ? (
            <>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={0.8} onPress={navigateTo('crypto')} style={styles.buttonContainer}>
              <View style={styles.button}>
                <FontAwesome5 name='coins' color={colors.white} size={20} style={styles.buttonIcon}/>
                <Text style={styles.buttonLabel}>Crypto</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
              <View style={styles.button}>
                <Ionicons name='analytics' color={colors.white} size={20} style={styles.buttonIcon}/>
                <Text style={styles.buttonLabel}>Stocks</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
              <View style={styles.button}>
                <FontAwesome5 name='building' color={colors.white} size={20} style={styles.buttonIcon}/>
                <Text style={styles.buttonLabel}>Companies</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
              <View style={styles.button}>
                <FontAwesome5 name='dollar-sign' color={colors.white} size={20} style={styles.buttonIcon}/>
                <Text style={styles.buttonLabel}>Hedge Funds</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
              <View style={styles.button}>
                <FontAwesome5 name='newspaper' color={colors.white} size={20} style={styles.buttonIcon}/>
                <Text style={styles.buttonLabel}>News</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={0.8} onPress={()=>{}} style={styles.buttonContainer}>
              <View style={styles.button}>
                <FontAwesome5 name='share-alt' color={colors.white} size={20} style={styles.buttonIcon}/>
                <Text style={styles.buttonLabel}>Social Media</Text>
              </View>
            </TouchableHighlight>
            </>
          ) : null}
          </View>
        </View>
        <View style={styles.category}>
          <TouchableWithoutFeedback onPress={toggleUserData}>
            <View style={styles.categoryHeader}>
              <Ionicons name={userDataOpen ? 'caret-up' : 'caret-down'} color={colors.white} size={20}/>
              <Text style={styles.categoryHeaderText}>User Data</Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={userDataOpen ? {} : {height: 0}}>
          {userDataOpen ? (
            <>
            <Text style={styles.buttonLabel}>Nothing here right now</Text>
            </>
          ) : null}
          </View>
        </View>
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
    borderRadius: 10, 
    marginHorizontal: 10,
    marginTop: 10,
    flexShrink: 1,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 10,
    // justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    // padding: 10,
    borderWidth: 1,
    borderColor: colors.primary
  },
  buttonLabel: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  buttonIcon: {
    width: 30
  }
})