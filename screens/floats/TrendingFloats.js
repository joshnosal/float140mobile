import React, {useEffect, useState, useRef } from 'react'
import { Text, ActivityIndicator, View, Switch, StyleSheet, TextInput, Keyboard, TouchableOpacity, 
  TouchableWithoutFeedback, FlatList, Platform, UIManager } from 'react-native'
import { colors, fontSizes, sizes, hexToRGBA } from '../../styles/Theme'
import { FontAwesome, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'
import axios from 'axios'

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
    by: 'Comments',
    text: '',
    trending: true
  })
  const [expanded, setExpanded] = useState(false)
  const [data, setData] = useState([])
  const tokenSource = axios.CancelToken.source()
  const increment = 10

  useEffect(()=>{
    setLoading(true)
    getInitialData()
  }, [filter])

  const getInitialData = (length) => {
    axios.post('http://192.168.86.22:5000/float/get_filtered_floats', {filter: filter, skip: 0, inc: increment}, {cancelToken: tokenSource.token})
    .then(res=>{
      setData(res.data)
      setLoading(false)
    }).catch(err=>console.log(err))
    
  }

  const getMoreData = () => {
    axios.post('http://192.168.86.22:5000/float/get_filtered_floats', {filter: filter, skip: data.length, inc: increment}, {cancelToken: tokenSource.token})
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
  const refreshList = () => {
    setLoading(true)
    setTimeout(()=>{
      getInitialData()
    }, 250)
  }


  return (
    <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', margin: 10}}>
          <TouchableOpacity 
            onPress={()=>setFilter({...filter, by: 'Newest'})}
            style={[styles.filterGroup, {
              backgroundColor: filter.by === 'Newest' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3),
              borderColor: filter.by === 'Newest' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3)
            }]}
          >
            <MaterialCommunityIcons name='clock-time-four-outline' color={colors.white} size={20}/>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>setFilter({...filter, by: 'Comments'})}
            style={[styles.filterGroup, {
              backgroundColor: filter.by === 'Comments' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3),
              borderColor: filter.by === 'Comments' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3)
            }]}
          >
            <FontAwesome name='comment' color={colors.white} size={20}/>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>setFilter({...filter, by: 'Votes'})}
            style={[styles.filterGroup, {
              backgroundColor: filter.by === 'Votes' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3),
              borderColor: filter.by === 'Votes' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3)
            }]}
          >
            <MaterialCommunityIcons name='poll' color={colors.white} size={20}/>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>setFilter({...filter, by: 'Badges'})}
            style={[styles.filterGroup, {
              backgroundColor: filter.by === 'Badges' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3),
              borderColor: filter.by === 'Badges' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3)
            }]}
          >
            <SimpleLineIcons name='badge' color={colors.white} size={20}/>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>setFilter({...filter, by: 'Floats'})}
            style={[styles.filterGroup, {
              backgroundColor: filter.by === 'Floats' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3),
              borderColor: filter.by === 'Floats' ? hexToRGBA(colors.background, colors.primary, 1) : hexToRGBA(colors.background, colors.primary, 0.3)
            }]}
          >
            <SimpleLineIcons name='share' color={colors.white} size={20}/>
          </TouchableOpacity>
        </View>
        {/* <View> */}
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
            onEndReachedThreshold={1}
            style={{flex: 1}}
            ItemSeparatorComponent={()=>(
              <TouchableWithoutFeedback>
                <View style={{borderBottomColor: hexToRGBA(colors.background, colors.gray, 0.15), borderBottomWidth: 20}}/>
              </TouchableWithoutFeedback>
            )}
          />
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  filterGroup: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderRadius: 10
  },
})
