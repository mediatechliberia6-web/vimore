@@
 import { getFileUrl } from '@/lib/appwrite';
+import { uploadToServer } from '@/lib/upload';
@@
   const handleConfirmWithdrawal = async () => {
@@
-      if (withdrawalActionTarget.action === 'APPROVED' && withdrawalProofFile) {
-        const uploaded = await storage.createFile(BUCKET.PAYMENT_SCREENSHOTS, ID.unique(), withdrawalProofFile);
-        proofImageUrl = toProxyUrl(getFileUrl(BUCKET.PAYMENT_SCREENSHOTS, uploaded.$id));
-      }
+      if (withdrawalActionTarget.action === 'APPROVED' && withdrawalProofFile) {
+        const res = await uploadToServer(withdrawalProofFile, BUCKET.PAYMENT_SCREENSHOTS);
+        proofImageUrl = toProxyUrl(res.url);
+      }
