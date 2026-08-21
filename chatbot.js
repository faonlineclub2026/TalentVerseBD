// TVBot - Smart AI-like Chatbot for TalentVerse Bangladesh
// Powered by Firebase - Auto-learns from website data

const FB_CONFIG = {
  apiKey: "AIzaSyA91JckJ_FYGiNZxSeAlTjddREl5ok3B3c",
  authDomain: "talentverse-bd-b072c.firebaseapp.com",
  databaseURL: "https://talentverse-bd-b072c-default-rtdb.firebaseio.com",
  projectId: "talentverse-bd-b072c"
};

// Live data from Firebase
let siteData = {
  events: [],
  members: [],
  certificates: [],
  customReplies: [],
  quickBtns: []
};

// Load all website data
async function loadSiteData() {
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getDatabase, ref, onValue } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
    const apps = getApps();
    const app = apps.length ? apps[0] : initializeApp(FB_CONFIG);
    const db = getDatabase(app);

    // Load events
    onValue(ref(db, 'events'), snap => {
      siteData.events = snap.exists() ? Object.values(snap.val()) : [];
    });

    // Load members
    onValue(ref(db, 'members'), snap => {
      siteData.members = snap.exists() ? Object.values(snap.val()) : [];
    });

    // Load custom replies
    onValue(ref(db, 'chatbot_responses'), snap => {
      siteData.customReplies = snap.exists() ? Object.values(snap.val()).sort((a,b)=>(a.order||0)-(b.order||0)) : [];
    });

    // Load quick buttons
    onValue(ref(db, 'chatbot_quickbtns'), snap => {
      siteData.quickBtns = snap.exists() ? Object.values(snap.val()) : [];
      updateQuickBtns();
    });

  } catch(e) {
    console.log('Firebase load error:', e);
  }
}

function updateQuickBtns() {
  const container = document.getElementById('chatQuickBtns');
  if(!container || siteData.quickBtns.length === 0) return;
  container.innerHTML = siteData.quickBtns.slice(0,4).map(b =>
    `<button class="quick-btn" onclick="quickMsg(this)">${b.text}</button>`
  ).join('');
}

