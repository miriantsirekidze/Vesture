import { observable } from "@legendapp/state";
import { configureSynced, syncObservable } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage
    })
  }
})

const trending$ = observable({
  items: [],
  lastFetched: 0
});

syncObservable(trending$, persistOptions({
  persist: {
    name: 'trending'
  }
}))


export default trending$;