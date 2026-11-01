LiveMerge currently uses only three YouTube Data API endpoints:

| Form endpoint | What LiveMerge does | Daily cost |
|---|---|---:|
| youtube.search.list | Finds a channel’s current live video: eventType=live, type=video, order=date, channelId, part=snippet | 1 call from the separate search.list bucket |
| youtube.channels.list | Gets a channel name when that channel is not live: id, part=snippet | 1 unit |
| youtube.videos.list | Checks whether a manually added/edited video is live: id, part=snippet | 1 unit |

Select exactly those three endpoints. Do not select live chat, uploads, playlists, comments, analytics, or any write endpoint. The embedded YouTube player/chat uses the IFrame/embed APIs—not a YouTube Data API endpoint.

LiveMerge’s only OAuth scope is:

https://www.googleapis.com/auth/youtube.readonly

Google’s current default is 100 search.list calls/day, 100 videos.insert calls/day, and 10,000 units/day for all other endpoints. search.list is the likely quota constraint here. Quota calculator

## What to select and enter

### Sections 1–4

- Request type: Complete a compliance audit to request additional quota
- Applicant type: choose your actual status—likely individual user
- Organization legal name / parent company: self, if applying as an individual
- Organization website: your deployed HTTPS LiveMerge URL
- Contacts/address: your real legal/contact information
- Business description: use the draft below
- Target audience: General Public; add Individual Content Creators only if that is genuinely a target
- Revenue model: Free service if you do not charge or show ads
- Google representative: No, I do not have a Google representative, unless you do
- API client name: LiveMerge
- Does the name contain “YouTube”?: No
- Primary access URL: deployed LiveMerge HTTPS URL
- Privacy Policy URL: https://your-domain/privacy
- Terms URL: provide one once created
- Publicly accessible: Yes
- Demo account: not applicable; the app has no LiveMerge account. In special instructions, state: “The app is publicly accessible. Reviewers can use their own Google account to test the optional read-only OAuth connection.”

### Section 5: Project #1

- Google Cloud Project Number: copy the numeric project number from Google Cloud Console.
- Use-case category: Websites & Mobile Apps
- OAuth required: Yes
- Derived metrics / statistical-data agreement: do not opt in. LiveMerge does not calculate or retain derived metrics or statistics.
- Endpoint selection: youtube.search.list, youtube.channels.list, youtube.videos.list.

Use this description for “Describe your organization’s work as it relates to YouTube”:

> LiveMerge is a browser-based multi-stream viewing application. Users can add public YouTube video URLs or connect Google with the read-only YouTube scope to add channel IDs. For each user-selected channel, LiveMerge queries YouTube for its current live video and displays it in an embedded YouTube player. If a channel is not live, the app retrieves only the channel name for display. The application adds value by allowing users to monitor and watch multiple selected live streams in one customizable layout. It does not upload, modify, manage, monetize, or redistribute YouTube content.

## Quota request

Don’t request an arbitrary large number. Base it on expected active users.

The app currently performs approximately:

search.list per user/day ≈ added channels + scheduled refreshes + manual refreshes
channels.list per user/day ≤ search.list calls for channels that are offline
videos.list per user/day = manually added or edited video URLs

The scheduled refresh logic targets roughly 80 searches per user/day, plus the initial checks when the app opens. Therefore, if you expect 50 daily active signed-in users with ~5 channels each:

search.list: about 50 × 85 = 4,250/day
request with buffer: 6,000 search.list calls/day

channels.list: worst case ~4,250 units/day
videos.list: likely low/manual usage
general quota: keep default 10,000 units/day

For that example, select:

- Total general quota: No change / Default quota (10k)
- youtube.search.list: Above default, request 6,000/day
- youtube.videos.insert: do not request anything

Use this justification, replacing the user forecast with your real estimate:

> LiveMerge uses search.list to identify whether user-selected channels are currently live. Each active signed-in user may monitor approximately five channels, with an initial check and scheduled refreshes to keep the multi-stream wall current. At an expected 50 daily active users, projected usage is approximately 4,250 search.list calls per day. We request 6,000 daily calls to accommodate normal traffic variation and user-initiated refreshes. We use channels.list only to display the name of an offline user-selected channel and videos.list only when a user manually adds or edits a video URL. We do not use write operations or videos.insert.

If you have fewer than roughly 2 active users running the app all day, the current 100-search default may be enough; the quota is shared across every browser using the same Cloud project.

## Required uploads

Take screenshots at at least 1280×720, with the browser address bar visible, readable text, descriptive filenames, and each file under 10 MB. Current form requirements

- privacy-policy.png: /privacy, showing YouTube API Services, Google Privacy Policy link, deletion button, and Google permissions link.
- homepage-privacy-link.png: homepage with a visible embedded YouTube player/content and the Privacy link.
- terms-of-service.pdf or PNG: required. This still needs to be created.
- oauth-flow.png: Google consent screen showing the read-only scope; signed-in LiveMerge screen with sign-out control; Google permissions/revocation flow.
- player-embed.png: the multi-stream page with an embedded YouTube player.

## Two compliance gaps to resolve before submitting

1. The app needs a Terms of Service document; the form requires it even though its URL field is optional.
2. The current sign-out button only removes the token from browser storage. For the OAuth revocation evidence, implement Google token revocation as well, then show that flow in a screenshot. Google expects an authorization-revocation path and deletion of associated API data. YouTube Developer Policies

Also ensure your deployed Cloudflare Pages site serves /privacy directly—not only after navigating from the homepage—before placing that URL in the form.
