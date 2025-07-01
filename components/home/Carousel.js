import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, TouchableOpacity, Linking } from 'react-native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useDerivedValue,
  scrollTo,
  runOnUI,
} from 'react-native-reanimated';
import { use$ } from '@legendapp/state/react';
import trending$ from '../../stores/trending';
import { useTheme } from '../../theme/ThemeProvider';

export default function Carousel() {
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const trending = use$(trending$.items);
  const { width: screenWidth } = useWindowDimensions();

  const capped = useMemo(() => trending.slice(0, 150), [trending]);
  const withMeta = [], withoutMeta = [];
  capped.forEach(item => {
    if (typeof item.rating === 'number' && typeof item.reviews === 'number') {
      withMeta.push(item);
    } else {
      withoutMeta.push(item);
    }
  });
  const prioritized = [...withMeta, ...withoutMeta];
  const shuffleAvoidingAdjacent = arr => {
    const res = [];
    const buckets = arr.reduce((a, it) => ((a[it.source] = a[it.source] || []).push(it), a), {});
    const srcs = Object.keys(buckets);
    let last = null;
    while (res.length < arr.length) {
      const opts = srcs.filter(s => s !== last && buckets[s].length);
      const pick = opts.length ? opts[Math.floor(Math.random() * opts.length)] : last;
      res.push(buckets[pick].splice(Math.floor(Math.random() * buckets[pick].length), 1)[0]);
      last = pick;
    }
    return res;
  };
  const processed = useMemo(() => shuffleAvoidingAdjacent(prioritized), [prioritized]);
  const carouselData = useMemo(() => [...processed, ...processed], [processed]);

  const PAGE_SIZE = 3;
  const SPACING = 4;
  const totalGaps = PAGE_SIZE + 1;
  const ITEM_WIDTH = (screenWidth - SPACING * totalGaps) / PAGE_SIZE;
  const ITEM_HEIGHT = ITEM_WIDTH * (4 / 2);
  const offsetStep = PAGE_SIZE * (ITEM_WIDTH + SPACING);
  const numPages = Math.ceil(processed.length / PAGE_SIZE);

  const scrollRef = useAnimatedRef();
  const page = useSharedValue(0);
  const timer = useRef(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const scheduleNext = useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => {
      runOnUI(() => {
        'worklet';
        page.value = (page.value + 1) % numPages;
      })();
    }, 3000);
  }, [numPages]);

  useDerivedValue(() => {
    scrollTo(scrollRef, page.value * offsetStep, 0, true);
  });

  useEffect(() => {
    scheduleNext();
    return () => clearTimer();
  }, [scheduleNext]);

  const onScrollBeginDrag = () => {
    clearTimer();
  };
  const onMomentumScrollEnd = event => {
    const x = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(x / offsetStep);
    runOnUI(() => {
      'worklet';
      page.value = newPage;
    })();
    scheduleNext();
  };

  return (
    <View style={styles.outerContainer}>
      <Text style={{ margin: 10, fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>Hot this week.</Text>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={offsetStep}
        decelerationRate='fast'
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: SPACING,
          alignItems: 'center'
        }}
        style={{ width: screenWidth, height: ITEM_HEIGHT }}
      >
        {carouselData.map((item, idx) => (
          <TouchableOpacity
            key={`${item.id}_${idx}`}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              marginRight: SPACING
            }}
            onPress={() => Linking.openURL(item.product_link)}
          >
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: '80%', borderRadius: 8 }}
              resizeMode="cover"
            />
            <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.source}>{item.source}</Text>
            </View>
            <Text style={styles.meta}>
              {item.rating != null ? `${item.rating} ★ (${item.reviews || 0})` : 'No Reviews'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </View>
  );
}


const makeStyles = colors =>
  StyleSheet.create({
    outerContainer: {
      marginTop: '20%'
    },
    title: {
      fontSize: 12,
      marginTop: 4,
      color: colors.textPrimary
    },
    price: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textSecondary
    },
    meta: {
      fontSize: 10,
      color: '#888',
    },
    source: {
      fontSize: 10,
      color: colors.success,
      marginRight: 5
    }
  });
