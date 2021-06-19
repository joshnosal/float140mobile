import React, { useState, useContext, useEffect, useRef } from 'react' 
import { Text, View, StyleSheet, TouchableOpacity, Platform, UIManager, LayoutAnimation, 
  KeyboardAvoidingView, TextInput, ScrollView, Modal, TouchableHighlight, TouchableWithoutFeedback, 
  Keyboard, ActivityIndicator, Image } from 'react-native'
import { colors, fontSizes, hexToRGBA } from '../../styles/Theme'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import { AppContext } from '../../components/Context'
import * as ImagePicker from 'expo-image-picker'


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen(props) {
  const [user, setUser] = useState(props.user)
  const [modal, setModal] = useState()
  const { updateUser } = useContext(AppContext)



  return (
    <>
    <View style={styles.header}>
      <View style={{width: 50}}/>
      <Text style={{fontSize: fontSizes.lg, fontWeight: '600', color: colors.primary, flex: 1, textAlign: 'center'}}>Profile</Text>
      <View style={{width: 50}}/>
    </View>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{flex: 1, justifyContent: 'flex-end'}}
    >
      <ScrollView>
        <ProfileImageInput 
          image={user.profilePicture}
          updateUser={item=>setUser(item)}
        />
        <View style={{
          borderBottomColor: colors.gray,
          borderTopColor: colors.gray,
          borderBottomWidth: 0.5,
          borderTopWidth: 0.5,
          paddingVertical: 5,
          marginBottom: 15,
          marginTop: 25
        }}>
          <Text style={{
            color: colors.primary, 
            paddingHorizontal: 20,
            fontSize: fontSizes.md,
            fontWeight: '600',
            borderBottomColor: colors.white,
          }}>Details</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <View style={[styles.rowData, {paddingHorizontal: 10}]}>
            <Text style={styles.rowDataText}>{user.email}</Text>
          </View>
        </View>
        <CustomTextInput 
          label='Username'
          text={user.username}
          updateUser={item=>setUser(item)}
          attribute='username'
          multiline={false}
        />
        <CustomTextInput 
          label='About me'
          text={user.aboutMe}
          updateUser={item=>setUser(item)}
          attribute='aboutMe'
          multiline={true}
        />
        <View style={{height: 100}}/>
      </ScrollView> 
      <View style={{flex: 1}}/>
    </KeyboardAvoidingView>
    <UsernameModal open={modal === 'username' ? true : false} close={()=>setModal()} updateUser={item=>setUser(item)} user={props.user}/>
    </>
  )
}

