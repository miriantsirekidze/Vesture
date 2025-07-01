import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from "../theme/ThemeProvider";

const Outfit = () => {

  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <Text>Outfit</Text>
    </View>
  )
}

export default Outfit

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    }
  })