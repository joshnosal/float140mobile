import React, { useState, useEffect, useContext } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Animated, FlatList } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import { useHistory, useLocation } from 'react-router-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import MyFloats from './MyFloats'
import AllFloats from './AllFloats'
import TrendingFloats from './TrendingFloats'
import FloatDisplay from '../../components/FloatDisplay'
import { AppContext } from '../../components/Context'

export default function FloatsMain(props){
  const { user, checkUser } = useContext(AppContext)
  const history = useHistory()
  const location = useLocation()
  const windowWidth = Dimensions.get('window').width
  const windowHeight = Dimensions.get('window').height
  const [display, setDisplay] = useState(location.state && location.state.display ? location.state.display : 'all')
  const [navPos, setNavPos] = useState(new Animated.Value(0))
  const [floatID, setFloatID] = useState()
  const [floatPos, setFloatPos] = useState(new Animated.Value(0))

  // Animate hortizontal nav
  useEffect(()=>{
    let val = 0
    if (display === 'mine') val = 2
    if (display === 'trending') val = 1

    Animated.timing(navPos, {
      toValue: val,
      duration: 300,
      useNativeDriver: true
    }).start()

  }, [display])

  useEffect(()=>{
    let val = floatID ? 1 : 0
    Animated.timing(floatPos, {
      toValue: val,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [floatID])

  const showFloat = (id) => {
    setFloatID(id)
  }

  


  return (
    <View style={{flex: 1, position: 'relative'}}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={()=>setDisplay('all')}>
          <Text style={[styles.navBarText, {width: windowWidth / 3}]}>All Floats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setDisplay('trending')}>
          <Text style={[styles.navBarText, {width: windowWidth / 3}]}>Trending</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setDisplay('mine')}>
          <Text style={[styles.navBarText, {width: windowWidth / 3}]}>My Floats</Text>
        </TouchableOpacity>
        <Animated.View style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: windowWidth / 3,
          borderBottomColor: colors.primary,
          borderBottomWidth: 2,
          transform: [{translateX: navPos.interpolate({
            inputRange: [0,2],
            outputRange: [0, windowWidth * (2/3)]
          })}]
        }}/>
      </View>
      <Animated.View style={{
        flex: 1, 
        flexDirection: 'row', 
        width: windowWidth * 3,
        transform: [{translateX: navPos.interpolate({
          inputRange: [0,2],
          outputRange: [0, -windowWidth*2]
        })}]
      }}>
        <View style={[styles.bodyFrame, {width: windowWidth}]}>
          {display === 'all' ? <AllFloats showFloat={showFloat} user={user}/> : null}
        </View>
        <View style={[styles.bodyFrame, {width: windowWidth}]}>
          {display === 'trending' ? <TrendingFloats showFloat={showFloat} user={user}/> : null}
        </View>
        <View style={[styles.bodyFrame, {width: windowWidth}]}>
          {display === 'mine' ? <MyFloats showFloat={showFloat} user={user}/> : null}
        </View>
      </Animated.View>
      <Animated.View style={[
        styles.floatSlider, 
        {transform: [{translateY: floatPos.interpolate({
          inputRange: [0,1],
          outputRange: [windowHeight, 0]
        })}]}
      ]}>
        <FloatDisplay showFloat={showFloat} id={floatID} user={user}/>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBar: {
    position: 'relative',
    height: sizes.headerHeight,
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBarText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
  floatSlider: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    zIndex: 20,
    bottom: 0,
    backgroundColor: hexToRGBA(colors.background, colors.primary, 0.1),
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  }
})