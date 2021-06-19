import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, TouchableHighlight, Modal, SectionList, 
  TouchableOpacity, StyleSheet, Platform, UIManager, LayoutAnimation, TouchableWithoutFeedback } from 'react-native'
import { colors, fontSizes, hexToRGBA } from '../../styles/Theme'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import async from 'async'

import InvestmentPopup from './InvestmentPopup'

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MainDisplay(props){
  const [loading, setLoading] = useState(false)
  const [openTrade, setOpenTrade] = useState(false)
  const [popupState, setPopupState] = useState({
    open: false,
    step: 0,
    type: undefined,
    action: undefined,
    product: undefined
  })
  const [openModal, setOpenModal] = useState(false)
  const [activeInvestements, setActiveInvestments] = useState([])
  const [oldInvestments, setOldInvestments] = useState([])

  useEffect(()=>{
    if (!props.club) return setLoading(true)

    let investments = props.club.investments
    let array = []
    for ( let i = 0; i < investments.length; i++ ) {
      let now = new Date(),
          updated = new Date(investments[i].updatedAt),
          buys = [],
          sells = []
      let obj = {
        data: investments[i],
      }
      // Calculate metrics
      for ( let j=investments[i].transactions.length - 1; j >= 0; j-- ) {
        let transaction = {...investments[i].transactions[j]}
        if (transaction.type === 'buy') {
          buys.push(transaction)
        } else {
          let totalUnits = transaction.units
          let end = new Date(transaction.date)
          for (let k=0; k<buys.length; k++) {
            if (buys[k].units > 0) {
              let start = new Date(buys[k].date)
              let handledUnits = totalUnits > buys[k].units ? buys[k].units : totalUnits
              sells.push({
                return: handledUnits * transaction.price - handledUnits * buys[k].price,
                age: end.getTime() - start.getTime(),
                units: handledUnits,
                buyPrice: buys[k].price,
                sellPrice: transaction.price
              })
              buys[k].units = buys[k].units - handledUnits
              totalUnits = totalUnits - handledUnits
              if (totalUnits === 0) break
            }
          }
        }
      }
      obj.holds = buys.filter(item => item.units !== 0)
      obj.sells = sells
      array.push(obj)
    }
    setActiveInvestments(array.filter(item => item.data.units !== 0))
    setOldInvestments(array.filter(item => item.data.units === 0))


  }, [props.club])

  useEffect(()=>{
    if (props.display !== 'Investments') setOpenTrade(false)
  }, [props.display])

  const toggleTradePopup = () => {
    setPopupState({open: !popupState.open, step: 0, type: undefined, action: undefined, product: undefined})
    props.lockScroll(!popupState.open)
  }

  const getAvailableCash = () => {
    let val = Math.round(props.club.cash * 100) / 100
    return '$' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={colors.primary} size='large'/>
      </View>
    )
  } else {
    return(
      <View style={{flex: 1}}>
        {props.club.admin.includes(props.user._id) ? (
          <View style={{alignItems: 'center', justifyContent: 'center', height: 80, flexDirection: 'row'}}>
            <TouchableHighlight 
              style={{
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5),
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderRadius: 15
              }} 
              underlayColor={colors.primary} 
              onPress={toggleTradePopup}
            >
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>TRADE</Text>
            </TouchableHighlight>
            <View style={{width: 10}}/>
            <TouchableHighlight 
              style={{
                backgroundColor: hexToRGBA(colors.background, colors.gray, 0.3),
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderRadius: 15
              }} 
              underlayColor={colors.primary} 
              onPress={()=>setOpenModal(!openModal)}
            >
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>RESET</Text>
            </TouchableHighlight>
          </View>
        ) : null}
        <View style={{paddingHorizontal: 10}}>
          <SectionHeader title='Available Cash'/>
          <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500', padding: 10}}>{getAvailableCash()}</Text>
        </View>
        <SectionList
          style={{paddingHorizontal: 10}}
          sections={[{
            title: 'Active Investments',
            data: activeInvestements
          }, {
            title: 'Old Investments',
            data: oldInvestments
          }]}
          keyExtractor={(item, index)=> (index)}
          renderItem={({ item }) => <InvestmentItem item={item} popupState={popupState} setPopupState={(prop)=>setPopupState(prop)}/>}
          renderSectionHeader={({section: {title}})=><SectionHeader title={title}/>}
          ItemSeparatorComponent={()=><View style={{borderBottomColor: hexToRGBA(colors.background, colors.gray, 0.5), borderBottomWidth: 0.5}}/>}
        />
        {popupState.open ? (
          <InvestmentPopup close={toggleTradePopup} club={props.club} refreshClub={props.refreshClub} state={popupState}/>
        ) : null}
        <ResetModal open={openModal} close={()=>setOpenModal(false)} club={props.club} refreshClub={props.refreshClub}/>
      </View>
      
    )
  }
}

