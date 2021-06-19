import React, { useContext, useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, 
  LayoutAnimation, Platform, UIManager, ScrollView, Dimensions } from 'react-native'
import { Switch, Link, Route, useLocation, useHistory } from 'react-router-native'
import { AppContext } from '../../components/Context'
import { colors, fontSizes, hexToRGBA } from '../../styles/Theme'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import axios from 'axios'

import MemberScreen from './Members'
import InvestmentScreen from './Investments'
import useWindowDimensions from 'react-native/Libraries/Utilities/useWindowDimensions'

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Router(props) {
  const history = useHistory()
  const location = useLocation()
  const { user } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [club, setClub] = useState()
  const [display, setDisplay] = useState('Home')
  const [displays, setDisplays] = useState([
    {name: "Home", icon: 'home'}, 
    {name: "Investments", icon: 'analytics'}, 
    {name: "Floats", icon: 'cloud-upload-outline'}, 
    {name: "Feeds", icon: 'chatbubbles-outline'}, 
    {name: "Members", icon: 'people'}, 
    {name: "Stats", icon: 'stats-chart'}, 
  ])
  const widthWin = Dimensions.get('window').width
  const tokenSource = axios.CancelToken.source()
  const scrollerEl = useRef(null)
  const [lockScroll, setLockScroll] = useState(false)

  useEffect(()=>{
    getClub()
    return ()=>tokenSource.cancel()
  },[])

  const getClub = async () => {
    axios.post('http://192.168.86.22:5000/club/club', {id: location.state.id}, {})
    .then(res=>{
      setClub(res.data)
      if (res.data.admin.includes(user._id) && displays.length < 7) {
        let clone = [...displays]
        clone.push({name: 'Settings', icon: 'settings-sharp'})
        setDisplays(clone)
      }
      setLoading(false)
    }).catch(err=>{console.log(err)})
  }

  const updateDisplay = (name) => {
    setDisplay(name)
    for (let i=0; i<displays.length; i++) {
      if (displays[i].name === name) {
        scrollerEl.current.scrollTo({x: widthWin * i, y: 0, animated: true})
      }
    }
    
    toggleMenu()
  }
  const handleScroll = (x) => {
    for (let i=1; i<=displays.length; i++) {
      if (x < i * widthWin) {
        if (display === displays[i-1].name) {
          return
        } else {
          setDisplay(displays[i-1].name)
          return
        }
      }
    }
  }

  const toggleMenu = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen(!open)
  }

  return(
    <View style={{flex: 1}}>
      {/* HEADER */}
      <View style={{
        paddingHorizontal: 20,
        height: 40,
        borderBottomColor: colors.gray,
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{width: 50}}>
          <TouchableOpacity onPress={()=>history.goBack()}>
            <MaterialIcons name='chevron-left' color={colors.primary} size={24}/>
          </TouchableOpacity>
        </View>
        <Text style={{
          fontSize: fontSizes.lg, 
          fontWeight: '600', 
          color: colors.primary, 
          flex: 1, 
          textAlign: 'center'
        }}>{location.state.name}</Text>
        <View style={{width: 50, alignItems: 'flex-end'}}>
          <TouchableOpacity onPress={toggleMenu}>
            <MaterialIcons name='menu' color={colors.primary} size={24}/>
          </TouchableOpacity>
        </View>
      </View>
      {/* MENUBAR */}
      <View style={{
        maxHeight: !open ? 0 : 'auto',
        overflow: 'hidden',
        position: 'absolute',
        top: 40,
        width: '100%',
        zIndex: 10,
        elevation: 10,
        backgroundColor: colors.background,
        justifyContent: 'flex-end',
      }}>
        <View style={{justifyContent: 'flex-end', borderBottomWidth: 0.5}}>
        {displays.map((item, idx)=>(
          <TouchableOpacity key={idx} onPress={()=>updateDisplay(item.name)} style={{
            flexDirection: 'row', 
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: display === item.name ? hexToRGBA(colors.background, colors.primary, 0.5) : null,
            height: 40,
          }}>
            <Ionicons name={item.icon} color={colors.white} size={22}/>
            <Text style={{color: 'white', marginLeft: 10, fontSize: fontSizes.md}}>{item.name}</Text>
          </TouchableOpacity>
        ))}

        </View>
      </View>
      {/* <View style={{flex: 1, position: 'relative'}}/> */}
      {/* BODY */}
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color={colors.primary} size='large'/>
        </View>
      ) : (
        <ScrollView
          ref={e=>{scrollerEl.current = e}}
          horizontal={true}
          contentContainerStyle={{
            minWidth: widthWin * displays.length,
            flex: 1,
          }}
          scrollEventThrottle={200}
          decelerationRate='fast'
          pagingEnabled
          onScroll={e=>handleScroll(e.nativeEvent.contentOffset.x)}
          scrollEnabled={!lockScroll}
          disableScrollViewPanResponder={lockScroll}
        >
          {displays.map((view, idx)=>(
            <View style={{width: widthWin}} key={idx}>
              {view.name === 'Investments' ? (
                <InvestmentScreen refreshClub={getClub} club={club} user={user} display={display} lockScroll={b=>setLockScroll(b)}/>
              ) : view.name === 'Floats' ? (
                <Text style={{color: 'white'}}>{view.name}</Text>
              ) : view.name === 'Feeds' ? (
                <Text style={{color: 'white'}}>{view.name}</Text>
              ) : view.name === 'Members' ? (
                <MemberScreen refreshClub={getClub} club={club} user={user} display={display}/>
              ) : view.name === 'Stats' ? (
                <Text style={{color: 'white'}}>{view.name}</Text>
              ) : view.name === 'Settings' ? (
                <Text style={{color: 'white'}}>{view.name}</Text>
              ) : (
                <Text style={{color: 'white'}}>{view.name}</Text>
              )}
            </View>
          ))}

        </ScrollView>
      )}

      
      
      
    </View>
  )
}