# Post snapshot and editorial method

Captured on **27 October 2026**. The site includes six selected IdentityMD posts, not all tweets on X. Posts are paraphrased in the worker’s own words; card titles are editorial summaries. There are no invented authors, post IDs, engagement numbers or verification badges. The colored initial circles are local monograms, not author photographs.

The default ranking is captured likes, descending. “Most discussed” uses captured reply counts; “Latest first” uses timestamps decoded from the original X snowflake IDs in `src/posts.ts`. Times are displayed in UTC. Views retain the source’s rounded labels. Counts can change after capture, and a public mirror is not an authoritative X API.

| Post | Original | Captured likes / reposts / replies / views | Evidence used |
| --- | --- | --- | --- |
| A more resilient swarm | [Adam, 23 Oct](https://x.com/surfcoderepeat/status/2113665568414773675) | 209 / 32 / 25 / 11K | [Individual mirror](https://w.twstalker.com/surfcoderepeat/status/2113665568414773675) |
| What’s next for IdentityMD? | [Adam, 22 Oct](https://x.com/surfcoderepeat/status/2113415108428792077) | 170 / 35 / 22 / 12K | [Individual mirror](https://w.twstalker.com/surfcoderepeat/status/2113415108428792077) |
| Back in the pond | [taylor, 23 Oct](https://x.com/taylor_/status/2113666312501113260) | 137 / 20 / 15 / 6K | [Individual mirror](https://w.twstalker.com/taylor_/status/2113666312501113260) |
| An operator’s view of the ecosystem | [Collectible, 11 Oct](https://x.com/collectible/status/2109372720744120535) | 89 / 8 / 9 / 14K | [Author’s mirror profile](https://ww.twstalker.com/collectible), quoted original |
| A week of running agents | [Collectible, 13 Oct](https://x.com/collectible/status/2109865670594760946) | 87 / 9 / 8 / 8K | [Author’s mirror profile](https://ww.twstalker.com/collectible), outer post |
| Connecting the ecosystem dots | [KeeperCF, 23 Oct](https://x.com/Keeperssd/status/2113550974585287034) | 59 / 12 / 4 / 3K | [Individual mirror](https://w.twstalker.com/Keeperssd/status/2113550974585287034) |

## Source caveats

The failover post’s mirror repeats the same text as an embedded item and an outer item with different metrics. The selected outer counters are 25 replies, 32 reposts, 209 likes and 11K views. Another embedded capture shows 25 / 24 / 154 / 18K. The discrepancy is retained in the post’s source note rather than described as a precise live measurement.

Collectible’s two individual mirror URLs timed out. The profile page exposed the original IDs and counters, including the quoted original under the later post. The later post’s outer counters were 8 replies, 9 reposts, 87 likes and 8K views; the quoted earlier post showed 9 replies, 8 reposts, 89 likes and 14K views. Each card links to that profile as its evidence page. The individual X URLs are original-post destinations, not a claim that an authenticated X session was checked.

KeeperCF’s page includes both a quoted roadmap and the outer recap. The recap uses the outer counters, not the more popular quoted roadmap’s counters.

Roadmap capacity is described as planned, rather than released or currently active. Operator earnings and market opinions remain self-reported author claims; the summaries do not repeat dollar targets or promise returns. Original videos and full threads stay on X. There is no simulated video player or embedded third-party tracking script.

## Updating the snapshot

Replace or extend the `posts` array in `src/posts.ts` with posts you can actually source. Capture author, exact status ID, likes, replies, reposts, rounded views, evidence URL and any ambiguity. Write a short attributed summary. Change `snapshotDate` and this document together. Rebuild and run the validation script; its current six-post assertions intentionally need updating if the selection changes.
