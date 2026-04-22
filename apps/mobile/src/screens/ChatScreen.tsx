import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OPENROUTER_API_KEY } from '../api/keys';
import { API_BASE_URL } from '../api/config';
import { AuthContext } from '../context/AuthContext';

const COLORS = {
  lavender: '#d4e4f7',
  sage: '#d8e9d4',
  steelBlue: '#8faec8',
  darkNavy: '#1a2742',
  midNavy: '#2c3e5e',
  white: '#ffffff',
  background: '#f2f4f8',
  chatbotBg: '#f8f9fa'
};

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  text: string;
  cards?: any[];
};

export default function ChatScreen({ route, navigation }: any) {
  const agent = route.params?.agent || { id: 'travel-agent', name: 'Travel Agent', icon: '🧳' };
  const { token } = useContext(AuthContext) as any;
  const defaultGreeting = useMemo(
    () => `Hi! I'm your ${agent.name}. Where would you like to travel in India?`,
    [agent.name]
  );
  const agentId = useMemo(
    () => String(agent.id || agent.name || 'travel-agent').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    [agent.id, agent.name]
  );

  const [messages, setMessages] = useState<Message[]>([
    { id: 'msg-0', role: 'assistant', text: defaultGreeting }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydratingMemory, setIsHydratingMemory] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const loadMemory = async () => {
      if (!token) {
        setMessages([{ id: 'msg-0', role: 'assistant', text: defaultGreeting }]);
        return;
      }

      setIsHydratingMemory(true);
      try {
        const response = await fetch(`${API_BASE_URL}/agent-memory/${agentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to load memory');
        }

        const data = await response.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(
            data.messages.map((message: any) => ({
              id: String(message.id),
              role: message.role === 'assistant' ? 'assistant' : 'user',
              text: message.text
            }))
          );
        } else {
          setMessages([{ id: 'msg-0', role: 'assistant', text: defaultGreeting }]);
        }
      } catch (e) {
        setMessages([{ id: 'msg-0', role: 'assistant', text: defaultGreeting }]);
      } finally {
        setIsHydratingMemory(false);
      }
    };

    loadMemory();
  }, [agentId, defaultGreeting, token]);

  const fetchStoredMessages = async () => {
    if (!token) {
      return [] as Message[];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agent-memory/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        return [] as Message[];
      }

      const data = await response.json();
      return Array.isArray(data.messages)
        ? data.messages.map((message: any) => ({
            id: String(message.id),
            role: message.role === 'assistant' ? 'assistant' : 'user',
            text: message.text
          }))
        : [];
    } catch (e) {
      return [] as Message[];
    }
  };

  const replaceStoredMessages = async (persistedMessages: Array<{ role: Role; text: string }>) => {
    if (!token) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/agent-memory/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messages: persistedMessages })
      });
    } catch (e) {
      console.log('Failed to replace agent memory', e);
    }
  };

  const fetchListings = async (query: any) => {
    try {
      const locationMatch = query.location ? query.location.toLowerCase() : '';
      const response = await fetch(`${API_BASE_URL}/listings`);
      if (!response.ok) throw new Error('API down');
      const data = await response.json();

      let results = data.listings || [];
      if (locationMatch) {
        results = results.filter((item: any) =>
          item.location?.toLowerCase().includes(locationMatch) ||
          item.title?.toLowerCase().includes(locationMatch)
        );
      }
      return results.slice(0, 3);
    } catch (e) {
      console.log('Falling back to local mock data for agent', e);
      return [
        { id: 'f1', title: `Smart Home in ${query.location || 'India'}`, price: 8500, location: query.location || 'India', photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'] },
        { id: 'f2', title: `Luxury Villa in ${query.location || 'India'}`, price: 15000, location: query.location || 'India', photos: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600'] }
      ];
    }
  };

  const callModel = async (historyMessages: Message[]) => {
    const storedMessages = await fetchStoredMessages();
    const mergedHistory = storedMessages.length > 0 ? storedMessages : historyMessages;
    const userText = mergedHistory[mergedHistory.length - 1]?.text || '';

    if (!OPENROUTER_API_KEY) {
      const fallbackMessage = {
        id: Date.now().toString(),
        role: 'assistant' as Role,
        text: 'API key is missing. Please add your OPENROUTER_API_KEY in apps/mobile/src/api/keys.ts to enable chat.'
      };
      setMessages(prev => [...prev, fallbackMessage]);
      await persistMessages([{ role: 'assistant', text: fallbackMessage.text }]);
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: 'You are a trip planning agent for an Indian travel app. Help users find homes, plan itineraries, and suggest experiences across India. When the user asks for homes or stays in a location, mention that you are also surfacing matching listings. Keep responses concise and friendly.'
          },
          ...mergedHistory.map(message => ({
            role: message.role,
            content: message.text
          }))
        ]
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://next-gen-airbnb.local',
          'X-Title': 'NWXT Gen Mobile'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.error) {
        const errorMessage = {
          id: Date.now().toString(),
          role: 'assistant' as Role,
          text: `Error: ${data.error.message}`
        };
        setMessages(prev => [...prev, errorMessage]);
        await replaceStoredMessages(
          [...mergedHistory, errorMessage].map(message => ({ role: message.role, text: message.text }))
        );
        setIsLoading(false);
        return;
      }

      const assistantMessage = data.choices?.[0]?.message?.content;
      let finalText =
        typeof assistantMessage === 'string'
          ? assistantMessage
          : Array.isArray(assistantMessage)
            ? assistantMessage.map((part: any) => (typeof part === 'string' ? part : part?.text || '')).join('\n')
            : '';

      let cards: any[] = [];
      const looksLikeListingSearch = /\b(stay|stays|hotel|home|homes|villa|apartment|listing|listings|goa|pune|mumbai|jaipur|manali|kerala|srinagar)\b/i.test(userText);
      if (looksLikeListingSearch) {
        cards = await fetchListings({ location: userText });
        if (cards.length > 0 && !finalText) {
          finalText = 'I found a few places you might like:';
        }
      }

      if (finalText || cards.length > 0) {
        const assistantReply = {
          id: Date.now().toString(),
          role: 'assistant' as Role,
          text: finalText || 'Here are some places:',
          cards: cards.length > 0 ? cards : undefined
        };
        setMessages(prev => [...prev, assistantReply]);
        await replaceStoredMessages(
          [...mergedHistory, assistantReply].map(message => ({ role: message.role, text: message.text }))
        );
      }
    } catch (err) {
      const fallbackError = {
        id: Date.now().toString(),
        role: 'assistant' as Role,
        text: "I'm having trouble connecting to my servers right now."
      };
      setMessages(prev => [...prev, fallbackError]);
      await replaceStoredMessages(
        [...mergedHistory, fallbackError].map(message => ({ role: message.role, text: message.text }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const nextMessages = [...messages, { id: Date.now().toString(), role: 'user' as Role, text: userMsg }];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);
    replaceStoredMessages(nextMessages.map(message => ({ role: message.role, text: message.text })));
    callModel(nextMessages);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerIcon}>{agent.icon}</Text>
          <Text style={styles.headerTitle}>{agent.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isHydratingMemory && messages.length === 1 ? (
            <View style={[styles.messageWrapper, styles.aiWrapper]}>
              <View style={styles.aiAvatar}>
                <Text style={{ fontSize: 16 }}>{agent.icon}</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.steelBlue} />
              </View>
            </View>
          ) : null}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <Text style={{ fontSize: 16 }}>{agent.icon}</Text>
                  </View>
                )}

                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  {!!msg.text && (
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                      {msg.text}
                    </Text>
                  )}

                  {msg.cards && msg.cards.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
                      {msg.cards.map((card: any, idx: number) => (
                        <TouchableOpacity
                          key={card.id || idx}
                          style={styles.listingCard}
                          onPress={() => navigation.navigate('ListingDetail', { item: {
                            ...card,
                            image: (card.photos && card.photos[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
                            rating: '4.95',
                            badge: 'Agent pick'
                          } })}
                        >
                          <Image
                            source={{ uri: (card.photos && card.photos[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600' }}
                            style={styles.cardImage}
                          />
                          <View style={styles.cardBody}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{card.title}</Text>
                            <Text style={styles.cardPrice}>₹{card.price} / night</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            );
          })}

          {isLoading && (
            <View style={[styles.messageWrapper, styles.aiWrapper]}>
              <View style={styles.aiAvatar}>
                <Text style={{ fontSize: 16 }}>{agent.icon}</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.steelBlue} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { bottom: keyboardHeight > 0 ? keyboardHeight - (Platform.OS === 'ios' ? 10 : 0) : 0 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything..."
            placeholderTextColor={COLORS.steelBlue}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim().length === 0 && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={inputText.trim().length === 0 || isLoading || isHydratingMemory}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: COLORS.darkNavy,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  chatArea: {
    flex: 1,
    backgroundColor: COLORS.chatbotBg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '100%',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: COLORS.darkNavy,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.darkNavy,
  },
  cardsScroll: {
    marginTop: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  listingCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 13,
    color: COLORS.steelBlue,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: COLORS.darkNavy,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#ebebeb',
  },
  sendIcon: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  }
});
