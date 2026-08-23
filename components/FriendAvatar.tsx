'use client';

import React from 'react';
import { Friend } from '@/types/gym';
import { getInitials } from '@/lib/utils';

interface FriendAvatarProps {
  friend?: Friend;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'w-7 h-7 text-[10px] rounded-lg',
  md: 'w-9 h-9 text-xs rounded-xl',
  lg: 'w-14 h-14 text-base rounded-2xl',
  xl: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl rounded-2xl',
} as const;

export function FriendAvatar({ friend, size = 'md', className = '' }: FriendAvatarProps) {
  const initials = friend ? getInitials(friend.name) : '?';
  const color = friend?.color || '#3b82f6';

  return (
    <div
      className={`flex items-center justify-center font-black text-zinc-950 border-2 border-black/20 select-none shadow-lg ${SIZES[size]} ${className}`}
      style={{ backgroundColor: color }}
      title={friend?.name}
    >
      {initials}
    </div>
  );
}