function ResetModal(props){
  const [step, setStep] = useState(0)
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    if (props.open) setStep(0)
  }, [props.open])

  const resetInvestments = () => {
    axios.post('http://192.168.86.22:5000/club/reset_investments', {club: props.club}, {
      cancelToken: tokenSource.token
    })
    .then(res=>{
      props.close()
      props.refreshClub()
    })
    .catch(err=>{
      console.log(err.response)
    })
    return () => tokenSource.cancel()
  }

  return (
    <Modal 
      visible={props.open}
      animationType='slide'
      transparent={true}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {step === 0 ? (
          <View style={{
            backgroundColor: colors.background,
            borderColor: colors.gray,
            borderRadius: 20,
            borderWidth: 0.5,
            padding: 20
          }}>
            <Text style={{color: colors.white, fontSize: fontSizes.lg, fontWeight: '600', textAlign: 'center', marginBottom: 20}}>Are you sure?</Text>
            <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '300', textAlign: 'center'}}>Resetting will delete all of your active and old investments and cannot be undone.</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={()=>setStep(step+1)}
                style={{backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5), paddingVertical: 5, width: 150, borderRadius: 15, alignItems: 'center'}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Yes, I'm sure</Text>
              </TouchableHighlight>
              <View style={{width: 10}}/>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={()=>props.close()}
                style={{backgroundColor: hexToRGBA(colors.background, colors.gray, 0.5), paddingVertical: 5, width: 150, borderRadius: 15, alignItems: 'center'}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Nope</Text>
              </TouchableHighlight>
            </View>
          </View>
        ) : (
          <View style={{
            backgroundColor: colors.background,
            borderColor: colors.gray,
            borderRadius: 20,
            borderWidth: 0.5,
            padding: 20
          }}>
            <Text style={{color: colors.white, fontSize: fontSizes.lg, fontWeight: '600', textAlign: 'center', marginBottom: 20}}>Let's do it</Text>
            <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '300', textAlign: 'center'}}>No turning back after this.</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={resetInvestments}
                style={{backgroundColor: hexToRGBA(colors.background, colors.primary, 0.5), paddingVertical: 5, width: 150, borderRadius: 15, alignItems: 'center'}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Reset</Text>
              </TouchableHighlight>
              <View style={{width: 10}}/>
              <TouchableHighlight
                underlayColor={colors.primary}
                onPress={()=>props.close()}
                style={{backgroundColor: hexToRGBA(colors.background, colors.gray, 0.5), paddingVertical: 5, width: 150, borderRadius: 15, alignItems: 'center'}}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Cancel</Text>
              </TouchableHighlight>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

function SectionHeader({ title }) {
  return (
    <View style={{
      backgroundColor: colors.background, 
      paddingBottom: 10,
      paddingTop: 20,
      borderBottomColor: colors.gray,
      borderBottomWidth: 0.5
    }}>
      <Text style={{color: colors.primary, fontSize: fontSizes.md, fontWeight: '600'}}>{title}</Text>
    </View>
  )

}

function InvestmentItem(props) {
  const tokenSource = axios.CancelToken.source()
  const [price, setPrice] = useState(0)
  const [roi, setROI] = useState({
    dollars: 0,
    percentage: 0
  })
  const [open, setOpen] = useState(false)
  const [ror, setROR] = useState(0)

  useEffect(()=>{
    const getInfo = () => {
      axios.post('http://192.168.86.22:5000/data/get_current_crypto', {id: props.item.data.symbol+'-USD'}, {
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

    return () => {
      tokenSource.cancel()
      clearInterval(clock)
    }
  }, [])

  useEffect(()=>{
    if (price === 0) return
    // Calculate ROI
    let sells = props.item.sells
    let holds = props.item.holds
    let totalUnits = 0, 
        totalReturn = 0,
        costBasis = 0,
        totalRoR = 0
    for (let i=0; i<sells.length; i++) {
      totalReturn = totalReturn + sells[i].return
      costBasis = costBasis + sells[i].buyPrice * sells[i].units
      totalUnits = totalUnits + sells[i].units
      let roiVal = ( (sells[i].sellPrice * sells[i].units - sells[i].buyPrice * sells[i].units) / (sells[i].buyPrice * sells[i].units)) * 100
      totalRoR = totalRoR + (roiVal * ((1000 * 60 * 60 * 24 * 365) / sells[i].age ) * sells[i].units)
    }
    for (let i=0; i<holds.length; i++) {
      let now = new Date(), start = new Date(holds[i].date)
      let age = now.getTime() - start.getTime()
      let val = (price * holds[i].units - holds[i].price * holds[i].units)
      totalUnits = totalUnits + holds[i].units
      totalReturn = totalReturn + val
      costBasis = costBasis + holds[i].price * holds[i].units
      let roiVal = ( (price * holds[i].units - holds[i].price * holds[i].units) / (holds[i].price * holds[i].units)) * 100
      totalRoR = totalRoR + (roiVal * ((1000 * 60 * 60 * 24 * 365) / age ) * holds[i].units)
    }

    let percentageROI = Math.round((totalReturn / costBasis) * 10000) / 100
    let percentageROR = Math.round( (totalRoR / totalUnits) * 100 ) / 100
    setROI({dollars: totalReturn, percentage: percentageROI})
    setROR(percentageROR)
  }, [price])

  const formatUnit = (x) => {
    if (x === 0) return ''
    let int = Math.floor(x / 1)
    let rem = '' + (x % 1)
    rem = rem ? '.' + rem.slice(2) : ''
    let string = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + rem
    return string.slice(0, 10)
  }
  const formatDollars = (x) => {
    x = Math.round(x * 100) / 100
    let pref = x >= 0 ? '$' : '-$'
    return pref + Math.abs(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  const formatPercentage = (x) => {
    x = Math.round(x * 100) / 100
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '%'
  }

  const getBasis = () => {
    let holds = props.item.holds
    let costBasis = 0
    for ( let i=0; i<holds.length; i++ ) {
      costBasis = costBasis + holds[i].units * holds[i].price
    }
    costBasis = costBasis
    return formatDollars(costBasis)
  }

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen(!open)
  }

  return (
    <View style={{ padding: 10 }}>
      <TouchableWithoutFeedback onPress={toggleOpen} >
        <View style={{flexDirection: 'row', alignItems: 'center'}} >
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} color={colors.white} size={18} style={{paddingRight: 5}}/>
          <Text style={{width: '35%', flexDirection: 'row'}} numberOfLines={1}>
            <Text style={{color: 'white', fontWeight: '600', fontSize: fontSizes.md}}>{props.item.data.symbol + '  '}</Text>
            <Text style={{color: 'white', fontWeight: '400', fontStyle: 'italic'}}>{props.item.data.name}</Text>
          </Text>
          <Text style={{color: 'white', fontWeight: '600', fontSize: fontSizes.sm, width: '30%', textAlign: 'center'}} numberOfLines={1}>
            {formatUnit(props.item.data.units)}
          </Text>
          <View style={{flexGrow: '1', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
            <TouchableOpacity 
              style={{paddingVertical: 3, borderRadius: 10, width: 40, alignItems: props.item.data.units ? 'flex-end' : 'flex-start'}}
              onPress={()=>props.setPopupState({open: true, step: 3, type: props.item.data.assetCat, action: 'buy', product: {product: props.item.data.symbol + '-USD', symbol: props.item.data.symbol, name: props.item.data.name}})}
            >
              <Text style={{color: colors.white, fontWeight: '600'}}>BUY</Text>
            </TouchableOpacity>
            {props.item.data.units ? (
            <View style={{borderRightColor: colors.primary, borderRightWidth: 1, marginLeft: 5, marginRight: 5, height: 24}}/>
            ) : null}
            {props.item.data.units ? (
            <TouchableOpacity 
              style={{paddingVertical: 3, borderRadius: 10, width: 40, alignItems: 'flex-start'}}
              onPress={()=>props.setPopupState({open: true, step: 3, type: props.item.data.assetCat, action: 'sell', investment: props.item.data})}
            >
              <Text style={{color: colors.white, fontWeight: '600'}}>SELL</Text>
            </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={{maxHeight: open ? null : 0, height: open ? null : 0, overflow: 'scroll', justifyContent: 'flex-end'}}>
        
        <View style={{paddingTop: 5}}>
          <Text style={{color: colors.white, fontWeight: '600', fontSize: fontSizes.sm, marginBottom: 5}}>Stats:</Text>
          <Text style={{paddingHorizontal: 10, marginBottom: 5}} numberOfLines={1}>
            <Text style={styles.statLabel}>{'Basis:  '}</Text>
            <Text style={styles.statData}>{getBasis()}</Text>
          </Text>
          <Text style={{paddingHorizontal: 10, marginBottom: 5}} numberOfLines={1}>
            <Text style={styles.statLabel}>{'ROI:  '}</Text>
            <Text style={[styles.statData, {color: roi.dollars >=0 ? colors.green : colors.error}]}>{formatDollars(roi.dollars)}</Text>
            <Text style={[styles.statData, {color: roi.dollars >=0 ? colors.green : colors.error}]}>{' (' + formatPercentage(roi.percentage) + ')'}</Text>
          </Text>
          <Text style={{paddingHorizontal: 10, marginBottom: 5}} numberOfLines={1}>
            <Text style={styles.statLabel}>{'Total ROR:  '}</Text>
            <Text style={[styles.statData, {color: ror >=0 ? colors.green : colors.error}]}>{formatPercentage(ror) }</Text>
          </Text>
          <Text style={{paddingHorizontal: 10, marginBottom: 5}} numberOfLines={1}>
            <Text style={styles.statLabel}>{'Current price:  '}</Text>
            <Text style={[styles.statData]}>{formatDollars(price)}</Text>
          </Text>
          <Text style={{paddingHorizontal: 10, marginBottom: 5}} numberOfLines={1}>
            <Text style={styles.statLabel}>{'Current value:  '}</Text>
            <Text style={[styles.statData]}>{formatDollars(price * props.item.data.units)}</Text>
          </Text>
          <Text style={{color: colors.white, fontWeight: '600', fontSize: fontSizes.sm, marginBottom: 5, marginTop: 10}}>Trade log:</Text>
          {props.item.data.transactions.map((action, idx)=>{
            let date = new Date(action.date)
            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            date = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
            let string = action.type === 'buy' ? 'Purchased ' : 'Sold '
            string = string + (Math.round(action.units * 100000) / 100000) + ' shares at ' + '$' + action.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' per share'
            return(
              <View style={{paddingHorizontal: 10}} key={idx}>
                <Text style={{color: colors.white, fontWeight: '300'}}>{string}</Text>
                <Text style={{color: colors.gray, fontStyle: 'italic', marginBottom: 5}}>{date}</Text>
              </View>
              
            )
          })}
        </View>

      </View>

    </View>
    
  )
}

const styles = StyleSheet.create({
  statGroup: {
  },
  statLabel: {
    color: colors.gray,
    fontSize: fontSizes.sm,
    fontWeight: '300',
  },
  statData: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '300',
    overflow: 'hidden'
  }
})