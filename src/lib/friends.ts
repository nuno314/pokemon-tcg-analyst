export type FriendRelation = "none" | "pending_outgoing" | "pending_incoming" | "accepted";

export type UserPreview = {
  userId: string;
  ptcglName: string;
  displayName: string;
};

export type UserWithRelation = UserPreview & {
  friendshipId: string | null;
  relation: FriendRelation;
};
