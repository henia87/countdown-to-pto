import { Component, OnInit } from '@angular/core';
import { CountdownService } from '../../services/countdown.service';

@Component({
  selector: 'app-countdown',
  standalone: false,
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent implements OnInit {
  constructor(private countdownService: CountdownService) {}

  // Expose service signals through getters
  get remainingTime() {
    return this.countdownService.remainingTime;
  }

  get progress() {
    return this.countdownService.progress;
  }

  get countdownComplete() {
    return this.countdownService.countdownComplete;
  }

  ngOnInit(): void {
    // Increment the check counter for fun statistics
    this.countdownService.incrementCheckCount();
  }

  // Helper method to format numbers with leading zeros
  formatNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
