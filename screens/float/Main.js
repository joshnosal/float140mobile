import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Animated, StyleSheet, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback, TextInput, PixelRatio, Platform, ScrollView, Keyboard } from 'react-native'
import { useHistory, useLocation } from 'react-router-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import Svg, {Line, Polyline, Path, G, Rect, TSpan, Text as SvgText} from 'react-native-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { captureRef } from 'react-native-view-shot'
import * as d3 from "d3"

import CryptoChart from '../../components/CryptoChartHOC'
import CryptoTicker from '../../components/CryptoTicker'
import CryptoHealthIndex from '../../components/CryptoHealthIndex'
import Crypto24hrStats from '../../components/Crypto24hrStats'



export default function FloatMain(props){
  const windowWidth = Dimensions.get('window').width
  const setSize = (type) => {
    if (type === 'ticker') {
      return 100
    } else if (type === 'health index') {
      return 190
    } else if (type === '24hr stats') {
      return 215
    } else {
      return windowWidth * 0.8
    }
  }
  const history = useHistory()
  const location = useLocation()
  const [top, setTop] = useState(new Animated.Value(0))
  const [paths, setPaths] = useState([])
  const [path, setPath] =useState({
    type: null,
    line: '',
    color: colors.white,
  })
  const [sketch, setSketch] = useState({
    on: false,
    type: null,
    color: colors.white,
  })
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [showTicker, setShowTicker] = useState(false)
  const [showOldImage, setShowOldImage] = useState(location.state.image ? true : false)
  const [timeStamp, setTimeStamp] = useState(location.state.originalFloat ? false : true)
  const [floatTo, setFloatTo] = useState('public')
  const textInput = useRef(null)
  const canvas = useRef(null)
  const boardHeight = setSize(location.state.dataType)
  const colorList = [
    colors.white,
    colors.primary,
    colors.error,
    '#e98218',
    '#ffd400',
    '#8ab40a',
    colors.green
  ]
  const line = d3.line().curve(d3.curveCardinal)

  useEffect(()=>{
    Animated.timing(top, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])


  const startDraw = (e) => {
    if (sketch.type === 'line') {
      setPath({
        type: 'line',
        color: sketch.color,
        line: { x1: e.locationX, y1: e.locationY, x2: e.locationX, y2: e.locationY }
      })
    } else if (sketch.type === 'text') {
      if (path.type==='text') {
        let array = [...paths]
        array.push(path)
        setPaths(array)
      }
      textInput.current.blur()
      textInput.current.focus()
      setPath({
        type: 'text',
        color: sketch.color,
        line: {
          x: e.locationX,
          y: e.locationY,
          text: ['']
        }
      })
    } else {
      setPath({
        type: 'pen',
        line: [[e.locationX, e.locationY]],
        color: sketch.color
      })
    }
    
  }
  const extendLine = (e) => {
    if (sketch.type === 'line') {
      setPath({
        ...path,
        line: {
          ...path.line,
          x2: e.locationX,
          y2: e.locationY
        }
      })
    } else if (sketch.type === 'text') {
    } else {
      let array = [...path.line]
      array.push([e.locationX, e.locationY])
      setPath({
        ...path,
        line: array
      })
    }
  }
  const finishLine = (e) => {
    if (sketch.type==='text') return
    let array = [...paths]
    array.push(path)
    setPaths(array)
    setPath({
      type: null,
      line: '',
      color: sketch.color
    })
  }
  const updateTextPath = (e) => {
    let text = [...path.line.text]
    if (e.nativeEvent.key === 'Enter') {
      text.push('')
    } else if (e.nativeEvent.key === 'Backspace') {
      if (text.length === 1 && text[0] === '') {
        return
      } else if (text[text.length-1] === '') {
        text = text.slice(0, text.length-1)
      } else {
        let i = text[text.length-1].length
        text[text.length-1] = text[text.length-1].slice(0, i-1)
      }
    } else {
      text[text.length-1] = text[text.length-1] + e.nativeEvent.key
    }
    setPath({
      ...path,
      line: {
        ...path.line,
        text: text
      }
    })
  }
  const getDate = () => {
    let date = new Date(location.state.time)
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let month = months[date.getMonth()]
    let minutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()
    let hours = date.getHours() < 10 ? '0'+date.getHours() : date.getHours()
    let ampm = date.getHours() < 12 ? 'a.m.' : 'p.m.'
    return month+'-'+date.getDate()+'-'+date.getFullYear()+' @'+hours+':'+minutes+' '+ampm

  }

  const getMainContent = () => {
    // if (!location.state.dataType || !location.state.live) return
    if (location.state.dataType === 'chart') {
      if (location.state.assetCat === 'crypto') {
        return (
          <CryptoChart 
            width={1}
            height={0.8}
            period={location.state.period}
            graphs={location.state.graphs}
            details={location.state.details}
            data={location.state.data}
            getData={false}
            sendData={()=>{}}
          />
        )
      }
    } else if (location.state.dataType === 'ticker') {
      if (location.state.assetCat === 'crypto') {
        return (
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <CryptoTicker product={location.state.details.product} symbol={location.state.details.currency} size='lg'/>
          </View>
        )
      }
    } else if (location.state.dataType === 'health index') {
      if (location.state.assetCat === 'crypto') {
        return (
          <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
            <CryptoHealthIndex product={location.state.details.product} symbol={location.state.details.currency}/>
          </View>
        )
      }
    } else if (location.state.dataType === '24hr stats') {
      if (location.state.assetCat === 'crypto') {
        return (
          <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
            <Crypto24hrStats product={location.state.details.product}/>
          </View>
        )
      }
    }
  }


  const createFloat = async () => {
    let float = {
      dataType: location.state.dataType,
      assetCat: location.state.assetCat,
      live: location.state.live,
      showTicker: showTicker,
      title: title,
      message: message,
      assetName: location.state.details.name,
      assetSymbol: location.state.details.currency,
      direction: 'Hold',
      details: location.state.details
    }
    if (location.state.dataType === 'chart') {
      float.graphs = location.state.graphs
      float.period = location.state.period
      
      float.data = {
        array: location.state.data,
        time: location.state.time
      }
    } 
    const targetPixelCount = 1080
    const pixelRatio = PixelRatio.get()
    const pixels = targetPixelCount / pixelRatio

    try {
      float.sketchImage = await captureRef(canvas, {
        result: 'data-uri',
        height: (boardHeight / windowWidth) * pixels,
        width: 1 * pixels,
      })
    } catch {
      return
    }
    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/float/save_new_float', {float: float, originalFloat: location.state.originalFloat}, {headers: {Authorization: `JWT ${token}`}}).then(res=>{
      history.push({
        pathname: '/floats',
        state: {
          display: 'mine'
        }
      })
    }).catch(err=>{console.log(err)})
  }

  return(
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={{paddingHorizontal: 20, position: 'absolute', left: 0}} onPress={()=>history.goBack()}>
          <Text style={{color: colors.primary, fontSize: fontSizes.md}}>Back</Text>
        </TouchableOpacity>
        <Text style={{color: colors.primary, fontSize: fontSizes.lg, fontWeight: '600'}}>Float</Text>
      </View>
      <ScrollView scrollEnabled={!sketch.on}>
        <Animated.View style={{
            position: 'relative',
            flex: 1,
            justifyContent: 'flex-end',
            transform: [{translateY: top.interpolate({
              inputRange: [0,1],
              outputRange: [1000, 0]
            })}]
          }}
        >
          <View style={{height: windowWidth, height: boardHeight}}>
            {/* LIVE TICKER IF ANY */}
            {showTicker ? 
              <View style={{position: 'absolute', width: windowWidth, justifyContent: 'center', height: 60, marginHorizontal: 5, top: 0}}>
                <CryptoTicker product={location.state.details.product} symbol={location.state.details.currency}/>
              </View> : null}
            {/* DRAW AREA */}
            {sketch.on ? (
            <View 
              style={{
                height: boardHeight,
                width: windowWidth,
                position: 'absolute', 
                top: 0,
                left: 0,
                elevation: 20, 
                zIndex: 20,
                backgroundColor: 'rgba(255,255,255,0)'
                // backgroundColor: 'red'
              }}
              onStartShouldSetResponder={()=>sketch.on}
              onResponderGrant={(e)=>startDraw(e.nativeEvent)}
              onResponderMove={(e)=>extendLine(e.nativeEvent)}
              onResponderRelease={(e)=>finishLine(e.nativeEvent)}
              onResponderTerminate={(e)=>{console.log('terminated')}}
            />) : null }
            {/* SKETCH AREA */}
            <View 
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                elevation: 10,
                zIndex: 10,
              }} 
              ref={(e)=>{canvas.current = e}}
              pointerEvents='box-none'
            >
              
              {/* SKETCH */}
              {showOldImage ? (
              <View style={{position: 'absolute', width: windowWidth, height: boardHeight, zIndex: 1, elevation: 1}} pointerEvents='box-none'>
                <Image source={{ uri: location.state.image}} style={{width: '100%', height: '100%'}} pointerEvents='box-none'/>
              </View>
              ) : null}
              <Svg 
                height={boardHeight} 
                width={windowWidth} 
                style={{
                  backgroundColor: 'rgba(255,255,255,0)', 
                }}
              >
              {paths.map((item, i)=>{
                if (item.type === 'line') {
                  return <Line x1={item.line.x1} y1={item.line.y1} x2={item.line.x2} y2={item.line.y2} stroke={item.color} strokeWidth={2} key={i}/>
                } else if (item.type === 'text') {
                  return (<SvgText x={item.line.x} y={item.line.y} fontSize={14} fill={item.color} key={i}>
                    {item.line.text.map((text, j)=>(
                      <TSpan key={j} x={item.line.x} dy={j===0 ? 0 : 14}>{text}</TSpan>
                    ))}
                  </SvgText>)
                } else {
                  return <Path d={line(item.line)} fill='none' stroke={item.color} strokeWidth={2} key={i} />
                }
              })}
              { path.type === 'pen' && path.line.length ? <Path d={line(path.line)} fill='none' stroke={path.color} strokeWidth={2} key={9402834} /> : null}
              { path.line && path.type === 'line' ? <Line x1={path.line.x1} y1={path.line.y1} x2={path.line.x2} y2={path.line.y2} stroke={path.color} strokeWidth={2} key={4398432}/> : null}
              { path.line && path.type === 'text' ? 
                <SvgText x={path.line.x} y={path.line.y} fontSize={14} fill={path.color}>
                  {path.line.text.map((text, i)=>(
                    <TSpan key={i} x={path.line.x} dy={i===0 ? 0 : 20}>{text}</TSpan>
                  ))}
                </SvgText> : null}
              </Svg>
            </View>
            {/* LIVE GRAPH IF ANY */}
            {getMainContent()}
          </View>

          {/* SKETCH CONTROL ROW */}
          <View style={styles.controlRow}>
            {!sketch.type || sketch.type==='pen' ? <TouchableOpacity onPress={()=>{
              if (!sketch.on) setSketch({...sketch, on: true, type: 'pen'})
            }}>
              <MaterialIcons name='edit' size={30} color={sketch.on && sketch.type==='pen' ? colors.primary : colors.white} />
            </TouchableOpacity> : null }
            {!sketch.type || sketch.type==='line' ? <TouchableOpacity onPress={()=>{
              if (!sketch.on) setSketch({...sketch, on: true, type: 'line'})
            }}>
              <MaterialIcons name='show-chart' size={35} color={sketch.on && sketch.type==='line' ? colors.primary : colors.white} />
            </TouchableOpacity> : null }
            {!sketch.type || sketch.type==='text' ? <TouchableOpacity style={{marginHorizontal: 5}} onPress={()=>{
              if (!sketch.on) setSketch({...sketch, on: true, type: 'text'})
            }}>
              <MaterialIcons name='text-fields' size={30} color={sketch.on && sketch.type==='text' ? colors.primary : colors.white} />
            </TouchableOpacity> : null }
            {paths.length ? <TouchableOpacity style={{marginHorizontal: 10}} onPress={()=>{
              let array = [...paths]
              setPaths(array.slice(0, array.length-1))
            }}>
              <MaterialIcons name='undo' size={30} color={colors.white} />
            </TouchableOpacity> : null}
            {sketch.on ? <TouchableOpacity onPress={()=>{
              if (path.type === 'text') {
                let array = [...paths]
                array.push(path)
                setPaths(array)
                setPath({type: null, line: '', color: sketch.color})
              }
              setPath({type: null, line: null, color: sketch.color})
              setSketch({...sketch, on: false, type: null})
            }}>
              <MaterialIcons name='check' size={30} color={colors.white} />
            </TouchableOpacity> : null }
            <TextInput 
              ref={e=>{textInput.current = e}} 
              editable={sketch.type==='text' && sketch.on ? true : false} 
              style={{height: 0, width: 0}} 
              onKeyPress={updateTextPath}
              multiline={true}
              autoCorrect={false}
            />
            <View style={{marginRight: 'auto'}}/>
            {colorList.map((item,i)=>(
              <TouchableWithoutFeedback 
                onPress={()=>setSketch({...sketch, color: item})}
                key={i}
              >
                <View
                  style={sketch.color === item && sketch.on ? {
                    backgroundColor: item,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    marginLeft: 10
                  } : {
                    backgroundColor: item,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    marginLeft: 10
                  }} 
                />
              </TouchableWithoutFeedback>
            ))}
          </View>
          {location.state.dataType == 'ticker' ? null : (
          <View style={{flexDirection: 'row', margin: 10, alignItems: 'center'}}>
            <TouchableOpacity onPress={()=>setShowTicker(!showTicker)}>
              <MaterialIcons name={showTicker ? 'check-box' : 'check-box-outline-blank'} color={colors.primary} size={24}/>
            </TouchableOpacity>
            <Text style={{fontSize: fontSizes.md, color: colors.white, marginLeft: 10}}>Show ticker</Text>
          </View>
          )}
          {location.state.image ? (
          <View style={{flexDirection: 'row', margin: 10, alignItems: 'center'}}>
            <TouchableOpacity onPress={()=>setShowOldImage(!showOldImage)}>
              <MaterialIcons name={showOldImage ? 'check-box' : 'check-box-outline-blank'} color={colors.primary} size={24}/>
            </TouchableOpacity>
            <Text style={{fontSize: fontSizes.md, color: colors.white, marginLeft: 10}}>Show original sketch</Text>
          </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.textInput} onChangeText={text=>setTitle(text)} value={title} maxLength={100}/>
          </View>
          <View style={styles.row}>
            <Text style={styles.inputLabel}>Comment</Text>
            <TextInput 
              style={styles.textInput} 
              multiline={true} 
              onChangeText={text=>setMessage(text)}
              value={message}
              maxLength={280}
            />
          </View>
          <View style={{flexDirection: 'row', margin: 10, alignItems: 'center'}}>
            <TouchableOpacity onPress={()=>setFloatTo('public')}>
              <MaterialIcons name={floatTo === 'public' ? 'radio-button-on' : 'radio-button-off'} color={colors.primary} size={24}/>
            </TouchableOpacity>
            <Text style={{fontSize: fontSizes.md, color: colors.white, marginLeft: 10, marginRight: 20}}>Public</Text>
            <TouchableOpacity onPress={()=>setFloatTo('private')}>
              <MaterialIcons name={floatTo==='private' ? 'radio-button-on' : 'radio-button-off'} color={colors.primary} size={24}/>
            </TouchableOpacity>
            <Text style={{fontSize: fontSizes.md, color: colors.white, marginLeft: 10}}>Club</Text>
          </View>
          <View style={{alignItems: 'center', margin: 10}}>
            <TouchableOpacity 
              onPress={createFloat}
              style={{borderRadius: 10, backgroundColor: colors.primary, width: 150, alignItems: 'center'}}
            >
              <Text style={{fontSize: fontSizes.lg, fontWeight: '600', padding: 5}}>Float</Text>
            </TouchableOpacity>
          </View>
          <View style={{minHeight: 260}}/>
        </Animated.View>
      </ScrollView>
    </View>
  )

}

const styles = StyleSheet.create({
  row: {
    margin: 10,
  },
  inputLabel: {
    color: colors.gray,
    fontSize: fontSizes.md,
    fontWeight: '600',
    paddingBottom: 5
  },
  textInput: {
    borderWidth: 0.5,
    borderColor: colors.white,
    color: colors.white,
    borderRadius: 5,
    fontSize: fontSizes.md,
    padding: 10,
    marginBottom: 0
  },
  container: {
    flex: 1,
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
  controlRow: {
    margin: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center'
  },
  sketchFront: {
    position: 'absolute', 
    elevation: 2, 
    zIndex: 2, 
    backgroundColor: 'rgba(255,255,255,0)'
  },
  sketchBack: {
    position: 'absolute', 
    elevation: 2, 
    zIndex: 2, 
    backgroundColor: 'rgba(255,255,255,0)'
  },
  activeColor: {
    width: 20,
    height: 20,
  },
  passiveColor: {
    width: 20,
    height: 20,
  }
})