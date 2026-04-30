import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function Logo({ size = 60 }) {
  // Recreated as a high-fidelity SVG to remove background and fix design
  const width = size;
  const height = size / 2;
  
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 200 100">
        <Path 
          d="M20 90L65 10L85 45L70 45L65 35L35 90H20Z" 
          fill="#fff" 
        />
        <Path 
          d="M85 45L110 90H95L80 65L70 85L65 75L85 45Z" 
          fill="#6366f1" 
          opacity={0.8}
        />
        <Path 
          d="M115 10H165C180 10 190 20 190 35C190 50 180 60 165 60H140L170 90H150L125 65H130L170 65C175 65 178 62 178 58V37C178 33 175 30 170 30H130V90H115V10Z" 
          fill="#fff" 
        />
      </Svg>
    </View>
  );
}

export function FullLogo({ size = 40 }) {
  return (
    <View style={styles.container}>
      <Logo size={size * 2} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>AR ASSOCIATE</Text>
        <View style={styles.subtitleRow}>
           <View style={styles.line} />
           <Text style={styles.subtitle}>Enterprise Engine</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  line: {
    height: 1,
    width: 15,
    backgroundColor: 'rgba(79, 70, 229, 0.5)',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
