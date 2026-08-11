# Post Facebook giới thiệu PTCGL Tracker

Dán thẳng lên Facebook; thay `[LINK]` bằng URL thật khi có.

---

Chào mọi người 👋

Mình vừa làm một tool nhỏ cho người chơi **Pokémon TCG Live**, tên **PTCGL Tracker**, và rất mong được anh chị / các bạn thử giúp và góp ý chân thành.

**Link:** [LINK]

### Dùng để làm gì?
Sau mỗi trận trên PTCGL, export battle log → dán vào web → gắn deck đã chơi. Tool sẽ lưu lịch sử, tính win rate, và giúp xem lại trận / nhận vài gợi ý cải thiện.

### Những gì MVP đang có (hy vọng mọi người thấy hữu ích)
1. **Import battle log** từ PTCGL, gắn deck (paste list PTCGL/Limitless).
2. **Dashboard win rate** — tổng, đi trước / đi sau, theo từng deck, lọc 7 ngày / 30 ngày / tất cả.
3. **Xem lại trận theo turn** — timeline rõ ràng sau khi import.
4. **AI Analyst (local)** — điểm tốt / cần cải thiện / tip matchup; nhận diện deck đối thủ theo bài lõi (meta Mega-era) + vài counter engine-first.
5. **Ghi chú từng trận** — viết lưu ý riêng sau trận; AI đọc note để phân tích sát hơn và cải thiện đánh giá phong cách.
6. **Phong cách chơi** — sau khoảng 10 trận: Aggressive / Defensive / Disruptive…
7. **Quest luyện tập hàng ngày** + heatmap kiểu GitHub (theo năm Th1–Th12).
8. **Sửa tên hồ sơ** nếu lúc đầu nhập nhầm.

### Lưu ý rất quan trọng
Khi đăng ký / vào **Hồ sơ**, **username phải khớp đúng display name trên PTCGL** (ví dụ `Fairy_VN`). Sai một ký tự là tool có thể nhận nhầm thắng/thua trong log. Nhập nhầm thì vào **Hồ sơ** sửa lại — trận cũ sẽ được khớp lại.

### Còn thô — rất cần feedback
Đây vẫn là MVP. Mình biết còn nhiều chỗ chưa ổn, ví dụ:
- Parse log / nhận diện W-L đôi khi lệch nếu tên không khớp hoặc log lạ
- Nhận diện deck đối thủ còn false positive / miss meta mới
- AI tip còn rule-based, chưa “huấn luyện viên” sâu theo từng turn (ghi chú trận sẽ giúp mình cải thiện phần này nếu mọi người chịu khó note)
- UI/UX, mobile, tốc độ import nhiều trận
- Quest / heatmap / playstyle còn đơn giản

Mọi người dùng thử xong, cho mình xin feedback giúp với ạ — bug, ý tưởng, hoặc “cái này khó hiểu quá”. Nếu được, sau vài trận hãy thử **ghi chú** những điểm then chốt (Boss timing, energy brick, prize map…) để mình thu thập thêm signal. Comment dưới post hoặc inbox mình đều được. Mình lắng nghe và cải thiện dần.

Cảm ơn mọi người đã đọc và ủng hộ 🙏  
Chúc mọi người leo rank vui vẻ!

---

**Gợi ý đăng:** kèm 1–2 ảnh screenshot dashboard + import (hoặc match AI / ô ghi chú trận). Hashtag tùy chọn: `#PTCGL` `#PokemonTCG` `#PTCGLive`.
