import React from 'react'
import { StatusBar } from 'react-native'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import Router from './AppRouter'


const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A1128',
    primary: 'dodgerblue',
    white: 'white',
    text: 'white',
    error: '#d32f2f',
    accent: '#f26419'
  },
}

export default function App() {

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content"/>
      <Router/>
    </PaperProvider>
  );
}




