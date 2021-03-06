import React, { useEffect, useState, useRef } from 'react'
import Svg, {Line, Circle, Path, G, Rect, Text, TSpan} from 'react-native-svg'
import * as d3 from "d3"
import axios from 'axios'
import async from 'async'
import {Dimensions, View, ActivityIndicator, PixelRatio} from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import { captureRef } from 'react-native-view-shot'

export default function CryptoChart(props) {
  const [loading, setLoading] = useState(false)
  // const [data, setData] = useState([])
  const [paths, setPaths] = useState({
    pricePath: null,
    volumeRects: [],
    candles: []
  })
  const [touchDisabled, setTouchDisabled] = useState(props.touchDisabled || false)
  const [display, setDisplay] = useState({
    userLine: null,
    priceY: null,
    price: null,
    volumeY: null,
    volume: null,
    candleY: null,
    high: null,
    low: null,
    open: null,
    right: false
  })
  const margins = {
    left: 0,
    top: 10,
    right: 0,
    bottom: 20,
  }
  const svgRef = useRef(null)
  const windowWidth = Dimensions.get('window').width
  const graphWidth = windowWidth * props.width - margins.left - margins.right
  const graphHeight = windowWidth * props.height - margins.top - margins.bottom

  useEffect(()=>{
    if (props.data.length) createChart()
  }, [props.data])

  const createChart = () => {
    dragLine(null, null)
    let x = d3.scaleTime()
        .domain(d3.extent(props.data, d=>(d.time)))
        .range([0, graphWidth]),
        priceY = d3.scaleLinear()
        .domain([d3.min(props.data, d=>(d.low)), d3.max(props.data, d=>(d.high))])
        .range([graphHeight*0.9, graphHeight*0.1]),
        volumeX = d3.scaleBand()
        .domain(props.data.map(d=>(d.time)))
        .range([0, graphWidth])
        .paddingInner(0.05),
        candleX = d3.scaleBand()
        .domain(props.data.map(d=>(d.time)))
        .range([0, graphWidth])
        .paddingInner(0.5),
        volumeY = d3.scaleLinear()
        .domain([0, d3.max(props.data, d=>(d.volume))*3])
        .range([graphHeight, 0])

    let line = d3.line().x(d=>(x(d.time))).y(d=>(priceY(d.close))).curve(d3.curveCardinal)
    let area = d3.area().x(d=>(x(d.time))).y0(volumeY(0)).y1(d=>(volumeY(d.volume)))
    let array = [], candles = []
    for (let i=0; i<props.data.length; i++) {
      array.push({
        x: volumeX(props.data[i].time),
        y: volumeY(props.data[i].volume),
        width: volumeX.bandwidth(),
        height: graphHeight - volumeY(props.data[i].volume)
      })
      candles.push({
        up: props.data[i].close > props.data[i].open ? true : false,
        lineX: candleX(props.data[i].time) + candleX.bandwidth() / 2,
        lineY1: priceY(props.data[i].high),
        lineY2: priceY(props.data[i].low),
        recX: candleX(props.data[i].time),
        recY: props.data[i].open > props.data[i].close ? priceY(props.data[i].open) : priceY(props.data[i].close) ,
        recWidth: candleX.bandwidth(),
        recHeight: props.data[i].open > props.data[i].close ? priceY(props.data[i].close) - priceY(props.data[i].open) : priceY(props.data[i].open) - priceY(props.data[i].close)
      })
    }
    setPaths({
      ...paths, 
      pricePath: line(props.data),
      volumePath: area(props.data),
      volumeRects: array,
      candles: candles
    })
    setLoading(false)
  }

  const dragLine = (x, y) => {
    if (touchDisabled) return
    let xScale = d3.scaleTime()
        .domain(d3.extent(props.data, d=>(d.time)))
        .range([0, graphWidth]),
        priceY = d3.scaleLinear()
        .domain([d3.min(props.data, d=>(d.low)), d3.max(props.data, d=>(d.high))])
        .range([graphHeight*0.9, graphHeight*0.1]),
        volumeY = d3.scaleLinear()
        .domain([0, d3.max(props.data, d=>(d.volume))*3])
        .range([graphHeight, 0])

    if (x < margins.left || x > margins.left+graphWidth || y < margins.top || y > margins.top + graphHeight) {
      setDisplay({...display, userLine: null})
    } else {
      let time = xScale.invert(x)
      let bisect = d3.bisector(d=>(d.time)).center
      let item = props.data[bisect(props.data, time)]
      setDisplay({
        ...display, 
        userLine: x,
        priceY: priceY(item.close),
        price: item.close,
        volumeY: volumeY(item.volume),
        volume: item.volume,
        high: item.high,
        low: item.low,
        open: item.open,
        candleY: (priceY(item.open) + priceY(item.close)) / 2,
        right: x > (props.width * windowWidth) / 2 ? true : false
      })
    }
  }

  const toDollars = (x) => {
    let whole, dec
    if (x < 10) {
      x = Math.round(x * 10000) / 10000
      whole = Math.round(x)
      dec = Math.round((x % 1) * 10000)
    } else {
      x = Math.round(x * 100) / 100
      whole = Math.round(x)
      dec = Math.round((x % 1) * 100)
    }
    return '$'+whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + dec
  }
  const withComma = (x) => {
    x = Math.round(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  const getTimeArray = () => {
    let date = props.data.length ? new Date(props.data[props.data.length-1].time * 1000) : new Date(),
        mls = date.getTime(),
        array = [],
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


    
    const getTimeString = (time) => {
      date = new Date(time)
      let hr =  date.getHours() < 10 ? '0'+date.getHours() : date.getHours()
      let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      return hr + ':' + min
    }
    const getDayString = (time) => {
      date = new Date(time)
      return days[date.getDay()]
    }
    const getMonthDayString = (time) => {
      date = new Date(time)
      return months[date.getMonth()]+'-'+date.getDate()
    }
    const getMonthYearString = (time) => {
      date = new Date(time)
      return months[date.getMonth()]+'-'+date.getFullYear()
    }
    

    if (props.period ==='24hr') {
      let int = (1000 * 60 * 60 * 24) / 4
      for (let i=4; i>=0; i--) {
        array.push(getTimeString(mls - (int * i)))
      }
    } else if (props.period === '7d') {
      let int = (1000 * 60 * 60 * 24 * 7) / 6
      for (let i=6; i>=0; i--) {
        array.push(getDayString(mls - (int * i)))
      }
    } else if (props.period === '30d') {
      let int = (1000 * 60 * 60 * 24 * 30) / 4
      for (let i=4; i>=0; i--) {
        array.push(getMonthDayString(mls - (int * i)))
      }
    } else if (props.period === '1yr') {
      let int = (1000 * 60 * 60 * 24 * 365) / 4
      for (let i=4; i>=0; i--) {
        array.push(getMonthYearString(mls - (int * i)))
      }
    } else if (props.period === '5yr') {
      let int = (1000 * 60 * 60 * 24 * 365 * 5) / 4
      for (let i=4; i>=0; i--) {
        array.push(getMonthYearString(mls - (int * i)))
      }
    } else {
      let int = (1000 * 60 * 60) / 4
      for (let i=4; i>=0; i--) {
        array.push(getTimeString(mls - (int * i)))
      }
    }
    return array
  }

  const XAxis = () => {
    let tickSize = 7
    let textSize = 10
    let tickPaths = []
    let tickTexts = []
    let labels = getTimeArray()
    tickPaths.push({
      x1: margins.left - 1,
      x2: margins.left - 1,
      y1: props.height * windowWidth-margins.bottom,
      y2: props.height * windowWidth-margins.bottom + tickSize
    })
    tickTexts.push({
      text: labels[0],
      textAnchor: 'start',
      x: margins.left - 1,
      y: props.height * windowWidth-margins.bottom + tickSize + textSize,
    })
    if (props.period === '7d') {
      for (let i=1; i<6; i++) {
        tickPaths.push({
          x1: margins.left - 1 + ((graphWidth+2) * i / 6),
          x2: margins.left - 1 + ((graphWidth+2) * i / 6),
          y1: props.height * windowWidth-margins.bottom,
          y2: props.height * windowWidth-margins.bottom + tickSize
        })
        tickTexts.push({
          text: labels[i],
          textAnchor: 'middle',
          x: margins.left - 1 + ((graphWidth+2) * i / 6),
          y: props.height * windowWidth-margins.bottom + tickSize + textSize
        })
      }
      tickTexts.push({
        text: labels[6],
        textAnchor: 'end',
        x: margins.left - 1 + graphWidth,
        y: props.height * windowWidth-margins.bottom + tickSize + textSize
      })
    } else {
      for (let i=1; i<4; i++) {
        tickPaths.push({
          x1: margins.left - 1 + ((graphWidth+2) * i / 4),
          x2: margins.left - 1 + ((graphWidth+2) * i / 4),
          y1: props.height * windowWidth-margins.bottom,
          y2: props.height * windowWidth-margins.bottom + tickSize
        })
        tickTexts.push({
          text: labels[i],
          textAnchor: 'middle',
          x: margins.left - 1 + ((graphWidth+2) * i / 4),
          y: props.height * windowWidth-margins.bottom + tickSize + textSize
        })
      }
      tickTexts.push({
        text: labels[4],
        textAnchor: 'end',
        x: margins.left - 1 + graphWidth,
        y: props.height * windowWidth-margins.bottom + tickSize + textSize
      })
    }
    tickPaths.push({
      x1: props.width * windowWidth - margins.left + 1,
      x2: props.width * windowWidth - margins.left + 1,
      y1: props.height * windowWidth-margins.bottom,
      y2: props.height * windowWidth-margins.bottom + tickSize
    })
    

    return (
      <G>
        <Line 
          x1={margins.left - 1} 
          x2={props.width * windowWidth - margins.left + 1} 
          y1={props.height * windowWidth - margins.bottom } 
          y2={props.height * windowWidth - margins.bottom } 
          stroke={colors.primary} 
          strokeWidth={0.8}
        />
        {tickPaths.map((tick, i)=>(
          <Line
            x1={tick.x1}
            x2={tick.x2}
            y1={tick.y1}
            y2={tick.y2}
            stroke={colors.primary}
            strokeWidth={0.8}
            key={i}
          />
        ))}
        {tickTexts.map((text, i)=>(
          <Text
            x={text.x}
            y={text.y}
            textAnchor={text.textAnchor}
            stroke={colors.primary}
            strokeWidth={1}
            fontWeight='lighter'
            fontSize={textSize}
            key={i}
          >{text.text}</Text>
        ))}
      </G>
    )
  }

  return (
    <View 
      onResponderGrant={(e)=>dragLine(e.nativeEvent.locationX-margins.left, e.nativeEvent.locationY)}
      onStartShouldSetResponder={(e) => true}
      onResponderMove={(e)=>dragLine(e.nativeEvent.locationX-margins.left, e.nativeEvent.locationY)}
      onResponderTerminationRequest={()=>true}
    >
      {loading ? (
        <View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ActivityIndicator size='large' color={colors.primary}/>
        </View>
      ) : null}
      <Svg height={props.height * windowWidth} width={props.width * windowWidth} ref={(e)=>{svgRef.current = e}}>
        <XAxis/>
        {props.graphs.candles && !loading ? <G translateX={margins.left} translateY={margins.top}>
          
        </G> : null}
        <G translateX={margins.left} translateY={margins.top}>
          {props.graphs.volume && !loading ? paths.volumeRects.map((rect, i)=>(
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={hexToRGBA(colors.background, colors.primary, 0.3)}
              stroke={hexToRGBA(colors.background, colors.primary, 0.7)}
              strokeWidth={0.5}
              key={i}
            />
          )) : null}
          {props.graphs.candles && !loading ? paths.candles.map((candle, i)=>(
            <G key={i}>
              <Line x1={candle.lineX} x2={candle.lineX} y1={candle.lineY1} y2={candle.lineY2} stroke={candle.up ? colors.green : colors.error} strokeWidth={1}/>
              <Rect 
                x={candle.recX}
                y={candle.recY}
                width={candle.recWidth}
                height={candle.recHeight}
                fill={candle.up ? colors.green : colors.error}
              />
            </G>
          )) : null}
          
          {props.graphs.price && !loading ? <Path d={paths.pricePath} stroke={colors.accent} style={{transform: [{translateX: 40}]}}/> : null }

        {display.userLine && !loading ? (
          <>
          <Line x1={display.userLine} x2={display.userLine} y1={0} y2={graphHeight} stroke={colors.gray} strokeWidth={0.8}/>
          {props.graphs.price ? <Circle cx={display.userLine} cy={display.priceY} r={5} stroke='white' strokeWidth={0.7}/> : null }
          {props.graphs.price ? <Text stroke={colors.white} strokeWidth={0.8} fontSize={10} x={display.right ? display.userLine-10 : display.userLine+10} y={display.priceY+3} textAnchor={display.right ? 'end' : 'start'} fontWeight='lighter'>{toDollars(display.price)}</Text> : null }
          {props.graphs.volume ? <Circle cx={display.userLine} cy={display.volumeY} r={5} stroke='white' strokeWidth={0.7}/> : null }
          {props.graphs.volume ? <Text stroke={colors.white} strokeWidth={0.8} fontSize={10} x={display.right ? display.userLine-10 : display.userLine+10} y={display.volumeY+3} textAnchor={display.right ? 'end' : 'start'} fontWeight='lighter'>{withComma(display.volume)}</Text> : null }
          {props.graphs.candles ? <Circle cx={display.userLine} cy={display.candleY} r={5} stroke='white' strokeWidth={0.7}/> : null }
          {props.graphs.candles ? (
            <Text stroke={colors.white} strokeWidth={0.8} fontSize={10} x={display.right ? display.userLine-10 : display.userLine+10} y={display.candleY - 16} textAnchor={display.right ? 'end' : 'start'} fontWeight='lighter'>
              <TSpan x={display.right ? display.userLine-10 : display.userLine+10} key={1}>{'High: '+toDollars(display.high)}</TSpan>
              <TSpan x={display.right ? display.userLine-10 : display.userLine+10} dy={12} key={2}>{'Low: '+toDollars(display.low)}</TSpan>
              <TSpan x={display.right ? display.userLine-10 : display.userLine+10} dy={12} key={3}>{'Open: '+toDollars(display.open)}</TSpan>
              <TSpan x={display.right ? display.userLine-10 : display.userLine+10} dy={12} key={4}>{'Close: '+toDollars(display.price)}</TSpan>
            </Text>
          ) : null }
          </>
        ) : null}
        </G>
      </Svg>
    </View>
  )
}