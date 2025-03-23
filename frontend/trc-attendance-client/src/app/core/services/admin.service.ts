import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface MeetingType {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Meeting Types
  getMeetingTypes(): Promise<MeetingType[]> {
    return firstValueFrom(this.http.get<MeetingType[]>(`${this.apiUrl}/meeting-types`));
  }

  createMeetingType(data: { name: string; description: string }): Promise<MeetingType> {
    return firstValueFrom(this.http.post<MeetingType>(`${this.apiUrl}/meeting-types`, data));
  }

  deleteMeetingType(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/meeting-types/${id}`));
  }

  // User Management
  getUsers(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/users`));
  }

  updateUserRole(userId: string, role: string): Promise<any> {
    return firstValueFrom(this.http.patch<any>(`${this.apiUrl}/users/${userId}/role`, { role }));
  }

  deleteUser(userId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/users/${userId}`));
  }

  deleteUserData(userId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/users/${userId}/data`));
  }
} 