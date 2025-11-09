import { Component, OnInit } from '@angular/core';
import { CountdownService } from '../../services/countdown.service';
import confetti from 'canvas-confetti';
import { effect } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: false,
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent implements OnInit {
  private confettiLaunched = false;
  currentFunnyQuote: string = '';

  // Array of rotating funny work-themed quotes
  private funnyQuotes = [
    'Still here? Unfortunate... 😅',
    'The elves are preparing your vacation! 🧝',
    "Santa's checking your commit history 🎅",
    "Management can't take this back now! 📝",
    'Tickets can wait... 📊',
    'Your OOO message is ready to deploy! 📧',
    'Slack status: 🎄🎅 (soon!)',
    'Breaking: Local dev counting down to PTO 📰',
    'Coffee consumption: MAXIMUM ☕',
    "Productivity graph: 📉 (it's fine!)",
    'Days until you ignore emails: [countdown] 📬',
    'Christmas is coming... AND SO IS YOUR VACATION! 🎄',
    'Meetings? Not your problem soon! 🚫',
    'The standup can happen without you! 🎤',
    'Your laptop will miss you... probably 💻',
  ];

  constructor(private countdownService: CountdownService) {
    // Watch for countdown completion and trigger confetti
    effect(() => {
      if (this.countdownComplete() && !this.confettiLaunched) {
        this.confettiLaunched = true;
        this.launchConfetti();
      }
    });
  }

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

    // Set a random funny quote on page load
    this.setRandomQuote();

    // Change quote every 10 seconds
    setInterval(() => {
      this.setRandomQuote();
    }, 10000);
  }

  // Select a random funny quote
  private setRandomQuote(): void {
    const randomIndex = Math.floor(Math.random() * this.funnyQuotes.length);
    this.currentFunnyQuote = this.funnyQuotes[randomIndex];
  }

  // Calculate remaining workdays (Mon-Fri only)
  getWorkdaysRemaining(): number {
    const now = new Date();
    const targetDate = new Date('2025-12-19T18:00:00+01:00');

    let workdays = 0;
    const currentDate = new Date(now);
    // Set time to start of day for accurate day counting
    currentDate.setHours(0, 0, 0, 0);

    // Loop through each day until target (including Dec 19 since you work until 6PM)
    while (currentDate <= targetDate) {
      const dayOfWeek = currentDate.getDay();
      // 1 = Monday, 5 = Friday (0 = Sunday, 6 = Saturday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workdays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workdays;
  }

  // Calculate remaining work hours (8 hours per workday)
  getWorkHoursRemaining(): number {
    return this.getWorkdaysRemaining() * 8;
  }

  // Helper method to format numbers with leading zeros
  formatNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  // Get funny milestone message based on progress
  getMilestoneMessage(): string {
    const progressValue = this.progress();

    if (progressValue >= 99) {
      return "DON'T. SNEEZE. 😤";
    } else if (progressValue >= 90) {
      return 'SINGLE DIGITS BABY! 🎊';
    } else if (progressValue >= 75) {
      return "Almost there! Don't jinx it! 🤞";
    } else if (progressValue >= 50) {
      return 'More than halfway! 🎉';
    } else if (progressValue >= 25) {
      return 'Halfway to paradise! 🏝️';
    } else if (progressValue >= 10) {
      return 'Final stretch! 🏃';
    } else {
      return 'Still here? Unfortunate... 😅';
    }
  }

  // Launch epic confetti celebration
  private launchConfetti(): void {
    const duration = 5000; // 5 seconds of confetti
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Christmas colors: red, green, gold, white
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#C41E3A', '#165B33', '#FFD700', '#FFFFFF'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#C41E3A', '#165B33', '#FFD700', '#FFFFFF'],
      });
    }, 250);

    // Bonus: One big burst at the start
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 },
      colors: ['#C41E3A', '#165B33', '#FFD700', '#FFFFFF'],
    });
  }
}
