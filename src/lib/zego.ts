export const ZEGO_APP_ID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0', 10);

export function buildRoomId(userA: string, userB: string): string {
  return 'call_' + [userA, userB].sort().join('_');
}

export type CallType = 'audio' | 'video';
export type CallSignalType = 'CALL_INCOMING' | 'CALL_ACCEPTED' | 'CALL_DECLINED' | 'CALL_CANCELLED' | 'CALL_ENDED';

export interface CallSignalData {
  roomId: string;
  callType: CallType;
  callerName: string;
  callerAvatar: string;
  callerUsername: string;
  callerId: string;
}
