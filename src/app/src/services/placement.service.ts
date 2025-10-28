import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage-service';

const AUTH_API = 'https://projectsapi.lpu.in/';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

@Injectable({
  providedIn: 'root',
})
export class PlacementService {
  constructor(private http: HttpClient,private storageService: StorageService) {}

  getBatchyears(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/Get',
     {headers}
    );
  }


  getPlannerSession(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Planning/GetPlanningSession',
     {headers}
    );
  }

  getAuthBatchyears(type:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetAuthenticationBatchYear?type='+type,
     {headers}
    );
  }

  getCompanyByBatchyears(batchYear:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetCompanyBatchWise?batchYear='+batchYear,
     {headers}
    );
  }



  getReportType(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Planning/GetQueryType',
     {headers}
    );
  }


  getCompanyByAuthBatchyears(batchYear:any,type:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetCompanyAuthenticationBatchWise?batchYear='+batchYear+'&type='+type,
     {headers}
    );
  }

  getStreamByBatchyears(batchYear:any,companyId:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetStreamByBatchYear?batchYear='+batchYear + '&companyId='+companyId,
     {headers}
    );
  }

  getStreamByAuthBatchyears(batchYear:any,companyId:any,type:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetStreamByAuthBatchYear?batchYear='+batchYear + '&companyId='+companyId+'&type='+type,
     {headers}
    );
  }

  getDriveByStreamBatchyears(batchYear:any,companyId:any,stream:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetSoftSkillPlacementDrive?batchYear='+batchYear + '&companyId='+companyId + '&stream='+stream,
     {headers}
    );
  }

  getAuthDriveByStreamBatchyears(batchYear:any,companyId:any,stream:any,type:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetAuthSoftSkillPlacementDrive?batchYear='+batchYear + '&companyId='+companyId + '&stream='+stream+'&type='+type,
     {headers}
    );
  }


    getRounds(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetRoundData',
     {headers}
    );
  }


      getDriveAttendanceDetails(driveId:any,roundId:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetPlacementStudentsDriveAttendanceDetails?driveId='+driveId+'&roundId='+roundId,
     {headers}
    );
  }

  getmouData(sessionId:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Placement/GetMouDashboardData?sessionId='+sessionId,
     {headers}
    );
  }


  addSoftSkillData(dataSoft:any[]): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/Placement/AddPlacementSoftSkillData',dataSoft,
     {headers}
    );
  }


  getPlannerReportData(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/Planning/RunQuery',dataSoft,
     {headers}
    );
  }

  getLinkedQueryData(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/Planning/RunLinkedQuery',dataSoft,
     {headers}
    );
  }



  updateFinalSubmitSoftSkillData(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/Placement/UpdatePlacementDataForFinalSubmit',dataSoft,
     {headers}
    );
  }

  getSoftSkillData(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/Placement/GetPlacementSoftSkillRequestDetailShow',dataSoft,
     {headers}
    );
    
  }


  addFeedback(dataSoft:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.post(
      AUTH_API + 'api/Planning/AddFeedbackForm',dataSoft,
     {headers}
    );
  }
  //05-10-2024
  getDivisionsService(): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Planning/GetSchoolDivisions?type=d',
     {headers}
    );
  }

  getQuarterAchievementService(SessionIdNew:any,DivID:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Planning/GetQuarterWiseAchievements?SessionIdNew='+SessionIdNew+'&DivID='+DivID,
     {headers}
    );
  }
//15-10-2024
getTransferAllocationService(PlannerSessionId:any,LoginName:any): Observable<any> {
  let token = this.storageService.getUser();
  let headers = new HttpHeaders()
  .set('Authorization', 'Bearer ' + token)
  .set('Content-Type', 'application/json'); 

  //httpOptions.headers.set('Authentication', 'Bearer ' + token);
  return this.http.get(
    AUTH_API + 'api/Planning/GetTransferAllocations?PlannerSessionId='+PlannerSessionId,
   {headers}
  );
}

  //16-10-2024
  TransferOBPMetricAllocation(TransferredData: any, type: string): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json');

    // Properly stringify the data for the POST request
    return this.http.post(
        `${AUTH_API}api/Planning/OBPTransferAllocations?Type=${type}`,
        TransferredData,
        { headers }
    );
}

  getOBPDepartmentService(LoginName:any): Observable<any> {
    let token = this.storageService.getUser();
    let headers = new HttpHeaders()
    .set('Authorization', 'Bearer ' + token)
    .set('Content-Type', 'application/json'); 

    //httpOptions.headers.set('Authentication', 'Bearer ' + token);
    return this.http.get(
      AUTH_API + 'api/Planning/OBPGetDepartments?LoginName='+LoginName,
     {headers}
    );
  }


 
}


