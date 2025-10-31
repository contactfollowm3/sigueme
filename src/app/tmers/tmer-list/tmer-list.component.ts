import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TmerService } from '../shared/tmer.service';
import { Tmer } from '../shared/tmer.model';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tmer-list',
  templateUrl: './tmer-list.component.html',
  styleUrls: ['./tmer-list.component.scss'],
})
export class TmerListComponent implements OnInit, OnDestroy {
  tmers: Tmer[] = [];
  private langChangeSub: Subscription;
  private tmersSub: Subscription;

  constructor(
    private tmerService: TmerService,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTmers();

    // Initialize with current language
    this.updateTranslations();

    // Subscribe to language changes
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
      this.cdRef.detectChanges();
    });
  }

  loadTmers() {
    this.tmersSub = this.tmerService.getTmers().subscribe(
      (tmers: Tmer[]) => {
        this.tmers = tmers;
      },
      (err: any) => {
        console.error('Error loading tmers:', err);
      }
    );
  }

  updateTranslations() {
    // Optionally add any translation-specific logic here
    console.log('Current language:', this.translate.currentLang);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
    if (this.tmersSub) {
      this.tmersSub.unsubscribe();
    }
  }
}