// Normalize text for matching
function normalize(text) {
  return text.toLowerCase()
    .replace(/[।,!?।''""]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if message matches keywords
function matches(msg, keywords) {
  const m = normalize(msg);
  return keywords.some(kw => m.includes(normalize(kw)));
}

// Generate dynamic reply based on website data
function getReply(msg) {
  const m = normalize(msg);

  // 1. Check custom Firebase replies first
  for(const r of siteData.customReplies) {
    const kws = (r.keywords||'').split(',').map(k=>k.trim()).filter(k=>k);
    if(kws.some(kw => m.includes(normalize(kw)))) {
      return r.reply;
    }
  }

  // 2. Greeting
  if(matches(msg, ['হ্যালো','hello','hi','হাই','সালাম','আস্সালামু','walaikum','ওয়ালাইকুম','hey','হেই','কেমন','kemn','whats up','কি খবর','ki khabar','good morning','good evening','শুভ','নমস্কার'])) {
    return `ওয়ালাইকুম আস্সালাম! 👋\n\nআমি TVBot — TalentVerse Bangladesh এর AI assistant।\n\nআমি আপনাকে এই বিষয়ে সাহায্য করতে পারি:\n🏆 ইভেন্ট সম্পর্কে\n👥 টিম পরিচিতি\n🎖️ সার্টিফিকেট যাচাই\n📝 রেজিস্ট্রেশন\n📞 যোগাযোগ\n\nকী জানতে চান?`;
  }

  // 3. Events - dynamic from Firebase
  if(matches(msg, ['event','ইভেন্ট','ইভেন্ট','quiz','কুইজ','competition','প্রতিযোগিতা','program','প্রোগ্রাম','অনুষ্ঠান','workshop','ওয়ার্কশপ','showcase','debate','বিতর্ক','কি কি','ki ki','কোন','kon','কি আছে','আয়োজন','ayojon'])) {
    if(siteData.events.length === 0) {
      return '🏆 এখন কোনো ইভেন্ট নেই। শীঘ্রই আসছে!\n\nআপডেটের জন্য আমাদের Facebook follow করুন:\nhttps://www.facebook.com/share/18HcL7fN3C/';
    }
    const upcoming = siteData.events.filter(e => e.status !== 'Completed');
    const completed = siteData.events.filter(e => e.status === 'Completed');
    let reply = `🏆 আমাদের Events (${siteData.events.length}টি):\n\n`;
    if(upcoming.length > 0) {
      reply += `📅 আসন্ন ইভেন্ট:\n`;
      upcoming.forEach(e => { reply += `• ${e.name} (${e.date||'Coming Soon'}) — ${e.platform||''}\n`; });
    }
    if(completed.length > 0) {
      reply += `\n✅ সম্পন্ন ইভেন্ট:\n`;
      completed.forEach(e => { reply += `• ${e.name}\n`; });
    }
    reply += `\nবিস্তারিত জানতে Events পেজ দেখুন!`;
    return reply;
  }

  // 4. Registration
  if(matches(msg, ['register','রেজিস্ট্রেশন','রেজিস্ট্রেশন','registration','sign up','যোগ দিতে চাই','অংশগ্রহণ','অংশ নিতে','participate','form','ফর্ম'])) {
    if(siteData.events.filter(e=>e.status!=='Completed').length === 0) {
      return '📝 এখন কোনো Registration চালু নেই।\n\nনতুন ইভেন্টের জন্য অপেক্ষা করুন!\n\n📘 Facebook: TalentVerse Bangladesh\n💬 WhatsApp: +8801634428536';
    }
    return `📝 Registration করতে:\n\n১. Register পেজে যান\n২. ইভেন্ট সিলেক্ট করুন\n৩. Form পূরণ করুন\n\n🎯 আসন্ন ইভেন্ট:\n${siteData.events.filter(e=>e.status!=='Completed').map(e=>`• ${e.name}`).join('\n')}\n\n👉 register.html পেজে যান`;
  }

  // 5. Team/Members - dynamic
  if(matches(msg, ['team','টিম','member','সদস্য','members','কে কে','executive','panel','পরিষদ','নেতৃত্ব','leadership','ceo','coo','founder','প্রতিষ্ঠাতা'])) {
    if(siteData.members.length === 0) {
      return '👥 আমাদের টিম তৈরি হচ্ছে!\n\nবিস্তারিত জানতে:\n👉 Executive Panel পেজ দেখুন';
    }
    const leaders = siteData.members.filter(m => m.dept === 'Leadership');
    let reply = `👥 আমাদের Executive Panel:\n\n`;
    if(leaders.length > 0) {
      reply += `⭐ Leadership:\n`;
      leaders.forEach(m => { reply += `• ${m.name} — ${m.role}\n`; });
    }
    const depts = [...new Set(siteData.members.filter(m=>m.dept!=='Leadership').map(m=>m.dept))];
    if(depts.length > 0) {
      reply += `\n📋 Departments: ${depts.join(', ')}`;
    }
    reply += `\n\n👉 Executive Panel পেজে সবার পরিচয় দেখুন!`;
    return reply;
  }

  // 6. Certificate verify
  if(matches(msg, ['certificate','সার্টিফিকেট','verify','ভেরিফাই','সনদ','id','আইডি','TVB','tvb','নম্বর','number','check'])) {
    return `🎖️ Certificate Verify করতে:\n\n১. Verify পেজে যান\n২. Certificate ID লিখুন\n   (যেমন: TVB-2026-001)\n৩. Verify বাটন চাপুন\n\n✅ সার্টিফিকেট সত্যিকারের হলে সব তথ্য দেখাবে\n❌ ভুয়া হলে "পাওয়া যায়নি" দেখাবে\n\n👉 verify.html পেজে যান`;
  }

  // 7. Contact
  if(matches(msg, ['contact','যোগাযোগ','phone','ফোন','number','নম্বর','whatsapp','হোয়াটসঅ্যাপ','facebook','ফেসবুক','instagram','ইনস্টাগ্রাম','email','ইমেইল','mail','কথা বলতে','call'])) {
    return `📞 আমাদের সাথে যোগাযোগ:\n\n📘 Facebook:\nfacebook.com/share/18HcL7fN3C\n\n📸 Instagram:\n@talentverse.bangladesh07\n\n💬 WhatsApp:\n+8801634428536\n\n✉️ Email:\ntalentversebd5@gmail.com\n\n📍 Location: Bangladesh`;
  }

  // 8. About/Mission
  if(matches(msg, ['about','সম্পর্কে','কি','what','who','কে','mission','vision','লক্ষ্য','কেন','why','প্রতিষ্ঠা','founded','history','ইতিহাস','talentverse','talent verse','টেলেন্টভার্স'])) {
    return `🌟 TalentVerse Bangladesh\n"Where Talent Meets Opportunity"\n\n📅 প্রতিষ্ঠা: ২০২৬\n📍 বাংলাদেশ\n\n🎯 আমাদের লক্ষ্য:\n✅ প্রতিভা আবিষ্কার করা\n✅ দক্ষতা বিকাশ করা\n✅ সুযোগ তৈরি করা\n✅ কমিউনিটি গড়া\n\nআমরা বিশ্বাস করি বাংলাদেশে প্রতিভার কোনো অভাব নেই — শুধু দরকার সঠিক প্ল্যাটফর্ম!`;
  }

  // 9. Join
  if(matches(msg, ['join','যোগ','apply','আবেদন','volunteer','ভলান্টিয়ার','সদস্য হতে','member হতে','কিভাবে যোগ','kivabe','হতে চাই'])) {
    return `🤝 TalentVerse Bangladesh এ যোগ দিন!\n\n📝 আবেদন করতে:\n১. Join Our Team পেজে যান\n২. Form পূরণ করুন\n৩. আমরা যোগাযোগ করব\n\n🎯 আমরা খুঁজছি:\n• Event Organizer\n• Content Creator\n• Social Media Manager\n• Graphic Designer\n• Volunteer\n• Community Manager\n\n👉 join.html পেজে যান`;
  }

  // 10. Thanks
  if(matches(msg, ['thanks','ধন্যবাদ','thank','শুক্রিয়া','জাজাকাল্লাহ','জাযাকাল্লাহ','আল্লাহ হাফেজ','খোদা হাফেজ','bye','বিদায়','ok','ঠিক আছে','আচ্ছা'])) {
    return `জাযাকাল্লাহু খাইরান! 😊\n\nআর কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন।\nTalentVerse Bangladesh এর সাথে থাকুন! 🌟`;
  }

  // 11. Help
  if(matches(msg, ['help','সাহায্য','হেল্প','কি করতে পারো','কি জানো','what can you do','কি বলতে পারো'])) {
    return `আমি TVBot! এই বিষয়গুলো জানি:\n\n🏆 Events — সব ইভেন্টের তথ্য\n📝 Registration — কিভাবে Register করবেন\n👥 Team — আমাদের সদস্যরা\n🎖️ Certificate — সার্টিফিকেট যাচাই\n📞 Contact — যোগাযোগের তথ্য\nℹ️ About — আমাদের সম্পর্কে\n🤝 Join — সদস্য হওয়ার উপায়\n\nযেকোনো প্রশ্ন করুন বাংলায় বা English এ!`;
  }

  // 12. Bangla regional/informal variations
  if(matches(msg, ['kemon','কেমুন','কেমনে','কিতা','কিরে','কিছু','kichu','বলো','bolo','দাও','dao','জানাও','janao'])) {
    return `হ্যাঁ বলুন! 😊 আমি আপনাকে সাহায্য করতে এখানেই আছি।\n\nকী জানতে চান?\n• Events সম্পর্কে?\n• Registration?\n• Team সম্পর্কে?\n• যোগাযোগ?`;
  }

  // Default
  return `বুঝতে পারিনি 😅\n\nসরাসরি যোগাযোগ করুন:\n💬 WhatsApp: +8801634428536\n📘 Facebook: TalentVerse Bangladesh\n\nঅথবা জিজ্ঞেস করুন:\n• "Events কী কী আছে?"\n• "Register করব কিভাবে?"\n• "Team সম্পর্কে জানতে চাই"\n• "Certificate verify করব"`;
}

window.TVBot = {
  getReply: function(msg) {
    return new Promise(resolve => {
      setTimeout(() => resolve(getReply(msg)), 500 + Math.random() * 500);
    });
  }
};

// Initialize
loadSiteData();