// old code 
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { StorageService } from './storage.service';

// const AUTH_API = 'https://projectsapi.lpu.in/';

// // const httpOptions = {
// //   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// // };

// @Injectable({
//   providedIn: 'root',
// })
// export class PlacementService {
//   constructor(private http: HttpClient,private storageService: StorageService) {}

//   getBatchyears(): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/Get',
//      {headers}
//     );
//   }


//   getPlannerSession(): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Planning/GetPlanningSession',
//      {headers}
//     );
//   }

//   getAuthBatchyears(type:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetAuthenticationBatchYear?type='+type,
//      {headers}
//     );
//   }

//   getCompanyByBatchyears(batchYear:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetCompanyBatchWise?batchYear='+batchYear,
//      {headers}
//     );
//   }



//   getReportType(): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Planning/GetQueryType',
//      {headers}
//     );
//   }


//   getCompanyByAuthBatchyears(batchYear:any,type:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetCompanyAuthenticationBatchWise?batchYear='+batchYear+'&type='+type,
//      {headers}
//     );
//   }

//   getStreamByBatchyears(batchYear:any,companyId:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetStreamByBatchYear?batchYear='+batchYear + '&companyId='+companyId,
//      {headers}
//     );
//   }

//   getStreamByAuthBatchyears(batchYear:any,companyId:any,type:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetStreamByAuthBatchYear?batchYear='+batchYear + '&companyId='+companyId+'&type='+type,
//      {headers}
//     );
//   }

//   getDriveByStreamBatchyears(batchYear:any,companyId:any,stream:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetSoftSkillPlacementDrive?batchYear='+batchYear + '&companyId='+companyId + '&stream='+stream,
//      {headers}
//     );
//   }

//   getAuthDriveByStreamBatchyears(batchYear:any,companyId:any,stream:any,type:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetAuthSoftSkillPlacementDrive?batchYear='+batchYear + '&companyId='+companyId + '&stream='+stream+'&type='+type,
//      {headers}
//     );
//   }


//     getRounds(): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetRoundData',
//      {headers}
//     );
//   }


//       getDriveAttendanceDetails(driveId:any,roundId:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetPlacementStudentsDriveAttendanceDetails?driveId='+driveId+'&roundId='+roundId,
//      {headers}
//     );
//   }

//   getmouData(sessionId:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.get(
//       AUTH_API + 'api/Placement/GetMouDashboardData?sessionId='+sessionId,
//      {headers}
//     );
//   }


//   addSoftSkillData(dataSoft:any[]): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.post(
//       AUTH_API + 'api/Placement/AddPlacementSoftSkillData',dataSoft,
//      {headers}
//     );
//   }


//   getPlannerReportData(dataSoft:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.post(
//       AUTH_API + 'api/Planning/RunQuery',dataSoft,
//      {headers}
//     );
//   }

//   getLinkedQueryData(dataSoft:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.post(
//       AUTH_API + 'api/Planning/RunLinkedQuery',dataSoft,
//      {headers}
//     );
//   }



//   updateFinalSubmitSoftSkillData(dataSoft:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.post(
//       AUTH_API + 'api/Placement/UpdatePlacementDataForFinalSubmit',dataSoft,
//      {headers}
//     );
//   }

//   getSoftSkillData(dataSoft:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.post(
//       AUTH_API + 'api/Placement/GetPlacementSoftSkillRequestDetailShow',dataSoft,
//      {headers}
//     );
    
//   }


//   addFeedback(dataSoft:any): Observable<any> {
//     let token = this.storageService.getUser();
//     let headers = new HttpHeaders()
//     .set('Authorization', 'Bearer ' + token)
//     .set('Content-Type', 'application/json'); 

//     //httpOptions.headers.set('Authentication', 'Bearer ' + token);
//     return this.http.post(
//       AUTH_API + 'api/Planning/AddFeedbackForm',dataSoft,
//      {headers}
//     );
//   }

 
// }
