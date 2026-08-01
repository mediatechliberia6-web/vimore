@@
-import { uploadToServer } from '@/lib/upload';
+import { uploadToServer } from '@/lib/upload';
@@
   const handleCreate = async () => {
@@
-      const uploaded = await storage.createFile(BUCKET.EVENT_FLYERS, ID.unique(), flyerFile);
-      const flyerUrl = getFileUrl(BUCKET.EVENT_FLYERS, uploaded.$id);
+      const uploaded = await uploadToServer(flyerFile, BUCKET.EVENT_FLYERS);
+      const flyerUrl = uploaded.url;
@@
   };
