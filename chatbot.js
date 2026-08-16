// TVBot - Firebase-powered Chatbot for TalentVerse Bangladesh

const firebaseConfig = {
  apiKey: "AIzaSyA91JckJ_FYGiNZxSeAlTjddREl5ok3B3c",
  authDomain: "talentverse-bd-b072c.firebaseapp.com",
  databaseURL: "https://talentverse-bd-b072c-default-rtdb.firebaseio.com",
  projectId: "talentverse-bd-b072c",
  storageBucket: "talentverse-bd-b072c.firebasestorage.app",
  messagingSenderId: "304686688553",
  appId: "1:304686688553:web:0a887b8fc517e24d00af38"
};

// Default responses (used if Firebase not loaded yet)
const defaultResponses = [
  { keywords: 'হ্যালো,hello,hi,হাই,সালাম,আস্সালামু,hey', reply: 'ওয়ালাইকুম আস্সালাম! 👋 আমি TVBot — TalentVerse Bangladesh এর AI assistant।\n\nআমি যা বলতে পারি:\n🏆 Events\n🤝 Join করা\n🎖️ Certificate Verify\n👥 Team\n📞 যোগাযোগ' },
  { keywords: 'event,ইভেন্ট,quiz,কুইজ,competition,প্রতিযোগিতা,workshop,ওয়ার্কশপ,program,অনুষ্ঠান', reply: '🏆 আমাদের Events:\n\n1. 🕌 Islamic Quiz Competition\n2. 🌟 TalentVerse Showcase\n3. 📚 Skill Development Workshop\n4. 🎤 Youth Debate Competition\n5. 🎨 Creative Art Contest\n6. 🚀 Youth Leadership Summit\n\nআপডেটের জন্য Facebook পেজ follow করুন!' },
  { keywords: 'join,যোগ,member,সদস্য,apply,আবেদন,volunteer,টিম,team', reply: '🤝 TalentVerse Bangladesh এ যোগ দিতে:\n\n✅ Join Our Team পেজে যান\n✅ Form পূরণ করুন\n✅ আমরা যোগাযোগ করব\n\nআমরা খুঁজছি:\n• Event Organizer\n• Content Creator\n• Graphic Designer\n• Volunteer' },
  { keywords: 'certificate,সার্টিফিকেট,verify,ভেরিফাই,সনদ', reply: '🎖️ Certificate Verify করতে:\n\n1. Verify পেজে যান\n2. Certificate ID লিখুন\n(যেমন: TVB-2026-001)\n3. Verify বাটন চাপুন\n\nসমস্যা হলে WhatsApp করুন:\n+8801634428536' },
  { keywords: 'contact,যোগাযোগ,phone,whatsapp,facebook,instagram,নম্বর', reply: '📞 আমাদের সাথে যোগাযোগ:\n\n📘 Facebook:\nTalentVerse Bangladesh\n\n📸 Instagram:\n@talentverse.bangladesh07\n\n💬 WhatsApp:\n+8801634428536\n\n📍 Bangladesh' },
  { keywords: 'about,সম্পর্কে,কি,who,কে,mission,লক্ষ্য,founded,প্রতিষ্ঠা', reply: '🌟 TalentVerse Bangladesh\n"Where Talent Meets Opportunity"\n\nপ্রতিষ্ঠা: ২০২৬\n\n👤 CEO & Founder: Abdur Rahman\n👤 COO: Abdullah\n\n🎯 লক্ষ্য:\n✅ প্রতিভা আবিষ্কার\n✅ দক্ষতা বিকাশ\n✅ সুযোগ তৈরি\n✅ কমিউনিটি গড়া' },
  { keywords: 'thanks,ধন্যবাদ,জাজাকাল্লাহ,শুক্রিয়া,thank', reply: 'জাযাকাল্লাহু খাইরান! 😊\nআর কিছু জানতে চাইলে বলুন।\nTalentVerse Bangladesh এ আপনাকে স্বাগতম! 🌟' },
];

let botResponses = [...defaultResponses];

// Load responses from Firebase
async function loadResponses() {
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getDatabase, ref, onValue } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
    
    const apps = getApps();
    const app = apps.length ? apps[0] : initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
    onValue(ref(db, 'chatbot_responses'), snap => {
      if(snap.exists()) {
        const data = snap.val();
        botResponses = Object.values(data).sort((a,b) => (a.order||0) - (b.order||0));
      }
    });
  } catch(e) {
    console.log('Using default responses');
  }
}

loadResponses();

function getBotReply(msg) {
  const lower = msg.toLowerCase().trim();
  
  for(const r of botResponses) {
    const keywords = (r.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    if(keywords.some(kw => lower.includes(kw))) {
      return r.reply;
    }
  }
  
  return 'আমি বুঝতে পারিনি 😅\n\nসরাসরি যোগাযোগ করুন:\n💬 WhatsApp: +8801634428536\n📘 Facebook: TalentVerse Bangladesh\n\nঅথবা জিজ্ঞেস করুন:\n• Events সম্পর্কে\n• Join করতে চাই\n• Certificate Verify';
}

window.TVBot = {
  getReply: function(msg) {
    return new Promise(resolve => {
      setTimeout(() => resolve(getBotReply(msg)), 600 + Math.random() * 600);
    });
  }
};
