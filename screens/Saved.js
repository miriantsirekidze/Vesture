import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, View, ScrollView } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import { useTheme } from "../theme/ThemeProvider";


const Saved = () => {
  const {colors} = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const headerHeight = useHeaderHeight()

  return (
    <View style={styles.container}>
      <ScrollView style={{ paddingTop: headerHeight }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', }}>
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 400, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
        <Image source={require('../assets/cat.jpg')} style={{ height: 150, width: 250, resizeMode: 'contain', borderRadius: 10, marginTop: 10 }} />
      </ScrollView>
    </View>
  )
}

export default Saved

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    }
  })