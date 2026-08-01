@@
-import { ID, Query, Permission, Role } from 'appwrite';
+import { ID, Query, Permission, Role } from 'appwrite';
+import { uploadToServer } from '@/lib/upload';
@@
   const handleLogoEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !isCluster) return;
     setLogoUploading(true);
     try {
-      const uploaded = await storage.createFile(BUCKET.AVATARS, ID.unique(), file);
-      await updateCluster((contact as Cluster).$id, { avatarId: uploaded.$id });
+      const res = await uploadToServer(file, BUCKET.AVATARS);
+      await updateCluster((contact as Cluster).$id, { avatarId: res.fileId });
       toast({ title: "Logo Updated", description: "Cluster logo has been changed." });
     } catch (err: any) {
       toast({ variant: 'destructive', title: "Upload Failed", description: err.message });
     } finally {
       setLogoUploading(false);
       if (e.target) e.target.value = "";
     }
   };
@@
   const handleCoverEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !isCluster) return;
     setCoverUploading(true);
     try {
-      const uploaded = await storage.createFile(BUCKET.COVERS, ID.unique(), file);
-      await updateCluster((contact as Cluster).$id, { coverId: uploaded.$id });
+      const res = await uploadToServer(file, BUCKET.COVERS);
+      await updateCluster((contact as Cluster).$id, { coverId: res.fileId });
       toast({ title: "Cover Updated", description: "Cluster cover has been changed." });
     } catch (err: any) {
       toast({ variant: 'destructive', title: "Upload Failed", description: err.message });
     } finally {
       setCoverUploading(false);
       if (e.target) e.target.value = "";
     }
   };
