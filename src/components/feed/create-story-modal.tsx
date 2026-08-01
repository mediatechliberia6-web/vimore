@@
-import { uploadToServer } from '@/lib/upload';
+import { uploadToServer } from '@/lib/upload';
@@
     try {
       setIsProcessing(true);
       triggerHaptic(30);

       try {
         let finalFileId = "";
         let finalImageUrl = "";

         if (selectedFile) {
-        const fileId = ID.unique();
-        const res = await storage.createFile(BUCKET_STORIES, fileId, selectedFile);
-        finalFileId = res.$id;
-        finalImageUrl = getFileUrl(BUCKET_STORIES, finalFileId);
+        const up = await uploadToServer(selectedFile, BUCKET_STORIES);
+        finalFileId = up.fileId;
+        finalImageUrl = up.url;
         }
