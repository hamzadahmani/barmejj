import React, {ErrorInfo, PropsWithChildren} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Color} from '../helpers/constatn';

type State = {error: Error | null};

export default class AppErrorBoundary extends React.Component<
  PropsWithChildren,
  State
> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Barmej render error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.brand}>BARMEJ</Text>
        <Text style={styles.title}>L’application n’a pas pu démarrer</Text>
        <Text style={styles.description}>
          Une erreur locale a été détectée. Vous pouvez réessayer sans fermer
          l’application.
        </Text>
        <ScrollView style={styles.errorBox}>
          <Text selectable style={styles.errorText}>
            {this.state.error.message}
          </Text>
        </ScrollView>
        <Pressable
          style={styles.button}
          onPress={() => this.setState({error: null})}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Color.background,
  },
  brand: {color: Color.main, fontSize: 12, fontWeight: '800', letterSpacing: 3},
  title: {color: Color.text, fontSize: 26, fontWeight: '800', marginTop: 16},
  description: {color: Color.muted, fontSize: 14, lineHeight: 21, marginTop: 10},
  errorBox: {
    flexGrow: 0,
    maxHeight: 160,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
  },
  errorText: {color: Color.error, fontSize: 12, lineHeight: 18},
  button: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Color.main,
  },
  buttonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
});
