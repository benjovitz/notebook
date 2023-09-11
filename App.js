import {NavigationContainer} from '@react-navigation/native'; // npm install @react-navigation/native
import {createNativeStackNavigator} from '@react-navigation/native-stack'; // npm install @react-navigation/native-stack
import { StyleSheet, Text, View, Button, TextInput, FlatList, } from 'react-native';
import React, { useState } from 'react';
import { app, database } from './firebase.js';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {useCollection} from "react-firebase-hooks/firestore"

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

console.log("hej")

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


function updateNoteInDatabase(noteHeader, noteText, id){
  updateDoc(doc(database, "notes", id),{
    noteHeader: noteHeader,
    noteText: noteText
  })
}
  
  const  [notes, setNotes] = useState([
    {key:1,noteHeader:"header 1", noteText:"text 1"},
    {key:2,noteHeader:"header 2", noteText:"text 2"}
  ])

  const updateNote = (header, text, key) => { 
    const updatedNotes = [...notes] 
    const updatedNote = updatedNotes.find(n=>n.key === key)
    updatedNote.noteHeader = header
    updatedNote.noteText = text
    setNotes(updatedNotes)
  }
  return (
  <View style={styles.container}>
    <FlatList data={data} renderItem={(note) =><View> 
      <Text style={styles.noteItem} onPress={()=>{
      navigation.navigate("Edit", {
        header: note.item.noteHeader,
        text: note.item.noteText, 
        updateNote: updateNote,
        key: note.item.key,
      addToDatabase: addToDatabase})
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
    const noteText = route.params?.text 
    const noteHeader = route.params?.header
    const updateNote = route.params?.updateNote
    const addNote = route.params?.addNote
    const key = route.params?.key
    const addToDatabase = route.params?.addToDatabase
    
    const [replyText, setReplyText] = useState('')
    const [replyHeader, setReplyHeader] = useState('')

    return (
   <View>
    <TextInput style={styles.headerInput} onChangeText={(txt)=>setReplyHeader(txt)}>{noteHeader}</TextInput>
    <TextInput style={styles.textInput} onChangeText={(txt) => setReplyText(txt)}> {noteText}</TextInput>
    <Button title='Save Changes' onPress={()=>{
      updateNote ? updateNote(replyHeader,replyText,key) : addToDatabase(replyHeader,replyText)
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
