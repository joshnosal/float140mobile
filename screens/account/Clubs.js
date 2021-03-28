import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Animated } from 'react-native'
import { colors, fontSizes, hexToRGBA } from '../../styles/Theme'
import { Switch, Route, useHistory } from 'react-router-native'

import ButtonHighlight from '../../components/ButtonHighlight'
import ButtonOpacity from '../../components/ButtonOpacity'

export default function MyClubs(props){
  const history = useHistory()
  const [bodyPos, setBodyPos] = useState(new Animated.Value(0))

  useEffect(()=>{
    Animated.timing(bodyPos, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const printSomething = () => {
    console.log('printing')
  }

  return(
    <>
    <View style={styles.header}>
      <Text style={styles.headerText}>My Clubs</Text>
    </View>
    <Animated.View style={[styles.body, {
      transform: [{translateY: bodyPos.interpolate({
        inputRange: [0,1],
        outputRange: [1200, 0]
      })}]
    }]}>
      <Switch>
        <Route exact path={`${props.match.path}/`}>
          <View>
            <ButtonHighlight
              text='New Club'
              size='md'
              backgroundColor={colors.primary}
              underlayColor={colors.background}
              width={200}
              round={true}
              action={printSomething}
              activeOpacity={0.8}
            />
          </View>
        </Route>
        <Route path={`${props.match.path}/new_club`}>
          <View>
            <ButtonHighlight
              text='Cancel'
              size='md'
              // backgroundColor={colors.primary}
              width={200}
              round={true}
              action={printSomething}
              activeOpacity={0.8}
            />
          </View>
        </Route>
      </Switch>
    </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5
  },
  headerText: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    color: colors.white
  },
  body: {
    flex: 1,
  }
})
