export const vi = {
  brand: "PTCGL Tracker",
  nav: {
    dashboard: "Tổng quan",
    decks: "Deck",
    import: "Import",
    signOut: "Đăng xuất",
  },
  home: {
    title: "PTCGL Tracker",
    subtitle: "Import battle log. Theo dõi win rate theo deck. Xem lại từng turn.",
    body: "Dán log từ Pokémon TCG Live, gắn deck đã chơi, xây lịch sử để cải thiện cách chơi.",
    openDashboard: "Mở tổng quan",
    getStarted: "Bắt đầu",
    signIn: "Đăng nhập",
  },
  auth: {
    signIn: "Đăng nhập",
    register: "Tạo tài khoản",
    name: "Tên",
    email: "Email",
    password: "Mật khẩu",
    noAccount: "Chưa có tài khoản?",
    hasAccount: "Đã có tài khoản?",
    signingIn: "Đang đăng nhập…",
    creating: "Đang tạo…",
  },
  onboarding: {
    title: "Tên PTCGL của bạn",
    hint: "Nhập đúng display name trên Pokémon TCG Live để nhận diện thắng/thua trong log.",
    label: "Tên hiển thị PTCGL",
    continue: "Tiếp tục",
    saving: "Đang lưu…",
  },
  dashboard: {
    title: "Tổng quan",
    playingAs: "Đang chơi với tên",
    allTime: "Tất cả",
    days7: "7 ngày",
    days30: "30 ngày",
    overall: "Tổng",
    goingFirst: "Đi trước",
    goingSecond: "Đi sau",
    games: "trận",
    winRateByDeck: "Win rate theo deck",
    newDeck: "Deck mới",
    noGames: "Chưa có trận",
    createDeckHint: "Tạo deck để theo dõi win rate theo list.",
    recentMatches: "Trận gần đây",
    importLog: "Import log",
    opponentDeckUnknown: "Deck đối thủ chưa rõ",
    yourDeckUnset: "Chưa gắn deck",
    playerStyle: "Phong cách chơi (AI)",
    playerStyleNeed: (n: number, need: number) =>
      `Cần ít nhất ${need} trận để đánh giá. Hiện có ${n}/${need}.`,
    playerStyleRefresh: "Cập nhật đánh giá",
    playerStyleGenerating: "Đang phân tích…",
  },
  match: {
    dashboard: "Tổng quan",
    match: "Trận đấu",
    deck: "Deck",
    wentFirst: "Đi trước",
    end: "Kết thúc",
    winner: "Người thắng",
    aiAnalyst: "AI Analyst",
    aiAnalyzing: "Đang phân tích…",
    aiAgain: "Phân tích lại",
    setup: "Setup",
    turn: "Turn",
    good: "Điểm tốt",
    improve: "Cần cải thiện",
    tips: "Hướng xử lý",
    vsNotes: "Lưu ý khi gặp đối thủ này / archetype",
    summary: "Tóm tắt",
  },
  decks: {
    title: "Deck",
    new: "Deck mới",
    edit: "Sửa",
    delete: "Xóa",
    empty: "Chưa có deck. Paste list PTCGL/Limitless để tạo.",
    matchesWithDeck: "Trận dùng deck này",
  },
  import: {
    title: "Import battle log",
    hint: "Export từ màn kết quả PTCGL (clipboard), dán vào đây và chọn deck.",
    matching: "Người chơi khớp",
  },
  common: {
    win: "Thắng",
    loss: "Thua",
    loading: "Đang tải…",
    error: "Có lỗi xảy ra",
  },
} as const;

export type Dictionary = typeof vi;

export function t() {
  return vi;
}

/** Ngưỡng tối thiểu để AI đánh giá phong cách chơi trên dashboard. */
export const PLAYER_ASSESSMENT_MIN_MATCHES = 10;
