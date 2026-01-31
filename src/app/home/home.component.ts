import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ExcelService } from '../excel/excel.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // original data loaded from Excel
  private originalData: any[] = [];

  // visible rows and columns
  rows = signal<any[]>([]);
  columns = signal<string[]>([]);

  // current search text
  searchText = signal('');

  // Columns to always show on small screens
  private readonly SMALL_SCREEN_COLUMNS = ['LOCATION', 'PHONE'];
  // Columns to show on all screens
  private readonly PRIORITY_COLUMNS = ['LOCATION', 'PHONE', 'CONTACT'];

  // advanced filters
  filterCrane = false;
  filterContainer = false;
  filterFullLoads = false;
  filterGeneralFreight = false;
  filterVehicle = false;
  filterRefrigerated = false;
  filterUrgent = false;
  filterSensitive = false;

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

  // excluded columns for filters
  private excludedColumns = ['Crane', 'CONTAINER', 'FULL LOADS', 'General freight', 'Vehicle', 'Refridgerated', 'URGENT', 'Senstive Freight', 'CARRIER'];
  // UI: control visibility of the responsive filter bar on small screens
  filtersOpen = false;
  // private excludedColumns = ['CRANE/INPUT', 'CONTAINER/INPUT', 'FULL LOADS/INPUT', 'General freight/INPUT', 'Vehicle/INPUT', 'Refridgerated', 'URGENT', 'Senstive Freight', 'CARRIER/OUTPUT'];

  // bound listener so we can add/remove it
  private onKeydownBound = (e: KeyboardEvent) => this.onKeydown(e);
  // bound document click/touch listener to close filters when clicking outside
  private onDocumentClickBound = (e: Event) => this.onDocumentClick(e);

  constructor(private http: HttpClient, private excel: ExcelService) {}

  ngOnInit(): void {
    // load file from assets
    const candidates = [
      'assets/Data/DataTransportsFile-updated.xlsx', // typical Angular assets path
      '/assets/Data/DataTransportsFile-updated.xlsx',
      '/Data/DataTransportsFile-updated.xlsx', // Vite public/Data
      'Data/DataTransportsFile-updated.xlsx'
    ];

    this.tryLoadCandidates(candidates, 0);
    // attach escape listener to close filter bar on devices with keyboards
    try { window.addEventListener('keydown', this.onKeydownBound); } catch (e) { /* ignore */ }
    // attach click/touch listeners (capture) so taps outside the filter bar close it on mobile/tablets
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
      // prevent further handling
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
      // best-effort: close filters if anything goes wrong
      this.filtersOpen = false;
    }
  }

  private tryLoadCandidates(paths: string[], idx: number) {
    if (idx >= paths.length) {
      const msg = 'Unable to locate a valid XLSX file at any of the candidate paths.';
      // console.error(msg, paths);
      // console.error('Place the file at src/assets/Data/DataTransportsFile-updated.xlsx or public/Data/DataTransportsFile-updated.xlsx and restart the dev server.');
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
    // keep original data and initialize columns, excluding filter columns
    this.originalData = data;
    const cols = new Set<string>();
    data.forEach((r) => Object.keys(r || {}).forEach((k) => {
      if (!this.excludedColumns.map(c => c.toLowerCase()).includes(k.toLowerCase())) cols.add(k);
    }));
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

  onFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    let data = this.originalData.slice();

    // apply advanced filters
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
          return val && ( val === 'YES' || val === 'YES' || String(val).toLowerCase() === 'yes');
        })
      );
    }

    if (this.filterSensitive) {
      data = data.filter((row) => {
        const v1 = row['Senstive Freight'];
        const v2 = row['Sensitive Freight'];
        return ((v1 != null && String(v1).toLowerCase() === 'yes') || (v2 != null && String(v2).toLowerCase() === 'yes'));
      });
    }

    // apply search
    const t = this.searchText() && this.searchText().trim().toLowerCase();
    if (t) {
      data = data.filter((row) =>
        this.columns()
          .map((c) => (row[c] == null ? '' : String(row[c]).toLowerCase()))
          .some((val) => val.includes(t))
      );
    }

    this.filteredData = data;

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
}
