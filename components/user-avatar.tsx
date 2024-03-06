import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type UserAvatarProps = {
  user: Pick<User, 'name' | 'image'>;
};

export default function UserAvatar({ user }: UserAvatarProps) {
  return (
    <Avatar>
      {user.image ? (
        <AvatarImage src={user.image}></AvatarImage>
      ) : (
        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
      )}
    </Avatar>
  );
}
