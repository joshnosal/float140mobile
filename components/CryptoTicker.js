import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import async from 'async'
import axios from 'axios'

export default function CryptoTicker(props) {
  const [price, setPrice] = useState(0)
  const [change, setChange] = useState(0)
  const [close, setClose] = useState(0)
  const tokenSource = axios.CancelToken.source()
  

  useEffect(()=>{
    setChange(Math.round((price - close) * 100) / 100)
  }, [price])
  
  useEffect(()=>{
    if (!props.product) return  


    let socket = new WebSocket('wss://ws-feed.pro.coinbase.com')
    let subscription = {
      type: 'subscribe',
      channels: [{
        name: 'ticker',
        product_ids: [props.product]
      }]
    }
    socket.onopen = () => socket.send(JSON.stringify(subscription))
    socket.onmessage = (msg) => {
      let data = JSON.parse(msg.data)
      setPrice(data.price)
    }
    

    async.waterfall([
      function getClosing(done){
        let start = new Date()
          start.setDate(start.getDate()-1, 0,0,0,0)
          axios.get('https://api.pro.coinbase.com/products/'+props.product+'/candles', {
            header: {'Content-Type': 'application/json'},
            params: {
              start: start.toISOString(),
              end: new Date().toISOString(),
              granularity: 86400
            },
            cancelToken: tokenSource.token
          }).then(res=>{
            setClose(res.data[0][4])
            done(null)
          }).catch(err=>{
            if (err.response && err.response.status === 429) {
              setTimeout(()=>getClosing(done), 500)
            } else {
              done(err)
            }
          })
      },
      (done) => {
        
        done(null)
      },
    ], (err, result)=>{
      // console.log(err)
    })

    return () => {
      tokenSource.cancel()
      socket.close()
    }

  }, [props.product])


  const withCommas = (x) => {
    x = Math.round(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }


  return (
    <View style={styles.ticker}>
      <Text style={change>=0 ? [styles.symbol, {color: colors.green}] : [styles.symbol, {color: colors.error}]}>{props.symbol}</Text>
      <Text style={styles.price}>{'$'+withCommas(price)}</Text>
      <Text style={change>=0 ? [styles.text, {color: colors.green}] : [styles.text, {color: colors.error}]}>{change}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  ticker: {
    flexDirection: 'row',
    padding: 10,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 5,
  },
  symbol: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: -2,
    marginRight: 5,
  },
  price: {
    color: colors.white,
    fontSize: fontSizes.md,
    marginRight: 5
  },
  text: {
    fontSize: fontSizes.md,
  }
})