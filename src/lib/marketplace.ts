@@
 export async function uploadProductImage(file: File, sellerId: string): Promise<string> {
-  const compressed = await compressImage(file);
-  const created = await storage.createFile(
-    BUCKET.MARKETPLACE_IMAGES,
-    ID.unique(),
-    compressed,
-    [
-      Permission.read(Role.any()),
-      Permission.update(Role.user(sellerId)),
-      Permission.delete(Role.user(sellerId)),
-    ]
-  );
-  return created.$id;
+  const compressed = await compressImage(file);
+  const res = await uploadToServer(compressed, BUCKET.MARKETPLACE_IMAGES);
+  return res.fileId;
 }
