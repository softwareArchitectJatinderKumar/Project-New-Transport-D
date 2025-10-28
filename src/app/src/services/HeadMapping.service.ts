import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from './storage-service';


const AUTH_API = 'https://projectsapi.lpu.in/';
const AUTH_API_LOCAL = 'https://projectsapi.lpu.in/';


 
export interface MetricMapping {
  Id: number;
  HeadUID: number;
  AssistantUID: number;
  IsActive: 0 | 1; // 1 for Yes, 0 for No
  MetricId: number;
  Type: 'PA' | 'AO' | 'DE' | null;
  HeadName?: string;      // Included for completeness but not used in form
  AssistantName?: string; // Included for completeness but not used in form
}

const INITIAL_DATA: MetricMapping[] = [
  // Mock data based on the structure of your CSV file
  { Id: 816, HeadUID: 11278, AssistantUID: 34196, IsActive: 1, MetricId: 3478, Type: 'PA' },
  { Id: 817, HeadUID: 11278, AssistantUID: 34196, IsActive: 1, MetricId: 3787, Type: 'DE' },
  { Id: 3478, HeadUID: 11918, AssistantUID: 33509, IsActive: 0, MetricId: 410, Type: 'AO' },
  { Id: 3484, HeadUID: 11918, AssistantUID: 33509, IsActive: 1, MetricId: 411, Type: 'AO' },
  { Id: 3485, HeadUID: 25708, AssistantUID: 34168, IsActive: 0, MetricId: 412, Type: 'PA' },
];

@Injectable({
  providedIn: 'root'
})
export class HeadMapping {
  private dataSubject: BehaviorSubject<MetricMapping[]> = new BehaviorSubject<MetricMapping[]>(INITIAL_DATA);
  public data$: Observable<MetricMapping[]> = this.dataSubject.asObservable();
  private nextId = 1000; // Starting ID for new records

  constructor(private http: HttpClient,private storageService: StorageService) {
    this.nextId = Math.max(...INITIAL_DATA.map(d => d.Id)) + 1;
  }

 
  
  // Add a new record
  addRecord(record: Omit<MetricMapping, 'Id'>): void {
    const newData: MetricMapping = {
      ...record,
      Id: this.nextId++
    };
    const currentData = this.dataSubject.getValue();
    this.dataSubject.next([newData, ...currentData]);
  }

  // Update an existing record
  updateRecord(updatedRecord: MetricMapping): void {
    const currentData = this.dataSubject.getValue();
    const index = currentData.findIndex(d => d.Id === updatedRecord.Id);

    if (index > -1) {
      currentData[index] = updatedRecord;
      this.dataSubject.next([...currentData]); // Emit new array to trigger change detection
    }
  }

  // Delete a record (optional)
  deleteRecord(id: number): void {
    const currentData = this.dataSubject.getValue();
    const filteredData = currentData.filter(d => d.Id !== id);
    this.dataSubject.next(filteredData);
  }
}