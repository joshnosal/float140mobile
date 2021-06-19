import React, { useState, useEffect, useRef } from 'react'
import { Text, View, Animated, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ScrollView, TouchableHighlight, Dimensions, PixelRatio } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import { useHistory, useLocation } from 'react-router-native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import async from 'async'

import CryptoChartHOC from '../../components/CryptoChartHOC'
import CryptoChart from '../../components/CryptoChartold'
import CryptoTicker from '../../components/CryptoTicker'
import HealthIndex from '../../components/CryptoHealthIndex'
import Stats from '../../components/Crypto24hrStats'
import { captureRef } from 'react-native-view-shot'


export default function Crypto(props) {
  const history = useHistory()
  const location = useLocation()
  const [pos, setPos] = useState(new Animated.Value(0))
  const [getData, setGetData] = useState(false)
  const [period, setPeriod] = useState('1h')
  const [graphs, setGraphs] = useState({
    price: true,
    volume: false,
    candles: false
  })
  const [float, setFloat] = useState({
    type: null,
    live: false
  })
  const [scroll, setScroll] = useState(true)
  const [details, setDetails] = useState({
    name: null,
    currency: null,
    product: null
  })
  const [hasHealth, setHasHealth] = useState(false)
  const chartRef = useRef(null)
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    Animated.timing(pos, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()

    setDetails({
      ...details, 
      name: location.state.name,
      currency: location.state.currency,
      product: location.state.product,
    })
  }, [])

  useEffect(()=>{
    if (!details.currency) return
    axios.post('http://192.168.86.22:5000/data/get_crypto_currency', {symbol: details.currency}, {cancelToken: tokenSource.token})
    .then(res=>{
      if (res.data.fcasScore > 0) setHasHealth(true)
    })
    .catch(err=>console.log(err))
    return () => tokenSource.cancel()
  })

  const useChartData = (data) => {
    floatChart('static', data)
  }

  const floatChart = async (live, data) => {
    if (live === 'live') {
      history.push({
        pathname: '/floating',
        state: {
          dataType: 'chart',
          assetCat: 'crypto',
          live: true,
          period: period,
          graphs: graphs,
          details: details
        }
      })
    } else  {
      history.push({
        pathname: '/floating',
        state: {
          dataType: 'chart',
          assetCat: 'crypto',
          live: false,
          period: period,
          graphs: graphs,
          details: details,
          data: data,
          time: new Date()
        }
      })
    }
  }

  const floatTicker = () => {
    history.push({
      pathname: '/floating',
      state: {
        dataType: 'ticker',
        assetCat: 'crypto',
        live: true,
        details: details
      }
    })
  }

  const floatHealth = () => {
    history.push({
      pathname: '/floating',
      state: {
        dataType: 'health index',
        assetCat: 'crypto',
        live: true,
        details: details
      }
    })
  }

  const floatStats = () => {
    history.push({
      pathname: '/floating',
      state: {
        dataType: '24hr stats',
        assetCat: 'crypto',
        live: true,
        details: details
      }
    })
  }


  return (
    <Animated.View style={[styles.container, {transform: [{translateX: pos.interpolate({
      inputRange: [0,1],
      outputRange: [600, 0]
    })}]}]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={()=>history.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{details.name}</Text>
      </View>
      <ScrollView style={styles.body} scrollEnabled={scroll}>
        <View style={styles.catTitleGroup}>
          <Text style={styles.catTitle}>Chart</Text>
          <View style={styles.floatBtn}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 3}} onPress={()=>floatChart('live')}>
              <>
              <Ionicons name='cloud-upload-outline' color='white' size={18}/>
              <Text style={styles.floatBtnText}>Live</Text>
              </>
            </TouchableOpacity>
          </View>
          <View style={styles.floatBtn}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 3}} onPress={()=>setGetData(true)}>
              <>
              <Ionicons name='cloud-upload-outline' color='white' size={18}/>
              <Text style={styles.floatBtnText}>Static</Text>
              </>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.graphBtnRow}>
          <TouchableOpacity style={graphs.price ? [styles.graphBtn, {backgroundColor: colors.primary}] : styles.graphBtn} onPress={()=>setGraphs({...graphs, price: !graphs.price})}>
            <Text style={styles.graphBtnText}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity style={graphs.volume ? [styles.graphBtn, {backgroundColor: colors.primary}] : styles.graphBtn} onPress={()=>setGraphs({...graphs, volume: !graphs.volume})}>
            <Text style={styles.graphBtnText}>Volume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={graphs.candles ? [styles.graphBtn, {backgroundColor: colors.primary}] : styles.graphBtn} onPress={()=>setGraphs({...graphs, candles: !graphs.candles})}>
            <Text style={styles.graphBtnText}>Candles</Text>
          </TouchableOpacity>
          <View style={{flexGrow: 1}}/>
          <View style={styles.periodGroup}>
            {['1h', '24h', '7d', '30d', '1y', '5y'].map((item, i)=>(
              <TouchableWithoutFeedback onPress={()=>setPeriod(item)} key={i}>
                <View style={period===item ? [styles.periodBtn, {backgroundColor: colors.primary}] : styles.periodBtn}>
                <Text style={styles.graphBtnText}>{item}</Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>
        <View ref={(e)=>{chartRef.current = e}}>
          <CryptoChartHOC 
            width={1} 
            height={0.8}
            period={period}
            graphs={graphs}
            details={details}
            float={float}
            getData={getData}
            sendData={useChartData}
          />
        </View>
        <View style={styles.statsBody}>
          <View style={styles.catTitleGroup}>
            <Text style={styles.catTitle}>Ticker</Text>
            <View style={styles.floatBtn}>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 3}} onPress={()=>floatTicker()}>
                <>
                <Ionicons name='cloud-upload-outline' color='white' size={18}/>
                <Text style={styles.floatBtnText}>Live</Text>
                </>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.catBodyGroup}>
            <CryptoTicker product={details.product} symbol={details.currency}/>
          </View>
          <View style={styles.catTitleGroup}>
            <Text style={styles.catTitle}>Health Index</Text>
            {hasHealth ? (
            <View style={styles.floatBtn}>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 3}} onPress={()=>floatHealth()}>
                <>
                <Ionicons name='cloud-upload-outline' color='white' size={18}/>
                <Text style={styles.floatBtnText}>Live</Text>
                </>
              </TouchableOpacity>
            </View>
            ) : null }
          </View>
          <View style={styles.catBodyGroup}>
            <HealthIndex product={details.product} symbol={details.currency}/>
          </View>
          <View style={styles.catTitleGroup}>
            <Text style={styles.catTitle}>24hr Statistics</Text>
            <View style={styles.floatBtn}>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 3}} onPress={()=>floatStats()}>
                <>
                <Ionicons name='cloud-upload-outline' color='white' size={18}/>
                <Text style={styles.floatBtnText}>Live</Text>
                </>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.catBodyGroup}>
            <Stats product={details.product}/>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  )
}


