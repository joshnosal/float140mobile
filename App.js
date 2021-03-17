import React, { useState, useEffect } from 'react'
import { StatusBar, AppState } from 'react-native'
import Router from './AppRouter'
import { NativeRouter } from "react-router-native"
import { useNetInfo } from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'



export default function App() {
  const netInfo = useNetInfo()
  const [state, setState] = useState(AppState.currentState)

  useEffect(()=>{
    const handleStateChange = (nextState) => {
      if (state !== 'background') {}
      console.log(nextState)
    }

    AppState.addEventListener('change', handleStateChange)
    return () => AppState.removeEventListener('change', handleStateChange)
  }, [])

  return (
    <NativeRouter> 
      <StatusBar barStyle="light-content"/>
      <Router internet={netInfo.isConnected || false}/>
    </NativeRouter> 
  );
}




