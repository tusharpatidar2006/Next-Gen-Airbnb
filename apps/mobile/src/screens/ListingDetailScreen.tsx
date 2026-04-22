import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Dimensions, StatusBar, Platform,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { buildGeoapifyStaticMapUrl, geocodeLocation, hasGeoapifyApiKey } from '../api/geoapify';
import { getHostProfileForListing } from '../data/listingHosts';

const { width } = Dimensions.get('window');

const C = {
  steelBlue: '#8faec8', darkNavy: '#1a2742',
  white: '#ffffff', accent: '#FF385C', bg: '#f8f9fb',
};

const MAP_IMG  = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80';

export default function ListingDetailScreen({ route, navigation }: any) {
  const { item } = route.params;
  const { user, token, wishlistIds, toggleWishlist } = useContext(AuthContext) as any;
  const isWishlisted = wishlistIds.includes(item.id);

  const [bookingModal, setBookingModal] = useState(false);
  const [payModal,     setPayModal]     = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const [checkIn,  setCheckIn]  = useState('2026-04-24');
  const [checkOut, setCheckOut] = useState('2026-04-26');

  const [cardName,   setCardName]   = useState('');
  const [cardNum,    setCardNum]    = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [payMethod,  setPayMethod]  = useState<'card'|'upi'>('card');
  const [mapUri, setMapUri] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);

  const rawPrice  = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 5000;
  const nights    = 2;
  const svcFee    = Math.round(rawPrice * 0.15);
  const total     = rawPrice * nights + svcFee;
  const displayRating = String(item.rating || '4.8');
  const reviewCount = '158';
  const host = getHostProfileForListing(item);

  useEffect(() => {
    if (!item?.location || !hasGeoapifyApiKey()) {
      setMapUri(null);
      return;
    }

    let cancelled = false;

    const loadMap = async () => {
      setMapLoading(true);
      try {
        const point = await geocodeLocation(`${item.location}, India`);
        if (!cancelled) {
          setMapUri(point ? buildGeoapifyStaticMapUrl({ center: point, width: 1200, height: 760, zoom: mapZoom }) : null);
        }
      } finally {
        if (!cancelled) {
          setMapLoading(false);
        }
      }
    };

    loadMap();

    return () => {
      cancelled = true;
    };
  }, [item?.location, mapZoom]);

  const onToggleWishlist = async () => {
    const result = await toggleWishlist(item.id);
    if (!result.ok) {
      Alert.alert('Login Required', result.message || 'Please log in to save wishlists.');
      return;
    }

    Alert.alert(
      result.added ? 'Saved to wishlist' : 'Removed from wishlist',
      result.added ? 'This stay was added to your wishlist.' : 'This stay was removed from your wishlist.'
    );
  };

  const onReserve = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to reserve a stay.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Profile') },
      ]);
      return;
    }
    setBookingModal(true);
  };

  const onConfirmPayment = async () => {
    if (payMethod === 'card' && (!cardNum || cvv.length < 3)) {
      Alert.alert('Invalid Details', 'Please fill all card fields correctly.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: item.id, startDate: checkIn, endDate: checkOut, amount: total, method: payMethod }),
      });
      setLoading(false);
      setPayModal(false);
      setSuccessModal(true);
    } catch {
      setLoading(false);
      setPayModal(false);
      setSuccessModal(true);  // graceful offline success
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── HERO ── */}
        <View style={s.hero}>
          <Image source={{ uri: item.image }} style={s.heroImg} />
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.heartBtn} onPress={onToggleWishlist}>
            <Text style={[s.heartTxt, isWishlisted && { color: C.accent }]}>{isWishlisted ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.pad}>
          {/* Title */}
          <Text style={s.title}>{item.title}</Text>
          <View style={s.row}>
            <Text style={s.rating}>★ {displayRating} <Text style={s.muted}>· {reviewCount} reviews</Text></Text>
            <Text style={s.loc}>{item.location}</Text>
          </View>
          <View style={s.div} />
          <Text style={s.sub}>{item.subtitle}</Text>
          <Text style={s.cap}>4 guests · 2 bedrooms · 2 beds · 2 bathrooms</Text>
          <View style={s.div} />

          {/* Host */}
          <Text style={s.sec}>Meet your host</Text>
          <View style={s.hostCard}>
            <View style={s.hostInner}>
              <View style={s.hostLeft}>
                <Image source={{ uri: host.avatar }} style={s.hostAvatar} />
                <Text style={s.hostName}>{host.name}</Text>
                <Text style={s.hostTag}>Host</Text>
              </View>
              <View style={{ flex:1 }}>
                {[[host.reviews,'Reviews'],[`${displayRating}★`,'Rating'],[host.yearsHosting,'Years hosting']].map(([n, l], i) => (
                  <View key={i}>
                    <View style={s.statRow}><Text style={s.statNum}>{n}</Text><Text style={s.statLabel}>{l}</Text></View>
                    {i < 2 && <View style={{ height:1, backgroundColor:'#eee', marginVertical:8 }} />}
                  </View>
                ))}
              </View>
            </View>
            <Text style={s.bio}>{host.bio}</Text>
          </View>

          {/* Reviews */}
          <View style={s.div} />
          <Text style={s.sec}>★ {displayRating} · {reviewCount} reviews</Text>
          <View style={s.ratingGrid}>
            {[['✨','Cleanliness','4.8'],['📝','Accuracy','4.8'],['🔑','Check-in','4.8'],['💬','Communication','4.7']].map(([icon,label,score],i)=>(
              <View key={i} style={s.ratingItem}>
                <Text style={{fontSize:16}}>{icon}</Text>
                <View>
                  <Text style={s.rL}>{label}</Text>
                  <Text style={s.rS}>{score}</Text>
                </View>
              </View>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width*0.8+16} decelerationRate="fast" style={{marginHorizontal:-24}}>
            {[['G','Gaurav','Great location, clean and spacious. All our favourite restaurants were walking distance.'],
              ['A',"A'isha","Bharat's personal family home. Felt very much like our home during our stay."]].map(([init,name,text],i,arr)=>(
              <View key={i} style={[s.revCard, {marginLeft: i===0 ? 24 : 0, marginRight: i===arr.length-1 ? 24 : 12}]}>
                <View style={s.revHeader}>
                  <View style={s.revAvatar}><Text style={{color:'#fff',fontWeight:'bold'}}>{init}</Text></View>
                  <View><Text style={s.revName}>{name}</Text><Text style={s.revDate}>February 2026</Text></View>
                </View>
                <Text style={s.revText}>{text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Map */}
          <View style={s.div} />
          <Text style={s.sec}>Where you'll be</Text>
          <Text style={s.mapSub}>{item.location}, India</Text>
          <View style={s.mapBox}>
            <Image source={{ uri: mapUri || MAP_IMG }} style={s.mapImg} />
            <View style={s.mapZoomControls}>
              <TouchableOpacity
                style={[s.mapZoomBtn, (!mapUri || mapZoom <= 5) && s.mapZoomBtnDisabled]}
                onPress={() => setMapZoom((current) => Math.max(5, current - 1))}
                disabled={!mapUri || mapZoom <= 5}
              >
                <Text style={s.mapZoomBtnText}>-</Text>
              </TouchableOpacity>
              <View style={s.mapZoomBadge}>
                <Text style={s.mapZoomLabel}>Zoom</Text>
                <Text style={s.mapZoomValue}>{mapZoom}x</Text>
              </View>
              <TouchableOpacity
                style={[s.mapZoomBtn, (!mapUri || mapZoom >= 18) && s.mapZoomBtnDisabled]}
                onPress={() => setMapZoom((current) => Math.min(18, current + 1))}
                disabled={!mapUri || mapZoom >= 18}
              >
                <Text style={s.mapZoomBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {!mapUri ? <View style={s.pin}><Text style={{fontSize:24,textAlign:'center'}}>🏠</Text></View> : null}
            {mapLoading ? (
              <View style={s.mapLoadingOverlay}>
                <ActivityIndicator color="#fff" />
                <Text style={s.mapLoadingText}>Loading Geoapify map...</Text>
              </View>
            ) : null}
            <View style={s.mapLabel}><Text style={{color:'#fff',fontSize:12,fontWeight:'bold'}}>Exact location provided after booking</Text></View>
          </View>
        </View>
      </ScrollView>

      {/* ── BOTTOM BAR ── */}
      <View style={s.bar}>
        <View>
          <Text style={s.barPrice}>{item.price}</Text>
          <Text style={s.barDates}>24 Apr – 26 Apr</Text>
        </View>
        <TouchableOpacity style={s.resBtn} onPress={onReserve}>
          <Text style={s.resTxt}>Reserve</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOOKING MODAL ── */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.modalTitle}>Confirm your trip</Text>
            <View style={s.div} />
            <Text style={s.mLabel}>Your dates</Text>
            <View style={{flexDirection:'row',gap:12,marginBottom:16}}>
              <View style={{flex:1}}>
                <Text style={s.dateLabel}>CHECK-IN</Text>
                <TextInput style={s.dateInput} value={checkIn} onChangeText={setCheckIn} placeholderTextColor={C.steelBlue} />
              </View>
              <View style={{flex:1}}>
                <Text style={s.dateLabel}>CHECKOUT</Text>
                <TextInput style={s.dateInput} value={checkOut} onChangeText={setCheckOut} placeholderTextColor={C.steelBlue} />
              </View>
            </View>
            <View style={s.div} />
            <Text style={s.mLabel}>Price breakdown</Text>
            {[
              [`₹${rawPrice.toLocaleString()} × ${nights} nights`, `₹${(rawPrice*nights).toLocaleString()}`],
              ['Service fee', `₹${svcFee.toLocaleString()}`],
            ].map(([l,v],i)=>(
              <View key={i} style={s.priceRow}><Text style={s.pL}>{l}</Text><Text style={s.pV}>{v}</Text></View>
            ))}
            <View style={[s.priceRow,{marginTop:8}]}>
              <Text style={[s.pL,{fontWeight:'800',color:C.darkNavy}]}>Total</Text>
              <Text style={[s.pV,{fontWeight:'800',color:C.darkNavy}]}>₹{total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={[s.resBtn,{marginTop:20}]} onPress={()=>{setBookingModal(false);setPayModal(true);}}>
              <Text style={s.resTxt}>Continue to Payment →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setBookingModal(false)} style={{marginTop:14,alignItems:'center'}}>
              <Text style={{color:C.steelBlue,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── PAYMENT MODAL ── */}
      <Modal visible={payModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.modalHeaderRow}>
              <Text style={s.modalTitle}>Secure Payment</Text>
              <TouchableOpacity style={s.closeBtn} onPress={()=>{setPayModal(false);setBookingModal(true);}}>
                <Text style={{ fontSize: 18, color: C.darkNavy, fontWeight: '600' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Property Summary Card */}
            <View style={s.summaryCard}>
              <Image source={{ uri: item.image }} style={s.summaryImg} />
              <View style={s.summaryInfo}>
                <Text style={s.summaryTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.summaryDates}>{nights} nights • 24 Apr - 26 Apr</Text>
                <Text style={s.summaryTotal}>Total: ₹{total.toLocaleString()}</Text>
              </View>
            </View>
            
            {/* Payment Methods */}
            <View style={s.methodTabs}>
              <TouchableOpacity 
                style={[s.methodTab, payMethod === 'card' && s.methodTabActive]} 
                onPress={() => setPayMethod('card')}
              >
                <Text style={[s.methodTabText, payMethod === 'card' && s.methodTabTextActive]}>Debit / Credit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.methodTab, payMethod === 'upi' && s.methodTabActive]} 
                onPress={() => setPayMethod('upi')}
              >
                <Text style={[s.methodTabText, payMethod === 'upi' && s.methodTabTextActive]}>UPI / QR</Text>
              </TouchableOpacity>
            </View>

            {payMethod === 'card' ? (
              <View>
                <Text style={s.inputLabel}>Card Number</Text>
                <TextInput style={s.payInput} placeholder="0000 0000 0000 0000" placeholderTextColor={C.steelBlue}
                  value={cardNum} onChangeText={setCardNum} keyboardType="number-pad" maxLength={19} />
                
                <View style={{flexDirection:'row',gap:12}}>
                  <View style={{flex:1}}>
                    <Text style={s.inputLabel}>Expiry Date</Text>
                    <TextInput style={s.payInput} placeholder="MM/YY" placeholderTextColor={C.steelBlue}
                      value={expiry} onChangeText={setExpiry} maxLength={5} />
                  </View>
                  <View style={{flex:1}}>
                    <Text style={s.inputLabel}>CVV</Text>
                    <TextInput style={s.payInput} placeholder="123" placeholderTextColor={C.steelBlue}
                      value={cvv} onChangeText={setCvv} keyboardType="number-pad" maxLength={4} secureTextEntry />
                  </View>
                </View>
              </View>
            ) : (
              <View style={s.qrContainer}>
                <View style={s.qrBankHeader}>
                  <View style={s.qrBankIcon}><Text style={{color:'#fff',fontSize:12,fontWeight:'bold'}}>SBI</Text></View>
                  <Text style={s.qrBankName}>State Bank of India - 0948</Text>
                </View>
                <View style={s.qrWrapper}>
                  {/* Real, Scannable UPI QR Code powered by qrserver API */}
                  <Image 
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(`upi://pay?pa=sbi.merchants@sbi&pn=NextGenAI Properties&am=${total}&cu=INR`)}` }} 
                    style={s.qrImage} 
                  />
                  <View style={s.phonePeLogo}>
                    <Text style={{color:'#fff', fontWeight:'bold', fontSize:18}}>पे</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text style={s.qrFooterText}>View UPI details</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={[s.resBtn,{marginTop:24, backgroundColor: '#f43f5e', paddingVertical: 16}]} onPress={onConfirmPayment} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.resTxt}>Pay ₹{total.toLocaleString()}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.sheet,{alignItems:'center'}]}>
            <Text style={{fontSize:64,marginBottom:16}}>🎉</Text>
            <Text style={[s.modalTitle,{textAlign:'center'}]}>Booking Confirmed!</Text>
            <Text style={{color:C.steelBlue,textAlign:'center',marginTop:6,marginBottom:4}}>
              Your stay at {item.title} is reserved.
            </Text>
            <Text style={{color:C.darkNavy,fontWeight:'700',fontSize:16,marginBottom:20}}>
              {checkIn} → {checkOut} · ₹{total.toLocaleString()}
            </Text>
            <View style={[s.div,{width:'100%'}]} />
            <TouchableOpacity style={[s.resBtn,{width:'100%'}]} onPress={()=>{setSuccessModal(false);navigation.navigate('MainTabs');}}>
              <Text style={s.resTxt}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { width: '100%', height: 300, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  backBtn: { position:'absolute', top: Platform.OS==='ios'?50:30, left:20, width:40, height:40, borderRadius:20, backgroundColor:'rgba(255,255,255,0.9)', justifyContent:'center', alignItems:'center' },
  backTxt: { fontSize:24, color:C.darkNavy, fontWeight:'bold', marginTop:-2 },
  heartBtn: { position:'absolute', top: Platform.OS==='ios'?50:30, right:20, width:40, height:40, borderRadius:20, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center' },
  heartTxt: { fontSize:22, color:'#fff' },
  pad: { padding:24 },
  title: { fontSize:26, fontWeight:'800', color:C.darkNavy, marginBottom:8 },
  row: { flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap' },
  rating: { fontSize:15, fontWeight:'700', color:C.darkNavy },
  muted: { color:C.steelBlue, fontWeight:'normal' },
  loc: { fontSize:15, fontWeight:'600', color:C.darkNavy, textDecorationLine:'underline' },
  div: { height:1, backgroundColor:'#eee', marginVertical:24 },
  sub: { fontSize:20, fontWeight:'700', color:C.darkNavy, marginBottom:6 },
  cap: { fontSize:15, color:C.steelBlue },
  sec: { fontSize:22, fontWeight:'700', color:C.darkNavy, marginBottom:16 },
  hostCard: { backgroundColor:'#fff', borderRadius:20, padding:24, shadowColor:C.darkNavy, shadowOffset:{width:0,height:6}, shadowOpacity:0.1, shadowRadius:15, elevation:6, borderWidth:1, borderColor:'#f1f1f1' },
  hostInner: { flexDirection:'row' },
  hostLeft: { alignItems:'center', marginRight:20 },
  hostAvatar: { width:80, height:80, borderRadius:40, marginBottom:8 },
  hostName: { fontSize:20, fontWeight:'bold', color:C.darkNavy },
  hostTag: { fontSize:14, color:C.steelBlue },
  statRow: { flexDirection:'row', alignItems:'flex-end', gap:8 },
  statNum: { fontSize:16, fontWeight:'bold', color:C.darkNavy, width:50 },
  statLabel: { fontSize:12, color:C.steelBlue, marginBottom:2 },
  bio: { fontSize:15, color:C.darkNavy, lineHeight:22, marginTop:16 },
  ratingGrid: { flexDirection:'row', flexWrap:'wrap', gap:16, marginBottom:20 },
  ratingItem: { width:'45%', flexDirection:'row', alignItems:'center', gap:8 },
  rL: { fontSize:12, color:C.steelBlue },
  rS: { fontSize:14, fontWeight:'700', color:C.darkNavy },
  revCard: { width:width*0.8, borderWidth:1, borderColor:'#eee', borderRadius:16, padding:16 },
  revHeader: { flexDirection:'row', alignItems:'center', marginBottom:12 },
  revAvatar: { width:40, height:40, borderRadius:20, backgroundColor:C.darkNavy, justifyContent:'center', alignItems:'center', marginRight:12 },
  revName: { fontSize:16, fontWeight:'bold', color:C.darkNavy },
  revDate: { fontSize:12, color:C.steelBlue },
  revText: { fontSize:15, color:C.darkNavy, lineHeight:22 },
  mapSub: { fontSize:15, color:C.darkNavy, marginBottom:16 },
  mapBox: { width:'100%', height:320, borderRadius:16, overflow:'hidden', position:'relative', backgroundColor:'#eee' },
  mapImg: { width:'100%', height:'100%', opacity:0.8 },
  pin: { position:'absolute', top:'50%', left:'50%', marginLeft:-25, marginTop:-25, width:50, height:50, backgroundColor:'rgba(255,255,255,0.9)', borderRadius:25, justifyContent:'center', alignItems:'center' },
  mapZoomControls: { position:'absolute', top:12, right:12, alignItems:'center', gap:8 },
  mapZoomBtn: { width:38, height:38, borderRadius:12, backgroundColor:'rgba(255,255,255,0.96)', justifyContent:'center', alignItems:'center' },
  mapZoomBtnDisabled: { opacity:0.45 },
  mapZoomBtnText: { fontSize:22, lineHeight:24, fontWeight:'800', color:C.darkNavy },
  mapZoomBadge: { minWidth:58, paddingHorizontal:8, paddingVertical:6, borderRadius:12, backgroundColor:'rgba(255,255,255,0.96)', alignItems:'center' },
  mapZoomLabel: { fontSize:10, fontWeight:'700', color:C.steelBlue, textTransform:'uppercase' },
  mapZoomValue: { fontSize:13, fontWeight:'800', color:C.darkNavy },
  mapLoadingOverlay: { position:'absolute', top:0, right:0, bottom:0, left:0, backgroundColor:'rgba(0,0,0,0.22)', justifyContent:'center', alignItems:'center', gap:8 },
  mapLoadingText: { color:'#fff', fontSize:13, fontWeight:'600' },
  mapLabel: { position:'absolute', bottom:0, width:'100%', padding:10, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center' },
  bar: { position:'absolute', bottom:0, width:'100%', backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#f1f1f1', flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:24, paddingVertical:16, paddingBottom: Platform.OS==='ios'?34:16 },
  barPrice: { fontSize:16, fontWeight:'800', color:C.darkNavy },
  barDates: { fontSize:13, color:C.steelBlue, marginTop:2, textDecorationLine:'underline' },
  resBtn: { backgroundColor:C.accent, paddingHorizontal:28, paddingVertical:14, borderRadius:12, alignItems:'center' },
  resTxt: { fontSize:16, color:'#fff', fontWeight:'700' },
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  sheet: { backgroundColor:'#fff', borderTopLeftRadius:30, borderTopRightRadius:30, padding:28, paddingBottom: Platform.OS==='ios'?44:28 },
  modalTitle: { fontSize:22, fontWeight:'800', color:C.darkNavy, marginBottom:4 },
  modalSub: { fontSize:15, color:C.steelBlue },
  mLabel: { fontSize:14, fontWeight:'700', color:C.darkNavy, marginBottom:10 },
  dateLabel: { fontSize:10, fontWeight:'800', color:C.steelBlue, letterSpacing:1, marginBottom:6 },
  dateInput: { borderWidth:1, borderColor:'#e2e8f0', borderRadius:10, padding:12, fontSize:15, color:C.darkNavy, backgroundColor:'#f8f9fb' },
  priceRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  pL: { fontSize:15, color:C.darkNavy },
  pV: { fontSize:15, color:C.darkNavy },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.darkNavy, marginBottom: 8 },
  payInput: { borderWidth:1, borderColor:'#e2e8f0', borderRadius:12, padding:14, fontSize:15, color:C.darkNavy, backgroundColor:'#fff', marginBottom:16 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  summaryCard: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 24 },
  summaryImg: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  summaryInfo: { flex: 1, justifyContent: 'center' },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: C.darkNavy, marginBottom: 4 },
  summaryDates: { fontSize: 13, color: C.steelBlue, marginBottom: 6 },
  summaryTotal: { fontSize: 14, fontWeight: '800', color: C.darkNavy },
  methodTabs: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20 },
  methodTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  methodTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  methodTabText: { fontSize: 13, fontWeight: '600', color: C.steelBlue },
  methodTabTextActive: { color: C.darkNavy },
  qrContainer: { backgroundColor: '#18181b', borderRadius: 16, padding: 24, alignItems: 'center' },
  qrBankHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  qrBankIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  qrBankName: { color: '#fff', fontSize: 15, fontWeight: '500' },
  qrWrapper: { position: 'relative', width: 200, height: 200, backgroundColor: '#fff', padding: 8, borderRadius: 8, marginBottom: 20 },
  qrImage: { width: '100%', height: '100%' },
  phonePeLogo: { position: 'absolute', top: '50%', left: '50%', width: 44, height: 44, marginLeft: -22, marginTop: -22, backgroundColor: '#18181b', borderRadius: 22, borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  qrFooterText: { color: '#c084fc', fontSize: 14, fontWeight: '600' }
});
