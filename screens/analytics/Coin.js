import React, { useState, useEffect } from 'react'
import { Text, View, Animated, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import { useHistory, useLocation } from 'react-router-native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import async from 'async'

import TextInput from '../../components/TextInputSearch'
import { TouchableHighlight } from 'react-native-gesture-handler'
import CryptoChart from '../../components/CryptoChart'
import CryptoTicker from '../../components/CryptoTicker'


export default function Crypto(props) {
  const history = useHistory()
  const location = useLocation()
  const [pos, setPos] = useState(new Animated.Value(0))
  const [period, setPeriod] = useState('1hr')
  const [graphs, setGraphs] = useState({
    price: true,
    volume: false,
    candles: false
  })
  const [scroll, setScroll] = useState(true)
  const [details, setDetails] = useState({
    name: ''
  })
  const [ratings, setRatings] = useState({
    fcas: null,
    developer: null,
    marketMaturity: null,
    utility: null,
  })
  const [price, setPrice] = useState({
    amount: null,
    change: null
  })
  const [stats, setStats] = useState({
    open: 0,
    high: 0,
    low: 0,
    volume: 0,
    last: 0,
    volume_30day: 0
  })
  const [loading, setLoading] = useState(true)

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
    loadData()
  }, [])

  const loadData = () => {
    async.waterfall([
      (done)=>{
        axios.post('http://192.168.86.22:5000/data/get_crypto_currency', {symbol: location.state.currency})
        .then(res=>{
          setRatings({
            fcas: res.data.fcasScore,
            developer: res.data.developerScore,
            marketMaturity: res.data.marketMaturityScore,
            utility: res.data.utilityScore,
          })
          done(null)
        })
        .catch(err=>{
          console.log(err)
          done(null)
        })
      },
      (done)=>{
        let socket = new WebSocket('wss://ws-feed.pro.coinbase.com')
        let subscription = {
          type: 'subscribe',
          channels: [{
            name: 'ticker',
            product_ids: [location.state.product]
          }]
        }
        socket.onopen = () => {socket.send(JSON.stringify(subscription))}
        let val, opening
        socket.onmessage = (msg) => {
          let data = JSON.parse(msg.data)
          val = data.price
          opening = data.open_24h
        }
        const counter = setInterval(()=>{
          setPrice({
            amount: val, 
            change: Math.round(((val - opening) / opening) * 100) / 100
          })
        }, 2000)
        done(null)
        return () => {
          socket.close()
          clearInterval(counter)
        }
      },
      (done)=>{
        axios.get('https://api.pro.coinbase.com/products/'+location.state.product+'/stats')
          .then(res=>{
            setStats({
              open: res.data.open,
              high: res.data.high,
              low: res.data.low,
              volume: res.data.volume,
              last: res.data.last,
              volume_30day: res.data.volume_30day
            })
            done(null)
          }).catch(err=>done(null))
      }
    ], (err, result)=>{
      setLoading(false)
    })


  }

  const withCommas = (x) => {
    x = Math.round(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
            {['1hr', '24hr', '7d', '30d', '1yr', '5yr'].map((item, i)=>(
              <TouchableWithoutFeedback onPress={()=>setPeriod(item)} key={i}>
                <View style={period===item ? [styles.periodBtn, {backgroundColor: colors.primary}] : styles.periodBtn}>
                <Text style={styles.graphBtnText}>{item}</Text>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>
        <TouchableWithoutFeedback onPress={()=>{
          console.log('press in')
          setScroll(false)
          }} onPressOut={()=>{
            console.log('press out')
            setScroll(true)}}>
          <CryptoChart 
            width={1} 
            height={0.8}
            period={period}
            graphs={graphs}
            product={location.state.product}
          />
        </TouchableWithoutFeedback>
        <View style={styles.statsBody}>
          <View style={styles.catTitleGroup}>
            <Text style={styles.catTitle}>Ticker</Text>
          </View>
          <View style={styles.catBodyGroup}>
            <CryptoTicker product={details.product} symbol={details.currency}/>
          </View>
          <View style={styles.ticker}>
            <Text style={price.amount>=0 ? [styles.tickerText, {color: colors.green}] : [styles.tickerText, {color: colors.error}]}>{price.change+'%'}</Text>
            <View style={{paddingRight: 5}}/>
            <Text style={styles.tickerText}>{'$'+withCommas(price.amount)}</Text>
          </View>
          <View style={styles.catTitleGroup}>
            <Text style={styles.catTitle}>Health Index</Text>
          </View>
          <View style={styles.ratingGroup}>
            <Text style={styles.ratingLabel}>FCAS</Text>
            <View style={[styles.ratingCell, {backgroundColor: ratings.fcas > 900 ? '#88BE7D' : ratings.fcas > 750 ? '#BAD477' : ratings.fcas > 650 ? '#EBE971' : ratings.fcas > 500 ? '#E5A76B' : '#DE6565'}]}>
              <Text style={[styles.score]}>{ratings.fcas}</Text>
            </View>
            <Text style={[styles.rating, {color: ratings.fcas > 900 ? '#88BE7D' : ratings.fcas > 750 ? '#BAD477' : ratings.fcas > 650 ? '#EBE971' : ratings.fcas > 500 ? '#E5A76B' : '#DE6565'}]}>
              {ratings.fcas > 900 ? 'Superb' : ratings.fcas > 750 ? 'Attractive' : ratings.fcas > 650 ? 'Basic' : ratings.fcas > 500 ? 'Caution' : 'Fragile'}
            </Text>
          </View>
          <View style={styles.ratingGroup}>
            <Text style={styles.ratingLabel}>Developer Behavior</Text>
            <View style={[styles.ratingCell, {backgroundColor: ratings.developer > 900 ? '#88BE7D' : ratings.developer > 750 ? '#BAD477' : ratings.developer > 650 ? '#EBE971' : ratings.developer > 500 ? '#E5A76B' : '#DE6565'}]}>
              <Text style={[styles.score]}>{ratings.developer}</Text>
            </View>
            <Text style={[styles.rating, {color: ratings.developer > 900 ? '#88BE7D' : ratings.developer > 750 ? '#BAD477' : ratings.developer > 650 ? '#EBE971' : ratings.developer > 500 ? '#E5A76B' : '#DE6565'}]}>
              {ratings.developer > 900 ? 'Superb' : ratings.developer > 750 ? 'Attractive' : ratings.developer > 650 ? 'Basic' : ratings.developer > 500 ? 'Caution' : 'Fragile'}
            </Text>
          </View>
          <View style={styles.ratingGroup}>
            <Text style={styles.ratingLabel}>Market Maturity</Text>
            <View style={[styles.ratingCell, {backgroundColor: ratings.marketMaturity > 900 ? '#88BE7D' : ratings.marketMaturity > 750 ? '#BAD477' : ratings.marketMaturity > 650 ? '#EBE971' : ratings.marketMaturity > 500 ? '#E5A76B' : '#DE6565'}]}>
              <Text style={[styles.score]}>{ratings.marketMaturity}</Text>
            </View>
            <Text style={[styles.rating, {color: ratings.marketMaturity > 900 ? '#88BE7D' : ratings.marketMaturity > 750 ? '#BAD477' : ratings.marketMaturity > 650 ? '#EBE971' : ratings.marketMaturity > 500 ? '#E5A76B' : '#DE6565'}]}>
              {ratings.marketMaturity > 900 ? 'Superb' : ratings.marketMaturity > 750 ? 'Attractive' : ratings.marketMaturity > 650 ? 'Basic' : ratings.marketMaturity > 500 ? 'Caution' : 'Fragile'}
            </Text>
          </View>
          <View style={styles.ratingGroup}>
            <Text style={styles.ratingLabel}>User Activity/Utility</Text>
            <View style={[styles.ratingCell, {backgroundColor: ratings.utility > 900 ? '#88BE7D' : ratings.utility > 750 ? '#BAD477' : ratings.utility > 650 ? '#EBE971' : ratings.utility > 500 ? '#E5A76B' : '#DE6565'}]}>
              <Text style={[styles.score]}>{ratings.utility}</Text>
            </View>
            <Text style={[styles.rating, {color: ratings.utility > 900 ? '#88BE7D' : ratings.utility > 750 ? '#BAD477' : ratings.utility > 650 ? '#EBE971' : ratings.utility > 500 ? '#E5A76B' : '#DE6565'}]}>
              {ratings.utility > 900 ? 'Superb' : ratings.utility > 750 ? 'Attractive' : ratings.utility > 650 ? 'Basic' : ratings.utility > 500 ? 'Caution' : 'Fragile'}
            </Text>
          </View>
          <View style={styles.catTitleGroup}>
            <Text style={styles.catTitle}>24hr Statistics</Text>
          </View>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupLabel}>Open :</Text>
            <Text style={styles.statGroupValue}>{'$'+withCommas(stats.open)}</Text>
          </View>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupLabel}>High :</Text>
            <Text style={styles.statGroupValue}>{'$'+withCommas(stats.high)}</Text>
          </View>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupLabel}>Low :</Text>
            <Text style={styles.statGroupValue}>{'$'+withCommas(stats.low)}</Text>
          </View>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupLabel}>Last :</Text>
            <Text style={styles.statGroupValue}>{'$'+withCommas(stats.last)}</Text>
          </View>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupLabel}>Volume :</Text>
            <Text style={styles.statGroupValue}>{withCommas(stats.volume)}</Text>
          </View>
          <View style={styles.statGroup}>
            <Text style={styles.statGroupLabel}>Volume (30d) :</Text>
            <Text style={styles.statGroupValue}>{withCommas(stats.volume_30day)}</Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  )
}


