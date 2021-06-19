import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, 
Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList, SectionList, TouchableWithoutFeedback } from 'react-native'
import { useHistory, useLocation } from 'react-router-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, fontSizes, sizes, hexToRGBA } from '../styles/Theme'
import axios from 'axios'

import CryptoTicker from './CryptoTicker'
import CryptoChart from './CryptoChartHOC'
import CryptoHealthIndex from './CryptoHealthIndex'
import Crypto24hrStats from './Crypto24hrStats'

function Comment(props) {
  const inc = 5
  const [comment, setComment] = useState()
  const [visible, setVisible] = useState(0)
  const [listening, setListening] = useState(false)
  const tokenSource = axios.CancelToken.source()

  useEffect(()=>{
    if (!props.id) return
    updateComment()
    return () => tokenSource.cancel()
  }, [props.id])

  useEffect(()=>{
    if (!listening) return 
    updateComment()
    setListening(false)
  }, [props.update])

  const updateComment = () => {
    axios.post('http://192.168.86.22:5000/float/get_comment', {id: props.id}, {cancelToken: tokenSource.token})
    .then(res=>{
      setComment(res.data)
    }).catch(err=>{})
  }

  const deleteComment = async () => {
    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/float/delete_comment', {id: comment._id}, {cancelToken: tokenSource.token, headers: {Authorization: `JWT ${token}`}})
    .then(res=>{
      props.refreshParent()
    }).catch(err=>{})
  }

  const loadMore = () => {
    setVisible(visible+inc)
  }

  const getAge = () => {
    let date = new Date()
    let post = new Date(comment.date)
    let age = date.getTime() - post.getTime()
    if (age < 1000 * 60) {
      return Math.round(age / 1000) + 's'
    } else if (age < 1000 * 60 * 60) {
      return Math.round(age / (1000 * 60)) + 'm'
    } else if (age < 1000 * 60 * 60 * 24) {
      return Math.round(age / (1000 * 60 * 60)) + 'h'
    } else if (age < 1000 * 60 * 60 * 24 * 365) {
      return Math.round(age / (1000 * 60 * 60 * 24)) + 'd'
    } else {
      return Math.round(age / (1000 * 60 * 60 * 24 * 365)) + 'yr'
    }
    
  }

  if (!comment) {
    return (
      <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={colors.primary}/>
      </View>
    )
  } else {
    return (
      <View style={{marginTop: 10, paddingLeft: props.level===1 ? 10 : 20, paddingRight: props.level===1 ? 10 : 0}}>
        <Text style={{fontSize: fontSizes.sm}}>
          <Text style={{fontWeight: '600', color: colors.primary}}>{comment.author.username + '  '}</Text>
          <Text style={{color: colors.white}}>{comment.text}</Text>
        </Text>
        <View style={{flexDirection: 'row', paddingVertical: 5}}>
          <Text style={{color: colors.gray, paddingRight: 10}}>{getAge()}</Text>
          {props.level >=4 ? null : (
          <TouchableOpacity onPress={()=>{
            setListening(true)
            props.reply(comment._id)
          }}>
            <Text style={{color: colors.gray, fontWeight: '600', paddingRight: 10}}>Reply</Text>
          </TouchableOpacity>
          )}
          <Text style={{color: colors.gray, paddingRight: 10}}>{comment.children.length + ' Responses'}</Text>
          {comment.author._id === props.user._id ? (
            <TouchableOpacity style={{flex: 1, alignItems: 'flex-end'}} onPress={()=>deleteComment()}>
              <Text style={{color: colors.gray}}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {comment.children.length ? (
          <FlatList
            data={comment.children.slice(0, visible)}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <Comment 
                id={item} 
                reply={props.reply} 
                update={props.update} 
                user={props.user} 
                level={props.level + 1}
                refreshParent={updateComment}
              />
            )}
            ListFooterComponent={()=>{
              if (visible >= comment.children.length) {
                return null
              } else {
                return (
                  <View style={{alignItems: 'center'}}>
                    <TouchableOpacity onPress={()=>loadMore()} style={{
                      paddingVertical: 5, 
                      paddingHorizontal: 20,
                      margin: 5, 
                      // height: 40,
                      // backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                      // borderRadius: 20,
                      // borderWidth: 0.5,
                      justifyContent: 'center'
                    }}>
                      <Text style={{color: colors.white, fontSize: fontSizes.md}}>{(comment.children.length - visible) + ' more replies . . .'}</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            }}
          />
        ) : null}
      </View>
    )
  }
}

export default function FloatDisplay(props) {
  const windowWidth = Dimensions.get('window').width
  const [boardHeight, setBoardHeight] = useState(windowWidth * 0.8)
  const inc = 10
  const [loading, setLoading] = useState(true)
  const [float, setFloat] = useState({})
  const [comments, setComments] = useState([])
  const [visible, setVisible] = useState(inc)
  const [parentID, setParentID] = useState()
  const [comment, setComment] = useState('')
  const [update, setUpdate] = useState(false)
  const tokenSource = axios.CancelToken.source()
  const inputRef = useRef(null)
  const history = useHistory()

  useEffect(()=>{
    if (!props.id) return setLoading(true)
    refreshComments()
  }, [props.id])

  const refreshComments = () => {
    axios.post('http://192.168.86.22:5000/float/get_single_float', {id: props.id}, {cancelToken: tokenSource.token})
    .then(res=>{
      setFloat(res.data)
      setSize(res.data.dataType)
      setComments(res.data.comments)
      setLoading(false)
    }).catch(err=>{console.log(err)})
  }

  const setSize = (type) => {
    if (type === 'ticker') {
      setBoardHeight(100)
    } else if (type === 'health index') {
      setBoardHeight(190)
    } else if (type === '24hr stats') {
      setBoardHeight(215)
    } else {
      setBoardHeight(windowWidth * 0.8)
    }
  }
  
  const loadMore = () => {
    setVisible(visible+inc)
  }

  const submitVote = async (vote) => {
    if (float[vote].includes(props.user._id)) return
    let sells = [...float.sells],
        buys = [...float.buys],
        holds = [...float.holds],
        direction

    if (vote !== 'holds') holds = holds.filter(id => id !== props.user._id)
    if (vote !== 'sells') sells = sells.filter(id => id !== props.user._id)
    if (vote !== 'buys') buys = buys.filter(id => id !== props.user._id)

    if (vote === 'holds') holds.push(props.user._id)
    if (vote === 'sells') sells.push(props.user._id)
    if (vote === 'buys') buys.push(props.user._id)

    if (sells.length > buys.length && sells.length > holds.length) {
      direction = 'Sell'
    } else if (buys.length > sells.length && buys.length > holds.length) {
      direction = 'Buy'
    } else {
      direction = 'Hold'
    }

    let newFloat = {
      ...float,
      holds: holds,
      buys: buys,
      sells: sells,
      totalVotes: holds.length + buys.length + sells.length,
      direction: direction
    }

    setFloat({
      ...float,
      holds: holds,
      buys: buys,
      sells: sells,
      totalVotes: holds.length + buys.length + sells.length,
      direction: direction
    })

    let token = await AsyncStorage.getItem('@userToken')
    let keys = ['holds', 'buys', 'sells', 'totalVotes', 'direction']
    axios.post('http://192.168.86.22:5000/float/update', {float: newFloat, keys: keys}, {cancelToken: tokenSource.token, headers: {Authorization: `JWT ${token}`}})
    .then(res=>{}).catch(err=>{console.log(err)})

  }
  const submitComment = async () => {
    if (!comment) return
    let token = await AsyncStorage.getItem('@userToken')
    axios.post('http://192.168.86.22:5000/float/create_comment', {
      floatID: float._id,
      parentID: parentID,
      date: new Date(),
      text: comment
    }, {
      cancelToken: tokenSource.token, 
      headers: {Authorization: `JWT ${token}`}
    }).then(res=>{
      refreshComments()
      setUpdate(!update)
    }).catch(err=>{console.log(err)})
    inputRef.current.blur()
  }

  const getTicker = () => {
    if (float.assetCat === 'crypto') {
      return <CryptoTicker product={float.details.product} symbol={float.details.currency}/>
    }
  }
  const getDataDisplay = () => {
    if (float.dataType === 'chart') {
      if (float.assetCat === 'crypto') {
        return (
          <CryptoChart 
            width={1} 
            height={0.8} 
            period={float.period} 
            graphs={float.graphs} 
            details={float.details} 
            data={float.live ? undefined : float.data.array}
          />
        )
      }
    } else if (float.dataType === 'ticker') {
      if (float.assetCat === 'crypto') {
        return (
          <TouchableWithoutFeedback>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <CryptoTicker product={float.details.product} symbol={float.details.currency} size='lg'/>
            </View>
          </TouchableWithoutFeedback>
        )
      }
    } else if (float.dataType === 'health index') {
      if (float.assetCat === 'crypto') {
        return (
          <TouchableWithoutFeedback>
            <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
              <CryptoHealthIndex product={float.details.product} symbol={float.details.currency}/>
            </View>
          </TouchableWithoutFeedback>
        )
      }
    } else if (float.dataType === '24hr stats') {
      if (float.assetCat === 'crypto') {
        return (
          <TouchableWithoutFeedback>
            <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
              <Crypto24hrStats product={float.details.product}/>
            </View>
          </TouchableWithoutFeedback>
        )
      }
    }
  }
  const getLabel = () => {
    if (float.assetCat === 'crypto') {
      return float.details.currency + ' ('+ getVote() +') - '+float.details.name
    }
  }
  const getVote = () => {
    if (float.sells.length > float.buys.length && float.sells.length > float.holds.length) {
      return 'Sell'
    } else if (float.buys.length > float.sells.length && float.buys.length > float.holds.length) {
      return 'Buy'
    } else {
      return 'Hold'
    }
  }
  const getDate = () => {
    let date = new Date(float.data.time)
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let month = months[date.getMonth()]
    let minutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()
    let hours = date.getHours() < 10 ? '0'+date.getHours() : date.getHours()
    let ampm = date.getHours() < 12 ? 'a.m.' : 'p.m.'
    return month+'-'+date.getDate()+'-'+date.getFullYear()+' @'+hours+':'+minutes+' '+ampm

  }

  const styleNumber = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  const getVoteStyles = (vote) => {
    let styler = {
      flex: 1,
      flexBasis: 1,
      alignItems: 'center',
      paddingVertical: 5
    }
    if (float[vote].includes(props.user._id)) {
      styler.backgroundColor = hexToRGBA(colors.background, colors.primary, 0.4)
    } else {
      styler.backgroundColor = hexToRGBA(colors.background, colors.primary, 0.2)
    }
    return styler
  }

  const startReply = (id) => {
    setParentID(id)
    inputRef.current.focus()
  }

  const reFloat = () => {
    let state = {
      dataType: float.dataType,
      assetCat: float.assetCat,
      live: float.live,
      image: float.sketchImage,
      details: float.details,
      originalFloat: float._id,
    }
    if (float.dataType === 'chart') {
      state.period = float.period
      state.graphs = float.graphs
      if (!float.live) {
        state.data = float.data.array
        state.time = float.data.time
      }
    }

    history.push({
      pathname: '/floating',
      state: state
    })
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {!float.dataType ? null : (
          <Text style={{
            color: float.sells.length > float.buys.length && float.sells.length > float.holds.length ? colors.error : float.buys.length > float.sells.length && float.buys.length > float.holds.length ? colors.green : colors.gray,
            fontSize: fontSizes.md,
            fontWeight: '600',
            paddingHorizontal: 10
          }}>{getLabel()}</Text>
        )}
        <View style={{flex: 1}}/>
        <TouchableOpacity onPress={()=>props.showFloat()} style={{padding: 10}}>
          <Ionicons name='md-close' color={colors.white} size={24}/>
        </TouchableOpacity>
      </View>
      {!float.dataType ? null : (
        <View style={{paddingHorizontal: 10}}>
          <Text style={{
            color: 'white',
            fontSize: fontSizes.sm,
            paddingBottom: 5,
            fontWeight: '600'
          }}>
            <Text style={{color: colors.primary}}>{float.author.username + '  '}</Text>
            <Text>{float.title}</Text>
          </Text>
          {float.message ? (
          <Text style={{
            color: colors.white,
            fontSize: fontSizes.sm,
            paddingBottom: 10,
          }}>{float.message}</Text>
          ) : null}
        </View>
      )}
      {loading || !float.dataType ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary}/>
        </View>
      ):(
        <>
        <SectionList
          style={{flex: 1}}
          sections={[{
            title: 'Main',
            data: comments.slice(0,visible)
          }]}
          keyExtractor={(item, index)=> item+index}
          renderItem={({item, index}) => (
            <Comment 
              id={item} 
              reply={startReply} 
              update={update} 
              user={props.user}
              level={1}
              index={index}
              refreshParent={refreshComments}
            />
          )}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={()=>{
            if (visible >= comments.length) {
              return null
            } else {
              return (
                <View style={{alignItems: 'center'}}>
                  <TouchableOpacity onPress={()=>loadMore()} style={{
                    paddingVertical: 5, 
                    paddingHorizontal: 20,
                    margin: 5, 
                    height: 40,
                    backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                    borderRadius: 20,
                    borderWidth: 0.5,
                    justifyContent: 'center'
                  }}>
                    <Text style={{color: colors.white, fontSize: fontSizes.md}}>Load more . . .</Text>
                  </TouchableOpacity>
                </View>
              )
            }
          }}
          renderSectionHeader={({ section: { title } }) => (
            <>
            <View style={{position: 'relative', height: boardHeight}}>
              {/* TICKER */}
              {float.showTicker ? (
                <View style={{position: 'absolute', width: windowWidth, justifyContent: 'center', height: 60, marginHorizontal: 0, top: 12}}>
                  {getTicker()}
                </View> 
              ): null}
              {/* TIME STAMP */}
                <Text style={{color: colors.primary, fontSize: fontSizes.sm, position: 'absolute', left: 10, top: 10}}>
                  {float.live ? 'Live '+float.dataType : getDate()}
                </Text>
              {/* SKETCH */}
              <View style={{position: 'absolute', width: windowWidth, height: boardHeight, zIndex: 1, elevation: 1}} pointerEvents='box-none'>
                <Image source={{ uri: float.sketchImage}} style={{width: '100%', height: '100%'}} pointerEvents='box-none'/>
              </View>
              {/* LIVE GRAPH */}
              <View style={{position: 'absolute', width: windowWidth, height: boardHeight}}>
                {getDataDisplay()}
              </View>
            </View>

            {/* VOTE ROW */}
            <View style={styles.voteBtnRow}>
              <TouchableOpacity style={getVoteStyles('buys')} onPress={()=>submitVote('buys')}>
                <Text style={styles.voteBtnCount}>{styleNumber(float.buys.length)}</Text>
                <Text style={styles.voteBtnText}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={getVoteStyles('holds')} onPress={()=>submitVote('holds')}>
                <Text style={styles.voteBtnCount}>{styleNumber(float.holds.length)}</Text>
                <Text style={styles.voteBtnText}>HOLD</Text>
              </TouchableOpacity>
              <TouchableOpacity style={getVoteStyles('sells')} onPress={()=>submitVote('sells')}>
                <Text style={styles.voteBtnCount}>{styleNumber(float.sells.length)}</Text>
                <Text style={styles.voteBtnText}>SELL</Text>
              </TouchableOpacity>
            </View>

            {/* ACTION ROW */}
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity 
                onPress={()=>{inputRef.current.focus()}}
                style={{
                  flexBasis: 1, 
                  flex: 1, 
                  alignItems: 'center',
                  backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
                  marginHorizontal: 10,
                  marginVertical: 5,
                  borderRadius: 10,
                }}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600', padding: 5 }}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={()=>reFloat()}
                style={{
                  flexBasis: 1, 
                  flex: 1, 
                  alignItems: 'center',
                  backgroundColor: hexToRGBA(colors.background, colors.primary, 0.4),
                  marginHorizontal: 10,
                  marginVertical: 5,
                  borderRadius: 10,
                }}
              >
                <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600', padding: 5 }}>Float</Text>
              </TouchableOpacity>
            </View>
            

            {/* COMMENTS TITLE */}
            <View style={{
              paddingHorizontal: 10,

            }}>
              <Text style={{fontSize: fontSizes.sm, fontWeight: '600', color: colors.white}}>Badges</Text>
            </View>
            </>
          )}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
          <View style={{alignItems: 'center', padding: 5, flexDirection: 'row'}}>
            <TextInput 
              ref={(e)=>{inputRef.current=e}}
              style={{
                borderWidth: 0.5,
                borderColor: colors.white,
                borderRadius: 10,
                fontSize: 20,
                color: colors.white,
                padding: 10,
                maxHeight: 100,
                flex: 1
              }}
              value={comment}
              onBlur={()=>{
                setComment()
                setParentID()
              }}
              onChangeText={(text)=>setComment(text)}
              placeholder='Comment...'
              placeholderTextColor={colors.gray}
              multiline={true}
            />
            <TouchableOpacity 
              style={{
                backgroundColor: hexToRGBA(colors.background, colors.primary, 0.3),
                width: 50,
                height: 40,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
              }}
              onPress={()=>submitComment()}
            >
              <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '600'}}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  voteBtnRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 5
  },
  voteBtn: {
    flex: 1,
    flexBasis: 1,
    alignItems: 'center',
  },
  voteBtnText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '600'
  },
  voteBtnCount: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '300'
  },
  commentRow: {
    alignItems: 'center',
  },
  commentBtn: {
    padding: 5,
    width: Dimensions.get('window').width * 0.7,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center'
  },
  commentBtnText: {
    fontSize: fontSizes.md,
    color: colors.white,
  }
})