@@
-import { uploadToServer } from '@/lib/upload';
+import { uploadToServer } from '@/lib/upload';
@@
-      const fileId = ID.unique();
-      await storage.createFile(BUCKET.POST_MEDIA, fileId, videoFile);
-      uploadedFileId = fileId;
-      const mediaUrl = getFileUrl(BUCKET.POST_MEDIA, fileId);
+      const res = await uploadToServer(videoFile, BUCKET.POST_MEDIA);
+      uploadedFileId = res.fileId;
+      const mediaUrl = res.url;
