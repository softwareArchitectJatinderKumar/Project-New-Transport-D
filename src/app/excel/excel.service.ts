import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExcelService {
  // Determine API endpoint at runtime to avoid hard-coded localhost in production
  private get apiUrl() {
    try {
      const win: any = window as any;
      if (win && win.APP_UPLOAD_ENDPOINT) {
        // allow callers to set e.g. https://api.example.com
        return String(win.APP_UPLOAD_ENDPOINT).replace(/\/$/, '') + '/api/excel';
      }
    } catch (e) { /* ignore */ }
    try {
      const meta = document.querySelector('meta[name="upload-endpoint"]') as HTMLMetaElement | null;
      if (meta && meta.content) return String(meta.content).replace(/\/$/, '') + '/api/excel';
    } catch (e) { /* ignore */ }
    // default to relative path; on Vercel this can be a serverless function under /api
    return '/api/excel';
  }

  constructor(private http: HttpClient) {}

  // Read an Excel file (ArrayBuffer or binary string) and return array of objects (first sheet)
  read(data: ArrayBuffer | string): any[] {
    const workbook = XLSX.read(data, { type: typeof data === 'string' ? 'binary' : 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    return json;
  }

  // Convert array of objects to a workbook
  toWorkbook(data: any[], sheetName = 'Sheet1') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return wb;
  }

  // Create a downloadable blob for the workbook in xlsx format
  workbookToBlob(wb: XLSX.WorkBook): Blob {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
  }

  // Convert workbook to ArrayBuffer for upload to server
  workbookToArrayBuffer(wb: XLSX.WorkBook): ArrayBuffer {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return wbout as ArrayBuffer;
  }

  // Convert ArrayBuffer to base64 string
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Write workbook to ArrayBuffer directly
  writeToBuffer(data: any[], sheetName = 'Sheet1'): ArrayBuffer {
    const wb = this.toWorkbook(data, sheetName);
    return this.workbookToArrayBuffer(wb);
  }

  // Save Excel data to server (replaces entire file)
  async saveToServer(data: any[], sheetName = 'Sheet1'): Promise<boolean> {
    try {
      const buffer = this.writeToBuffer(data, sheetName);
      const base64Data = this.arrayBufferToBase64(buffer);
      // Attempt to PUT to the computed apiUrl. If the server is not available (e.g. deployed as a static site on Vercel
      // without a backend), this will fail and we gracefully return false so callers can fallback to a download.
      const url = this.apiUrl;
      const response = await firstValueFrom(
        this.http.put<{ success: boolean; message?: string }>(url, { data: base64Data })
      );

      return response?.success || false;
    } catch (error) {
      console.error('Error saving Excel file to server:', error);
      return false;
    }
  }
}
