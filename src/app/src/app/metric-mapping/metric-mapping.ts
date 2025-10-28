// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-metric-mapping',
//   imports: [],
//   templateUrl: './metric-mapping.html',
//   styleUrl: './metric-mapping.scss'
// })
// export class MetricMapping {

// }
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
 
 
// import { Observable, combineLatest, BehaviorSubject, map, startWith, switchMap, tap, catchError } from 'rxjs';
// import { MetricMapping } from '../../services/HeadMapping.service';
import { PlacementService } from '../../services/placement.service';
import { PlanningrankingService } from '../../services/planningranking-service';
import { AuthService } from '../../services/auth-service';
import { StorageService } from '../../services/storage-service';


import { HeadMapping, MetricMapping } from '../../services/HeadMapping.service';

import * as XLSX from 'xlsx';
import { FormGroupName, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, catchError, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-metric-mapping',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './metric-mapping.html',
  styleUrls: ['./metric-mapping.scss']
})
export class MetricMappingComponent implements OnInit {
   isLoginFailed: boolean = false;
    // Data table source
    public mappingData$!: Observable<MetricMapping[]>;

    // Reactive Form Group
    public mappingForm!: FormGroup;

    // State variables for the form mode
    public isUpdateMode = false;
    private currentEditId: any | null = null;

    // Radio button options
    // public isActiveOptions = [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }];
    public typeOptions = ['PA', 'AO', 'DE'];

    // Table columns (for dynamic display)
    public tableColumns: any[] = ['id', 'headUID', 'assistantUID', 'isActive', 'metricId', 'type', 'Actions'];

    // Pagination & filtering state (reactive)
    public pageSizes: number[] = [5, 10, 25, 50];
    public totalRecords = 0;

    private pageSize$ = new BehaviorSubject<number>(10);
    private currentPage$ = new BehaviorSubject<number>(1);
    private searchTerm$ = new BehaviorSubject<string>('');

    // Exposed observable for template display (filtered + paged)
    public displayedData$!: Observable<MetricMapping[]>;

    constructor(
        private cdRef: ChangeDetectorRef,

        private placementService: PlacementService,
        private fb: FormBuilder,
        private HeadMapping: HeadMapping, private PlanningrankingService: PlanningrankingService,
        public formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private authService: AuthService, private storageService: StorageService,
        private title: Title
    ) { }

    ngOnInit(): void {
        this.initForm();
        let loginName = this.route.snapshot.params['loginName'];
        if (loginName != '' && loginName != undefined) {
            this.getToken(loginName);
        }

    }


    getToken(id: any) {
        this.authService.loginTemp(id).subscribe({
            next: data => {
                this.storageService.saveUser(data);

                this.GetAllEventsData();

                const stMainElement = document.getElementById('stMain');
                if (stMainElement) {
                    stMainElement.innerHTML = 'OBP Head<span class="themeClr"> Metric Mapping</span>';
                }

                const imgLogoElement = document.getElementById('imgLogo') as HTMLInputElement;
                if (imgLogoElement) {
                    imgLogoElement.style.width = '164px';
                }
            },
            error: _err => {
                this.LoginFailed(_err);
            }
        });
    }
    LoginFailed(_NewError: any) {
        this.isLoginFailed = true;
        swal.fire({
            title: 'Login Failed',
            text: 'Login details are Invalid!',
            icon: 'warning',
        })
        const element = document.getElementById('OBPHeadMapping');
        if (element) {
            element.hidden = true;
        }

        const stMainElement = document.getElementById('stMain');
        if (stMainElement) {
            stMainElement.innerHTML = 'OBP Head<span class="themeClr"> Metric Mapping</span>';
        }

        const imgLogoElement = document.getElementById('imgLogo') as HTMLInputElement;
        if (imgLogoElement) {
            imgLogoElement.style.width = '164px';
        }
    }

    loadingIndicator = false;
    sessionId: any = 'Select'; // Default empty value
    items: any[] = []; // Array to store dropdown options 

    HeadMappingData: any; filteredHeadMappingData: any;


