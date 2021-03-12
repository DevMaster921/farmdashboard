import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, ViewChild} from '@angular/core';
import {StaticValues} from '../../static/static-values';
import {HttpService} from '../../services/http.service';
import {ViewTypeService} from '../../services/view-type.service';
import {NGXLogger} from 'ngx-logger';
import {ChartBuilder} from '../../chart/chart-builder';
import { ChartGeneralMethodsComponent } from 'src/app/chart/chart-general-methods.component';

@Component({
  selector: 'app-gas-dialog',
  templateUrl: './gas-dialog.component.html',
  styleUrls: ['./gas-dialog.component.css']
})
export class GasDialogComponent extends ChartGeneralMethodsComponent implements AfterViewInit {
  @ViewChild('chart') chartEl: ElementRef;
  @Input('data') public data: Record<any, any>;
  ready = false;

  constructor(private httpService: HttpService,
              public vt: ViewTypeService,
              private cdRef: ChangeDetectorRef,
              private log: NGXLogger) {
                super();
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const currentDate = Math.ceil(new Date().getTime() / 1000);
    this.httpService.getHarvestTxHistoryByRange(currentDate - StaticValues.SECONDS_OF_MONTH, currentDate).subscribe(data => {
      this.log.debug('Gas price history ', data);
      const chartBuilder = new ChartBuilder();
      let prevDate = 0;
      chartBuilder.initVariables(1);
      data?.forEach(dto => {
        if (prevDate !== dto.blockDate) {
          chartBuilder.addInData(0, dto.blockDate, dto.lastGas);
        }
        prevDate = dto.blockDate;
      });
      this.handleData(chartBuilder, [
        ['Gas price', 'right', '#0085ff'],
      ]);
    });
  }

  private handleData(chartBuilder: ChartBuilder, config: string[][]): void {
    this.ready = true;
    this.cdRef.detectChanges();
    this.chart = chartBuilder.initChart(this.chartEl);
    chartBuilder.addToChart(this.chart, config);
  }
}