const styles = StyleSheet.create({
  floatBtn: {
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
    // backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
    overflow: 'hidden'
  },
  floatBtnText: {
    color: 'white',
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginHorizontal: 3
  },
  statsBody:{
    alignItems: 'flex-start'
  },
  catTitle: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 'auto'
  },
  catTitleGroup: {
    marginHorizontal: 10,
    marginTop: 10,
    borderBottomColor: colors.primary,
    borderBottomWidth: 0.7,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  catBodyGroup: {
    margin: 10,
    alignItems: 'flex-start',
  },
  container: {
    flex: 1
  },
  header: {
    height: sizes.headerHeight,
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontWeight: '600'
  },
  backBtn: {
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: fontSizes.md,
  },
  body: {
    flex: 1,
    flexGrow: 1,
  },
  graphBtnRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    flexWrap: 'wrap', 
  },
  graphBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm
  },
  graphBtn: {
    borderRadius: 5,
    borderColor: colors.primary,
    borderWidth: 1,
    margin: 3,
    paddingHorizontal: 5,
    paddingVertical: 3
  },
  periodGroup: {
    borderRadius: 5,
    borderColor: colors.primary,
    borderWidth: 1,
    margin: 3,
    flexDirection: 'row'
  },
  periodBtn: {
    paddingHorizontal: 5,
    paddingVertical: 3
  },
})