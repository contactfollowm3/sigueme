import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaymentComponent } from "./payment.component";
import { PaymentService } from "./share/payment.service";


@NgModule({
  declarations: [PaymentComponent],
  imports: [CommonModule],
  exports: [PaymentComponent],
  providers: [PaymentService],
})
export class PaymentModule {}