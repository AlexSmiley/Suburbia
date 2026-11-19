import { FormEvent, useEffect, useMemo, useState } from "react";
import { parseRangeResult, PostcodeRecord, suburbiaApi } from "./api";

const STATES = [
  { code: "ACT", name: "Australian Capital Territory" },
  { code: "NSW", name: "New South Wales" },
  { code: "NT", name: "Northern Territory" },
  { code: "QLD", name: "Queensland" },
  { code: "SA", name: "South Australia" },
  { code: "TAS", name: "Tasmania" },
  { code: "VIC", name: "Victoria" },
  { code: "WA", name: "Western Australia" }
];

type Tab = "state" | "range" | "add";

function App() {
  const [tab, setTab] = useState<Tab>("state");
  const [state, setState] = useState("NSW");
  const [records, setRecords] = useState<PostcodeRecord[]>([]);
  const [from, setFrom] = useState("2000");
  const [to, setTo] = useState("2010");
  const [rangeSuburbs, setRangeSuburbs] = useState<string[]>([]);
  const [totalCharacters, setTotalCharacters] = useState<number | null>(null);
  const [postcode, setPostcode] = useState("");
  const [suburbNames, setSuburbNames] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      record.postcode.includes(query) ||
      record.name.some((name) => name.toLowerCase().includes(query))
    );
  }, [records, search]);

  useEffect(() => {
    if (tab !== "state") return;
    let active = true;
    setLoading(true);
    setError("");
    suburbiaApi.byState(state)
      .then((data) => { if (active) setRecords(data); })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [state, tab]);

  async function submitRange(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{4}$/.test(from) || !/^\d{4}$/.test(to)) {
      setError("Enter both postcodes as four digits.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const raw = await suburbiaApi.byPostcodeRange(from, to);
      const result = parseRangeResult(raw);
      setRangeSuburbs(result.suburbs);
      setTotalCharacters(result.totalCharacters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to search this range.");
    } finally {
      setLoading(false);
    }
  }

  async function submitRecords(event: FormEvent) {
    event.preventDefault();
    const names = suburbNames.split(/[\n,;]/).map((name) => name.trim()).filter(Boolean);
    if (!/^\d{4}$/.test(postcode) || names.length === 0) {
      setError("Enter a four-digit postcode and at least one suburb name.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const saved = await suburbiaApi.save([{ postcode, name: names }]);
      setNotice(`Record submitted. The API returned ${saved.length} postcode records.`);
      setPostcode("");
      setSuburbNames("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the record.");
    } finally {
      setLoading(false);
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    setError("");
    setNotice("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Suburbia home">
          <span className="brand-mark">S</span>
          <span>suburbia<span className="brand-period">.</span></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={tab === "state" ? "nav-item active" : "nav-item"} onClick={() => changeTab("state")}><span>▦</span> State explorer</button>
          <button className={tab === "range" ? "nav-item active" : "nav-item"} onClick={() => changeTab("range")}><span>⌕</span> Postcode range</button>
          <button className={tab === "add" ? "nav-item active" : "nav-item"} onClick={() => changeTab("add")}><span>＋</span> Add suburbs</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="api-indicator"><span className="pulse" /> API workspace</div>
          <p>Australian postcode data, made easy to explore.</p>
          <span className="version">SUBURBIA · WEB CLIENT</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {tab === "state" ? "State explorer" : tab === "range" ? "Postcode range" : "Add suburbs"}</div>
          <div className="topbar-right"><span className="australia-dot" /> Australian postcode directory</div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">AUSTRALIA · SUBURB DIRECTORY</div>
              <h1>{tab === "state" ? "Explore suburbs" : tab === "range" ? "Search postcode range" : "Add suburb records"}</h1>
              <p>{tab === "state" ? "Browse postcode and suburb data by state or territory." : tab === "range" ? "Find every suburb covered by a postcode interval." : "Send new postcode and suburb records to the Suburbia API."}</p>
            </div>
            <div className="heading-decoration">AU<span>↗</span></div>
          </div>

          {error && <div className="alert error" role="alert"><strong>Something went wrong</strong><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
          {notice && <div className="alert success" role="status"><strong>Request complete</strong><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

          {tab === "state" && <>
            <div className="section-row"><div><h2>Choose a state or territory</h2><p className="section-caption">Select a region to load its postcode directory.</p></div><span className="count-pill">08 REGIONS</span></div>
            <div className="state-grid">
              {STATES.map((item) => <button key={item.code} onClick={() => { setState(item.code); setSearch(""); }} className={state === item.code ? "state-card selected" : "state-card"}>
                <span className="state-code">{item.code}</span><span className="state-name">{item.name}</span><span className="state-arrow">↗</span>
              </button>)}
            </div>
            <div className="section-row results-heading"><div><h2>{STATES.find((item) => item.code === state)?.name}</h2><p className="section-caption">Postcodes and suburbs returned by the API.</p></div><span className="count-pill">{records.length} RECORDS</span></div>
            <div className="toolbar"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by suburb or postcode..." /></label><span className="muted">{filteredRecords.length} results</span></div>
            <div className="table-wrap"><table><thead><tr><th>POSTCODE</th><th>SUBURB NAMES</th><th>SUBURBS</th></tr></thead><tbody>
              {loading ? <tr><td colSpan={3} className="empty-state">Loading postcode data…</td></tr> :
                filteredRecords.length ? filteredRecords.map((record) => <tr key={record.postcode}><td><span className="postcode-tag">{record.postcode}</span></td><td>{record.name.join(", ")}</td><td><span className="suburb-count">{record.name.length}</span></td></tr>) :
                <tr><td colSpan={3} className="empty-state">{error ? "Data could not be loaded." : "No matching records found."}</td></tr>}
            </tbody></table></div>
          </>}

          {tab === "range" && <>
            <div className="feature-card">
              <div className="feature-icon">⌕</div><div><h2>Find suburbs by postcode</h2><p>Enter a four-digit starting and ending postcode. Results are returned alphabetically by the API.</p></div>
            </div>
            <form className="form-card" onSubmit={submitRange}>
              <div className="form-grid">
                <label>FROM POSTCODE<input inputMode="numeric" maxLength={4} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} placeholder="2000" /></label>
                <div className="range-separator">TO</div>
                <label>TO POSTCODE<input inputMode="numeric" maxLength={4} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} placeholder="2010" /></label>
              </div>
              <button className="primary-button" disabled={loading} type="submit">{loading ? "Searching…" : "Search postcode range"} <span>↗</span></button>
            </form>
            {totalCharacters !== null && <div className="range-results">
              <div className="metrics"><div className="metric-card"><span>SUBURBS FOUND</span><strong>{rangeSuburbs.length}</strong></div><div className="metric-card"><span>TOTAL CHARACTERS</span><strong>{totalCharacters.toLocaleString()}</strong></div><div className="metric-card"><span>POSTCODE RANGE</span><strong>{from}–{to}</strong></div></div>
              <div className="results-panel"><div className="panel-heading"><div><h2>Matching suburbs</h2><p className="section-caption">Alphabetically sorted results</p></div><span className="count-pill">{rangeSuburbs.length} SUBURBS</span></div>
                {rangeSuburbs.length ? <div className="suburb-chips">{rangeSuburbs.map((name, index) => <span key={name + index}>{name}</span>)}</div> : <p className="empty-state">No suburbs found in this postcode range.</p>}
              </div>
            </div>}
          </>}

          {tab === "add" && <>
            <div className="feature-card"><div className="feature-icon">＋</div><div><h2>Submit postcode data</h2><p>The API validates four-digit postcodes and requires at least one non-empty suburb name for each record.</p></div></div>
            <form className="form-card add-form" onSubmit={submitRecords}>
              <label>POSTCODE<input inputMode="numeric" maxLength={4} value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 2000" /></label>
              <label>SUBURB NAMES<textarea rows={5} value={suburbNames} onChange={(e) => setSuburbNames(e.target.value)} placeholder={"Sydney\nBarangaroo\nDawes Point"} /></label>
              <p className="field-hint">Separate multiple suburb names with a new line, comma or semicolon.</p>
              <button className="primary-button" disabled={loading} type="submit">{loading ? "Submitting…" : "Submit to API"} <span>↗</span></button>
            </form>
          </>}
          <footer className="footer"><span>SUBURBIA WEB CLIENT</span><span>Powered by the Suburbia REST API</span></footer>
        </section>
      </main>
    </div>
  );
}

export default App;
