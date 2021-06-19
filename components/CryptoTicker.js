import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import { FontAwesome } from '@expo/vector-icons'
import async from 'async'
import axios from 'axios'

export default function CryptoTicker(props) {
  const [price, setPrice] = useState(0)
  const [change, setChange] = useState(0)
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState(props.size || 'sm')
  const tokenSource = axios.CancelToken.source()
  
  
  useEffect(()=>{
    if (!props.product) return  

    const getInfo = () => {
      axios.post('http://192.168.86.22:5000/data/get_current_crypto', {id: props.product}, {
        cancelToken: tokenSource.token
      })
      .then(res=>{
        if (!res.data.price) return
        setPrice(res.data.price)
        setChange(Math.round((res.data.price - res.data.open_24h) * 100) / 100)
        setLoading(false)
      })
      .catch(err=>{
        console.log(err.response)
      })
    }

    getInfo()
    let clock = setInterval(()=>getInfo(), 1000)

    return () => {
      tokenSource.cancel()
      clearInterval(clock)
    }

  }, [props.product])


  const withCommas = (x) => {
    x = Math.round(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const getSymbol = () => {
    if (!props.product) return
    let idx = props.product.indexOf('-')
    return props.product.slice(0, idx)
  }

  if (loading) {
    return <ActivityIndicator/>
  } else if (!price || !change) {
    return <Text style={{
      fontSize: fontSizes.md,
      color: colors.gray,
      paddingHorizontal: 10,
    }}>Ticker not available</Text>
  } else { 
    return (
      <View style={styles.ticker}>
        <Text style={{
          fontSize: size === 'lg' ? fontSizes.xl : fontSizes.md,
          fontWeight: '600',
          marginRight: 5,
          color: change >=0 ? colors.green : colors.error
        }}>{getSymbol()}</Text>
        <Text style={{
          fontSize: size === 'lg' ? fontSizes.xl : fontSizes.md,
          color: change >=0 ? colors.green : colors.error
        }}>{'$'+withCommas(price)}</Text>
        <FontAwesome 
          name={change>=0 ? 'caret-up' : 'caret-down'} 
          color={change>=0 ? colors.green : colors.error}
          size={size === 'lg' ? 36 : 24}
          style={{marginHorizontal: size === 'lg' ? 10 : 5}}
        />
        <Text style={{
          fontSize: size === 'lg' ? fontSizes.xl : fontSizes.md,
          color: change >=0 ? colors.green : colors.error
        }}>{change}</Text>
      </View>
    )
  }

  
}

const styles = StyleSheet.create({
  ticker: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  symbol: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
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