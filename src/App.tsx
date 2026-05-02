import { useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { SearchResults } from './components/SearchResults'
import { MyList } from './components/MyList'
import { AddToListModal } from './components/AddToListModal'
import { ThemeToggle } from './components/ThemeToggle'
import { useSearch } from './hooks/useSearch'
import { useWatchlist } from './hooks/useWatchlist'
import type { WatchableItem, ListEntry } from './types'
import './App.css'

type View = 'search' | 'list'

function App() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('list')
  const [pendingItem, setPendingItem] = useState<WatchableItem | null>(null)

  const { results, status, error, page, totalPages, setPage } = useSearch(query)
  const { entries, addOrUpdate, remove, getEntry } = useWatchlist()

  function handleAddClick(item: WatchableItem) {
    setPendingItem(item)
  }

  function handleEditEntry(entry: ListEntry) {
    setPendingItem(entry.item)
  }

  function handleSave(entry: ListEntry) {
    addOrUpdate(entry)
  }

  function isInList(id: string): boolean {
    return getEntry(id) !== null
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <button
            className="app-header__logo"
            onClick={() => setView('search')}
            aria-label="Go to search"
          >
            🎬 MyMovieList
          </button>
          <nav className="app-header__nav">
            <button
              className={`nav-btn${view === 'search' ? ' nav-btn--active' : ''}`}
              onClick={() => setView('search')}
              aria-current={view === 'search' ? 'page' : undefined}
            >
              Search
            </button>
            <button
              className={`nav-btn${view === 'list' ? ' nav-btn--active' : ''}`}
              onClick={() => setView('list')}
              aria-current={view === 'list' ? 'page' : undefined}
            >
              My List
            </button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'search' ? (
          <>
            <section className="search-section">
              <h1 className="search-section__title">Find Movies &amp; TV Shows</h1>
              <SearchBar value={query} onChange={setQuery} />
            </section>
            <SearchResults
              results={results}
              status={status}
              error={error}
              query={query}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              getEntry={isInList}
              onAddClick={handleAddClick}
            />
          </>
        ) : (
          <MyList
            entries={entries}
            onEdit={handleEditEntry}
            onRemove={remove}
          />
        )}
      </main>

      {pendingItem && (
        <AddToListModal
          item={pendingItem}
          existingEntry={getEntry(`${pendingItem.media_type}-${pendingItem.id}`)}
          onSave={handleSave}
          onClose={() => setPendingItem(null)}
        />
      )}
    </>
  )
}

export default App
