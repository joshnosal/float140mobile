import React, { useEffect, useState, useRef } from 'react' 
import { View, Text, Animated, Dimensions, TouchableOpacity, TouchableHighlight, 
  ActivityIndicator, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { colors, fontSizes, hexToRGBA } from '../../styles/Theme'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import async from 'async'
import AsyncStorage from '@react-native-async-storage/async-storage'

function StepOne(props) {

  return (
    <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}>
      <TouchableHighlight 
        underlayColor={colors.primary} 
        style={{backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5), width: 120, paddingVertical: 10, borderRadius: 25, marginBottom: 40}}
        onPress={()=>{
          props.handleNext()
          props.setAction('buy')
        }}
      >
        <Text style={{color: 'white', fontSize: fontSizes.lg, textAlign: 'center'}}>Buy</Text>
      </TouchableHighlight>
      <TouchableHighlight 
        underlayColor={colors.primary} 
        style={{backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5), width: 120, paddingVertical: 10, borderRadius: 25}}
        onPress={()=>{
          props.handleNext()
          props.setAction('sell')
        }}
      >
        <Text style={{color: 'white', fontSize: fontSizes.lg, textAlign: 'center'}}>Sell</Text>
      </TouchableHighlight>
    </View>
  )
}

function StepTwo(props) {

  return (
    <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}>
      <TouchableHighlight 
        underlayColor={colors.primary} 
        style={{backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5), width: 120, paddingVertical: 10, borderRadius: 25, marginBottom: 40}}
        onPress={()=>{
          props.handleNext()
          props.setType('stock')
        }}
      >
        <Text style={{color: 'white', fontSize: fontSizes.lg, textAlign: 'center'}}>Stock</Text>
      </TouchableHighlight>
      <TouchableHighlight 
        underlayColor={colors.primary} 
        style={{backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5), width: 120, paddingVertical: 10, borderRadius: 25}}
        onPress={()=>{
          props.handleNext()
          props.setType('crypto')
        }}
      >
        <Text style={{color: 'white', fontSize: fontSizes.lg, textAlign: 'center'}}>Crypto</Text>
      </TouchableHighlight>
    </View>
  )
}

function StepThreeCryptoBuy(props){
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    if (props.state.type === 'stock') {
      setLoading(false)
      setProducts([])
      return
    }
    async.waterfall([
      (done) => {
        axios.get('https://api.pro.coinbase.com/products')
        .then(res=>{
          let list = []
          res.data.map((item)=>{
            if (item.id.includes('-USD') && !item.id.includes('-USDC')) {
              let obj = {
                product: item.id,
                symbol: item.base_currency,
              }
              list.push(obj)
            }
          })
          done(null, list)
        }).catch(err=>done(err))
      },
      (list, done) => {
        axios.get('https://api.pro.coinbase.com/currencies', {cancelToken: tokenSource.token})
        .then(res=>{
          done(null, list, res.data)
        }).catch(err=>done(err))
      },
      (list, currencies, done) => {
        for (let i=0; i<list.length; i++) {
          for (let j=0; j<currencies.length; j++) {
            if (list[i].symbol === currencies[j].id) {
              list[i].name = currencies[j].name
            }
          }
        }
        done(null, list)
      },
      (list, done) => {
        list = list.sort((a, b)=> (a.product > b.product ? 1 : b.product > a.product ? -1 : 0))
        done(null, list)
      }
    ], (err, result)=>{
      err ? setProducts([]) : setProducts(result)
      setLoading(false)
    })
    return ()=>tokenSource.cancel()
  }, [props.step, props.state])

  if (loading) {
    return (
      <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}>
        <ActivityIndicator color={colors.primary} size='large'/>
      </View>
    )
  } else {
    return (
      <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}>
        {!products.length && props.state.type === 'stock' ? (
          <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>No stocks found</Text>
        ) : !products.length && props.state.type === 'crypto' ? (
          <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>No cryptocurrencies found</Text>
        ) : (
          <FlatList 
            data={products}
            style={{
              // maxHeight: 40 * 6, 
              width: '80%', 
              borderRadius: 10,
              backgroundColor: hexToRGBA(colors.background, colors.primary, 0.2)
            }}
            keyExtractor={item=>item.product}
            renderItem={({ item })=>(
              <TouchableHighlight 
                onPress={()=>{
                  props.setProduct(item)
                  props.handleNext()
                }}
                underlayColor={colors.primary}
                style={{height: 40, justifyContent: 'center', paddingHorizontal: 10}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md}}>
                  <Text style={{fontWeight: '600', paddingRight: 10}}>{item.symbol + '  '}</Text>
                  <Text style={{fontWeight: '300'}}>{item.name}</Text>
                </Text>
              </TouchableHighlight>
            )}
          />
        )}
      </View>
    )
  }
}

