import type { User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

// Missing: Appointment in prisma schema and so appointment history of user missing
// From user only Pick id, name, email, phone

type UserInfo = Pick<User, 'id' | 'name' | 'email' | 'phone'>;

export const columns: ColumnDef<UserInfo>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
];
