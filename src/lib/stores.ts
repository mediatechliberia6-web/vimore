@@
 import { ID, Query, Permission, Role } from 'appwrite';
+import { uploadToServer } from '@/lib/upload';
@@
 async function uploadStoreLogo(file: File, ownerId: string): Promise<string> {
-  const created = await storage.createFile(
-    BUCKET.STORE_LOGOS,
-    ID.unique(),
-    file,
-    [
-      Permission.read(Role.any()),
-      Permission.update(Role.user(ownerId)),
-      Permission.delete(Role.user(ownerId)),
-    ]
-  );
-  return created.$id;
+  // Use server-side upload to avoid depending on client session.
+  const res = await uploadToServer(file, BUCKET.STORE_LOGOS);
+  // NOTE: server-side upload currently does not set per-file permissions.
+  // If you require Role.user-based update/delete permissions, adjust /api/upload to accept ownerId
+  // and set permissions via admin storage.createFile().
+  return res.fileId;
 }
