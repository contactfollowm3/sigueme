import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
  Output,
  EventEmitter,
} from '@angular/core';
import { environment } from '../../environments/environment';


import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit, AfterViewInit {
  stripe: Stripe | null = null; // Stripe instance
  elements: StripeElements | null = null; // Stripe Elements instance

  @ViewChild('cardNumber') cardNumRef!: ElementRef; // Reference to card number element
  @ViewChild('cardExp') cardExpRef!: ElementRef; // Reference to card expiry element
  @ViewChild('cardCvc') cardCvcRef!: ElementRef; // Reference to card CVC element

  @Output() paymentConfirmed = new EventEmitter<any>(); // Event emitter for payment confirmation

  cardNumber: any; // Card number element
  cardExp: any; // Card expiry element
  cardCvc: any; // Card CVC element

  isValidatingCard: boolean = false; // Loading state
  error: string = ''; // Error message
  token: any;
  isStripeLoaded: boolean = false; // Flag to track Stripe.js initialization

  constructor(private ngZone: NgZone) {}

  async ngOnInit() {
    // Load Stripe.js with your publishable key
   this.stripe = await loadStripe(environment.STRIPE_PK);

    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.isStripeLoaded = true; // Mark Stripe.js as loaded
      this.initializeStripeElements(); // Initialize Stripe Elements
    }
  }

  ngAfterViewInit(): void {
    // If Stripe.js is already loaded, initialize Stripe Elements
    if (this.isStripeLoaded) {
      this.initializeStripeElements();
    }
  }

  initializeStripeElements(): void {
    if (
      this.elements &&
      this.cardNumRef &&
      this.cardExpRef &&
      this.cardCvcRef
    ) {
      // Create card elements
      this.cardNumber = this.elements.create('cardNumber', { style });
      this.cardNumber.mount(this.cardNumRef.nativeElement);

      this.cardExp = this.elements.create('cardExpiry', { style });
      this.cardExp.mount(this.cardExpRef.nativeElement);

      this.cardCvc = this.elements.create('cardCvc', { style });
      this.cardCvc.mount(this.cardCvcRef.nativeElement);

      // Add event listeners for real-time validation
      this.cardNumber.on('change', this.onChange.bind(this));
      this.cardExp.on('change', this.onChange.bind(this));
      this.cardCvc.on('change', this.onChange.bind(this));
    }
  }

  ngOnDestroy() {
    // Clean up event listeners and destroy elements
    if (this.cardNumber) {
      this.cardNumber.off('change', this.onChange);
      this.cardNumber.destroy();
    }
    if (this.cardExp) {
      this.cardExp.off('change', this.onChange);
      this.cardExp.destroy();
    }
    if (this.cardCvc) {
      this.cardCvc.off('change', this.onChange);
      this.cardCvc.destroy();
    }
  }

  onChange(event: { error?: { message: string } }): void {
    // Handle real-time validation errors
    if (event.error) {
      this.error = event.error.message;
    } else {
      this.error = '';
    }
  }

  async onSubmit() {
    this.isValidatingCard = true;

    if (!this.stripe || !this.elements) {
      console.error('Stripe.js has not been initialized.');
      return;
    }

    // Create a payment method using the card elements
    const { token, error } = await this.stripe.createToken(this.cardNumber);
    
    this.isValidatingCard = false;

    if (error) {
      // Show error to the user
      this.error = error.message || 'An error occurred.';
    } else {
      this.token = token;
      // Emit the token to the parent component or handle it as needed
      this.ngZone.run(() => {
        this.paymentConfirmed.emit(token);
      });
    }
  }

  isCardValid(): boolean {
    // Check if all card fields are complete
    return (
      this.cardNumber?._complete &&
      this.cardExp?._complete &&
      this.cardCvc?._complete
    );
  }
}

// Stripe Elements style
const style = {
  base: {
    iconColor: '#666EE8',
    color: '#31325F',
    lineHeight: '40px',
    fontWeight: 300,
    fontFamily: 'Helvetica Neue',
    fontSize: '15px',
    '::placeholder': {
      color: '#CFD7E0',
    },
  },
};
