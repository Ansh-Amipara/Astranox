export type AdminUserDto = Readonly<{
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}>;
