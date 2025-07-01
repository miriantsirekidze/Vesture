import React, { useEffect } from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PADDING = 2.5;
const CONTAINER_WIDTH = 65;
const CONTAINER_HEIGHT = 35;
const CIRCLE_SIZE = 25;
const ICON_SIZE = 18;

const ICON_OFFSET = PADDING + (CIRCLE_SIZE - ICON_SIZE) / 2;
const SLIDE_DISTANCE = CONTAINER_WIDTH - CIRCLE_SIZE - PADDING * 2;

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const AnimatedToggle = ({ value, onValueChange, iconOff, iconOn }) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 300 });
  }, [value, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#fff', '#000']
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#000', '#fff']
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: PADDING + progress.value * (SLIDE_DISTANCE - 5) }
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#000', '#fff']
    ),
  }));

  const leftIconStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['#fff', '#ccc']
    ),
  }));
  const rightIconStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['#ccc', '#000']
    ),
  }));

  const activeIconColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['#fff', '#000']
    ),
  }));

  const sunInsideStyle = useAnimatedStyle(() => {
    const opacity = 1 - progress.value;
    const scale = 1 - 0.2 * progress.value;
    return {
      opacity,
      transform: [{ scale }],
    };
  });
  const moonInsideStyle = useAnimatedStyle(() => {
    const opacity = progress.value;
    const scale = 0.8 + 0.2 * progress.value;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.container, containerStyle]}>
        <AnimatedIcon
          // name="sunny"
          name={iconOn}
          size={ICON_SIZE}
          style={[styles.leftIcon, leftIconStyle]}
        />
        <AnimatedIcon
          // name="moon"
          name={iconOff}
          size={ICON_SIZE}
          style={[styles.rightIcon, rightIconStyle]}
        />

        <Animated.View style={[styles.circle, knobStyle]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              sunInsideStyle,
              styles.centerIconContainer,
            ]}
          >
            <AnimatedIcon
              // name="sunny"
              name={iconOn}
              size={ICON_SIZE}
              style={activeIconColorStyle}
            />
          </Animated.View>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              moonInsideStyle,
              styles.centerIconContainer,
            ]}
          >
            <AnimatedIcon
              // name="moon"
              name={iconOff}
              size={ICON_SIZE}
              style={activeIconColorStyle}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    borderRadius: CONTAINER_HEIGHT / 2,
    padding: PADDING,
    borderWidth: 2.5,
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
    top: PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', 
  },
  leftIcon: {
    position: 'absolute',
    left: ICON_OFFSET,
    top: ICON_OFFSET,
  },
  rightIcon: {
    position: 'absolute',
    right: ICON_OFFSET,
    top: ICON_OFFSET,
  },
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedToggle;
