import { Injectable } from '@angular/core';
import baseUrl from './helper';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private http : HttpClient) { }

  public addHistory(h:any) {
    console.log(h);
    return this.http.post(`${baseUrl}/history/`, h);
  }

}