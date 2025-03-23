import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      mentorCode: [''],
      adminCode: [''],
    });

    // Add validator for mentor code when role is mentor
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const mentorCodeControl = this.registerForm.get('mentorCode');
      if (role === 'mentor') {
        mentorCodeControl?.setValidators([Validators.required]);
      } else {
        mentorCodeControl?.clearValidators();
      }
      mentorCodeControl?.updateValueAndValidity();
    });

    // Add validator for admin code when role is admin
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const adminCodeControl = this.registerForm.get('adminCode');
      if (role === 'admin') {
        adminCodeControl?.setValidators([Validators.required]);
      } else {
        adminCodeControl?.clearValidators();
      }
      adminCodeControl?.updateValueAndValidity();
    });
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get role() {
    return this.registerForm.get('role');
  }

  get mentorCode() {
    return this.registerForm.get('mentorCode');
  }

  get adminCode() {
    return this.registerForm.get('adminCode');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      try {
        const formData = this.registerForm.value;
        // Only include mentorCode if role is mentor
        if (formData.role !== 'mentor') {
          delete formData.mentorCode;
        }

        // Only include adminCode if role is admin
        if (formData.role !== 'admin') {
          delete formData.adminCode;
        }
        await this.authService.register(formData);
        this.router.navigate(['/student/check-in-out']);
      } catch (error) {
        console.error('Registration error:', error);
        // Handle specific error for invalid mentor code
        if (error instanceof Error && error.message.includes('Invalid mentor code')) {
          this.registerForm.get('mentorCode')?.setErrors({ invalidCode: true });
        }
        // Handle specific error for invalid admin code
        if (error instanceof Error && error.message.includes('Invalid admin code')) {
          this.registerForm.get('adminCode')?.setErrors({ invalidCode: true });
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
}
