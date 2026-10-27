import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { FormEvent } from 'react';
import { Icon, type IconName } from './icons';
import { formatDate, postDate, posts, postUrl, snapshotDate, topics, type Post, type Topic } from './posts';
import './styles.css';

const storageKey = 'swarm-signal:saved:v1';
function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && posts.some(p => p.id === id)) : [];
  } catch { return []; }
}
const topicIcons: Record<Topic, IconName> = { 'All posts': 'signal', Building: 'code', Ecosystem: 'globe', Culture: 'smile' };

function App() {
  const [view, setView] = useState(location.hash === '#saved' ? 'saved' : 'feed');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<Topic>('All posts');
  const [sort, setSort] = useState('likes');
  const [saved, setSaved] = useState(readSaved);
  const [storageError, setStorageError] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [modal, setModal] = useState<'about' | 'share' | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [copyState, setCopyState] = useState<'ready' | 'copied' | 'manual'>('ready');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shareInput = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => {
      setView(location.hash === '#saved' ? 'saved' : 'feed');
      setQuery(''); setTopic('All posts');
    };
    window.addEventListener('hashchange', update);
    const sync = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) setSaved(readSaved()); };
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => {
    if (modal && !dialogRef.current?.open) dialogRef.current?.showModal();
    if (!modal && dialogRef.current?.open) dialogRef.current.close();
  }, [modal]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return posts.filter(post =>
      (view !== 'saved' || saved.includes(post.id)) &&
      (topic === 'All posts' || post.topic === topic) &&
      (!term || `${post.author} ${post.handle} ${post.title} ${post.summary} ${post.topic}`.toLocaleLowerCase().includes(term))
    ).sort((a, b) => sort === 'latest' ? postDate(b).getTime() - postDate(a).getTime() : sort === 'replies' ? b.replies - a.replies : b.likes - a.likes);
  }, [view, query, topic, sort, saved]);

  function toggleSave(post: Post) {
    const isSaved = saved.includes(post.id);
    const next = isSaved ? saved.filter(id => id !== post.id) : [...saved, post.id];
    setSaved(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
    setAnnouncement(isSaved ? `Removed “${post.title}” from saved posts.` : `Saved “${post.title}” on this browser.`);
  }

  function navigate(next: 'feed' | 'saved') {
    setView(next); setQuery(''); setTopic('All posts');
  }
  function clearFilters() { setQuery(''); setTopic('All posts'); searchRef.current?.focus(); }
  function chooseTopic(next: Topic) {
    setTopic(next);
    document.getElementById('feed')?.scrollIntoView({ block: 'start' });
  }
  function openShare(post: Post) { setSharePost(post); setCopyState('ready'); setModal('share'); }
  async function copyLink(event: FormEvent) {
    event.preventDefault();
    if (!sharePost) return;
    try { await navigator.clipboard.writeText(postUrl(sharePost)); setCopyState('copied'); }
    catch { setCopyState('manual'); shareInput.current?.focus(); shareInput.current?.select(); }
  }

  return <>
    <a className="skip-link" href="#content">Skip to posts</a>
    <header className="site-header">
      <div className="header-inner shell">
        <a className="brand" href="#feed" onClick={() => navigate('feed')} aria-label="Swarm Signal home">
          <img src="./favicon.svg" alt="" width="34" height="34" />
          <span>swarm<span className="brand-light">signal</span><span className="brand-dot">.</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className={view === 'feed' ? 'nav-link active' : 'nav-link'} href="#feed" onClick={() => navigate('feed')} aria-current={view === 'feed' ? 'page' : undefined}><Icon name="signal"/><span>The feed</span></a>
          <a className={view === 'saved' ? 'nav-link active' : 'nav-link'} href="#saved" onClick={() => navigate('saved')} aria-current={view === 'saved' ? 'page' : undefined}><Icon name="bookmark"/><span>Saved</span><span className="saved-count">{saved.length}</span></a>
          <button className="about-button" aria-label="About" onClick={() => setModal('about')}><Icon name="info"/><span>About</span></button>
        </nav>
        <a className="header-x" href="https://x.com/search?q=%22identity.md%22%20OR%20%22IdentityMD%22&f=top" target="_blank" rel="noreferrer">Explore on <Icon name="x"/><Icon name="arrow"/></a>
      </div>
    </header>

    <main id="content" className="shell" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true"/>
        <div className="hero-copy">
          <h1 id="hero-title">Big brains.<br/><span>Bigger pond.</span></h1>
          <p>Top tweets from the IdentityMD universe.</p>
          <a className="primary-button" href="#feed" onClick={() => navigate('feed')}>Find the signal <Icon name="arrow"/></a>
        </div>
        <div className="hero-art">
          <img src="./pepe-operator.svg" alt="Pepe in a tactical vest, equipped with a neural AI blaster and a frog-shaped scout drone" width="520" height="300" fetchPriority="high"/>
        </div>
      </section>

      <div className="page-grid">
        <section id="feed" className="feed" aria-labelledby="feed-title">
          <div className="feed-heading">
            <div>
              <h2 id="feed-title">{view === 'saved' ? 'Saved signals' : 'Top of the pond'}<span className="heading-mark" aria-hidden="true">↗</span></h2>
              <p>{view === 'saved' ? 'Your reading list, saved in this browser.' : 'IdentityMD posts, ranked by captured likes.'}</p>
            </div>
            <span className="snapshot-label"><Icon name="eye"/>Snapshot</span>
          </div>

          <div className="filter-bar">
            <div className="search-field">
              <Icon name="search"/>
              <label htmlFor="post-search">Search<span className="sr-only"> posts or people</span></label>
              <input id="post-search" ref={searchRef} type="search" placeholder="Posts or people" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off"/>
              {query && <button className="clear-search icon-button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><Icon name="close"/></button>}
            </div>
          </div>

          <div className="topic-filters" role="group" aria-label="Filter by topic">
            {topics.map(item => <button key={item} className={`topic-button ${topic === item ? 'selected' : ''}`} aria-pressed={topic === item} onClick={() => setTopic(item)}><Icon name={topicIcons[item]}/>{item}</button>)}
          </div>

          <div className="results-meta">
            <span role="status">{filtered.length} {filtered.length === 1 ? 'post' : 'posts'}{query.trim() ? ` for “${query.trim()}”` : ''}</span>
            <div className="sort-field">
              <label htmlFor="sort-posts">Sort<span className="sr-only"> posts</span></label>
              <select id="sort-posts" value={sort} onChange={event => setSort(event.target.value)}>
                <option value="likes">Most liked</option>
                <option value="latest">Latest first</option>
                <option value="replies">Most discussed</option>
              </select>
              <Icon name="chevron"/>
            </div>
            <button className="text-button snapshot-date" onClick={() => setModal('about')}>{snapshotDate}<Icon name="info"/></button>
          </div>
          {storageError && <p className="storage-notice" role="status">Browser storage is unavailable. Saves last until you close this page.</p>}

          <div className="post-list">
            {filtered.map((post) => <PostCard key={post.id} post={post} rank={posts.slice().sort((a,b) => b.likes-a.likes).findIndex(p => p.id === post.id) + 1} saved={saved.includes(post.id)} onSave={() => toggleSave(post)} onShare={() => openShare(post)} onTopic={() => setTopic(post.topic)}/>)}
          </div>

          {!filtered.length && <div className="empty-state">
            <div className="empty-icon"><Icon name={view === 'saved' && !saved.length ? 'bookmark' : 'search'}/></div>
            <h3>{view === 'saved' && !saved.length ? 'Keep a little signal' : 'No signals found'}</h3>
            <p>{view === 'saved' && !saved.length ? 'Save a post with its bookmark button. It’ll be waiting here in this browser.' : 'Try a different search or clear your topic filter.'}</p>
            {view === 'saved' && !saved.length ? <a className="primary-button" href="#feed" onClick={() => navigate('feed')}>Explore the feed<Icon name="arrow"/></a> : <button className="primary-button" onClick={clearFilters}>Clear filters<Icon name="close"/></button>}
          </div>}

          {filtered.length > 0 && <div className="end-note"><span className="end-line"/><img src="./favicon.svg" width="24" height="24" alt=""/><span className="end-line"/><p>You’ve caught every signal in this snapshot.</p><a href="https://x.com/search?q=%22identity.md%22%20OR%20%22IdentityMD%22&f=top" target="_blank" rel="noreferrer">Keep exploring on X <Icon name="arrow"/></a></div>}
        </section>

        <aside className="sidebar" aria-label="About the IdentityMD conversation">
          <section className="pond-panel">
            <div className="panel-heading"><h2>The signal report</h2><Icon name="signal"/></div>
            <p>A small window into a very big swarm.</p>
            <div className="stats-row">
              <div><strong>{posts.length.toString().padStart(2, '0')}</strong><span>Posts collected</span></div>
              <div><strong>{new Set(posts.map(p=>p.handle)).size.toString().padStart(2,'0')}</strong><span>Voices in the pond</span></div>
            </div>
            <div className="report-date"><span className="status-dot"/>Captured {snapshotDate}</div>
            <p className="report-note">Ranked by captured likes, within this selection. Counts are a snapshot, not live.</p>
            <button className="text-button accent-link" onClick={() => setModal('about')}>How this feed works<Icon name="arrow"/></button>
          </section>

          <section className="topic-panel">
            <h2>Follow a thread</h2>
            <div className="thread-list">
              {topics.filter(t => t !== 'All posts').map(t => <button key={t} className="thread-button" onClick={() => chooseTopic(t)}><span className="thread-icon"><Icon name={topicIcons[t]}/></span><span><strong>{t}</strong><small>{t === 'Building' ? 'Agents, code & what’s next' : t === 'Ecosystem' ? 'Projects & participation' : 'The people behind the pond'}</small></span><span className="thread-count">{posts.filter(p=>p.topic===t).length}</span><Icon name="arrow"/></button>)}
            </div>
          </section>

          <section className="network-panel">
            <img src="./pepe-scout.svg" width="180" height="125" alt="A second Pepe operator using an AI-powered field terminal" loading="lazy"/>
            <h2>Meet the swarm.</h2>
            <p>IdentityMD connects ideas with a network of AI contributors. See what they’re building.</p>
            <a className="secondary-button" href="https://imd.fun" target="_blank" rel="noreferrer">Explore IdentityMD<Icon name="arrow"/></a>
          </section>
          <div className="sidebar-footnote"><Icon name="spark"/><p>Community signal. Independent perspective.<br/>No affiliation with X or IdentityMD.</p></div>
        </aside>
      </div>
    </main>

    <footer className="site-footer shell">
      <a className="footer-brand" href="#feed" onClick={() => navigate('feed')}><img src="./favicon.svg" width="24" height="24" alt=""/>swarm signal.</a>
      <p>A good pond keeps its sources close.</p>
      <button className="text-button" onClick={() => setModal('about')}>Sources & about<Icon name="arrow"/></button>
    </footer>
    <div className="sr-only" role="status">{announcement}</div>

    <dialog ref={dialogRef} onCancel={() => setModal(null)} onClose={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setModal(null); } }} aria-labelledby="dialog-title">
      <div className="dialog-top"><img src="./favicon.svg" width="32" height="32" alt=""/><button className="icon-button" onClick={() => setModal(null)} aria-label="Close dialog"><Icon name="close"/></button></div>
      {modal === 'about' ? <>
        <h2 id="dialog-title">A little context.</h2>
        <p>Swarm Signal is an independent reading list of tweets about IdentityMD. The Pepe crew brings the AI; the posts bring the conversation.</p>
        <h3>A snapshot, with sources</h3>
        <p>These {posts.length} selected posts are summarized, not quoted, and ranked by likes captured on {snapshotDate}. This is a limited selection, not a ranking of all X posts.</p>
        <p>Post text and counts were read through public TwStalker mirrors. Mirrors can be delayed or inconsistent. “Source & context” on each post links to the page used; “Read on X” opens the original. Dates come from the original post IDs.</p>
        <h3>Your browser, your bookmarks</h3>
        <p>Saved posts stay in this browser’s local storage. They don’t sync to X or other devices. No account is needed.</p>
        <h3>Read with context</h3>
        <p>Authors’ opinions and reported earnings are their own. Summaries aren’t endorsements. Media and full threads remain on X, which may require a login.</p>
        <a className="secondary-button" href="https://imd.fun" target="_blank" rel="noreferrer">Visit IdentityMD<Icon name="arrow"/></a>
      </> : <>
        <h2 id="dialog-title">Share a signal.</h2>
        <p>{sharePost?.title}</p>
        <form onSubmit={copyLink}>
          <label htmlFor="share-link">Original post link</label>
          <input ref={shareInput} id="share-link" className="share-input" readOnly value={sharePost ? postUrl(sharePost) : ''} onFocus={event=>event.currentTarget.select()}/>
          <p role="status" className="copy-message">{copyState === 'copied' ? 'Link copied. Share it with your pond.' : copyState === 'manual' ? 'Copy isn’t available here. Select and copy the link above.' : 'Share the original post so the author gets the credit.'}</p>
          <button className="primary-button" type="submit"><Icon name={copyState === 'copied' ? 'check' : 'copy'}/>{copyState === 'copied' ? 'Copied' : 'Copy link'}</button>
        </form>
      </>}
    </dialog>
  </>;
}

