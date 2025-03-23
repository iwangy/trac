import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MeetingType {
  _id: string;
  name: string;
  description: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Meeting Types Management
  async getMeetingTypes(): Promise<MeetingType[]> {
    return firstValueFrom(this.http.get<MeetingType[]>(`${this.apiUrl}/meeting-types`));
  }

  async createMeetingType(data: { name: string; description: string }): Promise<MeetingType> {
    return firstValueFrom(this.http.post<MeetingType>(`${this.apiUrl}/meeting-types`, data));
  }

  async updateMeetingType(id: string, data: { name: string; description: string }): Promise<MeetingType> {
    return firstValueFrom(this.http.put<MeetingType>(`${this.apiUrl}/meeting-types/${id}`, data));
  }

  async deleteMeetingType(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/meeting-types/${id}`));
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/users`));
  }

  async deleteUser(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/users/${id}`));
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    return firstValueFrom(this.http.patch<User>(`${this.apiUrl}/users/${id}/role`, { role }));
  }

  async deleteUserData(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/users/${id}/data`));
  }
} 