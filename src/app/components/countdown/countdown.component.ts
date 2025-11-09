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
