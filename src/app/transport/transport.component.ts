import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

  // editing state
  editingIndex: number | null = null;
  editingRow: any = null;

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

  constructor(private http: HttpClient, private excel: ExcelService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // load file from assets
    // The dev server may serve static files from different locations (for example Vite serves the
    // `public/` directory at root). We'll try multiple candidate paths so the app works whether the
    // file is placed under src/assets or public.
    const candidates = [
      'assets/Data/DataTransportsFile-updated.xlsx', // typical Angular assets path
      '/assets/Data/DataTransportsFile-updated.xlsx',
      '/Data/DataTransportsFile-updated.xlsx', // Vite public/Data
      'Data/DataTransportsFile-updated.xlsx'
    ];

    this.tryLoadCandidates(candidates, 0);
  }

  private tryLoadCandidates(paths: string[], idx: number) {
    if (idx >= paths.length) {
      const msg = 'Unable to locate a valid XLSX file at any of the candidate paths.';
      console.error(msg, paths);
      console.error('Place the file at src/assets/Data/DataTransportsFile-updated.xlsx or public/Data/DataTransportsFile-updated.xlsx and restart the dev server.');
      this.loadError = msg + ' See console for candidate paths tried.';
      this.loadMessage = null;
      this.originalData = [];
      this.setRows([]);
      return;
    }

    const path = paths[idx];
    this.http.get(path, { responseType: 'arraybuffer' }).subscribe(
      (buffer) => {
        if (!this.isXlsx(buffer)) {
          console.warn(`${path} returned content that is not a valid XLSX; trying next candidate...`);
          this.tryLoadCandidates(paths, idx + 1);
          return;
        }
        console.info(`Loaded Excel from: ${path}`);
        this.loadMessage = `Loaded Excel from: ${path}`;
        const data = this.excel.read(buffer);
        this.originalData = data;
        this.setRows(data);
      }, (err) => {
        console.warn(`GET ${path} failed:`, err, 'Trying next candidate...');
        this.loadMessage = `GET ${path} failed; trying next candidate...`;
        this.tryLoadCandidates(paths, idx + 1);
      }
    );
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

  // Quick check to see whether an ArrayBuffer looks like an XLSX (ZIP) file by checking for PK\x03\x04 header
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
    // keep original data and initialize columns
    this.originalData = data;
    const cols = new Set<string>();
    data.forEach((r) => Object.keys(r || {}).forEach((k) => cols.add(k)));
    this.columns.set(Array.from(cols));

    // initialize filteredData and apply pipeline
    this.filteredData = this.originalData.slice();
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearchChange(text: string) {
    // debounce search for better UX
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchText.set(text);
      this.currentPage = 1;
      this.applyFilters();
    }, 250);
  }

  private applyFilters() {
    const t = this.searchText() && this.searchText().trim().toLowerCase();
    if (!t) this.filteredData = this.originalData.slice();
    else {
      this.filteredData = this.originalData.filter((row) =>
        this.columns()
          .map((c) => (row[c] == null ? '' : String(row[c]).toLowerCase()))
          .some((val) => val.includes(t))
      );
    }

    // apply sorting
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

    // apply pagination
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

    // also update originalData so edits persist across searches
    const globalIndex = this.originalData.indexOf(this.rows()[this.editingIndex]);
    if (globalIndex >= 0) {
      this.originalData[globalIndex] = this.editingRow;
    } else {
      // best-effort: try to match by a unique key like first column
      const key = this.columns()[0];
      if (key) {
        const idx = this.originalData.findIndex((r) => r[key] === this.editingRow[key]);
        if (idx >= 0) this.originalData[idx] = this.editingRow;
      }
    }

    // update underlying originalData and refresh pipeline
    // try to match by identity or by first column
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
    // remove from originalData by matching first column if possible
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

  // Download current dataset as an updated Excel file
  exportCurrent() {
    const wb = this.excel.toWorkbook(this.originalData);
    const blob = this.excel.workbookToBlob(wb);
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
