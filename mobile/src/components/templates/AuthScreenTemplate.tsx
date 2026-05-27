import React from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';
import { BackButton } from '@/components/atoms/BackButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const CARD_TOP_OFFSET = Math.round(SCREEN_HEIGHT * 0.3);

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';

interface Props {
  children: React.ReactNode;
  onBack: () => void;
  imageUri?: string;
}

export function AuthScreenTemplate({ children, onBack, imageUri = DEFAULT_IMAGE }: Props) {
  return (
    <View className="flex-1 bg-white">
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: IMAGE_HEIGHT }}>
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <BackButton onPress={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: CARD_TOP_OFFSET - 32, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-white rounded-t-[32px] px-6 pt-8 pb-6"
          style={{ minHeight: SCREEN_HEIGHT - CARD_TOP_OFFSET + 32 }}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
