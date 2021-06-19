import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import axios from 'axios'

export default function Stats(props){

  const [stats, setStats] = useState({
    open: 0,
    high: 0,
    low: 0,
    volume: 0,
    last: 0,
    volume_30day: 0
  })
  const [loading, setLoading] = useState(true)
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    if (!props.product) return

    const getStats = () => {
      axios.get('https://api.pro.coinbase.com/products/'+props.product+'/stats', {
        cancelToken: tokenSource.token
      })
      .then(res=>{
        if (!res.data.open) return
        setStats({
          open: res.data.open,
          high: res.data.high,
          low: res.data.low,
          volume: res.data.volume,
          last: res.data.last,
          volume_30day: res.data.volume_30day
        })
        setLoading(false)
      }).catch(err=>{
        if (err.response.status === 429) {
          setTimeout(() => {
            getStats()
          }, 500);
        }
      })
    }

    getStats()

    return () => tokenSource.cancel()
  }, [props.product])


  const withCommas = (x) => {
    x = Math.round(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  if (loading) {
    return <ActivityIndicator/>
  } else if (!stats.open) {
    return <Text style={{
      fontSize: fontSizes.md,
      color: colors.gray
    }}>Not available</Text>
  } else {
    return (
      <>
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
      </>
    )
  }
}

const styles = StyleSheet.create({
  statGroup: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center'
  },
  statGroupLabel: {
    color: colors.gray,
    fontSize: fontSizes.md,
    width: 130,
    textAlign: 'right',
    paddingRight: 10
  },
  statGroupValue: {
    color: colors.white,
    fontSize: fontSizes.md,
  }
})