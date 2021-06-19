import React, { useState, useEffect} from 'react'
import { View, Text, StyleSheet, Dimensions, Image, ActivityIndicator, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import { useHistory, useLocation } from 'react-router-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CryptoTicker from './CryptoTicker'
import CryptoChart from './CryptoChartHOC'
import CryptoHealthIndex from './CryptoHealthIndex'
import Crypto24hrStats from './Crypto24hrStats'

export default function FloatIcon(props){
  const history = useHistory()
  const windowWidth = Dimensions.get('window').width
  const [boardHeight, setBoardHeight] = useState(windowWidth * 0.8)
  const tokenSource = axios.CancelToken.source()
  const [float, setFloat] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    axios.post('http://192.168.86.22:5000/float/get_single_float', {id: props.float}, {cancelToken: tokenSource.token})
    .then(res=>{
      setFloat(res.data)
      setSize(res.data.dataType)
      setLoading(false)
    }).catch(err=>{console.log(err)})

    return () => tokenSource.cancel()
  },[])

  const setSize = (type) => {
    if (type === 'ticker') {
      setBoardHeight(100)
    } else if (type === 'health index') {
      setBoardHeight(190)
    } else if (type === '24hr stats') {
      setBoardHeight(215)
    } else {
      setBoardHeight(windowWidth * 0.8)
    }
  }


  const submitVote = async (vote) => {
    if (float[vote].includes(props.user._id)) return
    let sells = [...float.sells],
        buys = [...float.buys],
        holds = [...float.holds],
        direction

    if (vote !== 'holds') holds = holds.filter(id => id !== props.user._id)
    if (vote !== 'sells') sells = sells.filter(id => id !== props.user._id)
    if (vote !== 'buys') buys = buys.filter(id => id !== props.user._id)

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

  const reFloat = () => {
    let state = {
      dataType: float.dataType,
      assetCat: float.assetCat,
      live: float.live,
      image: float.sketchImage,
      details: float.details,
      originalFloat: float._id,
    }
    if (float.dataType === 'chart') {
      state.period = float.period
      state.graphs = float.graphs
      if (!float.live) {
        state.data = float.data.array
        state.time = float.data.time
      }
    }

    history.push({
      pathname: '/floating',
      state: state
    })
  }

  const getTicker = () => {
    if (float.assetCat === 'crypto') {
      return <CryptoTicker product={float.details.product} symbol={float.details.currency}/>
    }
  }
  const getDataDisplay = () => {
    if (float.dataType === 'chart') {
      if (float.assetCat === 'crypto') {
        return (
          <CryptoChart 
            width={1} 
            height={0.8} 
            period={float.period} 
            graphs={float.graphs} 
            details={float.details} 
            data={float.live ? undefined : float.data.array}
          />
        )
      }
    } else if (float.dataType === 'ticker') {
      if (float.assetCat === 'crypto') {
        return (
          <TouchableWithoutFeedback>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <CryptoTicker product={float.details.product} symbol={float.details.currency} size='lg'/>
            </View>
          </TouchableWithoutFeedback>
        )
      }
    } else if (float.dataType === 'health index') {
      if (float.assetCat === 'crypto') {
        return (
          <TouchableWithoutFeedback>
            <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
              <CryptoHealthIndex product={float.details.product} symbol={float.details.currency}/>
            </View>
          </TouchableWithoutFeedback>
        )
      }
    } else if (float.dataType === '24hr stats') {
      if (float.assetCat === 'crypto') {
        return (
          <TouchableWithoutFeedback>
            <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
              <Crypto24hrStats product={float.details.product}/>
            </View>
          </TouchableWithoutFeedback>
        )
      }
    }
    
  }
  const getLabel = () => {
    if (float.assetCat === 'crypto') {
      return float.details.currency + ' ('+ getVote() +') - '+float.details.name
    }
  }
  const getVote = () => {
    if (float.sells.length > float.buys.length && float.sells.length > float.holds.length) {
      return 'Sell'
    } else if (float.buys.length > float.sells.length && float.buys.length > float.holds.length) {
      return 'Buy'
    } else {
      return 'Hold'
    }
  }
  const getDate = () => {
    let date = new Date(float.data.time)
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let month = months[date.getMonth()]
    let minutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()
    let hours = date.getHours() < 10 ? '0'+date.getHours() : date.getHours()
    let ampm = date.getHours() < 12 ? 'a.m.' : 'p.m.'
    return month+'-'+date.getDate()+'-'+date.getFullYear()+' @'+hours+':'+minutes+' '+ampm
  }

  const styleNumber = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  const getVoteStyles = (vote) => {
    let styler = {
      flex: 1,
      flexBasis: 1,
      alignItems: 'center',
      paddingVertical: 5
    }
    if (float[vote].includes(props.user._id)) {
      styler.backgroundColor = hexToRGBA(colors.background, colors.primary, 0.4)
    } else {
      styler.backgroundColor = hexToRGBA(colors.background, colors.primary, 0.2)
    }
    return styler
  }

  return (
    <View style={{width: windowWidth, marginVertical: 10}}>
      {loading ? (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: windowWidth}}>
        <ActivityIndicator size='small' color={colors.primary}/>
      </View>
      ) : (
      <View style={{flex: 1}}>
        {/* TITLE */}
        <Text style={{
          color: float.sells.length > float.buys.length && float.sells.length > float.holds.length ? colors.error : float.buys.length > float.sells.length && float.buys.length > float.holds.length ? colors.green : colors.gray,
          fontSize: fontSizes.md,
          fontWeight: '600',
          paddingHorizontal: 10
        }}>{getLabel()}</Text>
        <View style={{paddingHorizontal: 10}}>
          <Text style={{
            color: 'white',
            fontSize: fontSizes.sm,
            fontWeight: '600'
          }}>
            <Text style={{color: colors.primary}}>{float.author.username + '  '}</Text>
            <Text>{float.title}</Text>
          </Text>
          {float.message ? (
          <Text style={{
            color: colors.white,
            fontSize: fontSizes.sm,
          }}>{float.message}</Text>
          ) : null}
        </View>
        <View style={{position: 'relative', height: boardHeight}}>
          {/* TICKER */}
          {float.showTicker ? (
            <View style={{position: 'absolute', width: windowWidth, justifyContent: 'center', height: 60, marginHorizontal: 0, top: 12}}>
              {getTicker()}
            </View> 
          ): null}
          {/* TIME STAMP */}
            <Text style={{color: colors.primary, fontSize: fontSizes.sm, position: 'absolute', left: 10, top: 10}}>
              {float.live ? 'Live '+float.dataType : getDate()}
            </Text>
          {/* SKETCH */}
          <View style={{position: 'absolute', width: windowWidth, height: boardHeight, zIndex: 1, elevation: 1}} pointerEvents='box-none'>
            <Image source={{ uri: float.sketchImage}} style={{width: '100%', height: '100%'}} pointerEvents='box-none'/>
          </View>
          {/* LIVE GRAPH */}
          <View style={{position: 'absolute', width: windowWidth, height: boardHeight}}>
            {getDataDisplay()}
          </View>
        </View>
        {/* VOTE ROW */}
        <View style={styles.voteBtnRow}>
          <TouchableOpacity style={getVoteStyles('buys')} onPress={()=>submitVote('buys')}>
            <Text style={styles.voteBtnCount}>{styleNumber(float.buys.length)}</Text>
            <Text style={styles.voteBtnText}>BUY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={getVoteStyles('holds')} onPress={()=>submitVote('holds')}>
            <Text style={styles.voteBtnCount}>{styleNumber(float.holds.length)}</Text>
            <Text style={styles.voteBtnText}>HOLD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={getVoteStyles('sells')} onPress={()=>submitVote('sells')}>
            <Text style={styles.voteBtnCount}>{styleNumber(float.sells.length)}</Text>
            <Text style={styles.voteBtnText}>SELL</Text>
          </TouchableOpacity>
        </View>

        {/* ACTION ROW */}
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity 
            onPress={()=>props.showFloat(float._id)}
            style={{
              flexBasis: 1, 
              flex: 1, 
              alignItems: 'center',
              backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
              marginHorizontal: 10,
              marginVertical: 5,
              borderRadius: 10,
            }}
          >
            <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600', padding: 5 }}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>reFloat()}
            style={{
              flexBasis: 1, 
              flex: 1, 
              alignItems: 'center',
              backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
              marginHorizontal: 10,
              marginVertical: 5,
              borderRadius: 10,
            }}
          >
            <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600', padding: 5 }}>Float</Text>
          </TouchableOpacity>
        </View>


        {/* COMMENTS */}
        <View style={styles.commentRow}>
          <TouchableHighlight style={styles.commentBtn} underlayColor={colors.primary} onPress={()=>props.showFloat(float._id)}>
            <Text style={styles.commentBtnText}>
              <Text>{float.totalComments || 0}</Text>
              <Text> Comments</Text>
            </Text>
          </TouchableHighlight>
        </View>
      </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  voteBtnRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 5
  },
  voteBtn: {
    flex: 1,
    flexBasis: 1,
    alignItems: 'center',
  },
  voteBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '600'
  },
  voteBtnCount: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '300'
  },
  commentRow: {
    alignItems: 'center',
    marginVertical: 5
  },
  commentBtn: {
    padding: 5,
    width: Dimensions.get('window').width * 0.7,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center'
  },
  commentBtnText: {
    fontSize: fontSizes.md,
    color: colors.white,
  }
})