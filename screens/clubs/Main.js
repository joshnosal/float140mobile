import React, { Component, createRef, useState, useRef, useEffect } from 'react';
import { Animated, StyleSheet, View, Text, ScrollView } from 'react-native';
import { RectButton, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors, fontSizes } from '../../styles/Theme';
import { LinearGradient } from 'expo-linear-gradient'

const intervals = 4

export default class ClubScreenMain extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 0,
      interval: 1,
      headerScroll: false,
      bodyScroll: false
    }
    this.headerEl = createRef()
    this.bodyEl = createRef()
  }

  sizeScroll = (w, h) => {
    this.setState({width: w / intervals })
  }

  getHeaderSnapOffsets = () => {
    let array = []
    for (let i=0; i<=intervals; i++) {
      array.push(i * (this.state.width / 3))
    }
    return array
  }

  getHeaderInterval = (offset, data) => {
    if (this.state.bodyScroll) return this.setState({bodyScroll: false})

    this.setState({headerScroll: true}, ()=>{
      let int = 0
      if (offset < (this.state.width / 6)) {
        int = 1
      } else if ( offset >= ((this.state.width / 3) * (intervals - 1.5))) {
        int = intervals
      } else {
        for (let i=2; i<intervals; i++) {
          if ( offset >= ((this.state.width / 3) * (i - 1.5)) && offset < ((this.state.width / 3) * (i - 0.5))) {
            int = i
            break
          }
        }
      }
      if (int !== this.state.interval) this.setState({interval: int})
    })
  }

  getBodyInterval = (offset) => {
    if (this.state.headerScroll) return this.setState({headerScroll: false})

    this.setState({bodyScroll: true}, ()=>{
      let int = 0
      if (offset < (this.state.width / 2)) {
        int = 1
      } else if ( offset >= (this.state.width * (intervals - 1.5)) ) {
        int = intervals
      } else {
        for (let i=2; i<intervals; i++) {
          if ( offset >= (this.state.width * (i - 1.5)) && offset < (this.state.width * (i - 0.5))) { 
            int = i
            break
          }
        }
      }
      if (int !== this.state.interval) {
        this.setState({interval: int})
      }
    })    
  }

  componentDidUpdate(prevProps, prevState){
    if (prevState.interval === this.state.interval) return
    if (prevState.bodyScroll !== this.state.bodyScroll) return
    if (prevState.headerScroll !== this.state.headerScroll) return
    if (this.state.bodyScroll) {
      let xOffset = (this.state.interval - 1) * (this.state.width / 3)
      this.headerEl.current.scrollTo({x: xOffset, y: 0, animated: true})
    } else if (this.state.headerScroll) {
      console.log('here')
      let xOffset = (this.state.interval - 1) * this.state.width
      this.bodyEl.current.scrollTo({x: xOffset, y: 0, animated: true})
    } else {

      // let xhOffset = (this.state.interval - 1) * (this.state.width / 3)
      // this.headerEl.current.scrollTo({x: xhOffset, y: 0, animated: true})
      // let xbOffset = (this.state.interval - 1) * this.state.width
      // this.bodyEl.current.scrollTo({x: xbOffset, y: 0, animated: true})
    }
  }

  render(){
    return(
      <>
      <ScrollView
        ref={(e)=>this.headerEl.current = e}
        horizontal={true}
        style={styles.scrollHeader}
        contentContainerStyle={{ width: `${(intervals + 2) * (100 / 3)}%`}}
        scrollEventThrottle={200}
        decelerationRate='fast'
        snapToOffsets={this.getHeaderSnapOffsets()}
        onScroll={data=>this.getHeaderInterval(data.nativeEvent.contentOffset.x, data)}
        onMomentumScrollEnd={()=>this.setState({headerScroll: false})}
      >
        <View style={{width: this.state.width / 3, flex: 1, alignItems: 'center', justifyContent: 'center'}}/>
        <View style={{width: this.state.width / 3, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <TouchableWithoutFeedback onPress={()=>this.setState({interval: 1})}>
            <Text style={this.state.interval===1 ? styles.activeHeaderText : styles.inactiveHeaderText}>All Clubs</Text>
          </TouchableWithoutFeedback>
        </View>
        <View style={{width: this.state.width / 3, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={this.state.interval===2 ? styles.activeHeaderText : styles.inactiveHeaderText}>Favorites</Text>
        </View>
        <View style={{width: this.state.width / 3, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={this.state.interval===3 ? styles.activeHeaderText : styles.inactiveHeaderText}>Top Clubs</Text>
        </View>
        <View style={{width: this.state.width / 3, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={this.state.interval===4 ? styles.activeHeaderText : styles.inactiveHeaderText}>Events</Text>
        </View>
        <View style={{width: this.state.width / 3, flex: 1, alignItems: 'center', justifyContent: 'center'}}/>
      </ScrollView>
      <View style={styles.targetBar} />
      <ScrollView 
        ref={(e)=>this.bodyEl.current = e}
        horizontal={true}
        style={styles.scrollContainer}
        contentContainerStyle={{ width: `${100 * intervals}%`}}
        scrollEventThrottle={200}
        // decelerationRate='fast'
        pagingEnabled
        onContentSizeChange={this.sizeScroll}
        onScroll={(data)=>{
          this.getBodyInterval(data.nativeEvent.contentOffset.x)
        }}
        onMomentumScrollEnd={()=>this.setState({bodyScroll: false})}
      >
        <View style={{width: this.state.width}}>
          <Text style={{color: 'white'}}>All Clubs</Text>
        </View>
        <View style={{width: this.state.width}}>
          <Text style={{color: 'white'}}>Favorites</Text>
        </View>
        <View style={{width: this.state.width}}>
          <Text style={{color: 'white'}}>Top Clubs</Text>
        </View>
        <View style={{width: this.state.width}}>
          <Text style={{color: 'white'}}>Events</Text>
        </View>
      </ScrollView>
      </>
    )
  }
}


const styles = StyleSheet.create({
  gradientStyleRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 40,
    width: 100,
  },
  targetBar: {
    position: 'absolute',
    top: 38,
    left: '50%',
    transform: [{translateX: -50}],
    width: 100,
    backgroundColor: colors.primary,
    height: 2
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollHeader: {
    maxHeight: 40,
    flex: 1,
    width: '100%',
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5
  },
  activeHeaderText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.md
  },
  inactiveHeaderText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.sm
  }
})