export type QuestPoolItem = {
  title: string;
  detail: string;
};

export type Dictionary = {
  brand: string;
  metaDescription: string;
  nav: {
    dashboard: string;
    decks: string;
    import: string;
    settings: string;
    signOut: string;
  };
  home: {
    title: string;
    subtitle: string;
    body: string;
    openDashboard: string;
    getStarted: string;
    signIn: string;
  };
  auth: {
    signIn: string;
    register: string;
    name: string;
    email: string;
    password: string;
    noAccount: string;
    hasAccount: string;
    signingIn: string;
    creating: string;
  };
  onboarding: {
    title: string;
    hint: string;
    label: string;
    submit: string;
    saving: string;
  };
  settings: {
    pageTitle: string;
    pageHint: string;
    title: string;
    hint: string;
    label: string;
    submit: string;
    saving: string;
    saved: string;
  };
  dashboard: {
    title: string;
    playingAs: string;
    allTime: string;
    days7: string;
    days30: string;
    overall: string;
    goingFirst: string;
    goingSecond: string;
    games: string;
    gamesLine: (wins: number, losses: number, total: number) => string;
    winRateByDeck: string;
    newDeck: string;
    noGames: string;
    noGamesHint: string;
    createDeckHint: string;
    recentMatches: string;
    importLog: string;
    opponentDeckUnknown: string;
    yourDeckUnset: string;
    playerStyle: string;
    playerStyleNeed: (n: number, need: number) => string;
    playerStyleBasedOn: (n: number, need: number) => string;
    playerStyleEvaluate: string;
    playerStyleRefresh: string;
    playerStyleGenerating: string;
  };
  playerStyle: {
    mainStyle: string;
    tempo: string;
    summary: string;
    strengths: string;
    weaknesses: string;
    focus: string;
  };
  match: {
    dashboard: string;
    match: string;
    deck: string;
    wentFirst: string;
    end: string;
    winner: string;
    aiAnalyst: string;
    aiAnalyzing: string;
    aiAgain: string;
    aiAnalystHint: string;
    setup: string;
    turn: string;
    good: string;
    improve: string;
    tips: string;
    vsNotes: string;
    summary: string;
    userNoteTitle: string;
    userNoteHint: string;
    userNotePlaceholder: string;
    userNoteSave: string;
    userNoteSaving: string;
    userNoteSaved: string;
  };
  decks: {
    title: string;
    new: string;
    edit: string;
    delete: string;
    empty: string;
    matchesWithDeck: string;
    cardsLine: (total: number, p: number, t: number, e: number) => string;
    noMatchesYet: string;
    winRateLine: (pct: number, wins: number, losses: number) => string;
  };
  import: {
    title: string;
    hint: string;
    matching: string;
    deckUsed: string;
    noDeck: string;
    uploadTxt: string;
    pasteLog: string;
    importing: string;
    saveMatch: string;
    previewEmpty: string;
    you: string;
    opponent: string;
    result: string;
    winner: string;
    turns: string;
    setupEvents: string;
    importFailed: string;
    parseFailed: string;
  };
  quests: {
    lockedTitle: string;
    lockedHint: (need: number, count: number) => string;
    todayTitle: string;
    todayHint: (completed: number, total: number) => string;
    noteLabel: string;
    done: string;
    resetIn: (remaining: string) => string;
    resetting: string;
    heatmapTitle: (total: number, year: number) => string;
    heatmapDayTitle: (key: string, count: number) => string;
    less: string;
    more: string;
    weekdayLabels: readonly string[];
    pool: Record<
      | "win_today"
      | "import_two"
      | "win_first"
      | "win_second"
      | "win_concede"
      | "win_standard"
      | "attach_deck"
      | "analyze_one"
      | "win_streak_2",
      QuestPoolItem
    >;
    notes: {
      lock: (need: number) => string;
      done: string;
      import: string;
      deck: string;
      go: (remaining: number, total: number) => string;
    };
  };
  resultLabels: {
    concede: string;
    standard: string;
    unknown: string;
  };
  theme: {
    lightMode: string;
    darkMode: string;
  };
  common: {
    win: string;
    loss: string;
    loading: string;
    error: string;
  };
  api: {
    playerAssessmentNeed: (need: number, count: number) => string;
    failed: string;
    aiAssessmentFailed: string;
  };
  language: {
    label: string;
  };
};
