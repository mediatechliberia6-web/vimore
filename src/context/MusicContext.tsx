@@
   const publishTrack = useCallback(async (track: any) => {
     if (!currentUser) return;
     try {
       let audioId: string | undefined;
       let coverId: string | undefined;

       if (track.audioFile instanceof File) {
         let audioFile = track.audioFile;
-        const audioDoc = await storage.createFile(BUCKET.MUSIC_TRACKS, ID.unique(), audioFile);
-        audioId = audioDoc.$id;
+        const audioRes = await uploadToServer(audioFile, BUCKET.MUSIC_TRACKS);
+        audioId = audioRes.fileId;
       } else if (track.audioUrl) {
         audioId = extractFileId(track.audioUrl) || undefined;
       }

       if (track.coverFile instanceof File) {
         let coverFile = track.coverFile;
-        const coverDoc = await storage.createFile(BUCKET.ALBUM_COVERS, ID.unique(), coverFile);
-        coverId = coverDoc.$id;
+        const coverRes = await uploadToServer(coverFile, BUCKET.ALBUM_COVERS);
+        coverId = coverRes.fileId;
       } else if (track.cover) {
         coverId = extractFileId(track.cover) || undefined;
       }
@@
   const publishAlbum = useCallback(async (album: any) => {
     if (!currentUser) return;
     try {
       let coverId: string | undefined;
       if (album.coverFile instanceof File) {
         let coverFile = album.coverFile;
-        const coverDoc = await storage.createFile(BUCKET.ALBUM_COVERS, ID.unique(), coverFile);
-        coverId = coverDoc.$id;
+        const coverRes = await uploadToServer(coverFile, BUCKET.ALBUM_COVERS);
+        coverId = coverRes.fileId;
       } else if (album.cover) {
         coverId = extractFileId(album.cover) || undefined;
       }
