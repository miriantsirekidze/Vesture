import React, { useState, useMemo } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../utils/firebase';

import { useTheme } from '../theme/ThemeProvider';
import Carousel from '../components/home/Carousel';

export default function Home() {
  const [result, setResult] = useState({ entities: [], pages: [], time: 0 });

  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const pickAndDetect = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
    });
    if (res.canceled) return;
    const base64 = res.assets[0].base64;

    const start = Date.now();
    try {
      const detectFn = httpsCallable(functions, 'detectImage');
      const { data } = await detectFn({ imageBase64: base64 });
      const elapsed = Date.now() - start;
      setResult({
        entities: data.webEntities,
        pages: data.pages,
        time: elapsed,
      });
    } catch (e) {
      console.error(e);
      setResult({ entities: [], pages: [], time: Date.now() - start });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      <Carousel/>
    </ScrollView>
  );
}


const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    }
  })