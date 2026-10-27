export type Topic = 'All posts' | 'Building' | 'Ecosystem' | 'Culture';
export type Post = {
  id: string;
  author: string;
  handle: string;
  initials: string;
  color: string;
  topic: Exclude<Topic, 'All posts'>;
  title: string;
  summary: string;
  likes: number;
  reposts: number;
  replies: number;
  views: string;
  source: string;
  note?: string;
};

// A finite editorial snapshot, not an API response. All prose is paraphrased.
// See SOURCES.md for the capture date, mirror caveats and ranking method.
export const snapshotDate = '27 Oct 2026';
export const posts: Post[] = [
  {
    id: '2113665568414773675', author: 'Adam', handle: 'surfcoderepeat', initials: 'A', color: 'sage', topic: 'Building',
    title: 'A more resilient swarm',
    summary: 'Adam outlines an ENS-based failover system: workers would find alternate servers through identitymd.eth when one endpoint goes down. A step toward distributing the network’s infrastructure.',
    likes: 209, reposts: 32, replies: 25, views: '11K',
    source: 'https://w.twstalker.com/surfcoderepeat/status/2113665568414773675',
    note: 'The mirror repeats this post with different counts. These are the outer post’s captured counts.',
  },
  {
    id: '2113415108428792077', author: 'Adam', handle: 'surfcoderepeat', initials: 'A', color: 'sage', topic: 'Building',
    title: 'What’s next for IdentityMD?',
    summary: 'The roadmap covers NFT launches, more reliable financial apps, a /goal feature for coordinating agents, and agent wallets. These are development plans, including a proposed capacity of up to 10,000 agents, rather than released capabilities.',
    likes: 170, reposts: 35, replies: 22, views: '12K',
    source: 'https://w.twstalker.com/surfcoderepeat/status/2113415108428792077',
  },
  {
    id: '2113666312501113260', author: 'taylor', handle: 'taylor_', initials: 't', color: 'lavender', topic: 'Culture',
    title: 'Back in the pond',
    summary: 'Taylor celebrates imd.fun coming back online with a short video. A small update that brought a wave of replies from the community.',
    likes: 137, reposts: 20, replies: 15, views: '6K',
    source: 'https://w.twstalker.com/taylor_/status/2113666312501113260',
  },
  {
    id: '2109372720744120535', author: 'Collectible', handle: 'collectible', initials: 'C', color: 'sand', topic: 'Ecosystem',
    title: 'An operator’s view of the ecosystem',
    summary: 'Collectible compares the token and NFT markets and describes rewards from participating in IdentityMD. This is the author’s personal market opinion and reported experience, not a verified return or a forecast.',
    likes: 89, reposts: 8, replies: 9, views: '14K',
    source: 'https://ww.twstalker.com/collectible',
    note: 'Counts were captured from the quoted original on the author’s profile. The individual mirror page was unavailable.',
  },
  {
    id: '2109865670594760946', author: 'Collectible', handle: 'collectible', initials: 'C', color: 'sand', topic: 'Ecosystem',
    title: 'A week of running agents',
    summary: 'One week into mainnet, Collectible shares an enthusiastic account of receiving ecosystem tokens. The earnings claim is self-reported and does not establish what another operator would earn.',
    likes: 87, reposts: 9, replies: 8, views: '8K',
    source: 'https://ww.twstalker.com/collectible',
    note: 'Captured from the author’s profile; the individual mirror page was unavailable.',
  },
  {
    id: '2113550974585287034', author: 'KeeperCF', handle: 'Keeperssd', initials: 'K', color: 'mint', topic: 'Ecosystem',
    title: 'Connecting the ecosystem dots',
    summary: 'KeeperCF recaps the October 22 roadmap, agent participation, and experiments around INFER and IDM. The thread separates planned features from confirmed releases and asks to see sustained usage.',
    likes: 59, reposts: 12, replies: 4, views: '3K',
    source: 'https://w.twstalker.com/Keeperssd/status/2113550974585287034',
  },
];

export const topics: Topic[] = ['All posts', 'Building', 'Ecosystem', 'Culture'];
export function postUrl(post: Post) { return `https://x.com/${post.handle}/status/${post.id}`; }
export function postDate(post: Post) {
  const ms = Number((BigInt(post.id) >> 22n) + 1288834974657n);
  return new Date(ms);
}
export function formatDate(post: Post) {
  return postDate(post).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
