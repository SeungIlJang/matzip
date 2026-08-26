import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {countries, colors} from '@/constants';
import type {Country} from '@/types/domain';

interface CountryPickerProps {
  visible: boolean;
  selectedCode?: string | null;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

function CountryPicker({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: CountryPickerProps) {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return countries;
    }
    return countries.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query),
    );
  }, [keyword]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setKeyword('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select your country</Text>
          <Pressable hitSlop={10} onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search country"
          placeholderTextColor={colors.GRAY_500}
          value={keyword}
          onChangeText={setKeyword}
          autoCorrect={false}
        />

        <FlatList
          data={filtered}
          keyExtractor={item => item.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({item}) => {
            const selected = item.code === selectedCode;
            return (
              <Pressable
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => handleSelect(item)}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.name}>{item.name}</Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.BLACK,
  },
  close: {
    fontSize: 18,
    color: colors.GRAY_700,
  },
  search: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.GRAY_200,
    color: colors.BLACK,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  rowSelected: {
    backgroundColor: colors.RED_300,
  },
  flag: {
    fontSize: 24,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: colors.BLACK,
  },
  check: {
    fontSize: 16,
    color: colors.PINK_700,
    fontWeight: '700',
  },
});

export default CountryPicker;
