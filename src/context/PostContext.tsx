@@
   const uploadMedia = useCallback(async (file: File, bucketId: string = BUCKET.POST_MEDIA): Promise<string> => {
-    let toUpload = file;
-    const result = await storage.createFile(bucketId, ID.unique(), toUpload);
-    return getFileUrl(bucketId, result.$id);
+    const res = await uploadToServer(file, bucketId);
+    return res.url;
   }, []);
