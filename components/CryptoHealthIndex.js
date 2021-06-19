import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import axios from 'axios'

export default function HealthIndex(props){
  const [ratings, setRatings] = useState({
    fcas: 0,
    developer: 0,
    marketMaturity: 0,
    utility: 0,
  })
  const [loading, setLoading] = useState(true)
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    if (!props.product) return
    let idx = props.product.indexOf('-')
    let symbol = props.product.slice(0, idx)

    axios.post('http://192.168.86.22:5000/data/get_crypto_currency', {symbol: symbol}, {cancelToken: tokenSource.token})
    .then(res=>{
      setRatings({
        fcas: res.data.fcasScore,
        developer: res.data.developerScore,
        marketMaturity: res.data.marketMaturityScore,
        utility: res.data.utilityScore,
      })
      setLoading(false)
    })
    .catch(err=>{
      console.log(err)
    })

    return () => tokenSource.cancel()
  }, [props.product])

  const renderScore = (score) => {
    let color, text
    if (score > 900) { 
      color = colors.green
      text = 'Superb'
    } else if (score > 750) { 
      color = '#8ab40a' 
      text = 'Attractive'
    } else if (score > 650) { 
      color = '#ffd400'
      text = 'Basic'
    } else if (score > 500) { 
      color = '#e98218'
      text = 'Caution'
    } else { 
      color = colors.error
      text = 'Fragile'
    }
    
    return(
      <View style={{
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: color,
          padding: 5,
          borderRadius: 5,
          marginRight: 10
        }}>
          <Text style={{
            fontSize: fontSizes.sm,
            fontWeight: '600'
          }}>{score}</Text>
        </View>
        <Text style={{
          color: color,
          fontSize: fontSizes.md,
          fontWeight: '600'
        }}>{text}</Text>
      </View>
    )
  }

  if (loading) {
    return <ActivityIndicator/>
  } else if (ratings.fcas > 0) {
    return(
      <>
        <View style={styles.row}>
          <Text style={styles.label}>FCAS</Text>
          {renderScore(ratings.fcas)}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Developer</Text>
          {renderScore(ratings.developer)}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Maturity</Text>
          {renderScore(ratings.marketMaturity)}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Utility</Text>
          {renderScore(ratings.utility)}
        </View>
      </>
    )
  } else {
    return <Text style={{
      fontSize: fontSizes.md,
      color: colors.gray
    }}>Not available</Text>
  }
  
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5
  },
  label: {
    color: colors.gray,
    fontSize: fontSizes.md,
    fontWeight: '300',
    width: 100,
    textAlign: 'right',
    marginRight: 10
  },
  
})