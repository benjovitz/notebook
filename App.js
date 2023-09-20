import {NavigationContainer} from '@react-navigation/native'; // npm install @react-navigation/native
import {createNativeStackNavigator} from '@react-navigation/native-stack'; // npm install @react-navigation/native-stack
import { StyleSheet, Text, View, Button, TextInput, FlatList, Image } from 'react-native';
import React, { useState } from 'react';
import { app, database, storage } from './firebase.js';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {useCollection} from "react-firebase-hooks/firestore"
import {ref, uploadBytes, getDownloadURL} from "firebase/storage"
import * as ImagePicker from "expo-image-picker"

const Stack = createNativeStackNavigator();

const App = () => {

  //alert(JSON.stringify(database, null, 4))

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Page1'>
        <Stack.Screen
          name='Main'
          component={Page1}
          options={{ title: 'Notes App' }}
        />
        <Stack.Screen
          name='Edit'
          component={Page2}
          options={{ title: 'Edit Note' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Page1 = ({navigation, route}) => {
  
  const [values, loading, error] = useCollection(collection(database, "notes"))
  const data = values?.docs.map((doc => ({...doc.data(), id: doc.id})))

  async function addToDatabase(noteHeader, noteText){
    try{
    await addDoc(collection(database, "notes"),{
      noteHeader: noteHeader,
      noteText: noteText
    })
  } catch(err) {
    console.log("fejl i database", err)
  }
}
async function deleteFromDatabase(id){
  await deleteDoc(doc(database, "notes", id))
}


async function updateNoteInDatabase(noteHeader, noteText, id){
  noteHeader = noteHeader || data.find(note => note.id = id ).noteHeader
  noteText = noteText || data.find(note => note.id = id ).noteText
  await updateDoc(doc(database, "notes", id),{
    noteHeader: noteHeader,
    noteText: noteText
  })
}



  return (
  <View style={styles.container}>
    <FlatList data={data} renderItem={(note) =><View> 
      <Text style={styles.noteItem} onPress={()=>{
      navigation.navigate("Edit", {
        header: note.item.noteHeader,
        text: note.item.noteText, 
        key: note.item.id,
        updateNoteInDatabase: updateNoteInDatabase})
    }}>{note.item.noteHeader}
    </Text>
    <Text onPress={()=> deleteFromDatabase(note.item.id)}>X</Text>
    </View>}>
    </FlatList>
    <Button title='New Note' onPress={()=>{
      navigation.navigate("Edit", {addToDatabase: addToDatabase})
    }}></Button>
  </View>
  )
  }

  const Page2 = ({navigation, route}) => {
    const [imagePath, setImagePath] = useState(null)

    const noteText = route.params?.text 
    const noteHeader = route.params?.header
    const updateNoteInDatabase = route.params?.updateNoteInDatabase
    const key = route.params?.key
    const addToDatabase = route.params?.addToDatabase

    async function uploadImage(){
      const res = await fetch(imagePath)
      const blob = await res.blob()
      const storageRef = ref(storage, `${key}.jpg`)
      uploadBytes(storageRef, blob).then((snapshot) => {
        alert("image uploaded")
      })
    }

    async function donwloadImage(){
      await getDownloadURL(ref(storage, `${key}.jpg`))
      .then((url) => {
        setImagePath(url)
      })
      .catch((err) => {
        alert(err)
      })
    }

async function launchImagePicker(){
  let result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true
   })
   if(!result.canceled){
    console.log("get image")
    setImagePath(result.assets[0].uri)

   }
}
    const [replyText, setReplyText] = useState('')
    const [replyHeader, setReplyHeader] = useState('')

    return (
   <View>
    <TextInput style={styles.headerInput} onChangeText={(txt)=>setReplyHeader(txt)}>{noteHeader}</TextInput>
    <TextInput style={styles.textInput} onChangeText={(txt) => setReplyText(txt)}> {noteText}</TextInput>
    <Image style={{width: 200, height: 200}} source={{uri: imagePath}}></Image>
    <Button title='download image' onPress={donwloadImage}></Button>
    <Button title='pick image' onPress={launchImagePicker}></Button>
    <Button title='Save Changes' onPress={()=>{
      updateNoteInDatabase ? updateNoteInDatabase(replyHeader, replyText, key) : addToDatabase(replyHeader,replyText)
      uploadImage()
      navigation.goBack()
    }}></Button>
   </View>
    )
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  noteHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    marginBottom: 20,
    paddingVertical: 10,
    color: '#333',
  },
  textInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#333',
  },
});


export default App;
