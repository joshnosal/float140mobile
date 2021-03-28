import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Text, View, Animated, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, FlatList } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import { useHistory } from 'react-router-native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import async from 'async'

import TextInput from '../../components/TextInputSearch'
import { TouchableHighlight } from 'react-native-gesture-handler'

function Item({item, update, updateStats, match}){
  const [price, setPrice] = useState()
  const [change, setChange] = useState()
  const tokenSource = axios.CancelToken.source()
  const history = useHistory()

  useEffect(()=>{
    getStats()
    return () => tokenSource.cancel()
  }, [update])

  const getStats = () => {
    axios.get('https://api.pro.coinbase.com/products/'+item.product+'/stats', {cancelToken: tokenSource.token})
      .then(res=>{
        let newPrice = Number(res.data.last),
            newChange = Math.round(( (Number(res.data.last) - Number(res.data.open)) / Number(res.data.open)) * 10000 ) / 100 
        setPrice(newPrice)
        setChange(newChange)
        updateStats(item.product, newPrice, newChange)
      })
      .catch(err=>{
        if (err.response && err.response.status === 429) {
          setTimeout(()=>{
            getStats()
          },500)
        }
      })
  }

  const toDollars = (x) => {
    if (!x) return '-'
    x = Math.round(x * 100) / 100
    return '$'+x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const toPercentage = (x) => {
    if (!x) return '-'
    x = Math.round(x * 100) / 100
    return x + '%'
  }

  return(
    <TouchableHighlight onPress={()=>{
      let idx = match.path.indexOf('crypto')
      let path = match.path.slice(0, idx)
      history.push({
        pathname: path+'coin', 
        state: {
          product: item.product, 
          name: item.name, 
          currency: item.currency}
      })
    }} underlayColor={hexToRGBA(colors.background, colors.primary, 0.2)} style={styles.tableRow}>
      <>
        <View style={{flexBasis: 1, flexGrow: 3}}>
          <Text style={styles.currencyID}>{item.currency}</Text>
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
        <View style={{flexBasis: 1, flexGrow: 2, alignItems: 'center'}}>
          <Text style={styles.currencyPrice}>{toDollars(price)}</Text>
        </View>
        <View style={{flexBasis: 1, flexGrow: 2, alignItems: 'center'}}>
          <Text style={change>0 ? styles.currencyChangePos : styles.currencyChangeNeg}>{change ? change+'%' : '-'}</Text>
        </View>
      </>
    </TouchableHighlight>
  )
}

export default function Crypto(props) {
  const history = useHistory()
  const [pos, setPos] = useState(new Animated.Value(0))
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(null)
  const [currencies, setCurrencies] = useState([])
  const [filteredCurrencies, setFilteredCurrencies] = useState([])
  const [index, setIndex] = useState([])
  const [stats, setStats] = useState({})
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [update, setUpdate] = useState(false)

  
  useEffect(()=>{
    Animated.timing(pos, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  useEffect(()=>{
    async.waterfall([
      (done)=>{
        axios.get('https://api.pro.coinbase.com/products')
          .then(res=>{
            let list = []
            res.data.map((item)=>{
              let obj = {}
              if (item.id.includes('-USD') && !item.id.includes('-USDC')) {
                obj.product = item.id,
                obj.currency = item.base_currency
                list.push(obj)
              }
            })
            done(null, list)
          }).catch(err=>done(err))
      },
      async (products, done) => {
        axios.get('https://api.pro.coinbase.com/currencies')
        .then(res=>{
          done(null, products, res.data)
        }).catch(err=>done(err))
      },
      (products, currencies, done)=>{
        for (let i=0; i<products.length; i++) {
          for (let j=0; j<currencies.length; j++) {
            if (products[i].currency === currencies[j].id) {
              products[i].name = currencies[j].name
            }
          }
        }
        done(null, products)
      }
    ], (err, products)=>{
      if (err) {
        console.log(err)
        setLoading(false)
        setCurrencies([])
      } else {
        products = stortByName(products, 'asc')
        setCurrencies(products)
        setLoading(false)
      }
    })
  }, [])

  useEffect(()=>{
    if (!search) {
      setFilteredCurrencies(currencies)
    } else {
      let array = [...currencies]
      let result = [...currencies].filter(item => JSON.stringify(item).includes(search))
      setFilteredCurrencies(result)
    }
  }, [currencies, search])

  const updateStats = (product, price, change) => {
    let array = [...currencies]
    for (let i=0; i<array.length; i++) {
      if (array[i].product === product) {
        array[i].price = price
        array[i].change = change
      }
    }
  }


  const stortByName = (list, curDir) => {
    if (sortBy === 'name' && curDir === 'des') {
      list.sort((a, b)=>(a.currency > b.currency ? -1 : a.currency < b.currency ? 1 : 0))
      setSortDir('asc')
    } else {
      list.sort((a, b)=>(a.currency > b.currency ? 1 : a.currency < b.currency ? -1 : 0))
      setSortDir('des')
    }
    setSortBy('name')
    return list
  }

  const sortByPrice = (list, curDir) => {
    if (sortBy === 'price' && curDir === 'des' ) {
      list.sort((a, b)=>(a.price > b.price ? 1 : a.price < b.price ? -1 : 0))
      setSortDir('asc')
    } else {
      list.sort((a, b)=>(a.price > b.price ? -1 : a.price < b.price ? 1 : 0))
      setSortDir('des')
    }
    setSortBy('price')
    return list
  }

  const sortByChange = (list, curDir) => {
    if (sortBy === 'change' && curDir === 'des' ) {
      list.sort((a, b)=>(a.change > b.change ? 1 : a.change < b.change ? -1 : 0))
      setSortDir('asc')
    } else {
      list.sort((a, b)=>(a.change > b.change ? -1 : a.change < b.change ? 1 : 0))
      setSortDir('des')
    }
    setSortBy('change')
    return list
  }


  const renderItem = ({item}) =>(<Item item={item} update={update} updateStats={updateStats} match={props.match}/>)

  return (
    <Animated.View style={[styles.container, {transform: [{translateX: pos.interpolate({
      inputRange: [0,1],
      outputRange: [600, 0]
    })}]}]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={()=>history.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Cryptocurrencies</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.searchRow}>
          <TextInput onChangeText={(text)=>setSearch(text)}/>
          <TouchableOpacity style={{paddingHorizontal: 10}} onPress={()=>setUpdate(!update)}>
            <Ionicons name="refresh" color={colors.white} size={30}/>
          </TouchableOpacity>
        </View>
        <View style={styles.tableHeaderRow}>
          <TouchableOpacity onPress={()=>{stortByName(currencies, sortDir)}} style={{flexBasis: 1, flexGrow: 3}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.tableHeaderText]}>Name</Text>
              {sortBy==='name' ? <Ionicons name={sortDir==='asc' ? 'caret-up' : 'caret-down'} size={18} color={colors.white}/> : null }
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{sortByPrice(currencies, sortDir)}} style={{flexBasis: 1, flexGrow: 3}}>
            <View style={{alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.tableHeaderText]}>Price</Text>
              {sortBy==='price' ? <Ionicons name={sortDir==='asc' ? 'caret-up' : 'caret-down'} size={18} color={colors.white}/> : null }
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{sortByChange(currencies, sortDir)}} style={{flexBasis: 1, flexGrow: 3}}>
            <View style={{flexBasis: 1, flexGrow: 2, alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.tableHeaderText]}>Change</Text>
              {sortBy==='change' ? <Ionicons name={sortDir==='asc' ? 'caret-up' : 'caret-down'} size={18} color={colors.white}/> : null }
            </View>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadContainer}>
            <ActivityIndicator color={colors.primary} size='large'/>
          </View>
        ) : (
          <FlatList
            data={filteredCurrencies}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            keyExtractor={item => item.product}
          />
        )}
      </View>
    </Animated.View>
  )
}






const styles = StyleSheet.create({
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
  searchRow: {
    padding: 10,
    flexDirection: 'row'
  },
  tableHeaderRow: {
    marginHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  loadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  tableRow: {
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderBottomColor: colors.primary,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  tableRowLoading: {
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderBottomColor: colors.primary,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencyID: {
    color: colors.white,
    fontSize: fontSizes.md
  },
  currencyName: {
    color: colors.white,
    fontSize: fontSizes.sm,
  },
  currencyPrice: {
    color: colors.white,
    fontSize: fontSizes.md,
  },
  currencyChangePos: {
    color: colors.green,
    fontSize: fontSizes.md,
  },
  currencyChangeNeg: {
    color: colors.error,
    fontSize: fontSizes.md,
  }
})