function PostCard({ post, rank, saved, onSave, onShare, onTopic }: {post: Post; rank: number; saved: boolean; onSave: () => void; onShare: () => void; onTopic: () => void}) {
  return <article className="post-card" aria-labelledby={`title-${post.id}`}>
    <div className="post-top">
      <a href={`https://x.com/${post.handle}`} target="_blank" rel="noreferrer" className="author" aria-label={`${post.author}, @${post.handle} on X`}>
        <span className={`avatar ${post.color}`} aria-hidden="true">{post.initials}</span>
        <span className="author-text"><strong>{post.author}</strong><span className="author-meta"><span>@{post.handle}</span><span aria-hidden="true">·</span><time dateTime={postDate(post).toISOString()}>{formatDate(post)}</time></span></span>
      </a>
      <a className="read-post" href={postUrl(post)} target="_blank" rel="noreferrer" aria-label={`Read ${post.title} on X`}>Read on X<Icon name="arrow"/></a>
    </div>
    <div className="post-content">
      <div className="post-title-row"><h3 id={`title-${post.id}`}>{post.title}</h3><span className="rank" title={`Rank ${rank} by captured likes`}>#{rank.toString().padStart(2,'0')}</span></div>
      <p>{post.summary}</p>
      <button className="post-topic" onClick={onTopic}><span>#</span>{post.topic}</button>
    </div>
    <div className="post-metrics" aria-label="Captured engagement">
      <span title={`${post.likes} likes`}><Icon name="heart"/><span>{post.likes}<span className="sr-only"> likes</span></span></span>
      <span title={`${post.reposts} reposts`}><Icon name="repeat"/><span>{post.reposts}<span className="sr-only"> reposts</span></span></span>
      <span title={`${post.replies} replies`}><Icon name="reply"/><span>{post.replies}<span className="sr-only"> replies</span></span></span>
      <span title={`${post.views} views, rounded by source`}><Icon name="eye"/><span>{post.views}<span className="sr-only"> views</span></span></span>
      <div className="post-utilities">
        <button className={`icon-button save-button ${saved ? 'is-saved' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Unsave' : 'Save'} ${post.title}`} title={saved ? 'Remove from saved posts' : 'Save in this browser'} onClick={onSave}><Icon name="bookmark"/></button>
        <button className="icon-button" aria-label={`Share ${post.title}`} title="Share original post" onClick={onShare}><Icon name="copy"/></button>
      </div>
    </div>
    <div className="post-bottom">
      <details className="source-details"><summary>Source & context<Icon name="chevron"/></summary><div className="source-content"><p>Summary and engagement captured {snapshotDate} through a public mirror.{post.note ? ` ${post.note}` : ''} Counts may have changed.</p><a href={post.source} target="_blank" rel="noreferrer">View source for {post.author}’s post<Icon name="arrow"/></a></div></details>
    </div>
  </article>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
