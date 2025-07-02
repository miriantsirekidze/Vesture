import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, TouchableOpacity, Linking } from 'react-native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useDerivedValue,
  scrollTo,
  runOnUI,
  withTiming,
} from 'react-native-reanimated';
import { use$ } from '@legendapp/state/react';
import trending$ from '../../stores/trending';
import { useTheme } from '../../theme/ThemeProvider';

/*–– static parts of your styles ––*/
const baseStyles = StyleSheet.create({
  outerContainer: { marginTop: '20%' },
  title: { fontSize: 12, marginTop: 4 },
  price: { fontSize: 12, fontWeight: 'bold' },
  meta: { fontSize: 10, color: '#888' },
  source: { fontSize: 10, marginRight: 5 },
});

/*–– memoized card ––*/
const CarouselItem = React.memo(
  ({ item, itemStyle, colors }) => (
    <TouchableOpacity
      style={itemStyle}
      onPress={() => Linking.openURL(item.product_link)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: '100%', height: '80%', borderRadius: 8 }}
        resizeMode="cover"
      />
      <Text
        numberOfLines={1}
        style={[
          baseStyles.title,
          { color: colors.textPrimary },
        ]}
      >
        {item.title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={[
            baseStyles.price,
            { color: colors.textSecondary },
          ]}
        >
          {item.price}
        </Text>
        <Text
          style={[
            baseStyles.source,
            { color: colors.success },
          ]}
        >
          {item.source}
        </Text>
      </View>
      <Text style={baseStyles.meta}>
        {item.rating != null
          ? `${item.rating} ★ (${item.reviews || 0})`
          : 'No Reviews'}
      </Text>
    </TouchableOpacity>
  ),
  (prev, next) =>
    prev.item === next.item &&
    prev.itemStyle === next.itemStyle &&
    prev.colors === next.colors
);

export default function Carousel() {
  const { colors } = useTheme();

  /* — data prep — */
  const trending = use$(trending$.items);
  const capped = useMemo(() => trending.slice(0, 150), [trending]);

  const [withMeta, withoutMeta] = useMemo(() => {
    const w = [], wo = [];
    capped.forEach((it) =>
      typeof it.rating === 'number' && typeof it.reviews === 'number'
        ? w.push(it)
        : wo.push(it)
    );
    return [w, wo];
  }, [capped]);

  const prioritized = useMemo(
    () => [...withMeta, ...withoutMeta],
    [withMeta, withoutMeta]
  );

  const shuffleAvoidingAdjacent = useCallback((arr) => {
    const res = [];
    const buckets = arr.reduce((acc, it) => {
      (acc[it.source] || (acc[it.source] = [])).push(it);
      return acc;
    }, {});
    const sources = Object.keys(buckets);
    let last = null;
    while (res.length < arr.length) {
      let opts = sources.filter(
        (src) => src !== last && buckets[src].length
      );
      if (!opts.length) opts = sources.filter((src) => buckets[src].length);
      const pick = opts[Math.floor(Math.random() * opts.length)];
      const bucket = buckets[pick];
      const idx = Math.floor(Math.random() * bucket.length);
      res.push(bucket.splice(idx, 1)[0]);
      last = pick;
    }
    return res;
  }, []);

  const processed = useMemo(
    () => shuffleAvoidingAdjacent(prioritized),
    [prioritized, shuffleAvoidingAdjacent]
  );
  const carouselData = useMemo(
    () => [...processed, ...processed],
    [processed]
  );

  /* — layout math — */
  const { width: screenWidth } = useWindowDimensions();
  const PAGE_SIZE = 3;
  const SPACING = 4;
  const totalGaps = PAGE_SIZE + 1;
  const ITEM_WIDTH = (screenWidth - SPACING * totalGaps) / PAGE_SIZE;
  const ITEM_HEIGHT = ITEM_WIDTH * 2; // 4:2 → 2:1
  const offsetStep = PAGE_SIZE * (ITEM_WIDTH + SPACING);
  const numPages = Math.ceil(processed.length / PAGE_SIZE);

  /* memoize these inline‐styles so they never re-create on theme toggles */
  const scrollStyle = useMemo(
    () => ({ width: screenWidth, height: ITEM_HEIGHT }),
    [screenWidth, ITEM_HEIGHT]
  );
  const contentContainerStyle = useMemo(
    () => ({ paddingHorizontal: SPACING, alignItems: 'center' }),
    []
  );
  const itemStyle = useMemo(
    () => ({
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT,
      marginRight: SPACING,
    }),
    [ITEM_WIDTH, ITEM_HEIGHT, SPACING]
  );

  /* — auto-scroll (UI thread) — */
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
    return clearTimer;
  }, [scheduleNext]);

  /* — user swipe — */
  const onScrollBeginDrag = () => clearTimer();
  const onMomentumScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const newPage = Math.round(x / offsetStep);
    runOnUI(() => {
      'worklet';
      page.value = newPage;
    })();
    scheduleNext();
  };

  return (
    <View style={baseStyles.outerContainer}>
      <Text
        style={{
          margin: 10,
          fontSize: 18,
          fontWeight: '600',
          color: colors.textPrimary,
        }}
      >
        Hot this week.
      </Text>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={offsetStep}
        decelerationRate="fast"
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        style={scrollStyle}
      >
        {carouselData.map((item, idx) => (
          <CarouselItem
            key={`${item.id}_${idx}`}
            item={item}
            itemStyle={itemStyle}
            colors={colors}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}
