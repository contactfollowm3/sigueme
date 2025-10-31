import { NgModule } from '@angular/core';
import { MapComponent } from './map.component';
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { CamelizePipe } from 'ngx-pipes';


@NgModule({
  declarations: [
    MapComponent
  ],
  exports: [
    MapComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      //apiKey: "AIzaSyBpd58imJ4igvFwbHKqTyynIdZJqbDO7o0"
      //apiKey: "AIzaSyC6N89vctbjidctpbRGIXVMxYu4QGiPEsk" 
      apiKey: "AIzaSyDJ9pKtlH2anTPTwQhVeLRxhpQSNVpRBLU"   //this is the real 
    }),
    CommonModule
  ],
  providers: [
    MapService,
    CamelizePipe
  ] 
})
export class MapModule { }