    GetAllEventsData(): void {
        this.loadingIndicator = true;
        const startTime = new Date().getTime();
        // Populate mappingData$ observable from the service so template can use async pipe
        this.mappingData$ = this.PlanningrankingService.GetHeadMappings().pipe(
            map((response: any) => response?.item1 ?? []),
            tap((arr: MetricMapping[]) => {
                // Keep local copies for filtering and other UI usage
                this.HeadMappingData = arr;
                this.filteredHeadMappingData = arr;
                this.loadingIndicator = false;
                this.totalRecords = arr.length;

                // Derive dynamic columns from the first record
                if (arr && arr.length > 0) {
                    const keys = Object.keys(arr[0]);
                    // Ensure Actions column is last
                    this.tableColumns = [...keys.filter(k => k.toLowerCase() !== 'actions'), 'Actions'];
                } else {
                    this.tableColumns = ['Actions'];
                }

            }),
            catchError(err => {
                console.error('Failed to load head mappings', err);
                // Provide an empty array so the template stays stable
                this.HeadMappingData = [];
                this.filteredHeadMappingData = [];
                this.loadingIndicator = false;
                this.isLoginFailed = true; // signal error state if needed in UI
                return of([] as MetricMapping[]);
            })
        );
        const elapsed = new Date().getTime() - startTime;
        // --- CHANGE 2500 to 25 ---
        const remainingDelay = Math.max(1125000 - elapsed, 0); // Changed from 2500 to 25

        setTimeout(() => {
            this.loadingIndicator = false;
        }, remainingDelay);
        // Ensure displayedData$ is derived from mappingData$ + search + paging
        this.displayedData$ = combineLatest([this.mappingData$, this.searchTerm$, this.pageSize$, this.currentPage$]).pipe(
            map(([arr, term, size, page]) => {
                const list: MetricMapping[] = (arr as MetricMapping[]) || [];
                const filtered = this.applyFilter(list, term as string);
                this.totalRecords = filtered.length;
                return this.applyPaging(filtered, page as number, size as number);
            }),
            // hide loader when displayed data recalculated
            tap(() => { this.loadingIndicator = false; }),
            catchError(err => {
                console.error('displayedData$ error', err);
                return of([] as MetricMapping[]);
            })
        );

    }
    // Initialize the Reactive Form
    private initForm(): void {
        this.mappingForm = this.fb.group({
            HeadUID: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
            AssistantUID: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
            // IsActive is intentionally omitted for add mode; it will be added dynamically for edit mode
            MetricId: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
            Type: ['PA', Validators.required] // Default to PA
        });
    }



    // ---------- Client-side filtering & paging helpers ----------
    private applyFilter(data: MetricMapping[], term: string): MetricMapping[] {
        if (!term) return data;
        const lower = term.toLowerCase();
        return data.filter(item => {
            return Object.keys(item).some(k => {
                const v = (item as any)[k];
                return v != null && String(v).toLowerCase().includes(lower);
            });
        });
    }

    private applyPaging(data: MetricMapping[], page: number, size: number): MetricMapping[] {
        const start = ((page || 1) - 1) * (size || 10);
        return data.slice(start, start + (size || 10));
    }

