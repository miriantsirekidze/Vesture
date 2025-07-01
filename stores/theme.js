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

const theme$ = observable({
  isDark: true,

  changeTheme() {
    theme$.isDark.set(!theme$.isDark.get());
  }
});

syncObservable(theme$, persistOptions({
  persist: {
    name: 'theme'
  }
}))


export default theme$;