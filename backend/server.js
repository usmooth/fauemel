const express = require('express');
const mongoose = require('mongoose');
const SHA256 = require('crypto-js/sha256');
require('dotenv').config();

// --- Güncellenmiş Mongoose Modelleri ---

// Kullanıcı telefon numarasını da hash'li saklayabiliriz,
// ama şimdilik ana gizlilik odağımız ilişkiler olduğu için açık bırakabiliriz.
const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  feedbackCredit: { type: Number, default: 1 },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

// Feedback modeli artık hash'leri saklayacak
const FeedbackSchema = new mongoose.Schema({
  pairKey: { type: String, required: true, index: true }, // Eşleşme anahtarı (hash)
  fromUserHash: { type: String, required: true },       // Dönütü verenin hash'i
}, { timestamps: true });
const Feedback = mongoose.model('Feedback', FeedbackSchema);

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['match', 'info'], default: 'info' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    contactName: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
const Notification = mongoose.model('Notification', NotificationSchema);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB veritabanına başarıyla bağlanıldı.'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// --- Güncellenmiş API Endpoints ---

// Register endpoint'i aynı kalabilir
app.post('/api/register', async (req, res) => { /* ... öncekiyle aynı ... */ });

// Feedback endpoint'i YENİ MANTIKLA güncellendi
app.post('/api/feedback', async (req, res) => {
  try {
    const { fromUserId, pairKey, fromUserHash } = req.body;
    if (!fromUserId || !pairKey || !fromUserHash) {
      return res.status(400).json({ message: 'Eksik bilgi gönderildi.' });
    }

    const fromUser = await User.findById(fromUserId);
    if (!fromUser) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    if (fromUser.feedbackCredit < 1) return res.status(403).json({ message: 'Dönüt hakkınız yok.' });

    // Bu kullanıcının bu pairKey için daha önce oy verip vermediğini kontrol et
    const existingFeedback = await Feedback.findOne({ pairKey, fromUserHash });
    if (existingFeedback) {
        return res.status(409).json({ message: 'Bu ilişki için zaten dönüt vermişsiniz.' });
    }

    // Yeni hash'li dönütü kaydet
    const newFeedback = new Feedback({ pairKey, fromUserHash });
    await newFeedback.save();

    // Kullanıcının kredisini düşür
    fromUser.feedbackCredit -= 1;
    await fromUser.save();
    
    // --- YENİ EŞLEŞME KONTROLÜ ---
    // Şimdi, aynı pairKey'e sahip başka bir dönüt var mı diye bakalım
    const allFeedbacksForPair = await Feedback.find({ pairKey });
    
    if (allFeedbacksForPair.length === 2) {
        console.log(`Eşleşme bulundu! pairKey: ${pairKey}`);
        
        // Eşleşme var! İki kullanıcıya da bildirim gönderelim (şimdilik)
        // Gerçekte, hash'ten kullanıcıları bulmak için ek bir yapı gerekir.
        // Şimdilik sadece işlemi tetikleyen kullanıcıya bildirim gönderiyoruz.
        const notification = new Notification({
            user: fromUser._id,
            type: 'match',
            title: 'new!',
            message: 'mutual-positive-feedback-! you have a new match.',
            contactName: 'a contact', // Gerçek ismi bilmediğimiz için genel bir metin
        });
        await notification.save();
    }
    
    res.status(201).json({ message: 'Dönütünüz başarıyla gönderildi.' });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});


// Diğer endpointler (notifications, admin vs.) aynı kalabilir...
app.get('/api/notifications/:userId', async (req, res) => { /* ... öncekiyle aynı ... */ });
app.post('/api/admin/reset-credits', async (req, res) => { /* ... öncekiyle aynı ... */ });
app.post('/api/admin/clear-old-data', async (req, res) => { /* ... öncekiyle aynı ... */ });


app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde başarıyla başlatıldı.`);
});

// --- Önceki kodların tam halini buraya ekleyelim ---
app.post('/api/register', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ message: 'Telefon numarası gerekli.' });
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = new User({ phoneNumber });
            await user.save();
        }
        res.status(200).json({ userId: user._id, phoneNumber: user.phoneNumber, feedbackCredit: user.feedbackCredit });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

app.post('/api/admin/reset-credits', async (req, res) => {
    try {
        const result = await User.updateMany({}, { $set: { feedbackCredit: 1 } });
        res.status(200).json({ message: 'Tüm kullanıcıların dönüt hakları başarıyla sıfırlandı.', updatedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

app.post('/api/admin/clear-old-data', async (req, res) => {
    try {
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const deletedFeedbacks = await Feedback.deleteMany({ createdAt: { $lt: twoWeeksAgo } });
        const deletedNotifications = await Notification.deleteMany({ createdAt: { $lt: twoWeeksAgo } });
        res.status(200).json({ message: 'Eski veriler başarıyla temizlendi.', deletedFeedbacks: deletedFeedbacks.deletedCount, deletedNotifications: deletedNotifications.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});