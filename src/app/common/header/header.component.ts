import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tm2-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  private langChangeSub: Subscription;

  constructor(
    public auth: AuthService,
    private router: Router,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {
    // Subscribe to language change and refresh view
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.cdRef.detectChanges(); // Force re-render for translated text
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  search(city: string) {
    city
      ? this.router.navigate([`/tmers/${city}/homes`])
      : this.router.navigate(['/tmers']);
  }

  ngOnDestroy() {
    this.langChangeSub?.unsubscribe(); // prevent memory leak
  }
}
