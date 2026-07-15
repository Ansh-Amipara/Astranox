export type FriendshipDto = Readonly<{
  friendshipId: string;
  status: string;
  isIncoming: boolean;
  friend: {
    id: string;
    username: string;
    badges: string[];
    memberSince: Date | null;
  };
}>;

export type BaseFriendshipDto = Readonly<{
  id: string;
  userAId: string;
  userBId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}>;