const ProfileImageInput = (props) => {
  const [image, setImage] = useState(props.image || null)
  const { updateUser } = useContext(AppContext)

  useEffect(()=>{
    setImage(props.image || null)
  }, [props.image])

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        base64: true,
        allowsEditing: true,
        aspect: [1,1],
        quality: 0,
      });
    } catch {
      return
    }

    if (!result.cancelled) {
      let obj = {}
      obj.profilePicture = 'data:image/jpg;base64,' + result.base64
      updateUser(obj, saveUser)
    }
  };

  const clearImage = () => {
    let obj = {}
    obj.profilePicture = ''
    updateUser(obj, saveUser)
  }

  const saveUser = (obj) => {
    if (!obj) {
      alert('Something went wrong')
    } else {
      props.updateUser(obj)
    }
    
  }

  return (
    <View style={{justifyContent: 'center', alignItems: 'center', padding: 10, marginTop: 20}}>
      <View style={{ 
        width: 140, 
        height: 140, 
        borderRadius: 70, 
        overflow: 'hidden', 
        backgroundColor: colors.primary, 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 10
      }}>
        {image ? <Image source={{ uri: image }} style={{ width: 140, height: 140 }} /> : <AntDesign name='question' color={colors.white} size={100}/>}
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity onPress={pickImage}>
          <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>New</Text>
        </TouchableOpacity>
        <Text style={{color: colors.gray, fontSize: fontSizes.lg, fontWeight: '500', paddingHorizontal: 10}}>|</Text>
        <TouchableOpacity onPress={clearImage}>
          <Text style={{color: colors.white, fontSize: fontSizes.md, fontWeight: '500'}}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const UsernameModal = (props) => {
  const [open, setOpen] = useState(props.open)
  const [username, setUsername] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updateUser } = useContext(AppContext)

  useEffect(()=>{
    setOpen(props.open)
    setUsername('')
    setError(false)
  }, [props.open])

  const saveUser = (obj) => {
    setLoading(false)
    if (!obj) {
      alert('Something went wrong')
    } else {
      props.updateUser(obj)
      props.close()
    }
  }

  const saveChange = () => {
    setLoading(true)
    if (!username) {
      setUsername('')
      setError(true)
    } else {
      let obj = {}
      obj.username = username
      updateUser(obj, saveUser)
    }
  }


  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={open}
    >
      <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{flex: 1}}
        >
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <View style={{flex: 1, margin: 40, borderWidth: 0.5,  borderRadius: 20, padding: 10, backgroundColor:  hexToRGBA(colors.background, colors.primary, 0.3)}}>
              <View style={{alignItems: 'flex-end', marginBottom: 10}}>
                <TouchableOpacity onPress={props.close}>
                  <MaterialIcons name='close' size={24} color={colors.white}/>
                </TouchableOpacity>
              </View>
              <Text style={{color: colors.white, fontSize: fontSizes.lg, fontWeight: '500', padding: 10}}>Username</Text>
              <TextInput
                style={{
                  color: 'white', 
                  backgroundColor: colors.background,
                  borderColor: error ? colors.error : null,
                  borderWidth: 1, 
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  fontSize: fontSizes.md,
                  margin: 10
                }}

                value={username}
                onChangeText={text => setUsername(text)}
                placeholder='. . .'
                placeholderTextColor={'gray'}
              />
              <TouchableHighlight 
                onPress={saveChange} 
                underlayColor={colors.primary}
                style={{
                  marginTop: 20, 
                  alignSelf: 'center', 
                  width: 100, 
                  backgroundColor: colors.white,
                  paddingVertical: 5,
                  borderRadius: 15,
                  marginBottom: 10
                }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} size='small'/>
                ) : (
                  <Text style={{color: colors.background, fontSize: fontSizes.md, fontWeight: '600', textAlign: 'center'}}>Save</Text>
                )}
              </TouchableHighlight>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const CustomTextInput = (props) => {
  const [text, setText] = useState(props.text)
  const [edit, setEdit] = useState(false)
  const { updateUser } = useContext(AppContext)
  const textEl = useRef(null)
  
  useEffect(()=>{
    setText(props.text)
  }, [props.text])

  const saveUser = (obj) => {
    if (!obj) {
      alert('Something went wrong')
    } else {
      props.updateUser(obj)
    }
    setEdit(false)
  }

  const saveChange = () => {
    if (!text) {
      setText(props.text)
      setEdit(false)
    } else {
      let obj = {}
      obj[props.attribute] = text
      updateUser(obj, saveUser)
    }
  }

  return(
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{props.label}</Text>
      <View style={[styles.rowData]}>
        <TextInput
          ref={e=>{textEl.current=e}}
          style={{
            color: 'white', 
            borderColor: edit ? colors.gray : colors.background, 
            borderWidth: 0.5, 
            borderRadius: 10,
            paddingVertical: 3,
            marginVertical: 2,
            paddingHorizontal: 10,
            fontSize: fontSizes.md,
            flex: 1
          }}
          multiline={props.multiline}
          editable={edit}
          value={text}
          onFocus={()=>setEdit(true)}
          onChangeText={text => setText(text)}
          placeholder='. . .'
          placeholderTextColor={'gray'}
        />
        <TouchableOpacity onPress={()=>{edit ? saveChange() : setEdit(true)}} style={{padding: 10}}>
          <MaterialIcons name={edit ? 'save' : 'edit'} color={colors.white} size={22}/>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const PrivacyInput = (props) => {
  const [privacy, setPrivacy] = useState(props.privacy || false)
  const { updateUser } = useContext(AppContext)
  
  useEffect(()=>{
    setPrivacy(props.privacy || false)
  }, [props.privacy])

  const saveUser = (obj) => {
    if (!obj) {
      alert('Something went wrong')
    } else {
      props.updateUser(obj)
    }
  }

  const saveChange = () => {
    setPrivacy(!privacy)
    let obj = {}
    obj.private = !privacy
    updateUser(obj, saveUser)
  }

  return (
    <View  style={styles.row}>
      <Text style={styles.rowLabel}>Privacy</Text>
      <View style={{minHeight: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}}>
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={saveChange}>
          <MaterialIcons name={privacy ? 'check-box' : 'check-box-outline-blank'} color={colors.white} size={24}/>
          <Text style={{color: colors.white, fontSize: fontSizes.md, marginLeft: 10}}>{privacy ? 'Private' : 'Public'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    minHeight: 40,
    borderBottomColor: colors.gray,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  row: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  rowLabel: {
    color: colors.gray,
    fontSize: fontSizes.sm,
    paddingHorizontal: 10
  },
  rowData: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    minHeight: 40
  },
  rowDataText: {
    color: colors.white,
    fontSize: fontSizes.md,
    paddingVertical: 5
  },
  rowInputOuter: {
    overflow: 'scroll', 
    justifyContent: 'flex-end', 
  },
  rowInputInner: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  rowTextInput: {
    color: 'white', 
    borderColor: colors.gray, 
    borderWidth: 0.5, 
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: fontSizes.md,
    flex: 1,
  }
})