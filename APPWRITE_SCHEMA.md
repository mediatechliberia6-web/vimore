# ViMore Appwrite Sovereign Vault Schema

Use this manual to configure your Appwrite collections and attributes for production synchronization.

## 1. `profiles`
*   **Attributes:**
    *   `id` (String): The User ID from Auth.
    *   `name` (String): Full display name.
    *   `username` (String): Unique spatial signature.
    *   `avatar` (String): Profile image URL.
    *   `cover` (String, Optional): Banner image URL.
    *   `bio` (String, Optional): Workspace description.
    *   `gender` (String): `Male` or `Female`.
    *   `nationality` (String): Linguistic origin.
    *   `dateOfBirth` (String): Arrival date.
    *   `goldBalance` (Integer): Energy vault.
    *   `diamondBalance` (Integer): Premium energy.
    *   `starBalance` (Integer): Referral pulse.
    *   `referralCount` (Integer): Total handshakes.
    *   `role` (String): `SUPER`, `FINANCIAL`, `MODERATOR`, `USER`.
    *   `joinDate` (String): ISO 8601 timestamp.
    *   `hasEverBeenVerified` (Boolean): Signature history.
    *   `isVerified` (Boolean): Active pulse signature.

## 2. `posts`
*   **Attributes:**
    *   `creatorId` (String): Linking profile ID.
    *   `creatorName` (String): Display name of creator.
    *   `creatorUsername` (String): Spatial ID of creator.
    *   `creatorAvatar` (String): Avatar of creator.
    *   `content` (String): Post manifesto.
    *   `type` (String): `photo` or `video`.
    *   `mediaUrls` (String Array): High-fidelity assets.
    *   `isLocked` (Boolean): Energy gate pulse.
    *   `unlockPrice` (Integer, Optional): Gold required.
    *   `timestamp` (String): ISO 8601.
    *   `likes` (Integer): Positive pulse count.
    *   `unlikes` (Integer): Negative pulse count.
    *   `views` (Integer): Spatial reach.
    *   `commentsCount` (Integer): Discussion node count.
    *   `isBoosted` (Boolean): Campaign priority.
    *   `boostTargetViews` (Integer, Optional): Views promised.
    *   `boostCurrentViews` (Integer, Optional): Progress.

## 3. `campaigns`
*   **Attributes:**
    *   `title` (String): Campaign label.
    *   `content` (String): Discovery manifesto.
    *   `type` (String): `photo` or `video`.
    *   `actionUrl` (String): Target handshake link.
    *   `actionLabel` (String): Button signature.
    *   `mediaUrl` (String): HQ asset node.
    *   `isActive` (Boolean): Pulse status.
    *   `impressions` (Integer): Reach count.
    *   `clicks` (Integer): Engagement count.
    *   `timestamp` (String): ISO 8601.

## 4. `payment_requests` (Inbound Hub)
*   **Attributes:**
    *   `userId` (String): Requesting node.
    *   `username` (String): Spatial ID.
    *   `amount` (String): Package cost (e.g. "1000").
    *   `currency` (String): `LD` or `USD`.
    *   `packageName` (String): Target package.
    *   `code` (String): Verification handshake code.
    *   `screenshot` (String): Receipt visual URL.
    *   `status` (String): `PENDING`, `APPROVED`, `REJECTED`.
    *   `timestamp` (String).

## 5. `withdrawals` (Outbound Hub)
*   **Attributes:**
    *   `userId` (String): Recipient node.
    *   `username` (String): Spatial ID.
    *   `amount` (Float): Energy source (Gold/Diamond).
    *   `currency` (String): `GOLD` or `DIAMOND`.
    *   `payoutAmount` (Float): Cash equivalent.
    *   `payoutCurrency` (String): `USD` or `LD`.
    *   `method` (String): `ORANGE` or `MTN`.
    *   `accountName` (String): Legal name on wallet.
    *   `accountNumber` (String): Wallet pulse ID.
    *   `status` (String): `PENDING`, `APPROVED`, `REJECTED`.
    *   `timestamp` (String).

## 6. `messages`
*   **Attributes:**
    *   `senderId` (String): Source username.
    *   `recipientId` (String): Target username.
    *   `text` (String, Optional): Pulse content.
    *   `type` (String): `text`, `photo`, `video`, `voice`, `link`.
    *   `mediaUrl` (String, Optional): Asset link.
    *   `voiceDuration` (String, Optional): Sonic time.
    *   `status` (String): `sent`, `delivered`, `read`.
    *   `timestamp` (String).

## 7. `connections` (Social Graph)
*   **Attributes:**
    *   `userId` (String): Follower node.
    *   `targetUsername` (String): Followed node.
    *   `status` (String): `FRIEND` (Mutual) or `FOLLOWING`.
    *   `timestamp` (String).

## 8. `comments`
*   **Attributes:**
    *   `postId` (String): Linking post ID.
    *   `userId` (String): Creator ID.
    *   `userName` (String): Creator name.
    *   `userAvatar` (String): Creator avatar.
    *   `text` (String): Reaction content.
    *   `parentId` (String, Optional): Reply target.
    *   `timestamp` (String).

## 9. `stories`
*   **Attributes:**
    *   `userId` (String): Owner profile ID.
    *   `userUsername` (String): Owner signature.
    *   `userName` (String): Owner name.
    *   `userAvatar` (String): Owner avatar.
    *   `segments` (String): JSON array of vibe segments.
    *   `expiry` (String): ISO 8601 (Creation + 24h).
    *   `isCloseFriends` (Boolean): Privacy toggle.
    *   `viewCount` (Integer): Total pulses.
