import { Component, OnInit, computed } from '@angular/core';
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
  workingDecember13th: boolean = false; // Toggle for extra workday
  trackingTraitor: boolean = false; // Toggle for Dec 12th early leaver

  // Traitor's escape date
  private readonly TRAITOR_ESCAPE = new Date('2025-12-12T18:00:00+01:00');

  // Array of rotating funny work-themed quotes
  private funnyQuotes = [
    'Still here? Unfortunate... 😅',
    'The elves are preparing your vacation! 🧝',
    "Santa's checking your commit history 🎅",
    "Management can't take this back now! 📝",
    'Tickets can wait... 📊',
    'Your OOO message is ready to deploy! 📧',
    'Teams status: 🎄🎅 (soon!)',
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

  // Adjusted remaining time that accounts for December 13th
  adjustedRemainingTime = computed(() => {
    const baseTime = this.remainingTime();

    if (!this.workingDecember13th) {
      return baseTime;
    }

    // Add 24 hours (one full day) to all time calculations
    const additionalMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in ms
    const totalMs = baseTime.totalSeconds * 1000 + additionalMilliseconds;

    const totalSeconds = Math.floor(totalMs / 1000);
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
      isComplete: baseTime.isComplete,
      progressPercentage: baseTime.progressPercentage,
    };
  });

  get progress() {
    return this.countdownService.progress;
  }

  get countdownComplete() {
    return this.countdownService.countdownComplete;
  }

  // Computed signal for workdays remaining (updates in real-time)
  workdaysRemaining = computed(() => {
    // Access remainingTime to make this reactive
    const _ = this.remainingTime();

    const now = new Date();
    const targetDate = new Date('2025-12-19T18:00:00+01:00');
    const currentHour = now.getHours();

    let workdays = 0;
    const currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    // If it's past 6 PM on a weekday, don't count today
    if (currentHour >= 18 && now.getDay() >= 1 && now.getDay() <= 5) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate <= targetDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workdays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add December 13th (Saturday) if working that day
    if (this.workingDecember13th) {
      workdays += 1;
    }

    return workdays;
  });

  // Computed signal for work hours remaining (updates in real-time)
  workHoursRemaining = computed(() => {
    // Access remainingTime to make this reactive
    const _ = this.remainingTime();

    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay();

    let baseHours = this.workdaysRemaining() * 8;

    // If we're currently in a workday, subtract hours already worked today
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      let hoursWorkedToday = 0;

      if (currentHour >= 9 && currentHour < 12) {
        // 9 AM - 12 PM: 3 hours max
        hoursWorkedToday = currentHour - 9;
      } else if (currentHour >= 12 && currentHour < 13) {
        // 12 PM - 1 PM: Lunch break, still 3 hours worked
        hoursWorkedToday = 3;
      } else if (currentHour >= 13 && currentHour < 18) {
        // 1 PM - 6 PM: 3 hours from morning + hours after lunch
        hoursWorkedToday = 3 + (currentHour - 13);
      } else if (currentHour >= 18) {
        // Past 6 PM: Full 8 hours worked
        hoursWorkedToday = 8;
      }

      baseHours -= hoursWorkedToday;
    }

    return Math.max(0, baseHours);
  });

  // Traitor tracking - is the traitor still here or already free?
  isTraitorFree = computed(() => {
    const _ = this.remainingTime(); // Make reactive
    const now = new Date();
    return now >= this.TRAITOR_ESCAPE;
  });

  // Workdays until traitor escapes (before Dec 12)
  workdaysUntilTraitorEscape = computed(() => {
    const _ = this.remainingTime(); // Make reactive
    const now = new Date();
    const targetDate = this.TRAITOR_ESCAPE;
    const currentHour = now.getHours();

    let workdays = 0;
    const currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    // If it's past 6 PM on a weekday, don't count today
    if (currentHour >= 18 && now.getDay() >= 1 && now.getDay() <= 5) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate <= targetDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workdays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workdays;
  });

  // Days traitor has been free (after Dec 12)
  daysTraitorHasBeenFree = computed(() => {
    const _ = this.remainingTime(); // Make reactive
    const now = new Date();
    const diff = now.getTime() - this.TRAITOR_ESCAPE.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  });

  // Estimate emails answered while traitor relaxes (rough estimate: 20/day)
  emailsWhileTraitorRelaxes = computed(() => {
    return this.daysTraitorHasBeenFree() * 20;
  });

  // Office days remaining (Tue, Wed, Thu) - decreases at 6 PM on office days
  officeDaysRemaining = computed(() => {
    // Access remainingTime to make this reactive
    const _ = this.remainingTime();

    const now = new Date();
    const targetDate = new Date('2025-12-19T18:00:00+01:00');
    const currentHour = now.getHours();

    let officeDays = 0;
    const currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    // If it's past 6 PM on an office day, don't count today
    // Office days are Tue (2), Wed (3), Thu (4)
    const currentDay = now.getDay();
    const isOfficeDay = currentDay >= 2 && currentDay <= 4;

    if (currentHour >= 18 && isOfficeDay) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate <= targetDate) {
      const dayOfWeek = currentDate.getDay();
      // Count if it's Tuesday (2), Wednesday (3), or Thursday (4)
      if (dayOfWeek >= 2 && dayOfWeek <= 4) {
        officeDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return officeDays;
  });

  ngOnInit(): void {
    // Increment the check counter for fun statistics
    this.countdownService.incrementCheckCount();

    // Set a random funny quote on page load
    this.setRandomQuote();

    // Change quote every 10 seconds
    setInterval(() => {
      this.setRandomQuote();
    }, 10000);

    // Create realistic snowflakes
    this.createSnowflakes();
  }

  // Create individual random snowflakes
  private createSnowflakes(): void {
    const numberOfSnowflakes = 30;

    // Stagger initial snowflake creation
    for (let i = 0; i < numberOfSnowflakes; i++) {
      setTimeout(() => {
        this.createSnowflake();
      }, i * 300);
    }

    // Continuously create new snowflakes to maintain density
    setInterval(() => {
      this.createSnowflake();
    }, 600);
  }

  // Create a single snowflake with random properties
  private createSnowflake(): void {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄';

    // Random properties for natural variation
    const leftPosition = Math.random() * 100; // Random horizontal position
    const fontSize = Math.random() * 0.8 + 0.6; // 0.6rem to 1.4rem
    const duration = Math.random() * 10 + 10; // 10s to 20s fall time
    const delay = Math.random() * 2; // 0s to 2s delay
    const drift = Math.random() * 60 - 30; // -30px to 30px horizontal drift

    snowflake.style.left = `${leftPosition}%`;
    snowflake.style.fontSize = `${fontSize}rem`;
    snowflake.style.animationDuration = `${duration}s`;
    snowflake.style.animationDelay = `${delay}s`;
    snowflake.style.setProperty('--drift', `${drift}px`);

    document.body.appendChild(snowflake);

    // Clean up snowflake after animation completes
    setTimeout(() => {
      snowflake.remove();
    }, (duration + delay) * 1000);
  }

  // Select a random funny quote
  private setRandomQuote(): void {
    const randomIndex = Math.floor(Math.random() * this.funnyQuotes.length);
    this.currentFunnyQuote = this.funnyQuotes[randomIndex];
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
      return 'Hang in there! 💪✨';
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