function StepThreeSell(props) {
  const [data, setData] = useState([])

  useEffect(()=>{
    if (!props.club.investments.length) return
    let array = props.club.investments
    array = array.filter(item => item.units !== 0 && item.assetCat === props.state.type)
    array.sort((a,b)=>(a.symbol > b.symbol ? 1 : a.symbol < b.symbol ? -1 : 0))
    setData(array)
  }, [])

  return (
    <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}>
      <FlatList 
        data={data}
        style={{
          width: '80%', 
          borderRadius: 10,
          backgroundColor: hexToRGBA(colors.background, colors.primary, 0.2)
        }}
        keyExtractor={item=>item._id}
        renderItem={({ item })=>(
          <TouchableHighlight 
            onPress={()=>{
              props.setInvestment(item)
              props.handleNext()
            }}
            underlayColor={colors.primary}
            style={{height: 40, justifyContent: 'center', paddingHorizontal: 10}}
          >
            <Text style={{color: colors.white, fontSize: fontSizes.md}}>
              <Text style={{fontWeight: '600', paddingRight: 10}}>{item.symbol + '  '}</Text>
              <Text style={{fontWeight: '300'}}>{item.name}</Text>
            </Text>
          </TouchableHighlight>
        )}
      />
    </View>
  )
}

function StepFourCryptoBuy(props) {
  const [price, setPrice] = useState()
  const [values, setValues] = useState({
    dollarText: '0',
    dollarVal: 0,
    unitText: '0',
    unitVal: 0
  })
  const [max, setMax] = useState(false)
  const tokenSource = axios.CancelToken.source()
  const dollarInputEl = useRef(null)
  const unitInputEl = useRef(null)

  // Reset States
  useEffect(()=>{
    setValues({dollarText: '0', dollarVal: 0, unitText: '0', unitVal: 0})
    setMax(false)
    setPrice()
  }, [props.step])

  // Get live pricing
  useEffect(()=>{
    if (!props.state.product) return

    const getInfo = () => {
      axios.post('http://192.168.86.22:5000/data/get_current_crypto', {id: props.state.product.product}, {
        cancelToken: tokenSource.token
      })
      .then(res=>{
        if (!res.data.price) return
        setPrice(res.data.price)
      })
      .catch(err=>{
        console.log(err.response)
      })
    }

    getInfo()
    let clock = setInterval(()=>getInfo(), 1000)

    return ()=>{
      tokenSource.cancel()
      clearInterval(clock)
    }
  }, [props.state, max])

  useEffect(()=>{
    if (!dollarInputEl.current || !unitInputEl.current) return
    if (dollarInputEl.current.isFocused() || unitInputEl.current.isFocused()) return
    let unit = values.dollarVal / price
    setValues({...values, unitText: unit.toString(), unitVal: unit})
  }, [price])

  const submitBuy = async () => {
    if (dollarInputEl.current.isFocused()) {
      dollarInputEl.current.blur()
      return
    } else if (unitInputEl.current.isFocused()) {
      unitInputEl.current.blur()
      return
    }

    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/club/submit_investment', {
      club: props.club,
      state: props.state,
      values: values,
      price: price
    }, {
      cancelToken: tokenSource.token,
      headers: {Authorization: `JWT ${token}`}
    })
    .then(res=>{
      props.refreshClub()
      props.close()
    }).catch(err=>{
      alert('Apologies, something went wrong')
      console.log(err)
    })

    return ()=>tokenSource.cancel()

  }


  const updateDollars = () => {
    let val = Number(values.dollarText)
    let dollarText = values.dollarText
    if (isNaN(val) || val === 0) {
      setValues({dollarText: '0', dollarVal: 0, unitText: '0', unitVal: 0})
    } else {
      if (val > props.club.cash) {
        val = props.club.cash
        dollarText = val.toString()
      }
      let unit = val / price
      setValues({dollarText: dollarText, dollarVal: val, unitText: unit.toString(), unitVal: unit})
    }
  }
  const updateUnits = () => {
    let val = Number(values.unitText)
    let unitText = values.unitText
    if (isNaN(val) || val === 0) {
      setValues({dollarText: '0', dollarVal: 0, unitText: '0', unitVal: 0})
    } else {
      if (val * price > props.club.cash) {
        val = props.club.cash / price
        unitText = val.toString()
      }
      let dollar = val * price
      setValues({unitText: unitText, dollarText: dollar.toString(), dollarVal: dollar, unitVal: val})
    }
  }

  const formatNum = (x) => {
    x = Math.round(x * 100) / 100
    return '$' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }


  if (!props.state.product) {
    return <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}/>
  } else {
    return (
      <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
        <KeyboardAvoidingView 
          style={{flex: 1, width: props.window.width * 0.8, justifyContent: 'flex-end'}}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={220}
        >
          
          <View style={{flex: 1}}>
            <View style={{flexDirection:'row', flexWrap: 'nowrap', paddingHorizontal: 20, marginBottom: 20}}>
              <Text style={{color: 'white', fontSize: fontSizes.md}} numberOfLines={1}>
                <Text style={{fontWeight: '600'}}>{props.state.product.symbol}</Text>
                <Text style={{overflow: 'hidden'}}>{' - ' + props.state.product.name}</Text>
              </Text>
              <View style={{flex: 1}}/>
              {price ? ( <Text style={{color: 'white', fontSize: fontSizes.md, fontWeight: '500'}}>{formatNum(price)}</Text> ) : null}
            </View>
            <View style={{alignItems: 'center', paddingHorizontal: 20, marginBottom: 20}}>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={()=>{
                  let val = props.club.cash / price
                  setValues({
                    dollarText: props.club.cash.toString(), 
                    dollarVal: props.club.cash, 
                    unitText: val.toString(), 
                    unitVal: val
                  })
                  setMax(true)
                }}
                style={{paddingHorizontal: 30, paddingVertical: 5, borderRadius: 15, backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5)}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>Max</Text>
              </TouchableHighlight>
            </View>
            <View style={{alignItems: 'flex-start', flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, alignItems: 'center'}}>
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', width: 80}}>Dollars:</Text>
              <View style={{
                flex: 1, 
                borderColor: colors.primary, 
                borderWidth: 0.5, 
                borderRadius: 10, 
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                flexDirection: 'row'
              }}>
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400'}}>{'$ '}</Text>
                <TextInput
                  ref={e=>{dollarInputEl.current = e}}
                  value={values.dollarText}
                  onFocus={()=>{
                    setMax(false)
                    setValues({dollarText: '', dollarVal: 0, unitText: '0', unitVal: 0})
                  }}
                  onChangeText={(text)=>setValues({...values, dollarText: text})}
                  style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', flex: 1}}
                  keyboardType='numeric'
                  onEndEditing={updateDollars}
                />
              </View>
            </View>
            <View style={{alignItems: 'flex-start', flexDirection: 'row', paddingHorizontal: 20, marginBottom: 40, alignItems: 'center'}}>
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', width: 80}}>Coins:</Text>
              <View style={{
                flex: 1, 
                borderColor: colors.primary, 
                borderWidth: 0.5, 
                borderRadius: 10, 
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                flexDirection: 'row'
              }}>
                <TextInput
                  ref={e=>{unitInputEl.current = e}}
                  value={values.unitText}
                  onFocus={()=>{
                    setMax(false)
                    setValues({dollarText: '0', dollarVal: 0, unitText: '', unitVal: 0})
                  }}
                  onChangeText={text=>setValues({...values, unitText: text})}
                  style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', flex: 1}}
                  keyboardType='numeric'
                  onEndEditing={updateUnits}
                />
              </View>
            </View>
            <View style={{alignItems: 'flex-start', flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center'}}>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={submitBuy}
                style={{paddingHorizontal: 30, paddingVertical: 5, borderRadius: 15, backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5)}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>BUY</Text>
              </TouchableHighlight>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    )
  }
}

function StepFourCryptoSell(props) {
  const [price, setPrice] = useState()
  const [values, setValues] = useState({
    dollarText: '0',
    dollarVal: 0,
    unitText: '0',
    unitVal: 0
  })
  const [max, setMax] = useState(false)
  const tokenSource = axios.CancelToken.source()
  const dollarInputEl = useRef(null)
  const unitInputEl = useRef(null)

  // Reset States
  useEffect(()=>{
    setValues({dollarText: '0', dollarVal: 0, unitText: '0', unitVal: 0})
    setMax(false)
    setPrice()
  }, [props.step])

  // Get live pricing
  useEffect(()=>{
    if (!props.state.investment) return

    const getInfo = () => {
      axios.post('http://192.168.86.22:5000/data/get_current_crypto', {id: props.state.investment.symbol + '-USD'}, {
        cancelToken: tokenSource.token
      })
      .then(res=>{
        if (!res.data.price) return
        setPrice(res.data.price)
      })
      .catch(err=>{
        console.log(err.response)
      })
    }

    getInfo()
    let clock = setInterval(()=>getInfo(), 1000)

    return ()=>{
      tokenSource.cancel()
      clearInterval(clock)
    }
  }, [props.state, max])

  useEffect(()=>{
    if (!dollarInputEl.current || !unitInputEl.current) return
    if (dollarInputEl.current.isFocused() || unitInputEl.current.isFocused()) return
    let dollars = Math.floor( (values.unitVal * price) * 100) / 100
    setValues({...values, dollarText: dollars.toString(), dollarVal: dollars})
  }, [price])

  const submitSell = async () => {
    if (dollarInputEl.current.isFocused()) {
      dollarInputEl.current.blur()
      return
    } else if (unitInputEl.current.isFocused()) {
      unitInputEl.current.blur()
      return
    }

    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/club/submit_investment', {
      club: props.club,
      state: props.state,
      values: values,
      price: price
    }, {
      cancelToken: tokenSource.token,
      headers: {Authorization: `JWT ${token}`}
    })
    .then(res=>{
      props.refreshClub()
      props.close()
    }).catch(err=>{
      alert('Apologies, something went wrong')
      console.log(err.response)
    })

    return ()=>tokenSource.cancel()

  }

  const updateDollars = () => {
    let val = Number(values.dollarText)
    let dollarText = values.dollarText
    if (isNaN(val) || val === 0) {
      setValues({dollarText: '0', dollarVal: 0, unitText: '0', unitVal: 0})
    } else {
      if (val / price > props.state.investment.units) {
        val = Math.floor( (props.state.investment.units * price) * 100 ) / 100
        dollarText = val.toString()
      }
      let unit = val / price
      setValues({dollarText: dollarText, dollarVal: val, unitText: unit.toString(), unitVal: unit})
    }
  }
  const updateUnits = () => {
    let val = Number(values.unitText)
    let unitText = values.unitText
    if (isNaN(val) || val === 0) {
      setValues({dollarText: '0', dollarVal: 0, unitText: '0', unitVal: 0})
    } else {
      if (val > props.state.investment.units) {
        val = props.state.investment.units
        unitText = val.toString()
      }
      let dollar = val * price
      setValues({unitText: unitText, dollarText: dollar.toString(), dollarVal: dollar, unitVal: val})
    }
  }

  const formatNum = (x) => {
    x = Math.round(x * 100) / 100
    return '$' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }


  if (!props.state.investment) {
    return <View style={[styles.stepContainer, {width: props.window.width * 0.8}]}/>
  } else {
    return (
      <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
        <KeyboardAvoidingView 
          style={{flex: 1, width: props.window.width * 0.8, justifyContent: 'flex-end'}}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={220}
        >
          
          <View style={{flex: 1}}>
            <View style={{flexDirection:'row', flexWrap: 'nowrap', paddingHorizontal: 20, marginBottom: 20}}>
              <Text style={{color: 'white', fontSize: fontSizes.md}} numberOfLines={1}>
                <Text style={{fontWeight: '600'}}>{props.state.investment.symbol}</Text>
                <Text style={{overflow: 'hidden'}}>{' - ' + props.state.investment.name}</Text>
              </Text>
              <View style={{flex: 1}}/>
              {price ? ( <Text style={{color: 'white', fontSize: fontSizes.md, fontWeight: '500'}}>{formatNum(price)}</Text> ) : null}
            </View>
            <View style={{alignItems: 'center', paddingHorizontal: 20, marginBottom: 20}}>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={()=>{
                  let val = Math.floor( (props.state.investment.units * price) * 100 ) / 100
                  setValues({
                    dollarText: val.toString(), 
                    dollarVal: val, 
                    unitText: props.state.investment.units.toString(), 
                    unitVal: props.state.investment.units
                  })
                  setMax(true)
                }}
                style={{paddingHorizontal: 30, paddingVertical: 5, borderRadius: 15, backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5)}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>Max</Text>
              </TouchableHighlight>
            </View>
            <View style={{alignItems: 'flex-start', flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, alignItems: 'center'}}>
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', width: 80}}>Dollars:</Text>
              <View style={{
                flex: 1, 
                borderColor: colors.primary, 
                borderWidth: 0.5, 
                borderRadius: 10, 
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                flexDirection: 'row'
              }}>
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400'}}>{'$ '}</Text>
                <TextInput
                  ref={e=>{dollarInputEl.current = e}}
                  value={values.dollarText}
                  onFocus={()=>{
                    setMax(false)
                    setValues({dollarText: '', dollarVal: 0, unitText: '0', unitVal: 0})
                  }}
                  onChangeText={(text)=>setValues({...values, dollarText: text})}
                  style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', flex: 1}}
                  keyboardType='numeric'
                  onEndEditing={updateDollars}
                />
              </View>
            </View>
            <View style={{alignItems: 'flex-start', flexDirection: 'row', paddingHorizontal: 20, marginBottom: 40, alignItems: 'center'}}>
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', width: 80}}>Coins:</Text>
              <View style={{
                flex: 1, 
                borderColor: colors.primary, 
                borderWidth: 0.5, 
                borderRadius: 10, 
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                flexDirection: 'row'
              }}>
                <TextInput
                  ref={e=>{unitInputEl.current = e}}
                  value={values.unitText}
                  onFocus={()=>{
                    setMax(false)
                    setValues({dollarText: '0', dollarVal: 0, unitText: '', unitVal: 0})
                  }}
                  onChangeText={text=>setValues({...values, unitText: text})}
                  style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', flex: 1}}
                  keyboardType='numeric'
                  onEndEditing={updateUnits}
                />
              </View>
            </View>
            <View style={{alignItems: 'flex-start', flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center'}}>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={submitSell}
                style={{paddingHorizontal: 30, paddingVertical: 5, borderRadius: 15, backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5)}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>SELL</Text>
              </TouchableHighlight>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    )
  }
}

export default function InvestmentPopup(props) {
  const [pos, setPos] = useState(new Animated.Value(0))
  const [step, setStep] = useState(props.state.step || 0)
  const [stepPos, setStepPos] = useState(new Animated.Value(0))
  const [state, setState] = useState({
    type: props.state.type || undefined,
    action: props.state.action || undefined,
    product: props.state.product || undefined,
    investment: props.state.investment || undefined
  })
  const window = {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  }
  const timing = 300
  const steps = 4

  useEffect(()=>{
    Animated.timing(pos, {
      toValue: 1,
      duration: timing,
      useNativeDriver: true
    }).start()
  }, [])
  const closePopup = () => {
    Animated.timing(pos, {
      toValue: 0,
      duration: timing,
      useNativeDriver: true
    }).start()
    setTimeout(()=>props.close(), timing)
  }

  useEffect(()=>{
    Animated.timing(stepPos, { toValue: step, duration: timing, useNativeDriver: true }).start()
  }, [step])

  const handleBack = () => {
    if (step===3) setState({...state, product: undefined})
    if (step===1) setState({...state, action: undefined})
    setStep(step-1)
  }
  const handleNext = () => {
    setStep(step+1)
  }

  const styleNumber = (x) => {
    x = Math.floor(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <View style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: window.width * 0.5,
          top: window.height * 0.05,
          overflow: 'hidden',
          height: '80%',
          width: '80%',
          paddingBottom: 50,
          backgroundColor: colors.background,
          borderColor: colors.gray,
          borderWidth: 0.5,
          borderRadius: 20,
          transform: [
            {translateY: pos.interpolate({inputRange: [0, 1], outputRange: [1000, 0] })},
            {translateX: window.width * -0.4}
          ]
        }}
      >
        <View style={{paddingHorizontal: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center'}}>
          {step===0 ? null : (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name='chevron-back' size={24} color={colors.white} />
          </TouchableOpacity>
          )}
          <View style={{flex: 1}}/>
          <TouchableOpacity onPress={closePopup}>
            <Ionicons name='close' size={24} color={colors.white}/>
          </TouchableOpacity>
          
        </View>
        <View style={{alignItems: 'center', padding: 10}}>
          <Text style={{color: colors.white, fontSize: fontSizes.lg, lineHeight: 30}}>{'$' + styleNumber(props.club.cash)}</Text>
          <Text style={{color: colors.white, fontSize: fontSizes.sm, lineHeight: 20}}>{'Available'}</Text>
        </View>
        <Animated.View
          style={{
            width: window.width * 0.8 * steps,
            flexDirection: 'row',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            transform: [{
              translateX: stepPos.interpolate({
                inputRange: [0,steps],
                outputRange: [0, -window.width * 0.8 * steps]
              })
            }]
          }}
        >
          {/* STEP 0 */}
          <StepOne
            window={window}
            setAction={(act)=>setState({...state, action: act})}
            handleNext={handleNext}
            step={step}
          />
          <StepTwo 
            window={window}
            setType={(type)=>setState({...state, type: type})}
            handleNext={handleNext}
            step={step}
          />
          {state.type === 'crypto' && state.action === 'buy' ? (
            <StepThreeCryptoBuy 
              window={window}
              state={state}
              handleNext={handleNext}
              setProduct={(product)=>setState({...state, product: product})}
              step={step}
            />
          ) : state.type === 'crypto' & state.action === 'sell' ? (
            <StepThreeSell 
              window={window}
              state={state}
              handleNext={handleNext}
              setInvestment={(investment)=>setState({...state, investment: investment})}
              step={step}
              club={props.club}
            />
          ) : (
            <View style={[styles.stepContainer, {width: window.width * 0.8}]}/>
          )}
          {state.type === 'crypto' && state.action === 'buy' ? (
            <StepFourCryptoBuy
              window={window}
              state={state}
              close={closePopup}
              step={step}
              club={props.club}
              refreshClub={props.refreshClub}
            />
          ) : state.type === 'crypto' && state.action === 'sell' ? (
            <StepFourCryptoSell
              window={window}
              state={state}
              close={closePopup}
              step={step}
              club={props.club}
              refreshClub={props.refreshClub}
            />
          ) : (
            <View style={[styles.stepContainer, {width: window.width * 0.8}]}/>
          )}
          
        </Animated.View>
        
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  }
})