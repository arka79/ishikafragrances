import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Download,
  Info,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, firebaseReady } from '../lib/firebase.js';
import { fetchLiveCatalogue, publishCatalogue } from '../data/liveCatalogue.js';
import logo from '../images/logo.png';
import {
  FAMILIES,
  FAMILY_TONES,
  cloneBase,
  downloadFile,
  familyLabel,
  nextId,
  nextNo,
  parseCsv,
  parseJson,
  toCsv,
  toJson,
  validateCatalogue,
} from './catalogue.js';

const inr = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

function authMessage(error) {
  const code = error?.code ?? '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return 'That email and password do not match an admin account.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a few minutes and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Could not reach Firebase. Check your connection.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/password sign-in is not enabled in the Firebase project.';
  }
  return 'Sign-in failed. Check the Firebase email/password account.';
}

const Admin = () => {
  const [session, setSession] = useState(firebaseReady ? 'checking' : 'unconfigured');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const [products, setProducts] = useState(cloneBase);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);

  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('all');
  const [editor, setEditor] = useState(null);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(null);

  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    return onAuthStateChanged(
      auth,
      (user) => {
        setAdminEmail(user?.email ?? '');
        setSession(user ? 'authed' : 'anon');
      },
      () => {
        setSession('anon');
        setAuthError('Could not restore your Firebase session. Sign in again.');
      }
    );
  }, []);

  const loadLive = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const payload = await fetchLiveCatalogue();
      if (!payload.configured) {
        setSession('unconfigured');
        return;
      }
      setProducts(payload.products?.length ? payload.products : cloneBase());
      setLiveUpdatedAt(payload.updatedAt ?? null);
      setDirty(false);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session !== 'authed') return;
    // Keep unsaved work if the session expired and the owner signed back in.
    if (dirtyRef.current) return;
    loadLive();
  }, [session, loadLive]);

  useEffect(() => {
    if (!editor) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditor(null);
        setFormError('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [editor]);

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!notice || notice.tone === 'error') return undefined;
    const timer = window.setTimeout(() => setNotice(null), 8000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const familyCounts = useMemo(
    () =>
      products.reduce((counts, product) => {
        counts[product.category] = (counts[product.category] || 0) + 1;
        return counts;
      }, {}),
    [products]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.no.toLowerCase().includes(term) ||
        familyLabel(product.category).toLowerCase().includes(term);
      const matchesFamily = family === 'all' || product.category === family;
      return matchesTerm && matchesFamily;
    });
  }, [products, query, family]);

  const minPrice = products.length ? Math.min(...products.map((product) => product.price)) : null;
  const maxPrice = products.length ? Math.max(...products.map((product) => product.price)) : null;

  const liveTime = liveUpdatedAt ? new Date(liveUpdatedAt) : null;
  const liveLabel = liveTime
    ? `Live · ${liveTime.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      })}, ${liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Live catalogue';

  const showNotice = (tone, title, details = []) => setNotice({ tone, title, details });

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setAuthError('Enter the admin email and password.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (error) {
      setAuthError(authMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    if (
      dirtyRef.current &&
      !window.confirm('You have unpublished changes. Sign out and lose them?')
    ) {
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      // Sign out locally even if Firebase is unreachable.
    }
    setSession('anon');
    setDirty(false);
    setNotice(null);
    setProducts(cloneBase());
    setLiveUpdatedAt(null);
  };

  const handlePublish = async () => {
    const check = validateCatalogue(products);
    if (!check.ok) {
      showNotice('error', 'Cannot publish yet', [check.error]);
      return;
    }

    setPublishBusy(true);
    try {
      const payload = await publishCatalogue(products);
      setProducts(payload.products);
      setLiveUpdatedAt(payload.updatedAt);
      setDirty(false);
      showNotice('success', 'Published to the live site', [
        'Every visitor now sees this catalogue.',
      ]);
    } catch (error) {
      if (error?.code === 'permission-denied') {
        showNotice('error', 'Publish refused', [
          'This account is not the site owner. Sign in with the email set in site/config.',
        ]);
      } else if (error?.code === 'unavailable') {
        showNotice('error', 'Publish failed', [
          'Firebase is unreachable. Check your connection and try again.',
        ]);
      } else {
        showNotice('error', 'Publish failed', [error.message]);
      }
    } finally {
      setPublishBusy(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Discard unpublished changes and reload the live catalogue?')) return;
    setDirty(false);
    dirtyRef.current = false;
    await loadLive();
  };

  const openAdd = () => {
    setFormError('');
    setEditor({
      mode: 'add',
      id: null,
      name: '',
      no: nextNo(products),
      price: '',
      category: FAMILIES[0].key,
    });
  };

  const openEdit = (product) => {
    setFormError('');
    setEditor({
      mode: 'edit',
      id: product.id,
      name: product.name,
      no: product.no,
      price: String(product.price),
      category: product.category,
    });
  };

  const closeEditor = () => {
    setEditor(null);
    setFormError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = editor.name.trim().replace(/\s+/g, ' ');
    const no = editor.no.trim();
    const rawPrice = editor.price.trim();
    const price = Number(rawPrice);

    if (!name) return setFormError('Give the fragrance a name.');
    if (name.length > 80) return setFormError('Keep the name under 80 characters.');
    if (!no) return setFormError('Give it a catalogue number.');
    if (no.length > 10) return setFormError('Keep the catalogue number under 10 characters.');
    if (
      products.some(
        (product) => product.id !== editor.id && product.no.toLowerCase() === no.toLowerCase()
      )
    ) {
      return setFormError(`Catalogue number “${no}” is already used.`);
    }
    if (!/^\d+$/.test(rawPrice) || !Number.isInteger(price) || price <= 0) {
      return setFormError('Price must be a positive whole number of rupees per kg.');
    }

    const product = {
      id: editor.mode === 'edit' ? editor.id : nextId(products),
      no,
      name,
      price,
      category: editor.category,
    };

    setProducts((current) =>
      editor.mode === 'edit'
        ? current.map((item) => (item.id === editor.id ? product : item))
        : [...current, product]
    );
    setDirty(true);

    if (editor.mode === 'add') {
      setQuery('');
      setFamily('all');
    }

    showNotice('success', editor.mode === 'edit' ? `${name} updated` : `${name} added`, [
      'Press Publish changes to put it on the live site.',
    ]);
    closeEditor();
  };

  const handleDelete = (product) => {
    if (products.length <= 1) {
      showNotice('error', 'Keep at least one product', [
        'The site needs one fragrance to display in the opening section.',
      ]);
      return;
    }
    if (!window.confirm(`Delete ${product.name} from the catalogue?`)) return;

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setDirty(true);
    showNotice('success', `${product.name} removed from the working list`, [
      'Press Publish changes to remove it from the site.',
    ]);
  };

  const handleDuplicate = (product) => {
    const copy = {
      ...product,
      id: nextId(products),
      no: nextNo(products),
      name: `${product.name} copy`.slice(0, 80),
    };
    setProducts((current) => [...current, copy]);
    setDirty(true);
    openEdit(copy);
  };

  const handleRestore = () => {
    if (
      !window.confirm(
        'Replace the working list with the original starter catalogue? Nothing changes on the site until you publish.'
      )
    ) {
      return;
    }
    setProducts(cloneBase());
    setQuery('');
    setFamily('all');
    setDirty(true);
    showNotice('success', 'Starter catalogue loaded', [
      'Press Publish changes to make it live.',
    ]);
  };

  const handleImport = (event, parser, label) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotice('error', 'That file is too large', ['Import files must be 2 MB or smaller.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = parser(String(reader.result ?? ''));

      if (!result.ok) {
        const details = result.errors ?? [result.error];
        showNotice('error', `${label} import failed`, details.filter(Boolean));
        return;
      }

      const confirmed = window.confirm(
        `Replace the working list (${products.length} products) with ${result.products.length} imported products? Nothing goes live until you publish.`
      );
      if (!confirmed) return;

      setProducts(result.products);
      setQuery('');
      setFamily('all');
      setDirty(true);
      showNotice('success', `Imported ${result.products.length} products`, [
        'Press Publish changes to make them live.',
      ]);
    };
    reader.onerror = () => showNotice('error', 'Could not read that file');
    reader.readAsText(file);
  };

  const exportCsv = () => {
    downloadFile(
      'ishika-price-list.csv',
      `\uFEFF${toCsv(products)}`,
      'text/csv;charset=utf-8'
    );
    showNotice('success', 'CSV exported', [
      'This is the working list. Import it back with the same columns.',
    ]);
  };

  const exportJson = () => {
    downloadFile('ishika-price-list.json', toJson(products), 'application/json;charset=utf-8');
    showNotice('success', 'JSON backup exported');
  };

  /* ---------- sign-in screen ---------- */

  if (session === 'checking') {
    return (
      <div className="admin-shell">
        <main className="shell admin-main">
          <p className="admin-footnote">Checking your sign-in…</p>
        </main>
      </div>
    );
  }

  if (session === 'unconfigured') {
    return (
      <div className="admin-shell">
        <main className="shell admin-main">
          <div className="admin-login">
            <p className="eyebrow">Catalogue admin</p>
            <h1 className="admin-title">
              Connect <em>Firebase.</em>
            </h1>
            <p className="admin-lede">
              The live catalogue is stored in Firestore, so the admin panel needs this site’s
              Firebase web-app values before it can sign you in.
            </p>
            <ol className="admin-setup-list">
              <li>Create a free Firebase project with a Firestore database.</li>
              <li>Enable Email/Password sign-in and add your owner account.</li>
              <li>
                Create the <code>site/config</code> document with an{' '}
                <code>adminEmail</code> field.
              </li>
              <li>
                Publish <code>firebase/firestore.rules</code>.
              </li>
              <li>
                Copy <code>.env.example</code> to <code>.env</code>, paste the web-app config
                and restart the dev server.
              </li>
            </ol>
            <p className="admin-footnote">
              Full steps: <code>FIREBASE_SETUP.md</code>. The public site keeps working with
              the bundled catalogue until Firebase is connected.
            </p>
            <a className="btn btn--ghost btn--sm" href="./">
              <ArrowLeft size={14} strokeWidth={2} />
              Back to site
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (session !== 'authed') {
    return (
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="shell admin-topbar__inner">
            <a className="admin-identity" href="./" aria-label="Ishika Fragrances — back to site">
              <span className="brand__mark" aria-hidden="true">
                <img src={logo} alt="" />
              </span>
              <span className="admin-identity__text">
                <span className="admin-identity__name">Ishika Fragrances</span>
                <span className="admin-identity__label">Catalogue admin</span>
              </span>
            </a>
            <a className="btn btn--ghost btn--sm" href="./">
              <ArrowLeft size={14} strokeWidth={2} />
              Back to site
            </a>
          </div>
        </header>

        <main className="shell admin-main">
          <div className="admin-login">
            <p className="eyebrow">Catalogue admin</p>
            <h1 className="admin-title">
              Owner <em>sign-in.</em>
            </h1>
            <p className="admin-lede">
              The price list on this site is live. Sign in with the owner account to change
              it — without that account, nobody can edit or publish the catalogue.
            </p>

            <form className="admin-login__form" onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="admin-email">Admin email</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoFocus
                />
              </div>

              <div className="field">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {authError && (
                <p className="admin-form__error" role="alert">
                  {authError}
                </p>
              )}

              <button type="submit" className="btn btn--solid btn--sm" disabled={authBusy}>
                {authBusy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="admin-footnote">
              Sign-in is handled by Firebase Authentication and enforced by Firestore security
              rules. The public site can only read the catalogue — only the admin email set in{' '}
              <code>site/config</code> can publish.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* ---------- catalogue editor ---------- */

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="shell admin-topbar__inner">
          <a className="admin-identity" href="./" aria-label="Ishika Fragrances — back to site">
            <span className="brand__mark" aria-hidden="true">
              <img src={logo} alt="" />
            </span>
            <span className="admin-identity__text">
              <span className="admin-identity__name">Ishika Fragrances</span>
              <span className="admin-identity__label">Catalogue admin</span>
            </span>
          </a>

          <div className="admin-topbar__right">
            <span className="admin-save" role="status">
              <span className="admin-save__dot" aria-hidden="true" />
              {dirty ? 'Unpublished changes' : liveLabel}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleLogout}
              title={adminEmail ? `Signed in as ${adminEmail}` : undefined}
            >
              <LogOut size={14} strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="shell admin-main">
        {loadError ? (
          <section className="admin-panel admin-loaderror" aria-labelledby="load-error-title">
            <div className="admin-panel__head">
              <div>
                <p className="eyebrow">Catalogue</p>
                <h2 id="load-error-title">Could not load the live catalogue</h2>
              </div>
            </div>
            <div className="admin-notice admin-notice--error" role="alert">
              <span className="admin-notice__icon" aria-hidden="true">
                <AlertTriangle size={16} />
              </span>
              <div className="admin-notice__body">
                <strong>Nothing was changed</strong>
                <p>{loadError}</p>
              </div>
            </div>
            <div className="admin-loaderror__actions">
              <button
                type="button"
                className="btn btn--solid btn--sm"
                onClick={loadLive}
                disabled={loading}
              >
                <RefreshCw size={14} strokeWidth={2} />
                {loading ? 'Trying again…' : 'Try again'}
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="admin-hero">
              <div>
                <p className="eyebrow">Catalogue admin</p>
                <h1 className="admin-title">
                  Price list <em>control.</em>
                </h1>
                <p className="admin-lede">
                  Add fragrances, adjust per-kg prices and keep the live catalogue in order.
                  Changes stay unpublished until you press Publish changes.
                </p>
              </div>

              <div className="admin-stats" aria-label="Catalogue summary">
                <div className="admin-stat">
                  <span>Products</span>
                  <strong>{products.length}</strong>
                </div>
                <div className="admin-stat">
                  <span>Lowest / kg</span>
                  <strong>{minPrice === null ? '—' : inr(minPrice)}</strong>
                </div>
                <div className="admin-stat">
                  <span>Highest / kg</span>
                  <strong>{maxPrice === null ? '—' : inr(maxPrice)}</strong>
                </div>
              </div>
            </div>

            {notice && (
              <div
                className={`admin-notice admin-notice--${notice.tone}`}
                role={notice.tone === 'error' ? 'alert' : 'status'}
              >
                <span className="admin-notice__icon" aria-hidden="true">
                  {notice.tone === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
                </span>
                <div className="admin-notice__body">
                  <strong>{notice.title}</strong>
                  {notice.details.length > 0 && (
                    <ul>
                      {notice.details.slice(0, 6).map((detail, index) => (
                        <li key={`${index}-${detail}`}>{detail}</li>
                      ))}
                      {notice.details.length > 6 && (
                        <li>…and {notice.details.length - 6} more.</li>
                      )}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  className="admin-notice__close"
                  onClick={() => setNotice(null)}
                  aria-label="Dismiss message"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <section className="admin-publish" aria-label="Publishing">
              <div className="admin-publish__text">
                <Info size={18} className="admin-callout__icon" aria-hidden="true" />
                <div>
                  <strong>
                    {dirty ? 'You have unpublished changes' : 'The live catalogue is up to date'}
                  </strong>
                  <p>
                    {dirty
                      ? 'Visitors still see the previous prices until you publish.'
                      : 'Edits stay in this page until you press Publish changes.'}
                  </p>
                </div>
              </div>
              <div className="admin-publish__actions">
                {dirty && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={handleDiscard}
                    disabled={publishBusy}
                  >
                    Discard
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--solid btn--sm"
                  onClick={handlePublish}
                  disabled={!dirty || publishBusy}
                >
                  {publishBusy ? 'Publishing…' : dirty ? 'Publish changes' : 'Published'}
                </button>
              </div>
            </section>

            <section className="admin-panel" aria-labelledby="catalogue-panel-title">
              <div className="admin-panel__head">
                <div>
                  <p className="eyebrow">Products</p>
                  <h2 id="catalogue-panel-title">The price list</h2>
                </div>
                <p className="admin-panel__count">
                  Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong>
                </p>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search">
                  <Search size={16} strokeWidth={1.8} aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, number or family…"
                    aria-label="Search products"
                  />
                </div>

                <div className="admin-toolbar__actions">
                  <div className="admin-select">
                    <label htmlFor="family-filter" className="sr-only">
                      Filter by fragrance family
                    </label>
                    <select
                      id="family-filter"
                      value={family}
                      onChange={(event) => setFamily(event.target.value)}
                    >
                      <option value="all">All families ({products.length})</option>
                      {FAMILIES.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label} ({familyCounts[item.key] || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="button" className="btn btn--solid btn--sm" onClick={openAdd}>
                    <Plus size={14} strokeWidth={2} />
                    Add product
                  </button>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <caption className="sr-only">Catalogue products</caption>
                  <thead>
                    <tr>
                      <th scope="col">No.</th>
                      <th scope="col">Fragrance</th>
                      <th scope="col">Family</th>
                      <th scope="col">Price / kg</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={5} className="admin-table__empty">
                          <p className="admin-table__empty-title">Loading the live catalogue…</p>
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filtered.map((product) => (
                        <tr key={product.id}>
                          <td className="admin-table__no">{product.no}</td>
                          <td className="admin-table__name">{product.name}</td>
                          <td>
                            <span
                              className="admin-pill"
                              style={{ '--tone': FAMILY_TONES[product.category] }}
                            >
                              {familyLabel(product.category)}
                            </span>
                          </td>
                          <td className="admin-table__price">
                            {inr(product.price)}
                            <span>per kg</span>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="admin-icon"
                                onClick={() => openEdit(product)}
                                aria-label={`Edit ${product.name}`}
                                title="Edit"
                              >
                                <Pencil size={14} strokeWidth={1.9} />
                              </button>
                              <button
                                type="button"
                                className="admin-icon"
                                onClick={() => handleDuplicate(product)}
                                aria-label={`Duplicate ${product.name}`}
                                title="Duplicate"
                              >
                                <Copy size={14} strokeWidth={1.9} />
                              </button>
                              <button
                                type="button"
                                className="admin-icon admin-icon--danger"
                                onClick={() => handleDelete(product)}
                                aria-label={`Delete ${product.name}`}
                                title="Delete"
                              >
                                <Trash2 size={14} strokeWidth={1.9} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="admin-table__empty">
                          <p className="admin-table__empty-title">Nothing matches those filters.</p>
                          <p>Try a different name, number or family.</p>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => {
                              setQuery('');
                              setFamily('all');
                            }}
                          >
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-data" aria-labelledby="admin-data-title">
              <div className="admin-data__copy">
                <p className="eyebrow">Import &amp; backup</p>
                <h2 id="admin-data-title">Work in a spreadsheet</h2>
                <p>
                  Export the working list as CSV to edit it in Excel or Google Sheets, then import
                  it back. JSON files are full backups and can be imported the same way. Keep the
                  column names unchanged — imported products still need publishing.
                </p>
              </div>

              <div className="admin-data__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={exportCsv}>
                  <Download size={14} strokeWidth={2} />
                  Export CSV
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={exportJson}>
                  <Download size={14} strokeWidth={2} />
                  Export JSON
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => csvInputRef.current?.click()}
                >
                  <Upload size={14} strokeWidth={2} />
                  Import CSV
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => jsonInputRef.current?.click()}
                >
                  <Upload size={14} strokeWidth={2} />
                  Import JSON
                </button>
                <button type="button" className="admin-restore" onClick={handleRestore}>
                  <RefreshCw size={14} strokeWidth={2} />
                  Restore starter list
                </button>
              </div>

              <input
                ref={csvInputRef}
                className="admin-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => handleImport(event, parseCsv, 'CSV')}
              />
              <input
                ref={jsonInputRef}
                className="admin-file"
                type="file"
                accept=".json,application/json"
                onChange={(event) => handleImport(event, parseJson, 'JSON')}
              />
            </section>

            <p className="admin-footnote">
              Prices are in Indian rupees per kilogram. Publishing writes the catalogue to
              Firestore, which serves it to every visitor.
            </p>
          </>
        )}
      </main>

      {editor && (
        <div
          className="admin-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <div
            className="admin-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-editor-title"
          >
            <div className="admin-modal__head">
              <div>
                <p className="eyebrow">{editor.mode === 'edit' ? 'Edit product' : 'New product'}</p>
                <h2 id="admin-editor-title">
                  {editor.mode === 'edit' ? 'Update fragrance' : 'Add a fragrance'}
                </h2>
              </div>
              <button
                type="button"
                className="admin-icon"
                onClick={closeEditor}
                aria-label="Close editor"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="admin-product-name">Fragrance name</label>
                <input
                  id="admin-product-name"
                  autoFocus
                  value={editor.name}
                  onChange={(event) => setEditor({ ...editor, name: event.target.value })}
                  placeholder="e.g. Kewda"
                  maxLength={80}
                />
              </div>

              <div className="field--row">
                <div className="field">
                  <label htmlFor="admin-product-no">Catalogue no.</label>
                  <input
                    id="admin-product-no"
                    value={editor.no}
                    onChange={(event) => setEditor({ ...editor, no: event.target.value })}
                    placeholder="46"
                    maxLength={10}
                  />
                </div>
                <div className="field">
                  <label htmlFor="admin-product-family">Fragrance family</label>
                  <select
                    id="admin-product-family"
                    value={editor.category}
                    onChange={(event) =>
                      setEditor({ ...editor, category: event.target.value })
                    }
                  >
                    {FAMILIES.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="admin-product-price">Price per kilogram</label>
                <div className="admin-price">
                  <span aria-hidden="true">₹</span>
                  <input
                    id="admin-product-price"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={editor.price}
                    onChange={(event) => setEditor({ ...editor, price: event.target.value })}
                    placeholder="950"
                  />
                  <span>/ kg</span>
                </div>
              </div>

              {formError && (
                <p className="admin-form__error" role="alert">
                  {formError}
                </p>
              )}

              <div className="admin-modal__foot">
                <button type="button" className="btn btn--ghost btn--sm" onClick={closeEditor}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--solid btn--sm">
                  {editor.mode === 'edit' ? 'Save to working list' : 'Add to working list'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
