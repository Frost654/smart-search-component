import { LitElement, html, css } from 'lit';

export class SmartSearch extends LitElement {
  static properties = {
    data: { type: Array },
    filtered: { state: true },
    query: { state: true },
    open: { state: true },
    activeIndex: { state: true },
    selectedFilter: { state: true },
    placeholder: { type: String },
    theme: { type: String, reflect: true },

    minChars: { type: Number },
    debounceTime: { type: Number },
    maxResults: { type: Number },
    customFilter: { attribute: false },
  };

  constructor() {
    super();
    this._data = [];
    this.filtered = [];
    this.query = '';
    this.open = false;
    this.activeIndex = -1;
    this.selectedFilter = 'all';
    this.placeholder = 'Search...';
    this.theme = 'light';

    this.filtersList = ['all', 'account', 'transaction', 'customer'];
    this.filterFocusIndex = 0;

    this.announcement = '';

    this.minChars = 1;
    this.debounceTime = 0;
    this.maxResults = 50;
    this.customFilter = null;
    this._debounceTimer = null;

    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  // ✅ NEW: reliable announcer
  updateAnnouncement(text) {
    this.announcement = '';
    setTimeout(() => {
      this.announcement = text;
    }, 30);
  }

  set data(value) {
    const old = this._data;
    this._data = this.normalizeData(value || []);
    this.requestUpdate('data', old);
  }

  get data() {
    return this._data;
  }

  normalizeData(data) {
    return data.map(item => ({
      id: item.id ?? item._id ?? Math.random(),
      label: item.label ?? item.name ?? item.title ?? '',
      type: item.type ?? item.category ?? 'other',
      meta: item.meta ?? item
    }));
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleResize, true);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleResize, true);
    super.disconnectedCallback();
  }

  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
      --bg: #fff;
      --text: #000;
      --border: #ddd;
      --highlight: #eee;
      --filter-bg: #f5f5f5;
    }

    :host([theme="dark"]) {
      --bg: #1e1e1e;
      --text: #fff;
      --border: #444;
      --highlight: #333;
      --filter-bg: #2a2a2a;
    }

    .wrapper { position: relative; }

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      border-radius: 6px;
    }

    .clear-btn {
      position: absolute;
      right: 10px;
      top: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .dropdown {
      position: fixed;
      background: var(--bg);
      border: 1px solid var(--border);
      z-index: 10000;
      max-height: 250px;
      overflow: auto;
      border-radius: 6px;
    }

    .filters {
      display: flex;
      gap: 8px;
      padding: 10px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .filter {
      padding: 6px 10px;
      border-radius: 20px;
      background: var(--filter-bg);
      border: none;
      cursor: pointer;
    }

    .filter.active {
      background: #2563eb;
      color: white;
    }

    .item {
      padding: 10px;
      cursor: pointer;
    }

    .item.active {
      background: var(--highlight);
    }

    .no-results {
      padding: 12px;
      text-align: center;
      color: #888;
    }

    .sr-only {
      position: absolute;
      left: -9999px;
    }
  `;

  updated() {
    if (this.open) this.updateDropdownPosition();
  }

  focusCurrentFilter() {
    const filters = this.shadowRoot.querySelectorAll('.filter');
    filters[this.filterFocusIndex]?.focus();
  }

  focusResultItem() {
    this.updateComplete.then(() => {
      const items = this.shadowRoot.querySelectorAll('.item');
      items[this.activeIndex]?.focus();
    });
  }

  handleInput(e) {
    this.query = e.target.value;

    if (this.query.length < this.minChars) {
      this.filtered = [];
      this.open = false;
      return;
    }

    if (this.debounceTime > 0) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this.applyFilter();
        this.afterSearchUpdate();
      }, this.debounceTime);
    } else {
      this.applyFilter();
      this.afterSearchUpdate();
    }
  }

  applyFilter() {
    const q = this.query.toLowerCase();

    let result = this.data.filter(item => {
      if (this.customFilter) {
        return this.customFilter(item, this.query, this.selectedFilter);
      }

      const match = item.label.toLowerCase().includes(q);
      const typeMatch =
        this.selectedFilter === 'all' ||
        item.type === this.selectedFilter;

      return match && typeMatch;
    });

    this.filtered = result.slice(0, this.maxResults);
  }

  afterSearchUpdate() {
    this.open = true;
    this.activeIndex = -1;

    const text =
      this.filtered.length === 0
        ? (this.selectedFilter === 'all'
            ? 'No results found'
            : `No ${this.selectedFilter} results found`)
        : `${this.filtered.length} results found`;

    this.updateAnnouncement(text);
  }

  updateActiveAnnouncement() {
    const item = this.filtered[this.activeIndex];
    if (!item) return;

    this.updateAnnouncement(
      `${item.label} ${this.activeIndex + 1} of ${this.filtered.length}`
    );
  }

  updateFilterAnnouncement() {
    const label = this.filtersList[this.filterFocusIndex];

    this.updateAnnouncement(
      `${label} ${this.filterFocusIndex + 1} of ${this.filtersList.length}`
    );
  }

  handleFilter(type, index) {
    this.selectedFilter = type;
    this.filterFocusIndex = index;
    this.applyFilter();
    this.afterSearchUpdate();
    this.updateFilterAnnouncement();
  }

  handleFilterKeyDown(e) {
    const total = this.filtersList.length;

    if (e.key === 'ArrowRight') {
      this.filterFocusIndex = (this.filterFocusIndex + 1) % total;
      this.focusCurrentFilter();
      this.updateFilterAnnouncement();
    }

    if (e.key === 'ArrowLeft') {
      this.filterFocusIndex = (this.filterFocusIndex - 1 + total) % total;
      this.focusCurrentFilter();
      this.updateFilterAnnouncement();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.filtered.length) {
        this.activeIndex = 0;
        this.focusResultItem();
        this.updateActiveAnnouncement();
      }
    }
  }

  handleResultKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.filtered.length;
      this.focusResultItem();
      this.updateActiveAnnouncement();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.activeIndex === 0) {
        this.focusCurrentFilter();
        return;
      }
      this.activeIndex =
        (this.activeIndex - 1 + this.filtered.length) %
        this.filtered.length;
      this.focusResultItem();
      this.updateActiveAnnouncement();
    }

    if (e.key === 'Enter') {
      this.selectItem(this.filtered[this.activeIndex]);
    }
  }

  handleKeyDown(e) {
    if (!this.open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.filtered.length) {
        this.activeIndex = 0;
        this.focusResultItem();
        this.updateActiveAnnouncement();
      }
    }

    if (e.key === 'Enter' && this.activeIndex === -1 && this.filtered.length) {
      this.selectItem(this.filtered[0]);
    }

    if (e.key === 'Escape') {
      this.open = false;
    }
  }

  selectItem(item) {
    this.query = item.label;
    this.open = false;

    this.updateAnnouncement(`${item.label} selected`);

    this.dispatchEvent(new CustomEvent('select', { detail: item, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent('change', { detail: { value: item }, bubbles: true, composed: true }));

    this.updateComplete.then(() => {
      this.shadowRoot.querySelector('input')?.focus();
    });
  }

  clearInput() {
    this.query = '';
    this.filtered = [];
    this.open = false;

    this.updateAnnouncement('Search cleared');
  }

  handleOutsideClick(e) {
    if (!e.composedPath().includes(this)) this.open = false;
  }

  handleResize() {
    requestAnimationFrame(() => this.updateDropdownPosition());
  }

  updateDropdownPosition() {
    const input = this.shadowRoot.querySelector('input');
    const dropdown = this.shadowRoot.querySelector('.dropdown');
    if (!input || !dropdown) return;

    const rect = input.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;
  }

  highlight(text) {
    if (!this.query) return text;
    return text.replace(new RegExp(`(${this.query})`, 'gi'), '<mark>$1</mark>');
  }

  render() {
    return html`
      <div class="wrapper">
        <input
          .value=${this.query}
          placeholder=${this.placeholder}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
          role="combobox"
          aria-expanded=${this.open}
          aria-autocomplete="list"
          aria-controls="dropdown-list"
        />

        ${this.query
          ? html`<button class="clear-btn" @click=${this.clearInput} aria-label="Clear search">✕</button>`
          : ''}

        ${this.open
          ? html`
              <div class="dropdown" id="dropdown-list">
                <div class="filters">
                  ${this.filtersList.map(
                    (f, i) => html`
                      <button
                        class="filter ${this.selectedFilter === f ? 'active' : ''}"
                        role="option"
                        aria-selected=${this.selectedFilter === f}
                        @click=${() => this.handleFilter(f, i)}
                        @keydown=${this.handleFilterKeyDown}
                        tabindex=${this.filterFocusIndex === i ? 0 : -1}
                      >
                        ${f}
                      </button>
                    `
                  )}
                </div>

                ${this.filtered.length
                  ? this.filtered.map(
                      (item, i) => html`
                        <div
                          class="item ${i === this.activeIndex ? 'active' : ''}"
                          tabindex="0"
                          @keydown=${this.handleResultKeyDown}
                          @click=${() => this.selectItem(item)}
                          .innerHTML=${this.highlight(item.label)}
                        ></div>
                      `
                    )
                  : html`
                      <div class="no-results">
                        ${this.selectedFilter === 'all'
                          ? 'No results found'
                          : `No ${this.selectedFilter} results found`}
                      </div>
                    `}
              </div>
            `
          : ''}

        <div class="sr-only" aria-live="polite">
          ${this.announcement}
        </div>
      </div>
    `;
  }
}

customElements.define('smart-search', SmartSearch);