const styles = StyleSheet.create({
  statsBody:{
    alignItems: 'flex-start'
  },
  statGroup: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center'
  },
  statGroupLabel: {
    color: colors.gray,
    fontSize: fontSizes.md,
    width: 120,
    textAlign: 'right',
    paddingRight: 10
  },
  statGroupValue: {
    color: colors.white,
    fontSize: fontSizes.md,
  },
  ratingGroup: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center'
  },
  ratingCell: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    borderRadius: 3,
    marginRight: 10,
  },
  score: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  rating: {
    fontSize: fontSizes.md,
    fontWeight: '600'
  },
  ratingLabel: {
    color: colors.gray,
    fontSize: fontSizes.md,
    width: 150,
    textAlign: 'right',
    paddingRight: 10
  },
  catTitle: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    marginTop: 10,
    fontWeight: '600',
  },
  catTitleGroup: {
    marginHorizontal: 10,
    borderBottomColor: colors.primary,
    borderBottomWidth: 0.7,
    alignSelf: 'stretch',
  },
  catBodyGroup: {
    margin: 10,
    alignItems: 'flex-start',
  },
  ticker: {
    flexDirection: 'row',
    padding: 10,
    margin: 10,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 5,
    flexShrink: 1,
    width: 150
  },
  tickerText: {
    color: colors.white,
    fontSize: fontSizes.md,
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
    flexDirection: 'row'
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