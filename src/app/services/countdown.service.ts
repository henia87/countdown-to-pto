import { Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { CountdownTime } from '../models/countdown-time.interface';

@Injectable({
  providedIn: 'root',
})
export class CountdownService implements OnDestroy {
  // Target dates (GMT+1 / CET)
  private readonly COUNTDOWN_START = new Date('2025-11-10T09:00:00+01:00');
  private readonly COUNTDOWN_END = new Date('2025-12-19T18:00:00+01:00');

  private intervalId: any = null;

  // Signals - reactive state management without RxJS!
  private remainingMilliseconds = signal<number>(0);
  countdownStarted = signal<boolean>(false);
  countdownComplete = signal<boolean>(false);

  // Computed signal for countdown time breakdown
  remainingTime = computed<CountdownTime>(() => {
    const ms = this.remainingMilliseconds();
    return this.calculateTimeBreakdown(ms);
  });

  // Computed signal for progress percentage
  progress = computed<number>(() => {
    const now = new Date().getTime();
    const start = this.COUNTDOWN_START.getTime();
    const end = this.COUNTDOWN_END.getTime();

    if (now < start) return 0;
    if (now >= end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  });

  // Check if we're before the countdown starts
  isPreLaunch = computed<boolean>(() => {
    return new Date().getTime() < this.COUNTDOWN_START.getTime();
  });

  constructor() {
    this.startCountdown();

    // Effect to handle countdown completion
    effect(() => {
      if (this.remainingTime().isComplete && !this.countdownComplete()) {
        this.countdownComplete.set(true);
        this.stopCountdown();
        console.log('🎄 CHRISTMAS LEAVE TIME! 🎄');
      }
    });
  }

  private startCountdown(): void {
    // Update immediately
    this.updateCountdown();

    // Then update every second
    this.intervalId = setInterval(() => {
      this.updateCountdown();
    }, 1000);

    this.countdownStarted.set(true);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const target = this.COUNTDOWN_END.getTime();
    const difference = target - now;

    this.remainingMilliseconds.set(difference > 0 ? difference : 0);
  }

  private calculateTimeBreakdown(milliseconds: number): CountdownTime {
    if (milliseconds <= 0) {
      return {
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
        isComplete: true,
        progressPercentage: 100,
      };
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const weeks = Math.floor(totalDays / 7);

    const days = totalDays % 7;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    return {
      weeks,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      isComplete: false,
      progressPercentage: this.progress(),
    };
  }

  // Calculate time until countdown starts (for pre-launch)
  getTimeUntilStart(): CountdownTime {
    const now = new Date().getTime();
    const start = this.COUNTDOWN_START.getTime();
    const difference = start - now;

    return this.calculateTimeBreakdown(difference > 0 ? difference : 0);
  }

  private stopCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  // Helper methods for fun statistics
  getTotalWorkingDays(): number {
    const start = this.COUNTDOWN_START.getTime();
    const end = this.COUNTDOWN_END.getTime();
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    // Rough estimate of working days (exclude weekends)
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    return weeks * 5 + Math.min(remainingDays, 5);
  }

  // Track how many times user has checked the countdown
  incrementCheckCount(): void {
    const currentCount = this.getCheckCount();
    localStorage.setItem('countdownChecks', (currentCount + 1).toString());
  }

  getCheckCount(): number {
    const stored = localStorage.getItem('countdownChecks');
    return stored ? parseInt(stored, 10) : 0;
  }
}
