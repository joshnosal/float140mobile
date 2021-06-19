import React, {useEffect, useState, useRef } from 'react'
import { Text, ActivityIndicator, View, Switch, StyleSheet, TextInput, Keyboard, TouchableOpacity, 
  LayoutAnimation, TouchableHighlight, TouchableWithoutFeedback, FlatList, ScrollView, Platform, UIManager } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { Ionicons, FontAwesome } from '@expo/vector-icons'

import FloatIcon from '../../components/FloatIcon'
import FloatLine from '../../components/FloatLine'

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export default function AllFloats(props) {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    cat: 'All',
    by: 'Newest',
    dir: 'All',
    text: '',
  })
  const [tempFilter, setTempFilter] = useState({
    cat: 'All',
    by: 'Newest',
    dir: 'All',
    text: '',
  })
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(0)
  const [data, setData] = useState([])
  const [filterHeight, setFilterHeight] = useState(0)
  const searchInput = useRef(null)
  const tokenSource = axios.CancelToken.source()
  const increment = 10

  useEffect(()=>{
    setLoading(true)
    getInitialData()
  }, [filter])

  const getInitialData = async (length) => {
    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/float/get_my_floats', {
      filter: filter, 
      skip: 0, 
      inc: increment
    }, {
      cancelToken: tokenSource.token,
      headers: {Authorization: `JWT ${token}`}
    })
    .then(res=>{
      setData(res.data)
      setLoading(false)
    }).catch(err=>console.log(err))
    
  }

  const getMoreData = async () => {
    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/float/get_my_floats', {filter: filter, skip: data.length, inc: increment}, {cancelToken: tokenSource.token})
    .then(res=>{
      let array = [...data]
      array = array.concat(res.data)
      setData(array)
      setLoading(false)
    }).catch(err=>console.log(err))
  }

  const renderMyFloat = ({item}) => {
    if (expanded) {
      return <FloatIcon float={item} user={props.user} showFloat={props.showFloat} />
    } else {
      return <FloatLine float={item} user={props.user} showFloat={props.showFloat} />
    }
  }
  const loadMoreFloats = () => {
    if (loading) return
    getMoreData()
  }

  const expand = () => {
    setTempFilter(filter)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    filterHeight === 0 ? setFilterHeight(480) : setFilterHeight(0)
  }
  const applyFilter = () => {
    setFilter(tempFilter)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setFilterHeight(0)
  }
  const refreshList = () => {
    setLoading(true)
    setTimeout(()=>{
      getInitialData()
    }, 250)
  }


  return (
    <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', margin: 10}}>
          <TouchableOpacity onPress={()=>{
            if (filter.text) {
              setFilter({...filter, text: ''})
              setTempFilter({...tempFilter, text: ''})
            } else {
              searchInput.current.focus()
            }
          }} style={{flex: 1}}>
            <View style={{alignItems: 'center', paddingHorizontal: 0, flexDirection: 'row'}}>
              <Ionicons name={filter.text ? 'close' : 'search'} size={24} color={colors.white}/>
              <TextInput 
                ref={(e)=>searchInput.current = e}
                onChangeText={(text)=>setTempFilter({...tempFilter, text: text})}
                value={tempFilter.text}
                placeholder='Search...'
                placeholderTextColor={colors.gray}
                style={{
                  color: colors.white,
                  fontSize: fontSizes.md,
                  paddingHorizontal: 10,
                  flex: 1,
                }}
                onBlur={()=>setTempFilter(filter)}
                onSubmitEditing={()=>{
                  setFilter(tempFilter)
                }}
              />
            </View>
          </TouchableOpacity>
          <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity onPress={()=>{
              expand()
              searchInput.current.blur()
            }}>
              <Ionicons name='filter' size={24} color={colors.white}/>
            </TouchableOpacity>
          </View>
        </View>
        {/* <View> */}
        <View 
          style={{
            height: 1,
            height: filterHeight ? null : 0,
            flexBasis: 1,
            flex: filterHeight ? 100 : null,
            overflow: 'hidden',
            borderBottomColor: colors.gray,
            borderBottomWidth: 0.5
          }}
        >
          <View style={{justifyContent: 'flex-end'}}>
            <ScrollView>
              <View style={{marginHorizontal: 10, paddingVertical: 3, borderBottomColor: colors.gray, borderBottomWidth: 0.5, minHeight: 28}}>
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Asset Category</Text>
              </View>
              {['All', 'Stocks', 'Cryptocurrencies'].map((item, i)=>(
                <View style={{
                  backgroundColor: tempFilter.cat === item ? hexToRGBA(colors.background, colors.primary, 0.2) : null,
                  minHeight: 28
                }} key={i}>
                  <TouchableHighlight 
                    underlayColor={hexToRGBA(colors.background, colors.primary, 0.4)} 
                    onPress={()=>setTempFilter({...tempFilter, cat: item})}
                    style={{paddingHorizontal: 10, paddingVertical: 3}}
                  >
                    <View style={{flexDirection: 'row'}}>
                      <Ionicons name={item===tempFilter.cat ? 'radio-button-on' : 'radio-button-off'} size={18} color={colors.white}/>
                      <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', paddingLeft: 10}}>{item}</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              ))}
              <View style={{marginHorizontal: 10, paddingVertical: 6, borderBottomColor: colors.gray, borderBottomWidth: 0.5, minHeight: 28}}>
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Sort By</Text>
              </View>
              {['All', 'Buy', 'Sell', 'Hold'].map((item, i)=>(
                <View style={{
                  backgroundColor: tempFilter.dir === item ? hexToRGBA(colors.background, colors.primary, 0.2) : null,
                  minHeight: 26
                }} key={i}>
                  <TouchableHighlight 
                    underlayColor={hexToRGBA(colors.background, colors.primary, 0.4)} 
                    onPress={()=>setTempFilter({...tempFilter, dir: item})}
                    style={{paddingHorizontal: 10, paddingVertical: 3}}
                  >
                    <View style={{flexDirection: 'row'}}>
                      <Ionicons name={item===tempFilter.dir ? 'radio-button-on' : 'radio-button-off'} size={18} color={colors.white}/>
                      <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', paddingLeft: 10}}>{item}</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              ))}
              <View style={{marginHorizontal: 10, paddingVertical: 6, borderBottomColor: colors.gray, borderBottomWidth: 0.5, minHeight: 28}}>
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Sort By</Text>
              </View>
              {['Newest', 'Oldest', 'Comments', 'Votes', 'Badges', 'Floats'].map((item, i)=>(
                <View style={{
                  backgroundColor: tempFilter.by === item ? hexToRGBA(colors.background, colors.primary, 0.2) : null,
                  minHeight: 26
                }} key={i}>
                  <TouchableHighlight 
                    underlayColor={hexToRGBA(colors.background, colors.primary, 0.4)} 
                    onPress={()=>setTempFilter({...tempFilter, by: item})}
                    style={{paddingHorizontal: 10, paddingVertical: 3}}
                  >
                    <View style={{flexDirection: 'row'}}>
                      <Ionicons name={item===tempFilter.by ? 'radio-button-on' : 'radio-button-off'} size={18} color={colors.white}/>
                      <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '400', paddingLeft: 10}}>{item}</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              ))}
              <View style={{margin: 5, alignItems: 'center', justifyContent: 'center', minHeight: 28, flexDirection: 'row'}}>
                <TouchableOpacity onPress={()=>applyFilter()} style={{
                  backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
                  borderRadius: 10,
                  padding: 5,
                  marginHorizontal: 10,
                  width: 100,
                  alignItems: 'center'
                }}>
                  <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>expand()} style={{
                  backgroundColor: hexToRGBA(colors.background, colors.gray, 0.4),
                  borderRadius: 10,
                  padding: 5,
                  marginHorizontal: 10,
                  width: 100,
                  alignItems: 'center'
                }}>
                  <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={refreshList} style={{paddingHorizontal: 10}}>
            <FontAwesome name='refresh' color={colors.white} size={20}/>
          </TouchableOpacity>
          <View style={{flex: 1}}/>
          <Text style={{color: colors.white, fontSize: fontSizes.md}}>{expanded ? 'Grid' : 'List'}</Text>
          <Switch
            trackColor={{false: colors.primary, true: hexToRGBA(colors.background, colors.primary, 0.5)}}
            thumbColor={expanded ? colors.primary : colors.gray}
            ios_backgroundColor={hexToRGBA(colors.background, colors.gray, 0.5)}
            onValueChange={()=>setExpanded(!expanded)}
            value={expanded}
            style={{transform: [{scaleX: 0.6}, {scaleY: 0.6}]}}
          />
        </View>
        {/* LIST AREA */}
        {loading ? (
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size='large' color={colors.primary}/>
          </View>
        ) : (
          <TouchableWithoutFeedback style={{flex: 1}}>
          <FlatList
            data={data}
            renderItem={renderMyFloat}
            keyExtractor={item => item}
            onEndReached={loadMoreFloats}
            ItemSeparatorComponent={()=>(
              <TouchableWithoutFeedback>
                <View style={{borderBottomColor: hexToRGBA(colors.background, colors.gray, 0.15), borderBottomWidth: 20}}/>
              </TouchableWithoutFeedback>
            )}            onEndReachedThreshold={1}
            style={{flex: 1, flexBasis: 1}}
          />
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  loaderView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }

})