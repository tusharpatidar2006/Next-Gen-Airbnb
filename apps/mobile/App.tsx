import React, { useState, useMemo, useEffect } from 'react';
import { 
  SafeAreaView, StyleSheet, Text, View, ScrollView, 
  TouchableOpacity, Image, Dimensions, TextInput, Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import HostScreen from './src/screens/HostScreen';
import AIAgentsScreen from './src/screens/AIAgentsScreen';
import ChatScreen from './src/screens/ChatScreen';
import { AuthProvider, AuthContext, MemoryStorage } from './src/context/AuthContext';
import { API_BASE_URL } from './src/api/config';
// ─── UI TOKENS ───
const { width } = Dimensions.get('window');
const COLORS = {
  lavender: '#d4e4f7',
  cream: '#faf5dc',
  sage: '#d8e9d4',
  steelBlue: '#8faec8',
  darkNavy: '#1a2742',
  midNavy: '#2c3e5e',
  white: '#ffffff',
  background: '#ffffff', // base background to match web bright feel
  pillBg: '#ebebeb',
};

// ─── DATA SOURCES (Copied exactly from Next.js Web) ───

type CategoryId = 'homes' | 'experiences' | 'services';

const categories: { id: CategoryId; icon: string; label: string; badge?: string; aiTag?: boolean }[] = [
  { id: 'homes', icon: '🏠', label: 'Homes' },
  { id: 'experiences', icon: '🧳', label: 'Experiences', badge: 'NEW' },
  { id: 'services', icon: '🛎️', label: 'Services', badge: 'NEW' },
  {
    id: 'curated-experiences-services',
    title: 'Trending experiences and services',
    items: [
      { id: 'tr-exp-1', title: 'Airbnb Original Creator Studio', subtitle: 'Hosted pop-up with creators, music, and behind-the-scenes access', location: 'Mumbai', price: '₹2,200 / guest', rating: '4.95', badge: 'Original', category: 'experiences', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80' },
      { id: 'tr-exp-2', title: 'Local Market and Street Food Night', subtitle: 'Small-group tasting trail through iconic neighborhood stalls', location: 'Delhi', price: '₹1,250 / guest', rating: '4.93', badge: 'Popular', category: 'experiences', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80' },
      { id: 'tr-exp-3', title: 'Pottery and Design Workshop', subtitle: 'Hands-on maker session with take-home ceramics', location: 'Jaipur', price: '₹1,600 / guest', rating: '4.89', badge: 'Creative', category: 'experiences', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80' },
      { id: 'tr-svc-1', title: 'Private Yoga at Your Stay', subtitle: 'Certified instructor sessions for solo travelers or groups', location: 'Goa', price: '₹2,500 package', rating: '4.91', badge: 'Wellness', category: 'services', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80' },
      { id: 'tr-svc-2', title: 'In-villa Breakfast and Butler Setup', subtitle: 'Fresh breakfast, table styling, and service staff', location: 'Udaipur', price: '₹3,800 package', rating: '4.90', badge: 'Luxury', category: 'services', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
      { id: 'tr-svc-3', title: 'Premium Cab and Day Driver', subtitle: 'Full-day city transportation with hotel-style pickup', location: 'Hyderabad', price: '₹4,400 package', rating: '4.87', badge: 'Easy travel', category: 'services', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80' },
    ],
  },
];

const suggestedDestinations = [
  { id: 'nearby', icon: '->', title: 'Nearby', subtitle: "Find what's around you", query: '' },
];

const homePhotos = [
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1390971284633-8a13fde9d3aa?auto=format&fit=crop&w=900&q=80',
];

const mockSections = [
  {
    id: 'pune',
    title: 'Popular homes in Pune',
    items: [
      { id: 'pn1', title: 'Modern Loft in Koregaon Park', subtitle: 'Designer duplex with terrace in Pune', location: 'Koregaon Park, Pune', price: '₹8,200 / night', rating: '4.92', badge: 'Guest favourite', category: 'homes', image: homePhotos[0] },
      { id: 'pn2', title: 'Villa in Aundh', subtitle: 'Smart home with pool & garden', location: 'Aundh', price: '₹12,500 / night', rating: '4.87', badge: 'Superhost', category: 'homes', image: homePhotos[1] },
      { id: 'pn3', title: 'Bungalow in Baner', subtitle: 'Quiet neighbourhood, fiber WiFi', location: 'Baner', price: '₹6,900 / night', rating: '4.78', badge: 'Top rated', category: 'homes', image: homePhotos[2] },
      { id: 'pn4', title: 'Penthouse in Viman Nagar', subtitle: 'Sky view, rooftop terrace', location: 'Viman Nagar', price: '₹15,000 / night', rating: '4.96', badge: 'Luxury pick', category: 'homes', image: homePhotos[3] },
      { id: 'pn5', title: 'Farmhouse in Lavasa', subtitle: 'Hill retreat, 40 min from Pune', location: 'Lavasa', price: '₹18,000 / night', rating: '4.95', badge: 'Rare find', category: 'homes', image: homePhotos[4] },
      { id: 'pn-exp', title: 'Prototype Weekend', subtitle: 'Live founder retreat', location: 'Pimpri-Chinchwad', price: '₹6,768 / session', rating: '4.98', badge: 'Creator pick', category: 'experiences', image: homePhotos[8] },
      { id: 'pn-exp-2', title: 'Pune Street Food and Culture Walk', subtitle: 'Old city bites, stories, and hidden lanes', location: 'Pune', price: '₹1,400 / guest', rating: '4.94', badge: 'Popular', category: 'experiences', image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=900&q=80' },
      { id: 'pn-exp-3', title: 'Sunrise Fort Trail near Pune', subtitle: 'Guided trek with breakfast and valley views', location: 'Pune', price: '₹1,850 / guest', rating: '4.91', badge: 'Adventure', category: 'experiences', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
      { id: 'pn-agent', title: 'Prompt Pilot Agent', subtitle: 'Booking assistant for smart flows', location: 'Pune City', price: '₹8,559 setup', rating: '4.96', badge: 'Agent ready', category: 'agents', image: homePhotos[9] },
      { id: 'pn-svc', title: 'AI Concierge Setup', subtitle: 'Custom itinerary + check-in flow', location: 'Pune City', price: '₹20,083 package', rating: '4.86', badge: 'Hot right now', category: 'services', image: homePhotos[0] },
      { id: 'pn-svc-2', title: 'Private Chef for Villa Stays', subtitle: 'In-home Maharashtrian tasting menu service', location: 'Pune', price: '₹5,500 package', rating: '4.92', badge: 'Guest favourite', category: 'services', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80' },
      { id: 'pn-svc-3', title: 'Celebration Decor Setup', subtitle: 'Birthday, anniversary, and proposal room styling', location: 'Pune', price: '₹3,200 package', rating: '4.88', badge: 'Top rated', category: 'services', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    id: 'goa',
    title: 'Available in North Goa this weekend',
    items: [
      { id: 'ga1', title: 'Beach House in Calangute', subtitle: 'Seconds from the shore in Goa', location: 'Calangute, Goa', price: '₹11,000 / night', rating: '4.93', badge: 'Beachfront', category: 'homes', image: homePhotos[1] },
      { id: 'ga2', title: 'Villa in Siolim', subtitle: 'Infinity pool + sunset views', location: 'Siolim', price: '₹24,000 / night', rating: '4.97', badge: 'Guest favourite', category: 'homes', image: homePhotos[2] },
      { id: 'ga3', title: 'Treehouse in Assagao', subtitle: 'Canopy living with hammock porch', location: 'Assagao', price: '₹9,200 / night', rating: '4.88', badge: 'Unique stay', category: 'homes', image: homePhotos[3] },
      { id: 'ga4', title: 'Shack Villa in Morjim', subtitle: 'Turtle beach front', location: 'Morjim', price: '₹14,300 / night', rating: '4.90', badge: 'Eco stay', category: 'homes', image: homePhotos[4] },
      { id: 'ga-exp', title: 'Goa Build Retreat', subtitle: 'Open lounge for team sessions', location: 'Goa', price: '₹10,728 / retreat', rating: '4.98', badge: 'Team ready', category: 'experiences', image: homePhotos[9] },
      { id: 'ga-exp-2', title: 'Sunset Sailing in Goa', subtitle: 'Private catamaran evening with snacks and music', location: 'Goa', price: '₹2,900 / guest', rating: '4.97', badge: 'Popular', category: 'experiences', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80' },
      { id: 'ga-exp-3', title: 'Old Goa Food and Tavern Trail', subtitle: 'Portuguese bites, cocktails, and local stories', location: 'Panaji, Goa', price: '₹1,750 / guest', rating: '4.93', badge: 'New', category: 'experiences', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80' },
      { id: 'ga-agent', title: 'Host Brain Agent', subtitle: 'Automated guest responses', location: 'Candolim', price: '₹11,712 bundle', rating: '4.91', badge: 'Best seller', category: 'agents', image: homePhotos[0] },
      { id: 'ga-svc', title: 'Host Automation Service', subtitle: 'Sprint planning + automations', location: 'Candolim', price: '₹12,437 bundle', rating: '4.84', badge: 'Top host', category: 'services', image: homePhotos[1] },
      { id: 'ga-svc-2', title: 'Beach Picnic Setup', subtitle: 'Styled sunset picnic with decor and snacks', location: 'Goa', price: '₹4,800 package', rating: '4.95', badge: 'Romantic', category: 'services', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80' },
      { id: 'ga-svc-3', title: 'Scooter Rental Concierge', subtitle: 'Doorstep two-wheeler delivery for your stay', location: 'Goa', price: '₹1,200 package', rating: '4.85', badge: 'Handy', category: 'services', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    id: 'mumbai',
    title: 'Weekend escapes near Mumbai',
    items: [
      { id: 'mb1', title: 'Sea-view Flat in Bandra', subtitle: 'Steps from Bandstand promenade in Mumbai', location: 'Bandra West, Mumbai', price: '₹13,500 / night', rating: '4.89', badge: 'Sea view', category: 'homes', image: homePhotos[2] },
      { id: 'mb2', title: 'Penthouse in Juhu', subtitle: 'Beach & Bollywood vibes', location: 'Juhu', price: '₹28,000 / night', rating: '4.96', badge: 'VIP pick', category: 'homes', image: homePhotos[3] },
      { id: 'mb3', title: 'Cottage in Alibaug', subtitle: 'Island escape, ferry ride from Gateway', location: 'Alibaug', price: '₹9,800 / night', rating: '4.82', badge: 'Island life', category: 'homes', image: homePhotos[4] },
      { id: 'mb4', title: 'Bungalow in Mahabaleshwar', subtitle: 'Strawberry valley panorama', location: 'Mahabaleshwar', price: '₹11,500 / night', rating: '4.85', badge: 'Scenic beauty', category: 'homes', image: homePhotos[5] },
      { id: 'mb-exp', title: 'Mumbai Street Food Tour', subtitle: 'AI-curated local food trail', location: 'South Mumbai', price: '₹2,499 / person', rating: '4.97', badge: 'Foodie pick', category: 'experiences', image: homePhotos[0] },
      { id: 'mb-exp-2', title: 'Dharavi Community Walk', subtitle: 'Guided local storytelling and workshop visits', location: 'Mumbai', price: '₹950 / guest', rating: '4.96', badge: 'Popular', category: 'experiences', image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80' },
      { id: 'mb-exp-3', title: 'Bollywood Dance Class in Mumbai', subtitle: 'Studio session with choreographer and reel clips', location: 'Andheri, Mumbai', price: '₹1,800 / guest', rating: '4.92', badge: 'Fun', category: 'experiences', image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=80' },
      { id: 'mb-agent', title: 'City Navigator Agent', subtitle: 'Real-time local recommendations', location: 'Mumbai', price: '₹6,200 setup', rating: '4.88', badge: 'City guide', category: 'agents', image: homePhotos[1] },
      { id: 'mb-svc-1', title: 'Vacation Photographer in Mumbai', subtitle: '1-hour guided shoot at sea-face and heritage spots', location: 'Mumbai', price: '₹4,200 package', rating: '4.94', badge: 'Best seller', category: 'services', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80' },
      { id: 'mb-svc-2', title: 'Airport Transfer and Local Chauffeur', subtitle: 'Private pickup with flexible city drop-offs', location: 'Mumbai', price: '₹3,900 package', rating: '4.87', badge: 'Reliable', category: 'services', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    id: 'bangalore',
    title: 'Tech-friendly stays in Bangalore',
    items: [
      { id: 'bl1', title: 'Loft in Indiranagar', subtitle: 'Indie cafes at your doorstep in Bangalore', location: 'Indiranagar, Bangalore', price: '₹7,200 / night', rating: '4.88', badge: 'Creator fav', category: 'homes', image: homePhotos[3] },
      { id: 'bl2', title: 'Villa in Whitefield', subtitle: 'Gated community, 4BHK pool home', location: 'Whitefield', price: '₹18,500 / night', rating: '4.93', badge: 'Tech enclave', category: 'homes', image: homePhotos[4] },
      { id: 'bl3', title: 'Apartment in Koramangala', subtitle: 'Startup hub, coworking nearby', location: 'Koramangala', price: '₹5,900 / night', rating: '4.75', badge: 'Work-friendly', category: 'homes', image: homePhotos[5] },
      { id: 'bl4', title: 'Farmstay in Chikmagalur', subtitle: 'Coffee estate bungalow', location: 'Chikmagalur', price: '₹14,000 / night', rating: '4.94', badge: 'Brew retreat', category: 'homes', image: homePhotos[6] },
      { id: 'bl-exp', title: 'Bangalore Brew Trail', subtitle: 'Craft beer + local eats tour', location: 'CBR Road', price: '₹3,200 / person', rating: '4.89', badge: 'Social fix', category: 'experiences', image: homePhotos[1] },
      { id: 'bl-exp-2', title: 'Bangalore Art and Cafe Circuit', subtitle: 'Indiranagar murals, coffee tastings, and creators', location: 'Bangalore', price: '₹1,650 / guest', rating: '4.90', badge: 'Popular', category: 'experiences', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80' },
      { id: 'bl-agent', title: 'Startup Scout Agent', subtitle: 'Co-working space finder', location: 'Bangalore', price: '₹9,500 setup', rating: '4.93', badge: 'Builder pick', category: 'agents', image: homePhotos[2] },
      { id: 'bl-svc-1', title: 'Workspace Setup at Your Stay', subtitle: 'Desk, chair, monitor, and fast Wi-Fi upgrade', location: 'Bangalore', price: '₹2,800 package', rating: '4.86', badge: 'Remote ready', category: 'services', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80' },
      { id: 'bl-svc-2', title: 'In-home Massage and Wellness', subtitle: 'Spa therapists for your apartment or villa', location: 'Bangalore', price: '₹3,600 package', rating: '4.91', badge: 'Relaxing', category: 'services', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    id: 'jaipur',
    title: 'Heritage stays in Jaipur 🏰',
    items: [
      { id: 'jp1', title: 'Heritage Haveli in Pink City', subtitle: 'Royal stay with traditional artisan decor', location: 'Jaipur', price: '₹9,000 / night', rating: '4.96', badge: 'Heritage gem', category: 'homes', image: homePhotos[7] },
      { id: 'jp2', title: 'Palace Villa in Amer', subtitle: 'Overlooking the Amber Fort', location: 'Amer', price: '₹22,000 / night', rating: '4.99', badge: 'Royal pick', category: 'homes', image: homePhotos[8] },
      { id: 'jp3', title: 'Boutique Hotel in C-Scheme', subtitle: 'Modern luxury in Jaipur heart', location: 'C-Scheme', price: '₹7,500 / night', rating: '4.80', badge: 'City central', category: 'homes', image: homePhotos[9] },
      { id: 'jp-exp', title: 'Rajasthan Desert Camp', subtitle: 'Camel safari + stargazing night', location: 'Jaisalmer', price: '₹12,500 / night', rating: '4.97', badge: 'Desert magic', category: 'experiences', image: homePhotos[0] },
    ],
  },
  {
    id: 'delhi',
    title: 'Capital stays in New Delhi 🏛️',
    items: [
      { id: 'dl1', title: 'Penthouse in Vasant Vihar', subtitle: 'Diplomatic enclave luxury in Delhi', location: 'Vasant Vihar, Delhi', price: '₹18,000 / night', rating: '4.93', badge: 'Diplomat fav', category: 'homes', image: homePhotos[1] },
      { id: 'dl2', title: 'Apartment in Hauz Khas', subtitle: 'Trendy village, rooftop cafes', location: 'Hauz Khas', price: '₹8,500 / night', rating: '4.86', badge: 'Artsy quarter', category: 'homes', image: homePhotos[2] },
      { id: 'dl3', title: 'Bungalow in Mehrauli', subtitle: 'Near Qutub Minar, garden retreat', location: 'Mehrauli', price: '₹11,000 / night', rating: '4.88', badge: 'History & calm', category: 'homes', image: homePhotos[3] },
      { id: 'dl4', title: 'Flat in Saket', subtitle: 'South Delhi, malls and metro nearby', location: 'Saket', price: '₹5,200 / night', rating: '4.70', badge: 'Value pick', category: 'homes', image: homePhotos[4] },
      { id: 'dl-exp', title: 'Delhi Food Walk', subtitle: 'Chandni Chowk street food trail', location: 'Old Delhi', price: '₹1,999 / person', rating: '4.96', badge: 'Foodie pick', category: 'experiences', image: homePhotos[5] },
    ],
  },
  {
    id: 'hyderabad',
    title: 'Modern stays in Hyderabad',
    items: [
      { id: 'hy1', title: 'Sky Apartment in Hitech City', subtitle: 'Glass skyline views in Hyderabad', location: 'Hitech City, Hyderabad', price: '₹7,900 / night', rating: '4.91', badge: 'Business ready', category: 'homes', image: homePhotos[6] },
      { id: 'hy2', title: 'Villa in Jubilee Hills', subtitle: 'Quiet luxury near the best cafes', location: 'Jubilee Hills, Hyderabad', price: '₹16,500 / night', rating: '4.95', badge: 'Luxury pick', category: 'homes', image: homePhotos[7] },
    ],
  },
  {
    id: 'chennai',
    title: 'Coastal homes in Chennai',
    items: [
      { id: 'ch1', title: 'Sea Breeze Flat in Besant Nagar', subtitle: 'Morning walks and cafe culture in Chennai', location: 'Besant Nagar, Chennai', price: '₹6,700 / night', rating: '4.84', badge: 'Coastal stay', category: 'homes', image: homePhotos[8] },
      { id: 'ch2', title: 'Designer Stay in Adyar', subtitle: 'Leafy streets and easy city access', location: 'Adyar, Chennai', price: '₹8,400 / night', rating: '4.88', badge: 'City favorite', category: 'homes', image: homePhotos[9] },
    ],
  },
  {
    id: 'kolkata',
    title: 'Classic stays in Kolkata',
    items: [
      { id: 'ko1', title: 'Heritage Loft in Ballygunge', subtitle: 'Old-world charm with modern comfort in Kolkata', location: 'Ballygunge, Kolkata', price: '₹6,200 / night', rating: '4.83', badge: 'Cultural pick', category: 'homes', image: homePhotos[0] },
      { id: 'ko2', title: 'Apartment in Salt Lake', subtitle: 'Bright workspace and peaceful evenings', location: 'Salt Lake, Kolkata', price: '₹5,800 / night', rating: '4.79', badge: 'Work-friendly', category: 'homes', image: homePhotos[1] },
    ],
  },
  {
    id: 'ahmedabad',
    title: 'Urban homes in Ahmedabad',
    items: [
      { id: 'ah1', title: 'Riverside Apartment in Ahmedabad', subtitle: 'Sabarmati views and a calm neighborhood', location: 'Sabarmati Riverfront, Ahmedabad', price: '₹6,900 / night', rating: '4.86', badge: 'Riverside', category: 'homes', image: homePhotos[2] },
      { id: 'ah2', title: 'Townhouse in Prahlad Nagar', subtitle: 'Modern stay close to cafes and shops', location: 'Prahlad Nagar, Ahmedabad', price: '₹7,600 / night', rating: '4.89', badge: 'Top rated', category: 'homes', image: homePhotos[3] },
    ],
  },
  {
    id: 'kerala',
    title: 'Backwater bliss in Kerala 🌴',
    items: [
      { id: 'kl1', title: 'Houseboat on Vembanad Lake', subtitle: 'Private houseboat with chef', location: 'Alleppey', price: '₹16,000 / night', rating: '4.98', badge: 'Top in Kerala', category: 'homes', image: homePhotos[6] },
      { id: 'kl2', title: 'Treehouse in Wayanad', subtitle: 'Deep in spice forest canopy', location: 'Wayanad', price: '₹8,800 / night', rating: '4.91', badge: 'Eco retreat', category: 'homes', image: homePhotos[7] },
      { id: 'kl3', title: 'Beach Villa in Varkala', subtitle: 'Cliff-top sea facing', location: 'Varkala', price: '₹10,200 / night', rating: '4.89', badge: 'Clifftop gem', category: 'homes', image: homePhotos[8] },
      { id: 'kl4', title: 'Tea Estate Bungalow', subtitle: 'Colonial hill stay in Munnar', location: 'Munnar', price: '₹13,500 / night', rating: '4.95', badge: 'Misty hills', category: 'homes', image: homePhotos[9] },
      { id: 'kl-exp', title: 'Ayurveda Retreat', subtitle: 'Panchakarma + yoga package', location: 'Thrissur', price: '₹9,500 / retreat', rating: '4.99', badge: 'Wellness pick', category: 'experiences', image: homePhotos[0] },
    ],
  },
  {
    id: 'srinagar',
    title: 'Paradise stays in Kashmir 🏔️',
    items: [
      { id: 'sr1', title: 'Houseboat on Dal Lake', subtitle: 'Peaceful stay on water, mountain views', location: 'Srinagar', price: '₹15,000 / night', rating: '4.97', badge: 'Kashmir pick', category: 'homes', image: homePhotos[1] },
      { id: 'sr2', title: 'Cottage in Pahalgam', subtitle: 'Valley of Shepherds retreat', location: 'Pahalgam', price: '₹12,000 / night', rating: '4.92', badge: 'Valley life', category: 'homes', image: homePhotos[2] },
      { id: 'sr3', title: 'Apple Orchard Stay', subtitle: 'Seasonal harvest bungalow', location: 'Shopian', price: '₹7,800 / night', rating: '4.85', badge: 'Orchard stay', category: 'homes', image: homePhotos[3] },
      { id: 'sr-exp', title: 'Gulmarg Ski Weekend', subtitle: 'Ski packages with gondola access', location: 'Gulmarg', price: '₹22,000 / package', rating: '4.98', badge: 'Snow sports', category: 'experiences', image: homePhotos[4] },
    ],
  },
  {
    id: 'manali',
    title: 'Mountain retreats in Himachal 🌨️',
    items: [
      { id: 'mn1', title: 'Himalayan Cabin Stay', subtitle: 'Cozy wooden cabin near Rohtang Pass', location: 'Manali', price: '₹6,800 / night', rating: '4.90', badge: 'Mountain gem', category: 'homes', image: homePhotos[5] },
      { id: 'mn2', title: 'Riverside Cottage in Kasol', subtitle: 'Parvati river views, pine forest', location: 'Kasol', price: '₹4,500 / night', rating: '4.82', badge: 'Backpacker fav', category: 'homes', image: homePhotos[6] },
      { id: 'mn3', title: 'Chalet in Kufri', subtitle: 'Snow-capped views, Shimla nearby', location: 'Kufri', price: '₹9,400 / night', rating: '4.88', badge: 'Snow retreat', category: 'homes', image: homePhotos[7] },
      { id: 'mn4', title: 'Dharamshala Homestay', subtitle: 'Tibetan culture, Dalai Lama quarter', location: 'Dharamshala', price: '₹5,600 / night', rating: '4.86', badge: 'Spiritual stay', category: 'homes', image: homePhotos[8] },
      { id: 'mn-exp', title: 'Spiti Valley Expedition', subtitle: 'Off-road adventure + camping', location: 'Spiti', price: '₹18,000 / trip', rating: '4.99', badge: 'Epic adventure', category: 'experiences', image: homePhotos[9] },
    ],
  },
];

// ─── SCREENS ───

const ExploreScreen = ({ navigation }: any) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('homes');
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhen, setSearchWhen] = useState('');
  const [searchWho, setSearchWho] = useState('');
  const [liveSections, setLiveSections] = useState<any[]>(mockSections);
  const { wishlistIds, toggleWishlist } = React.useContext(AuthContext);
  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/listings`);
        if (res.ok) {
          const data = await res.json();
          if (data.listings && data.listings.length > 0) {
            // Group fetched listings into an "All Listings" section dynamically
            setLiveSections([
              {
                id: 'live',
                title: 'Available across India',
                items: data.listings.map((item: any) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: item.description || item.size,
                  location: item.location,
                  price: `₹${item.price} / night`,
                  rating: '4.95', // Placeholder for DB without avg review rating logic yet
                  badge: 'Guest favourite',
                  category: 'homes',
                  image: (item.photos && item.photos[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'
                }))
              },
              ...mockSections // Keep mock sections as fallback/supplements
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      }
    };
    fetchListings();
  }, []);

  // Filter sections by search intent and active category
  const filteredSections = useMemo(() => {
    const w = searchWhere.trim().toLowerCase();
    return liveSections.map(s => ({
      ...s,
      items: s.items.filter(item => {
        const catOk = item.category === activeCategory;
        const whereOk = !w || 
          item.title.toLowerCase().includes(w) || 
          item.subtitle.toLowerCase().includes(w) || 
          item.location.toLowerCase().includes(w);
        return catOk && whereOk;
      }),
    })).filter(s => s.items.length > 0);
  }, [activeCategory, searchWhere]);

  const toggleFav = async (id: string) => {
    const result = await toggleWishlist(id);
    if (!result.ok) {
      Alert.alert('Login Required', result.message || 'Please log in to save wishlists.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      
      {/* ── HEADER ── */}
      <View style={styles.header}>
        {/* Logo block */}
        <View style={styles.logoContainer}>
          <Image source={require('./assets/icon.png')} style={styles.logoIcon} />
          <Text style={styles.logoText}>NEXT GEN AIRBNB</Text>
        </View>

        {/* Search Bar pill */}
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 18, color: COLORS.darkNavy, marginRight: 10 }}>🔍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.searchLabel}>Where to?</Text>
            <TextInput 
              style={styles.searchInput}
              placeholder="Search destinations"
              value={searchWhere}
              onChangeText={setSearchWhere}
              placeholderTextColor={COLORS.steelBlue}
            />
          </View>
        </View>

        {/* Categories strip */}
        <View style={styles.categoryScroll}>
          {categories.map((cat, idx) => {
            const isActive = cat.id === activeCategory;
            return (
              <TouchableOpacity 
                key={cat.id} 
                onPress={() => setActiveCategory(cat.id)}
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <View style={styles.categoryLabelWrap}>
                  {cat.badge ? <Text style={styles.catBadgeText}>{cat.badge}</Text> : <View style={styles.catBadgeSpacer} />}
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── LISTINGS ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchHero}>
          <View style={styles.searchHeroTopRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categories.map((cat) => {
                const isActive = cat.id === activeCategory;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setActiveCategory(cat.id)}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  >
                    <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.searchCloseBtn}
              onPress={() => {
                setSearchWhere('');
                setSearchWhen('');
                setSearchWho('');
              }}
            >
              <Text style={styles.searchCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchSheet}>
            <Text style={styles.searchSheetTitle}>Where?</Text>
            <View style={styles.searchInputShell}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchSheetInput}
                placeholder="Search destinations"
                value={searchWhere}
                onChangeText={setSearchWhere}
                placeholderTextColor={COLORS.steelBlue}
              />
            </View>

            <Text style={styles.suggestionHeading}>Suggested destinations</Text>
            <View style={styles.suggestionList}>
              {suggestedDestinations.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionRow}
                  onPress={() => setSearchWhere(suggestion.query)}
                >
                  <View style={styles.suggestionIconBox}>
                    <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  </View>
                  <View style={styles.suggestionTextWrap}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.searchMetaRow}>
              <Text style={styles.searchMetaLabel}>When</Text>
              <TextInput
                style={styles.searchMetaInput}
                placeholder="Add dates"
                value={searchWhen}
                onChangeText={setSearchWhen}
                placeholderTextColor={COLORS.darkNavy}
              />
            </View>

            <View style={styles.searchMetaRow}>
              <Text style={styles.searchMetaLabel}>Who</Text>
              <TextInput
                style={styles.searchMetaInput}
                placeholder="Add guests"
                value={searchWho}
                onChangeText={setSearchWho}
                placeholderTextColor={COLORS.darkNavy}
              />
            </View>

            <View style={styles.searchFooter}>
              <TouchableOpacity
                onPress={() => {
                  setSearchWhere('');
                  setSearchWhen('');
                  setSearchWho('');
                }}
              >
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchActionBtn}>
                <Text style={styles.searchActionBtnIcon}>⌕</Text>
                <Text style={styles.searchActionBtnText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {filteredSections.length > 0 ? (
          filteredSections.map(section => (
            <View key={section.id} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.75 + 16} decelerationRate="fast">
                {section.items.map((item, idx) => (
                  <TouchableOpacity key={item.id} style={[styles.card, idx === 0 && { marginLeft: 20 }, idx === section.items.length - 1 && { marginRight: 20 }]} onPress={() => navigation.navigate('ListingDetail', { item })}>
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                      <View style={styles.overlay} />
                      
                      {/* Image top badges */}
                      <View style={styles.cardTopStrip}>
                        <View style={styles.cardBadge}>
                          <Text style={styles.cardBadgeLabel}>{item.badge}</Text>
                        </View>
                        <TouchableOpacity style={styles.heartBtn} onPress={() => toggleFav(item.id)}>
                          <Text style={{ fontSize: 18, color: wishlistSet.has(item.id) ? '#FF385C' : '#fff' }}>
                            {wishlistSet.has(item.id) ? '♥' : '♡'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {/* Card details */}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>{item.subtitle}</Text>
                      <Text style={styles.cardLoc}>{item.location}</Text>
                      
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardPrice}>{item.price}</Text>
                        <Text style={styles.cardRating}>★ {item.rating}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 50, marginBottom: 15 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtitle}>Try a different category or clear search.</Text>
            <TouchableOpacity onPress={() => setSearchWhere('')} style={styles.clearBtn}>
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Clear search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const WishlistScreen = () => (
  <View style={styles.centerScreen}>
    <Text style={styles.iconBig}>❤️</Text>
    <Text style={styles.emptyScreenTitle}>Your wishlist is empty</Text>
    <Text style={styles.emptyScreenSubtitle}>Tap the heart on any property to save it here.</Text>
  </View>
);

const WishlistDatabaseScreen = ({ navigation }: any) => {
  const { wishlistIds, toggleWishlist, token } = React.useContext(AuthContext);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const formatWishlistPrice = (price: string | number) =>
    typeof price === 'number' ? `₹${price.toLocaleString()} / night` : price;
  const mockWishlistCatalog = useMemo(
    () =>
      mockSections.flatMap(section =>
        section.items.map(item => ({
          ...item,
          image: item.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
        }))
      ),
    []
  );

  useEffect(() => {
    const fetchSavedListings = async () => {
      if (!token || wishlistIds.length === 0) {
        setSavedListings([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/listings`);
        const data = await res.json();
        const apiListings = Array.isArray(data.listings) ? data.listings : [];
        const normalizedApiListings = apiListings.map((item: any) => ({
          ...item,
          subtitle: item.description || item.size || item.location,
          image: (item.photos && item.photos[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
        }));
        const combinedListings = [...normalizedApiListings, ...mockWishlistCatalog];
        const uniqueListings = combinedListings.filter(
          (item, index, arr) => arr.findIndex(entry => entry.id === item.id) === index
        );
        setSavedListings(
          wishlistIds
            .map(id => uniqueListings.find((item: any) => item.id === id))
            .filter(Boolean)
        );
      } catch (e) {
        setSavedListings(
          wishlistIds
            .map(id => mockWishlistCatalog.find(item => item.id === id))
            .filter(Boolean)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedListings();
  }, [mockWishlistCatalog, wishlistIds, token]);

  if (!token) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.iconBig}>❤</Text>
        <Text style={styles.emptyScreenTitle}>Log in to use wishlists</Text>
        <Text style={styles.emptyScreenSubtitle}>Tap the heart on any property to save it here.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.emptyScreenTitle}>Loading your wishlist...</Text>
      </View>
    );
  }

  if (savedListings.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.iconBig}>❤</Text>
        <Text style={styles.emptyScreenTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyScreenSubtitle}>Tap the heart on any property to save it here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      <Text style={[styles.emptyScreenTitle, { textAlign: 'left', marginBottom: 20 }]}>Saved Wishlists</Text>
      {savedListings.map((item) => (
        <View key={item.id} style={styles.wishlistCard}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('ListingDetail', { item: {
              ...item,
              image: item.image || (item.photos && item.photos[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
              rating: '4.95',
              badge: 'Wishlist'
            } })}
          >
            <Image
              source={{ uri: item.image || (item.photos && item.photos[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600' }}
              style={styles.wishlistImage}
            />
            <View style={styles.wishlistBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{item.subtitle || item.description || item.location}</Text>
              <Text style={styles.cardLoc}>{item.location}</Text>
              <Text style={[styles.cardPrice, { marginTop: 8 }]}>{formatWishlistPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeWishlistBtn} onPress={() => toggleWishlist(item.id)}>
            <Text style={styles.removeWishlistText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const ProfileScreen = ({ navigation }: any) => {
  const { user, setUser, setToken, logout } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    try {
      const url = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
      const body = isLogin ? { email, password } : { email, password, name };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      
      if (!isLogin) {
        setIsLogin(true);
        setError('Registered! Please login.');
        return;
      }
      
      await MemoryStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.emptyScreenTitle}>Welcome, {user.name || 'Traveler'}</Text>
        <Text style={{color: COLORS.steelBlue, marginBottom: 30}}>{user.email}</Text>
        
        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Account Settings</Text>
              <Text style={{ color: '#ccc', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Host')}>
              <Text style={styles.menuItemText}>Become a Host</Text>
              <Text style={{ color: '#ccc', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.loginBtn, {backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.darkNavy, marginTop: 40}]} onPress={logout}>
          <Text style={[styles.loginBtnText, {color: COLORS.darkNavy}]}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.centerScreen, {justifyContent: 'flex-start', paddingTop: 80}]}>
      <Text style={styles.emptyScreenTitle}>{isLogin ? 'Log in to Next-Gen' : 'Create an account'}</Text>
      
      {error ? <Text style={{color: 'red', marginTop: 10, textAlign: 'center'}}>{error}</Text> : null}

      <View style={{width: '100%', marginTop: 30, gap: 15}}>
        {!isLogin && (
          <TextInput 
            style={styles.inputField} 
            placeholder="Full Name" 
            value={name} onChangeText={setName} 
            placeholderTextColor={COLORS.steelBlue}
          />
        )}
        <TextInput 
          style={styles.inputField} 
          placeholder="Email address" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={email} onChangeText={setEmail} 
          placeholderTextColor={COLORS.steelBlue}
        />
        <TextInput 
          style={styles.inputField} 
          placeholder="Password" 
          secureTextEntry
          value={password} onChangeText={setPassword} 
          placeholderTextColor={COLORS.steelBlue}
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleAuth}>
        <Text style={styles.loginBtnText}>{isLogin ? 'Continue' : 'Sign up'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{marginTop: 25}}>
        <Text style={{color: COLORS.darkNavy, fontWeight: 'bold', textDecorationLine: 'underline'}}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── MAIN NAV ───

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const TabGlyph = ({ color, active, glyph }: { color: string; active: boolean; glyph: string }) => (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? 'rgba(26, 39, 66, 0.12)' : 'transparent',
      }}
    >
      <Text style={{ color, fontSize: 19, fontWeight: '800' }}>{glyph}</Text>
    </View>
  );

  return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.darkNavy,
          tabBarInactiveTintColor: COLORS.steelBlue,
          tabBarStyle: {
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#f1f1f1',
            elevation: 0,
            backgroundColor: COLORS.white,
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          }
        }}
      >
        <Tab.Screen 
          name="Explore" 
          component={ExploreScreen} 
          options={{ tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => <TabGlyph color={color} active={focused} glyph="⌖" /> }}
        />
        <Tab.Screen 
          name="AI Planner" 
          component={AIAgentsScreen} 
          options={{ tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => <TabGlyph color={color} active={focused} glyph="✦" /> }}
        />
        <Tab.Screen 
          name="Wishlists" 
          component={WishlistDatabaseScreen} 
          options={{ tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => <TabGlyph color={color} active={focused} glyph="♡" /> }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarIcon: function ProfileIcon({ color }) { 
            const { user } = React.useContext(AuthContext);
            if (user) {
              return (
                 <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.darkNavy, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '900' }}>
                       {user.email[0].toUpperCase()}
                    </Text>
                 </View>
              );
            }
            return <Text style={{ color, fontSize: 24 }}>👤</Text>;
          } }}
        />
      </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
           <Stack.Screen name="MainTabs" component={MainTabs} />
           <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
           <Stack.Screen name="Host" component={HostScreen} />
           <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

// ─── STYLES ───

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(143, 174, 200, 0.2)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    color: COLORS.darkNavy,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(143, 174, 200, 0.1)',
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.darkNavy,
  },
  searchInput: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkNavy,
    padding: 0,
    marginTop: 2,
    height: 20,
  },
  categoryScroll: {
    marginTop: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 18,
    marginHorizontal: 10,
  },
  categoryBtn: {
    alignItems: 'center',
    width: 104,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingBottom: 10,
    paddingTop: 6,
    paddingHorizontal: 4,
    position: 'relative',
  },
  categoryBtnActive: {
    borderBottomColor: COLORS.darkNavy,
  },
  catIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  categoryLabelWrap: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'flex-start',
  },
  catBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    backgroundColor: COLORS.darkNavy,
    color: COLORS.white,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  catBadgeSpacer: {
    height: 16,
    marginBottom: 4,
  },
  aiTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.steelBlue,
  },
  categoryTextActive: {
    color: COLORS.darkNavy,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 80,
  },
  searchHero: {
    display: 'none',
  },
  searchHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  categoryRow: {
    paddingRight: 12,
    gap: 24,
  },
  categoryPill: {
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  categoryPillActive: {
    borderBottomColor: COLORS.darkNavy,
  },
  categoryPillIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryPillText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  categoryPillTextActive: {
    color: COLORS.darkNavy,
    fontWeight: '700',
  },
  searchCloseBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  searchCloseBtnText: {
    fontSize: 24,
    color: COLORS.darkNavy,
    lineHeight: 28,
  },
  searchSheet: {
    backgroundColor: COLORS.white,
    borderRadius: 34,
    padding: 22,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  searchSheetTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 18,
  },
  searchInputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(26,39,66,0.22)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  searchIcon: {
    fontSize: 18,
    color: COLORS.darkNavy,
    marginRight: 12,
    fontWeight: '700',
  },
  searchSheetInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkNavy,
    padding: 0,
  },
  suggestionHeading: {
    marginTop: 24,
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkNavy,
  },
  suggestionList: {
    gap: 14,
    marginBottom: 18,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIconBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#f4f6fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  suggestionIcon: {
    fontSize: 22,
    color: COLORS.steelBlue,
    fontWeight: '700',
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: '#6f7b8d',
  },
  searchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  searchMetaLabel: {
    fontSize: 17,
    color: '#666',
  },
  searchMetaInput: {
    minWidth: 120,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkNavy,
    padding: 0,
  },
  searchFooter: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 17,
    color: COLORS.darkNavy,
  },
  searchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e61e4d',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  searchActionBtnIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  searchActionBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginLeft: 20,
    marginBottom: 16,
  },
  card: {
    width: width * 0.75,
    marginRight: 16,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    paddingBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardTopStrip: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBadgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 16,
    paddingBottom: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.steelBlue,
    marginBottom: 2,
  },
  cardLoc: {
    fontSize: 12,
    color: COLORS.steelBlue,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  cardRating: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkNavy,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.steelBlue,
    marginTop: 8,
    marginBottom: 20,
  },
  clearBtn: {
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 24,
  },
  iconBig: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyScreenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyScreenSubtitle: {
    fontSize: 16,
    color: COLORS.steelBlue,
    textAlign: 'center',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  loginBtn: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  menuList: {
    width: '100%',
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.darkNavy,
    fontWeight: '600',
  },
  inputField: {
    width: '100%',
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.darkNavy,
  },
  wishlistCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(143, 174, 200, 0.12)',
  },
  wishlistImage: {
    width: '100%',
    height: 180,
  },
  wishlistBody: {
    padding: 16,
  },
  removeWishlistBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF385C',
    paddingVertical: 12,
    alignItems: 'center',
  },
  removeWishlistText: {
    color: '#FF385C',
    fontWeight: '700',
    fontSize: 14,
  }
});
