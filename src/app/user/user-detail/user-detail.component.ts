import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  TranslateModule,
  TranslateService,
  LangChangeEvent,
} from '@ngx-translate/core';
import { UserService } from '../share/user.service';
import { AuthService } from 'src/app/auth/shared/auth.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  user: any;
  selectedTab = 'home';

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  displayPreferences = {
    darkMode: false,
    language: 'en',
    timeZone: 'UTC',
  };

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUser();

    // Keep UI in sync with language changes
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log('Language changed to:', event.lang);
      this.cdRef.detectChanges();
    });

    // Load saved language from localStorage if present
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.translate.use(savedLang);
    }
  }

  getUser() {
    const userId = this.auth.getUserId();
    this.userService.getUser(userId).subscribe(
      (user) => {
        this.user = user;
        this.displayPreferences =
          user.displayPreferences || this.displayPreferences;

        if (this.displayPreferences.language) {
          this.translate.use(this.displayPreferences.language);
          localStorage.setItem('language', this.displayPreferences.language);
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  saveUser() {
    const userId = this.auth.getUserId();
    this.userService.updateUser(userId, this.user).subscribe(
      (updatedUser) => {
        console.log('✅ User updated:', updatedUser);
        this.user = updatedUser;
      },
      (error) => {
        console.error('❌ Failed to update user:', error);
      }
    );
  }

  resetForm() {
    this.getUser();
  }

  savePreferences() {
    const updatedUser = {
      ...this.user,
      displayPreferences: this.displayPreferences,
    };

    this.userService.updateUser(this.user._id, updatedUser).subscribe(
      (updated) => {
        this.user = updated;

        alert(this.translate.instant('MESSAGES.PREFERENCES_SAVED'));

        localStorage.setItem('language', this.displayPreferences.language);

        this.translate.use(this.displayPreferences.language).subscribe({
          next: () => {
            console.log('Language applied:', this.displayPreferences.language);
          },
          error: (err) => {
            console.error('Failed to switch language:', err);
            alert(this.translate.instant('MESSAGES.PREFERENCES_FAILED'));
          },
        });
      },
      (error) => {
        console.error('Error saving preferences:', error);
        alert(this.translate.instant('MESSAGES.PREFERENCES_FAILED'));
      }
    );
  }

  updatePassword() {
    const userId = this.auth.getUserId();

    this.userService.updatePassword(userId, this.passwordData).subscribe(
      () => {
        alert(this.translate.instant('MESSAGES.PASSWORD_UPDATED'));
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
      },
      (error) => {
        alert(
          error.error?.error ||
            this.translate.instant('MESSAGES.PASSWORD_UPDATE_ERROR')
        );
      }
    );
  }
}
