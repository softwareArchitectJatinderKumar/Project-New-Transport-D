import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ExcelService } from '../excel/excel.service';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-transport',
  imports: [CommonModule, FormsModule],
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit {
  // original data loaded from Excel
  private originalData: any[] = [];

  // visible rows and columns
  rows = signal<any[]>([]);
  columns = signal<string[]>([]);

  // current search text
  searchText = signal('');

  // Helper to get API base URL
  private get apiBaseUrl(): string {
    return typeof window !== 'undefined' && (window as any).ENV?.API_URL || '';
  }
  private get apiExcelUrl(): string {
    return this.apiBaseUrl + '/api/excel';
  }

  // Columns to always show on small screens
  private readonly SMALL_SCREEN_COLUMNS = ['LOCATION', 'PHONE'];
  // Columns to show on all screens
  private readonly PRIORITY_COLUMNS = ['LOCATION', 'PHONE', 'CONTACT'];

  // advanced filters (match HomeComponent names)
  filterCrane = false;
  filterContainer = false;
  filterFullLoads = false;
  filterGeneralFreight = false;
  filterVehicle = false;
  filterRefrigerated = false;
  // additional filters
  filterUrgent = false;
  filterSensitive = false;

  // columns to exclude from filter detection (same as Home)
  private excludedColumns = ['Crane', 'CONTAINER', 'FULL LOADS', 'General freight', 'Vehicle', 'Refridgerated', 'URGENT', 'Senstive Freight', 'CARRIER'];

  // editing state
  editingIndex: number | null = null;
  editingRow: any = null;

  // modal editor state (open when editing a full-row in a modal)
  modalOpen = false;
  modalRow: any = null;
  modalGlobalIndex: number | null = null;
  isAddMode = false;

  // Filter bar state
  filtersCollapsed = false;

  // UI state: sorting & pagination
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  pageSize = 10;
  currentPage = 1;

  filteredData: any[] = [];
  private searchDebounce: any = null;

  // UI/load status
  loadMessage: string | null = null;
  loadError: string | null = null;

  // control visibility of responsive filter bar
  filtersOpen = false;
  saveStatus: string | null = null;
  // bound key listener reference so we can remove it on destroy
  private onKeydownBound = (e: KeyboardEvent) => this.onKeydown(e);
  // bound document click/touch listener to close filters when clicking outside
  private onDocumentClickBound = (e: Event) => this.onDocumentClick(e);

  // keep a pending edit request if navigated with query params before data loads
  private pendingEdit: { key: string; value: string } | null = null;

  constructor(private http: HttpClient, private excel: ExcelService, private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    // capture query params so we can open modal after the data finishes loading
    this.route.queryParams.subscribe((p) => {
      // support either editKey/editValue or editByEmail for convenience
      if (p['editKey'] && p['editValue']) {
        this.pendingEdit = { key: p['editKey'], value: p['editValue'] };
      } else if (p['editByEmail'] && p['editByEmail'].length) {
        this.pendingEdit = { key: 'Email', value: p['editByEmail'] };
      }
    });
  }

  ngOnInit(): void {
    // Load data from API (Vercel KV)
    this.http.get<any[]>(this.apiExcelUrl).subscribe(
      (data) => {
        if (!data || !Array.isArray(data)) {
          console.error('Invalid data format from API');
          this.loadError = 'Invalid data format';
          this.originalData = [];
          this.setRows([]);
          return;
        }
        this.loadMessage = null;
        this.originalData = data;
        this.setRows(data);
      },
      (err) => {
        console.error('Failed to load data:', err);
        this.loadError = 'Failed to load data. Ensure the server API is running.';
        this.originalData = [];
        this.setRows([]);
      }
    );
    // listen for Escape key to close filter bar on devices/browsers that support it
    try { window.addEventListener('keydown', this.onKeydownBound); } catch (e) { /* ignore */ }
    // listen for clicks/touches outside the filter bar to close it on mobile/tablets
    try {
      document.addEventListener('click', this.onDocumentClickBound, true);
      document.addEventListener('touchstart', this.onDocumentClickBound, true);
    } catch (e) { /* ignore */ }
  }

  ngOnDestroy(): void {
    try { window.removeEventListener('keydown', this.onKeydownBound); } catch (e) { /* ignore */ }
    try {
      document.removeEventListener('click', this.onDocumentClickBound, true);
      document.removeEventListener('touchstart', this.onDocumentClickBound, true);
    } catch (e) { /* ignore */ }
  }

  private onKeydown(e: KeyboardEvent) {
    if (!this.filtersOpen) return;
    const key = e.key || (e as any).code || '';
    if (key === 'Escape' || key === 'Esc') {
      this.filtersOpen = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  private onDocumentClick(e: Event) {
    if (!this.filtersOpen) return;
    try {
      const target = (e.target || null) as HTMLElement | null;
      if (!target) {
        this.filtersOpen = false;
        return;
      }
      // If click/touch happened inside the filter bar or on the toggle control, do nothing
      if (target.closest && (target.closest('.filter-bar') || target.closest('.filter-toggle') || target.closest('[data-filter-toggle]'))) {
        return;
      }
      // otherwise close the filters
      this.filtersOpen = false;
    } catch (err) {
      this.filtersOpen = false;
    }
  }

  logout() {
    const ok = confirm('Are you sure you want to logout?');
    if (!ok) return;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.auth.getUser();
  }

  private loadOriginal(path: string) {
    this.http.get(path, { responseType: 'arraybuffer' }).subscribe((buffer) => {
      if (!this.isXlsx(buffer)) {
        console.error(`${path} is not a valid xlsx or the server returned HTML/other content. Check that the file exists under src/assets/Data/ and is served.`);
        this.originalData = [];
        this.setRows([]);
        return;
      }
      const data = this.excel.read(buffer);
      this.originalData = data;
      this.setRows(data);
    }, (err) => {
      console.error('Failed to load Excel file:', err);
      this.originalData = [];
      this.setRows([]);
    });
  }
  private isXlsx(buf: ArrayBuffer | any): boolean {
    try {
      if (!buf || !(buf instanceof ArrayBuffer)) return false;
      const arr = new Uint8Array(buf as ArrayBuffer);
      return arr.length > 4 && arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04;
    } catch (e) {
      return false;
    }
  }

  private setRows(data: any[]) {
    this.originalData = data;
    const cols = new Set<string>();
    data.forEach((r) => Object.keys(r || {}).forEach((k) => {
      if (!this.excludedColumns.map(c => c.toLowerCase()).includes(String(k).toLowerCase())) cols.add(k);
    }));
    this.columns.set(Array.from(cols));

    this.filteredData = this.originalData.slice();
    this.currentPage = 1;
    this.applyFilters();
    setTimeout(() => this.checkPendingEdit(), 20);
  }

  private checkPendingEdit() {
    if (!this.pendingEdit) return;
    const { key, value } = this.pendingEdit;
    this.pendingEdit = null;
    if (!key) return;

    const idx = this.originalData.findIndex((r) => {
      if (!r) return false;
      const v = r[key];
      if (v == null) return false;
      return String(v).toLowerCase() === String(value).toLowerCase();
    });
    if (idx >= 0) {
      this.openEditModalByGlobalIndex(idx);
      try { this.router.navigate([], { queryParams: {} }); } catch (e) { /* ignore */ }
    }
  }

  onSearchChange(text: string) {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchText.set(text);
      this.currentPage = 1;
      this.applyFilters();
    }, 250);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    let data = this.originalData.slice();

    const activeFilters: string[] = [];
    if (this.filterCrane) activeFilters.push('CRANE');
    if (this.filterContainer) activeFilters.push('CONTAINER');
    if (this.filterFullLoads) activeFilters.push('FULL LOADS');
    if (this.filterGeneralFreight) activeFilters.push('General freight');
    if (this.filterVehicle) activeFilters.push('Vehicle');
    if (this.filterRefrigerated) activeFilters.push('Refridgerated');
  if (this.filterUrgent) activeFilters.push('URGENT');

    if (activeFilters.length > 0) {
      data = data.filter((row) =>
        activeFilters.every((col) => {
          const val = row[col];
          return val && (String(val).toLowerCase() === 'yes');
        })
      );
    }

    // Special-case: Sensitive Freight may have inconsistent header spelling.
    if (this.filterSensitive) {
      data = data.filter((row) => {
        const v1 = row['Senstive Freight'];
        const v2 = row['Sensitive Freight'];
        return ((v1 != null && String(v1).toLowerCase() === 'yes') || (v2 != null && String(v2).toLowerCase() === 'yes'));
      });
    }

    const t = this.searchText() && this.searchText().trim().toLowerCase();
    if (t) {
      data = data.filter((row) =>
        this.columns()
          .map((c) => (row[c] == null ? '' : String(row[c]).toLowerCase()))
          .some((val) => val.includes(t))
      );
    }

    this.filteredData = data;

    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      this.filteredData.sort((a, b) => {
        const va = a?.[col];
        const vb = b?.[col];
        if (va == null && vb == null) return 0;
        if (va == null) return -1 * dir;
        if (vb == null) return 1 * dir;
        if (!isNaN(Number(va)) && !isNaN(Number(vb))) return (Number(va) - Number(vb)) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const page = this.filteredData.slice(start, start + this.pageSize);
    this.rows.set(page);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  changePage(delta: number) {
    const next = this.currentPage + delta;
    if (next < 1 || next > this.totalPages) return;
    this.currentPage = next;
    this.applyFilters();
  }

  setPageSize(n: any) {
    const num = Number(n) || 10;
    this.pageSize = num;
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') this.sortDirection = 'desc';
      else if (this.sortDirection === 'desc') this.sortDirection = null;
      else this.sortDirection = 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  startEdit(i: number) {
    this.editingIndex = i;
    this.editingRow = { ...(this.rows()[i] || {}) };
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editingRow = null;
  }

  saveEdit() {
    if (this.editingIndex == null) return;
    const updated = this.rows().slice();
    updated[this.editingIndex] = this.editingRow;
    this.rows.set(updated);

    const globalIndex = this.originalData.indexOf(this.rows()[this.editingIndex]);
    if (globalIndex >= 0) {
      this.originalData[globalIndex] = this.editingRow;
    } else {
      const key = this.columns()[0];
      if (key) {
        const idx = this.originalData.findIndex((r) => r[key] === this.editingRow[key]);
        if (idx >= 0) this.originalData[idx] = this.editingRow;
      }
    }

    const key = this.columns()[0];
    if (key) {
      const idx = this.originalData.findIndex((r) => r[key] === this.editingRow[key]);
      if (idx >= 0) this.originalData[idx] = this.editingRow;
    }
    this.applyFilters();
    this.cancelEdit();
  }

  deleteRow(i: number) {
    const r = this.rows()[i];
    const key = this.columns()[0];
    if (key) {
      const j = this.originalData.findIndex((x) => x[key] === r[key]);
      if (j >= 0) this.originalData.splice(j, 1);
    } else {
      const idx = this.originalData.indexOf(r);
      if (idx >= 0) this.originalData.splice(idx, 1);
    }
    this.applyFilters();
  }

  openEditModal(i: number) {
    const row = this.rows()[i];
    const idx = this.originalData.indexOf(row);
    this.modalGlobalIndex = idx >= 0 ? idx : null;
    this.modalRow = { ...(row || {}) };
    this.modalOpen = true;
  }

  openAddModal() {
    this.isAddMode = true;
    const template: any = {};
    this.columns().forEach((c) => (template[c] = ''));
    (this.excludedColumns || []).forEach((c) => {
      if (!(c in template)) template[c] = '';
    });
    this.modalRow = template;
    this.modalGlobalIndex = null;
    this.modalOpen = true;
  }

  openEditModalByGlobalIndex(globalIndex: number) {
    if (globalIndex == null || globalIndex < 0 || globalIndex >= this.originalData.length) return;
    this.modalGlobalIndex = globalIndex;
    this.modalRow = { ...(this.originalData[globalIndex] || {}) };
    this.modalOpen = true;
  }

  closeEditModal() {
    this.modalOpen = false;
    this.modalRow = null;
    this.modalGlobalIndex = null;
  }

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  saveModalEdit() {
    if (!this.modalRow) return;

    if (this.modalGlobalIndex != null && this.modalGlobalIndex >= 0 && this.modalGlobalIndex < this.originalData.length) {
      this.originalData[this.modalGlobalIndex] = this.modalRow;
    } else {
      const key = this.columns()[0];
      if (key) {
        const j = this.originalData.findIndex((r) => r && String(r[key]) === String(this.modalRow[key]));
        if (j >= 0) this.originalData[j] = this.modalRow;
        else this.originalData.push(this.modalRow); // last resort: append
      } else {
        this.originalData.push(this.modalRow);
      }
    }

    this.applyFilters();
    if (this.isAddMode) {
      this.isAddMode = false;
      this.currentPage = this.totalPages;
    }

    // Save to server
    this.http.put(this.apiExcelUrl, { data: this.originalData }).subscribe({
      next: () => {
        this.saveStatus = 'Record saved successfully!';
        setTimeout(() => this.saveStatus = null, 3000);
      },
      error: (err) => {
        console.error('Failed to save:', err);
        this.saveStatus = 'Save failed. Changes may not persist.';
        setTimeout(() => this.saveStatus = null, 3000);
      }
    });

    this.closeEditModal();
  }

  saveAddModal() {
    if (!this.modalRow) return;
    // clone modalRow to avoid accidental shared references
    const newRow = { ...(this.modalRow || {}) };
    this.originalData.push(newRow);
    this.isAddMode = false;
    this.currentPage = Math.max(1, Math.ceil((this.originalData.length || 1) / this.pageSize));
    this.applyFilters();

    // Save to server
    this.http.put(this.apiExcelUrl, { data: this.originalData }).subscribe({
      next: () => {
        this.saveStatus = 'New record saved successfully!';
        setTimeout(() => this.saveStatus = null, 3000);
      },
      error: (err) => {
        console.error('Failed to save:', err);
        this.saveStatus = 'Save failed. Changes may not persist.';
        setTimeout(() => this.saveStatus = null, 3000);
      }
    });

    this.closeEditModal();
  }

  modalColumns(): string[] {
    if (!this.modalRow) return [];
    const keys = Object.keys(this.modalRow || {});
    const ordered: string[] = [];
    const mainCols = new Set(this.columns());
    this.columns().forEach((c) => {
      if (keys.includes(c)) ordered.push(c);
    });
    keys.forEach((k) => {
      if (!mainCols.has(k)) ordered.push(k);
    });
    return ordered;
  }

  private filterColumnKeys = new Set([
    'crane',
    'container',
    'fullloads',
    'full loads',
    'generalfreight',
    'vehicle',
    'refrigerated',
    'urgent',
    'sensitive freight',
    'senstive freight',
    'refridgerated'
  ].map(k => this.normalizeKey(k)));

  private normalizeKey(s: string) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  isFilterColumn(col: string) {
    if (!col) return false;
    return this.filterColumnKeys.has(this.normalizeKey(col));
  }

  /**
   * Get columns to display in table based on screen size
   * Small screens: show only Location, Phone
   * Large screens: show Location, Phone, Contact
   */
  getTableColumns(): string[] {
    const allColumns = this.columns();
    const isSmallScreen = window.innerWidth < 720;
    
    if (isSmallScreen) {
      // On small screens, show only LOCATION and PHONE
      return allColumns.filter(c => 
        this.SMALL_SCREEN_COLUMNS.some(sc => 
          c.toLowerCase().includes(sc.toLowerCase())
        )
      );
    }
    
    // On large screens, prioritize LOCATION, PHONE, CONTACT
    const priority = allColumns.filter(c => 
      this.PRIORITY_COLUMNS.some(pc => 
        c.toLowerCase().includes(pc.toLowerCase())
      )
    );
    
    // If priority columns found, use them; otherwise show all
    return priority.length > 0 ? priority : allColumns;
  }

  checkboxValue(col: string) {
    if (!this.modalRow) return false;
    const v = this.modalRow[col];
    if (v === true) return true;
    return v != null && String(v).toLowerCase().trim() === 'yes';
  }

  setCheckboxValue(col: string, checked: boolean) {
    if (!this.modalRow) return;
    this.modalRow[col] = checked ? 'YES' : '';
  }

  exportCurrent() {
    const wb = this.excel.toWorkbook(this.originalData);
    const blob = this.excel.workbookToBlob(wb);

    // Build a FormData containing the workbook
    const form = new FormData();
    const file = new File([blob], 'DataTransportsFile-updated.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    form.append('file', file);
    form.append('target', 'src/assets/Data/DataTransportsFile-updated.xlsx');

    // Determine candidate upload endpoints in order of preference:
    // 1) runtime config: window.APP_UPLOAD_ENDPOINT (set by hosting page)
    // 2) meta tag <meta name="upload-endpoint" content="...">
    // 3) sensible relative endpoints that can be proxied by a server: /api/upload-excel, /upload-excel
    const candidates: string[] = [];
    try {
      const win: any = window as any;
      if (win && win.APP_UPLOAD_ENDPOINT) candidates.push(String(win.APP_UPLOAD_ENDPOINT));
    } catch (e) { /* ignore */ }
    try {
      const meta = document.querySelector('meta[name="upload-endpoint"]') as HTMLMetaElement | null;
      if (meta && meta.content) candidates.push(meta.content);
    } catch (e) { /* ignore */ }
    candidates.push('/api/upload-excel', '/upload-excel');

    // helper: fetch with timeout
    const fetchWithTimeout = (url: string, init: RequestInit, timeout = 7000) => {
      return new Promise<Response>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), timeout);
        fetch(url, init).then((res) => { clearTimeout(timer); resolve(res); }).catch((err) => { clearTimeout(timer); reject(err); });
      });
    };

    // Try each candidate sequentially; if any succeed return true
    const tryUpload = async (): Promise<boolean> => {
      for (const url of candidates) {
        if (!url) continue;
        try {
          const absolute = url.startsWith('http') ? url : url; // relative URLs preserved
          const res = await fetchWithTimeout(absolute, { method: 'POST', body: form }, 8000);
          if (res.ok) {
            try { await res.json(); } catch (_) { /* ignore parse error */ }
            return true;
          }
        } catch (e) {
          // continue to next candidate
          console.warn('Upload attempt failed for', url, e);
        }
      }
      return false;
    };

    try {
      tryUpload().then((ok) => {
        if (ok) {
          // uploaded successfully
          alert('Saved updated Excel on server.');
        } else {
          // all uploads failed — fall back to download
          console.warn('All upload attempts failed, falling back to download.');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'DataTransportsFile-updated.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }
      }).catch((err) => {
        console.warn('Upload flow failed, falling back to download:', err);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DataTransportsFile-updated.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
    } catch (e) {
      console.warn('Unexpected error exporting/uploading workbook:', e);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DataTransportsFile-updated.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  }
}
