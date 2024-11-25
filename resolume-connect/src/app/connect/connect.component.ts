import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import axios from 'axios';
import { environment } from '../../environment';

@Component({
  selector: 'app-connect',
  imports: [CommonModule, FormsModule],
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css'],
})
export class ConnectComponent {
  ipAddress: string = '';
  loading: boolean = false;
  error: boolean = false;
  errorMessage: string = '';
  host: any = localStorage.getItem('host');
  // Regex for validating an IP address
  ipPattern: RegExp =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  constructor(private router: Router, private authGuard: AuthGuard) {}

  validateIp(ip: any) {
    if (ip?.touched) {
      ip?.control?.setErrors(
        this.ipPattern.test(this.ipAddress) ? null : { pattern: true }
      );
    }
  }

  async onSubmit(form: any) {
    if (form.valid) {
      const conn = await this.checkHostConnection();
      if (conn.status == 'ok') {
        this.authGuard.allowAccess();
        this.router.navigate(['/program']);
      }
    } else {
      this.error = true;
    }
  }

  async checkHostConnection() {
    const res = await axios.post(`${environment.apiUrl}/connect`, {
      ip: this.ipAddress,
    });
    console.log(res.data);
    return res.data;
  }
}
