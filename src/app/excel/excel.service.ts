import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExcelService {
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
}
