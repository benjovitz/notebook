import {NavigationContainer} from '@react-navigation/native'; // npm install @react-navigation/native
import {createNativeStackNavigator} from '@react-navigation/native-stack'; // npm install @react-navigation/native-stack
import { StyleSheet, Text, View, Button, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

const Stack = createNativeStackNavigator();

const App = () => {
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
  
  const  [notes, setNotes] = useState([
    {id:1,noteHeader:"header 1", noteText:"text 1"},
    {id:2,noteHeader:"header 2", noteText:"text 2"}
  ])

  const addNote = (header, text) => {
    const id = notes.length + 1 
    setNotes([...notes,{id:id, noteHeader: header, noteText: text}])
  }

  const updateNote = (header, text, id) => { 
    const updatedNotes = [...notes] 
    const updatedNote = updatedNotes.find(n=>n.id === id)
    updatedNote.noteHeader = header
    updatedNote.noteText = text
    setNotes[updatedNotes]
  }

  return (
  <View style={styles.container}>
    <FlatList data={notes} renderItem={(note) => <Text style={styles.noteItem} onPress={()=>{
      navigation.navigate("Edit", {header: note.item.noteHeader, text: note.item.noteText, updateNote: updateNote,id: note.item.id})
    }}>{note.item.noteHeader}</Text>}>
    </FlatList>
    <Button title='New Note' onPress={()=>{
      navigation.navigate("Edit", {addNote: addNote})
    }}></Button>
  </View>
  )
  }

  const Page2 = ({navigation, route}) => {
    const noteText = route.params?.text 
    const noteHeader = route.params?.header
    const updateNote = route.params?.updateNote
    const addNote = route.params?.addNote
    const id = route.params?.id
    
    const [replyText, setReplyText] = useState('')
    const [replyHeader, setReplyHeader] = useState('')

    return (
   <View>
    <TextInput style={styles.headerInput} onChangeText={(txt)=>setReplyHeader(txt)}>{noteHeader}</TextInput>
    <TextInput style={styles.textInput} onChangeText={(txt) => setReplyText(txt)}> {noteText}</TextInput>
    <Button title='Save Changes' onPress={()=>{
      updateNote ? updateNote(replyHeader,replyText,id) : addNote(replyHeader,replyText)
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
