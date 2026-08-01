@@
 import * as UserProfile from '@/server/api-impl/root/user/profile';
 import * as Withdraw from '@/server/api-impl/root/withdraw';
+import * as DebugSession from '@/server/api-impl/root/debug/session';
@@
   'auth/lookup-phone': AuthLookupPhone,
   'auth/create-profile': AuthCreateProfile,
+  'debug/session': DebugSession,
   'advertise/submit': AdvertiseSubmit,
@@
   'user/profile': UserProfile,
   'withdraw': Withdraw,
+  
 };
