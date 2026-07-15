export type UserSearchResultDto = Readonly<{
  id: string;
  username: string;
  badges: string[];
  memberSince: Date | null;
}>;