    // Case-insensitive property getter to tolerate different API casing
    private getProp(obj: any, key: string): any {
        if (!obj || !key) return undefined;
        if (key in obj) return obj[key];
        const lower = key.toLowerCase();
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lower);
        return foundKey ? obj[foundKey] : undefined;
    }

    public onSearch(term: string): void {
        this.loadingIndicator = true;
        this.searchTerm$.next(term || '');
        this.currentPage$.next(1);
    }

    public onPageSizeChange(size: number | string): void {
        const s = typeof size === 'string' ? parseInt(size, 10) : size;
        this.loadingIndicator = true;
        this.pageSize$.next(s || 10);
        this.currentPage$.next(1);
    }

    public goToPage(page: number): void {
        if (page < 1) return;
        this.currentPage$.next(page);
    }

    public get currentPage(): number {
        return this.currentPage$.value;
    }

    public get pageSize(): number {
        return this.pageSize$.value;
    }

    public get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalRecords / (this.pageSize || 1)));
    }

    // Export currently displayed data to Excel
    public exportToExcel(): void {
        this.loadingIndicator = true;
        // take current filtered data snapshot
        this.mappingData$.pipe(take(1)).subscribe((arr: MetricMapping[]) => {
            const data = (arr || []).map(r => {
                // convert to plain object with readable keys
                const obj: any = {};
                Object.keys(r).forEach(k => obj[k] = (r as any)[k]);
                return obj;
            });
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'HeadMappings');
            XLSX.writeFile(wb, `HeadMappings_${new Date().toISOString().slice(0, 10)}.xlsx`);
            this.loadingIndicator = false;
        }, err => {
            console.error('Export failed', err);
            this.loadingIndicator = false;
        });
    }
    // Radio button options (now send 'Yes'/'No')
    public isActiveOptions = [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];

    // Helper: normalize incoming raw value (number/boolean/string) -> 'Yes'|'No'
    private normalizeIsActiveToYesNo(raw: any): 'Yes' | 'No' {
        if (raw === 1 || raw === '1' || raw === true || raw === 'true') return 'Yes';
        if (raw === 0 || raw === '0' || raw === false || raw === 'false') return 'No';
        if (typeof raw === 'string') {
            const s = raw.trim().toLowerCase();
            if (s === 'yes' || s === 'y') return 'Yes';
            if (s === 'no' || s === 'n') return 'No';
        }
        // default
        return 'Yes';
    }

    public onEdit(record: MetricMapping | any): void {
        this.isUpdateMode = true;
        const get = (k: string) => this.getProp(record, k);
        this.currentEditId = Number(get('Id') ?? get('id') ?? (record as any).Id ?? null);

        // Ensure IsActive control exists for edit mode
        if (!this.mappingForm.get('IsActive')) {
            this.mappingForm.addControl('IsActive', this.fb.control(null, Validators.required));
        }

        // Ensure Remarks control exists for edit mode and is required
        if (!this.mappingForm.get('Remarks')) {
            this.mappingForm.addControl('Remarks', this.fb.control('', Validators.required));
        }

        // Patch values converting isActive to 'Yes'/'No'
        const rawIsActive = get('IsActive') ?? get('isActive') ?? undefined;
        const isActiveVal = this.normalizeIsActiveToYesNo(rawIsActive);

        this.mappingForm.patchValue({
            HeadUID: get('HeadUID') ?? get('headUID') ?? get('headUid') ?? null,
            AssistantUID: get('AssistantUID') ?? get('assistantUID') ?? get('assistantUid') ?? null,
            IsActive: isActiveVal,
            MetricId: get('MetricId') ?? get('metricId') ?? null,
            Type: get('Type') ?? get('type') ?? 'PA'
        });

        this.mappingForm.get('IsActive')?.setValidators([Validators.required]);
        this.mappingForm.get('IsActive')?.updateValueAndValidity();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Submit: ensure IsActive appended as 'Yes'/'No' string for updates
    public onSubmit(): void {
        if (this.mappingForm.invalid) {
            this.mappingForm.markAllAsTouched();
            return;
        }

        const formData = this.mappingForm.value;

        if (this.isUpdateMode && this.currentEditId !== null) {
            const MformData = new FormData();
            MformData.append('HeadUID', String(formData.HeadUID));
            MformData.append('AssistantUID', String(formData.AssistantUID));
            MformData.append('MetricId', String(formData.MetricId));
            MformData.append('Type', String(formData.Type));

            // Remarks required for updates
            const remarksVal = String(this.mappingForm.get('Remarks')?.value ?? '');
            MformData.append('Remarks', remarksVal);

            // normalize IsActive to 'Yes'/'No' before sending
            const isActiveVal = this.normalizeIsActiveToYesNo(this.mappingForm.get('IsActive')?.value);
            MformData.append('IsActive', isActiveVal);

            const idVal = String(this.currentEditId);
            MformData.append('Id', idVal);

            // console.log("Form Data")
            // MformData.forEach((value, key) => {
            // console.log(key, value);
            // });
            this.PlanningrankingService.updateRecord(MformData).pipe(take(1)).subscribe({
                next: (res: any) => {
                    const sres = res.item1[0];
                    if (sres.msg === '-1') {
                        swal.fire(
                            { title: 'Failed to Update', icon: 'error' }
                        ), setTimeout(() => {
                            window.location.reload();
                        }, 112200);
                    } else if (sres.msg === '1') {
                        swal.fire(
                            { title: 'Updation done : ', text: sres.msg, icon: 'success' }
                        ), setTimeout(() => {
                            window.location.reload();
                        }, 2200);
                    }

                    this.GetAllEventsData();
                    this.loadingIndicator = false;
                },
                error: (err: any) => {
                    console.error('Update failed', err);
                    this.loadingIndicator = false;
                }
            });

            // cleanup and reset handled after subscribe; keep current behavior
        } else {

            // 3. Add Button Logic: Add new record
            // Call InsertHeadMapping API in PlanningrankingService
            this.loadingIndicator = true;
            // Exclude IsActive from payload when inserting new records
            const payload: any = { ...formData };
            if ('IsActive' in payload) delete payload.IsActive;

            const MformData = new FormData();
            MformData.append('HeadUID', formData.HeadUID);
            MformData.append('AssistantUID', formData.AssistantUID);
            MformData.append('MetricId', formData.MetricId);
            MformData.append('Type', formData.Type);

            // console.log("Form Data")
            // MformData.forEach((value, key) => {
            //  console.log(key, value);
            // });
            this.PlanningrankingService.InsertHeadMapping(MformData).pipe(take(1)).subscribe({
                next: (res: any) => {
                    // FIX: Replaced standard alert() with swal.fire() for consistency
                    swal.fire({
                        title: 'Success!',
                        text: 'New record added successfully!',
                        icon: 'success'
                    });
                    this.GetAllEventsData();
                    this.loadingIndicator = false;
                },
                error: (err: any) => {
                    console.error('InsertHeadMapping failed', err);
                    // FIX: Replaced standard alert() with swal.fire() for consistency
                    swal.fire({
                        title: 'Failed to Add Record',
                        text: 'An error occurred while adding the new record.',
                        icon: 'error'
                    });
                    this.loadingIndicator = false;
                }
            });
        }

        // Reset state and form (existing cleanup)
        this.isUpdateMode = false;
        this.currentEditId = null;
        this.mappingForm.reset({ Type: 'PA' });
        if (this.mappingForm.get('IsActive')) this.mappingForm.removeControl('IsActive');
        if (this.mappingForm.get('Remarks')) this.mappingForm.removeControl('Remarks');
    }

    // Update display helper to accept number/string/bool and return 'Yes'/'No'
    public isActiveDisplay(value: any): string {
        if (value === undefined || value === null) return '';
        if (value === 1 || value === '1' || value === true || value === 'True') return 'Yes';
        if (value === 0 || value === '0' || value === false || value === 'False') return 'No';
        if (typeof value === 'string') {
            const s = value.trim().toLowerCase();
            if (s === 'yes' || s === 'y') return 'Yes';
            if (s === 'no' || s === 'n') return 'No';
            return value;
        }
        return String(value);
    }

    // Add this method to the OBPMetricBinding class
    public onCancelUpdate(): void {
        this.isUpdateMode = false;
        this.currentEditId = null;
        // Reset the main form controls to default
        this.mappingForm.reset({ Type: 'PA' });
        // Remove the controls that were dynamically added for update mode
        if (this.mappingForm.get('IsActive')) {
            this.mappingForm.removeControl('IsActive');
        }
        if (this.mappingForm.get('Remarks')) {
            this.mappingForm.removeControl('Remarks');
        }
        // Scroll to the top of the page if needed, for smooth transition
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    public onDelete(record: MetricMapping | any): void {
        this.isUpdateMode = true;
        const get = (k: string) => this.getProp(record, k);
        this.currentEditId = Number(get('Id') ?? get('id') ?? (record as any).Id ?? null);
        const MformData = new FormData();
        MformData.append('RecordId', this.currentEditId);

        this.PlanningrankingService.deleteRecord(MformData).pipe(take(1)).subscribe({
            next: (res: any) => {
                const sres = res.item1[0];
                if (sres.msg === '-1') {
                    swal.fire(
                        { title: 'Action Failed', icon: 'error' }
                    ), setTimeout(() => {
                        window.location.reload();
                    }, 112200);
                } else if (sres.msg === '1') {
                    swal.fire(
                        { title: 'Action completed : ', text: sres.msg, icon: 'success' }
                    ), setTimeout(() => {
                        window.location.reload();
                    }, 2200);
                }

                this.GetAllEventsData();
                this.loadingIndicator = false;
            },
            error: (err: any) => {
                console.error('Update failed', err);
                this.loadingIndicator = false;
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// import { Component, OnInit } from '@angular/core';
// import { HeadMapping, MetricMapping } from '../../services/HeadMapping.service';

// import * as XLSX from 'xlsx';
// // The import is correct now, containing FormBuilder and FormGroup
// import { FormsModule, UntypedFormBuilder, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
// import swal from 'sweetalert2';
// import { ActivatedRoute } from '@angular/router';
// import { Title } from '@angular/platform-browser';

// import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
// import { map, tap, catchError, take } from 'rxjs/operators';
// import { CommonModule } from '@angular/common';


// @Component({
//   selector: 'app-metric-mapping',
//   standalone: true,
//   // Added ReactiveFormsModule for [formGroup] and formControlName to work
//   imports: [CommonModule, FormsModule, ReactiveFormsModule], 
//   templateUrl: './metric-mapping.html',
//   styleUrls: ['./metric-mapping.scss']
// })
// export class MetricMappingComponent implements OnInit {
//     // 1. Declare the FormGroup property
//    mappingForm!: FormGroup; 
//    isLoginFailed: boolean = false;
    
//     // --- TEMPLATE PROPERTY ADDITIONS FOR NEW CONTROL FLOW ---
//     loadingIndicator: boolean = false; // Added for loader logic
//     isUpdateMode: boolean = false; // Added for form toggling
    
//     // Properties for table and pagination (with dummy values/types)
//     displayedData$: Observable<any[]> = of([]);
//     tableColumns: string[] = ['HeadUID', 'AssistantUID', 'MetricId', 'Type', 'Actions'];
//     isActiveOptions = [{ label: 'Active', value: 1 }, { label: 'Inactive', value: 0 }];
//     typeOptions = ['PA', 'AD', 'TR'];
    
//     totalRecords: number = 0;
//     pageSize: number = 10;
//     pageSizes: number[] = [5, 10, 25, 50];
//     currentPage: number = 1;
//     totalPages: number = 1;
//     // --- END TEMPLATE PROPERTY ADDITIONS ---


//     // 2. Inject FormBuilder in the constructor
//     constructor(private fb: FormBuilder) {}

//     // 3. Initialize the form in ngOnInit
//     ngOnInit(): void {
//         this.initializeForm();
//         // In a real app, you would load data here to populate displayedData$
//         // For demonstration, setting dummy data:
//         this.displayedData$ = of([
//             { HeadUID: 101, AssistantUID: 201, MetricId: 301, Type: 'PA' },
//             { HeadUID: 102, AssistantUID: 202, MetricId: 302, Type: 'AD' }
//         ]);
//         this.totalRecords = 2;
//         this.totalPages = 1;
//     }

//     private initializeForm(): void {
//         // Initialize mappingForm with all the form controls used in the HTML
//         this.mappingForm = this.fb.group({
//             HeadUID: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]], 
//             AssistantUID: ['', Validators.required],
//             MetricId: ['', Validators.required],
//             IsActive: [1], // Default active
//             Remarks: [''], 
//             Type: ['PA', Validators.required] // Default PA
//         });
//     }

//     // Example submit handler
//     onSubmit(): void {
//         if (this.mappingForm.valid) {
//             console.log('Form Submitted!', this.mappingForm.value);
//         } else {
//             this.mappingForm.markAllAsTouched();
//         }
//     }
    
//     // --- TEMPLATE METHOD ADDITIONS ---
//     onCancelUpdate(): void {
//         this.isUpdateMode = false;
//         this.mappingForm.reset({ IsActive: 1, Type: 'PA' });
//     }

//     onSearch(value: string): void {
//         console.log('Search:', value);
//         // Implement filtering logic here
//     }

//     onPageSizeChange(value: string): void {
//         this.pageSize = parseInt(value, 10);
//         this.currentPage = 1;
//         // Implement re-pagination logic here
//     }

//     exportToExcel(): void {
//         console.log('Exporting to Excel...');
//         // Implement export logic here
//     }

//     goToPage(page: number): void {
//         this.currentPage = page;
//         // Implement page change logic here
//     }
    
//     onEdit(record: any): void {
//         this.isUpdateMode = true;
//         this.mappingForm.patchValue(record);
//         console.log('Editing record:', record);
//     }
    
//     onDelete(record: any): void {
//         console.log('Deleting record:', record);
//         // Implement delete logic with confirmation (e.g., using sweetalert2)
//     }
//     // --- END TEMPLATE METHOD ADDITIONS ---
// }
