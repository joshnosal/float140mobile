import { StyleSheet, Platform, StatusBar } from 'react-native'


const colors = {
  background: '#000000', //'#0A1128',
  primary: '#1e90ff',
  white: '#ffffff',
  text: '#ffffff',
  error: '#d32f2f',
  accent: '#f26419',
  gray: '#808080',
  green: '#149414'
}
const fontSizes = {
  xl: 26,
  lg: 22,
  md: 18,
  sm: 14,
  xs: 10,
}
const sizes = {
  headerHeight: 40
}

const buttons = {}
const fonts = {
  header1: {
    fontSize: 32,
    fontWeight: '500'
  },
  inputLabel1: {
    fontSize: 20,
    fontWeight: '500'
  }
}
const containers = {
  containerColFullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
}


function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const Color = (r, g, b) => ('rgb('+r+','+g+','+b+')')

const hexToRGBA = (bgHex, colorHex, opacity) => {
  let bgRGB = hexToRgb(bgHex)
  let colorRGB = hexToRgb(colorHex)
  if (!opacity) opacity = 0.5

  return Color(
    Math.round((1-opacity) * bgRGB.r + opacity * colorRGB.r),
    Math.round((1-opacity) * bgRGB.g + opacity * colorRGB.g),
    Math.round((1-opacity) * bgRGB.b + opacity * colorRGB.b),
  )
}

export {colors, fontSizes, sizes, hexToRGBA}

export default StyleSheet.create({
  ...buttons,
  ...fonts,
  ...containers,
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  }
})