import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Text, View, Animated, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, FlatList } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import { useHistory } from 'react-router-native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import async from 'async'

import TextInput from '../../components/TextInputSearch'
import { TouchableHighlight } from 'react-native-gesture-handler'

function Item({item, match}){
  const tokenSource = axios.CancelToken.source()
  const history = useHistory()

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
        <View style={{width: 100, alignItems: 'center'}}>
          <Text style={styles.currencyPrice}>{toDollars(item.price)}</Text>
        </View>
        <View style={{width: 80, alignItems: 'center', justifyContent:'center'}}>
          <Text style={item.change>0 ? styles.currencyChangePos : styles.currencyChangeNeg}>{item.change ? item.change : '-'}</Text>
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
  const [sort, setSort] = useState({
    by: 'name',
    dir: 'asc'
  })
  const tokenSource = axios.CancelToken.source()

  
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
              if (item.id.includes('-USD') && !item.id.includes('-USDC')) {
                let obj = {
                  product: item.id,
                  currency: item.base_currency,
                  price: 0,
                  change: 0
                }
                list.push(obj)
              }
            })
            done(null, list)
          }).catch(err=>done(err))
      },
      (products, done) => {
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
      },
      (products, done) => {
        axios.get('http://192.168.86.22:5000/data/all_crypto_prices', {
          cancelToken: tokenSource.token
        })
        .then(res=>{
          for (let i=0; i<products.length; i++) {
            for (let j=0; j<res.data.length; j++) {
              if (res.data[j].product_id === products[i].product) {
                products[i].price = Number(res.data[j].price)
                products[i].change = Math.round((res.data[j].price - res.data[j].open_24h) * 100) / 100
                break
              }
            }
          }
          done(null, products)
        })
        .catch(err=>{
          done(err, products)
          console.log(err.response)
        })
      }
    ], (err, products)=>{
      if (err) {
        console.log(err)
        setLoading(false)
        setCurrencies([])
      } else {
        setCurrencies(products)
        setLoading(false)
      }
    })

  }, [])

  useEffect(()=>{
    if (!currencies.length) return
    const clock = setInterval(()=>{
      let products = [...currencies]
      axios.get('http://192.168.86.22:5000/data/all_crypto_prices', {
        cancelToken: tokenSource.token
      })
      .then(res=>{
        for (let i=0; i<products.length; i++) {
          for (let j=0; j<res.data.length; j++) {
            if (res.data[j].product_id === products[i].product) {
              products[i].price = Number(res.data[j].price)
              products[i].change = Math.round((res.data[j].price - res.data[j].open_24h) * 100) / 100
              break
            }
          }
        }
        setCurrencies(products)
      })
      .catch(err=>{
        console.log(err.response)
      })
    }, 1000)

    return ()=> clearInterval(clock)

  }, [])

  useEffect(()=>{
    if (!currencies.length) return setFilteredCurrencies([])

    let products = [...currencies]
    if (search) {
      products = products.filter(item => JSON.stringify(item).includes(search))
    }

    if (sort.by === 'name') {
      if (sort.dir === 'asc') {
        products.sort((a, b)=>(a.currency > b.currency ? 1 : a.currency < b.currency ? -1 : 0))
      } else {
        products.sort((a, b)=>(a.currency > b.currency ? -1 : a.currency < b.currency ? 1 : 0))
      }
    } else if (sort.by === 'price') {
      if (sort.dir === 'asc') {
        products.sort((a, b)=>(a.price > b.price ? 1 : a.price < b.price ? -1 : 0))
      } else {
        products.sort((a, b)=>(a.price > b.price ? -1 : a.price < b.price ? 1 : 0))
      }
    } else if (sort.by === 'change') {
      if (sort.dir === 'asc') {
        products.sort((a, b)=>(a.change > b.change ? 1 : a.change < b.change ? -1 : 0))
      } else {
        products.sort((a, b)=>(a.change > b.change ? -1 : a.change < b.change ? 1 : 0))
      }
    }
    setFilteredCurrencies(products)
  }, [currencies, search, sort])

  const updateSort = (type) => {
    if (sort.by === type) {
      sort.dir === 'asc' ? setSort({...sort, dir: 'des'}) : setSort({...sort, dir: 'asc'})
    } else {
      setSort({
        by: type,
        dir: 'asc'
      })
    }
  }

  const renderItem = ({item}) =>(<Item item={item} match={props.match}/>)

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
        </View>
        <View style={styles.tableHeaderRow}>
          <TouchableOpacity onPress={()=>{updateSort('name')}} style={{flexBasis: 1, flexGrow: 3, justifyContent: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.tableHeaderText]}>Name</Text>
              {sort.by==='name' ? <Ionicons name={sort.dir==='asc' ? 'caret-up' : 'caret-down'} size={18} color={colors.white}/> : null }
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{updateSort('price')}} style={{justifyContent: 'center'}}>
            <View style={{width:100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.tableHeaderText]}>Price</Text>
              {sort.by==='price' ? <Ionicons name={sort.dir==='asc' ? 'caret-up' : 'caret-down'} size={18} color={colors.white}/> : null }
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{updateSort('change')}} style={{justifyContent: 'center'}}>
            <View style={{width: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
              <Text style={[styles.tableHeaderText]}>Change</Text>
              {sort.by==='change' ? <Ionicons name={sort.dir==='asc' ? 'caret-up' : 'caret-down'} size={18} color={colors.white}/> : null }
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
    paddingHorizontal: 5,
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