import React, { useEffect, useState } from 'react'
import { View, Text, Dimensions, ActivityIndicator, StyleSheet, TouchableOpacity, TouchableHighlight, Image } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FontAwesome, MaterialCommunityIcons, SimpleLineIcons, AntDesign } from '@expo/vector-icons'
import axios from 'axios'

export default function FloatLine(props) {
  const [loading, setLoading] = useState(true)
  const [float, setFloat] = useState({})
  const tokenSource = axios.CancelToken.source()
  const windowWidth = Dimensions.get('window').width

  useEffect(()=>{
    axios.post('http://192.168.86.22:5000/float/get_single_float', {id: props.float}, {cancelToken: tokenSource.token})
    .then(res=>{
      setFloat(res.data)
      setLoading(false)
    }).catch(err=>{console.log(err)})

    return () => tokenSource.cancel()
  },[])

  const submitVote = async (vote) => {
    if (float[vote].includes(props.user._id)) return
    let sells = [...float.sells],
        buys = [...float.buys],
        holds = [...float.holds],
        direction

    if (vote !== 'holds') holds = holds.filter(id => id.toString() !== props.user._id)
    if (vote !== 'sells') sells = sells.filter(id => id.toString() !== props.user._id)
    if (vote !== 'buys') buys = buys.filter(id => id.toString() !== props.user._id)

    if (vote === 'holds') holds.push(props.user._id)
    if (vote === 'sells') sells.push(props.user._id)
    if (vote === 'buys') buys.push(props.user._id)

    if (sells.length > buys.length && sells.length > holds.length) {
      direction = 'Sell'
    } else if (buys.length > sells.length && buys.length > holds.length) {
      direction = 'Buy'
    } else {
      direction = 'Hold'
    }

    let newFloat = {
      ...float,
      holds: holds,
      buys: buys,
      sells: sells,
      totalVotes: holds.length + buys.length + sells.length,
      direction: direction
    }

    setFloat({
      ...float,
      holds: holds,
      buys: buys,
      sells: sells,
      totalVotes: holds.length + buys.length + sells.length,
      direction: direction
    })

    let token = await AsyncStorage.getItem('@userToken')
    let keys = ['holds', 'buys', 'sells', 'totalVotes', 'direction']
    axios.post('http://192.168.86.22:5000/float/update', {float: newFloat, keys: keys}, {cancelToken: tokenSource.token, headers: {Authorization: `JWT ${token}`}})
    .then(res=>{
      
    }).catch(err=>{console.log(err)})

  }

  const getLabel = () => {
    let live = float.live ? 'Live ' : 'Static '
    if (float.assetCat === 'crypto') {
      return float.assetSymbol + ' ('+ float.direction +') '+float.assetName + ' - ' + live + float.dataType
    }
  }
  const getVoteStyles = (vote) => {
    let styler = {
      flex: 1,
      flexBasis: 1,
      alignItems: 'center',
      paddingVertical: 5,
    }
    if (float[vote].includes(props.user._id)) {
      styler.backgroundColor = hexToRGBA(colors.background, colors.primary, 0.4)
    } else {
      styler.backgroundColor = hexToRGBA(colors.background, colors.primary, 0.2)
    }
    return styler
  }

  return (
    <TouchableHighlight underlayColor={hexToRGBA(colors.background, colors.primary, 0.3)} onPress={()=>props.showFloat(float._id)}>
    <View style={{width: windowWidth, paddingVertical: 10}}>
      {loading ? (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: windowWidth}}>
        <ActivityIndicator size='small' color={colors.primary}/>
      </View>
      ) : (
        <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}}>
          <View>
            {float.author.profilePicture && float.author.profilePicture !== '' ? (
              <Image source={{ uri: float.author.profilePicture }} style={{width: 40, height: 40, borderRadius: 20}}/>
            ) : (
              <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'}}>
                <AntDesign name='question' color={colors.white} size={30}/>
              </View>
            )}
          </View>
          <View style={{flex: 1}}>
            <Text style={{
              color: float.sells.length > float.buys.length && float.sells.length > float.holds.length ? colors.error : float.buys.length > float.sells.length && float.buys.length > float.holds.length ? colors.green : colors.gray,
              fontSize: fontSizes.sm,
              fontWeight: '600',
              paddingLeft: 10
            }}>{getLabel()}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex: 1}}>
                <View style={{paddingHorizontal: 10}}>
                  <Text style={{
                    color: 'white',
                    fontSize: fontSizes.sm,
                    fontWeight: '600'
                  }}>
                    <Text style={{color: colors.primary}}>{float.author.username + '  '}</Text>
                    <Text>{float.title}</Text>
                  </Text>
                  <View style={{justifyContent: 'flex-start', flexDirection: 'row', flexWrap: 'wrap'}}>
                    <View style={styles.badgeGroup}>
                      <Text style={styles.badgeValue}>{float.totalComments + '  '}</Text>
                      <FontAwesome name='comment' color={colors.gray} size={14}/>
                    </View>
                    <View style={styles.badgeGroup}>
                      <Text style={styles.badgeValue}>{float.totalVotes + '  '}</Text>
                      <MaterialCommunityIcons name='poll' color={colors.gray} size={14}/>
                    </View>
                    <View style={styles.badgeGroup}>
                      <Text style={styles.badgeValue}>{float.totalBadges + '  '}</Text>
                      <SimpleLineIcons name='badge' color={colors.gray} size={14}/>
                    </View>
                    <View style={styles.badgeGroup}>
                      <Text style={styles.badgeValue}>{float.refloats + '  '}</Text>
                      <SimpleLineIcons name='share' color={colors.gray} size={14}/>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.voteBtnRow}>
                <TouchableOpacity style={getVoteStyles('buys')} onPress={()=>submitVote('buys')}>
                  <Text style={styles.voteBtnText}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity style={getVoteStyles('holds')} onPress={()=>submitVote('holds')}>
                  <Text style={styles.voteBtnText}>H</Text>
                </TouchableOpacity>
                <TouchableOpacity style={getVoteStyles('sells')} onPress={()=>submitVote('sells')}>
                  <Text style={styles.voteBtnText}>S</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  badgeGroup: {
    paddingVertical: 3,
    paddingRight: 20,
    flexDirection: 'row'
  },
  badgeText: {

  },
  badgeValue: {
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  badgeLabel: {
    fontSize: fontSizes.sm,
    color: colors.gray
  },
  voteBtnRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 5,
    width: 90,
  },
  voteBtn: {
    flex: 1,
    flexBasis: 1,
    alignItems: 'center',
  },
  voteBtnText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
})