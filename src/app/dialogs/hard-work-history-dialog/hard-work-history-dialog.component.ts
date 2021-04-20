import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, ViewChild} from '@angular/core';
import {HttpService} from '../../services/http/http.service';
import {ViewTypeService} from '../../services/view-type.service';
import {NGXLogger} from 'ngx-logger';
import {ChartBuilder} from '../../chart/chart-builder';
import {ChartGeneralMethodsComponent} from 'src/app/chart/chart-general-methods.component';
import {IChartApi} from 'lightweight-charts';
import {HardworksService} from '../../services/http/hardworks.service';

@Component({
  selector: 'app-hard-work-history-dialog',
  templateUrl: './hard-work-history-dialog.component.html',
  styleUrls: ['./hard-work-history-dialog.component.scss']
})
export class HardWorkHistoryDialogComponent extends ChartGeneralMethodsComponent implements AfterViewInit {
  @ViewChild('chart') chartEl: ElementRef;
  @Input() public data: Record<any, any>;
  ready = false;
  chart: IChartApi;

  constructor(private httpService: HttpService,
              public vt: ViewTypeService,
              private cdRef: ChangeDetectorRef,
              private log: NGXLogger,
              private hardworksService: HardworksService,
              ) {
                super();
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.hardworksService.getHardWorkHistoryData().subscribe(data => {
      this.log.debug('History of All Hard Works loaded ', data);
      const chartBuilder = new ChartBuilder();
      const hwFees = new Map<number, number>();
      let savedGas = 0;
      data?.forEach(dto => {
        savedGas += dto.savedGasFees;
        hwFees.set(dto.blockDate, savedGas);
      });
      chartBuilder.initVariables(1);
      hwFees.forEach((fees, date) => chartBuilder.addInData(0, date, fees / 1000000));
      this.handleData(chartBuilder, [
        ['Saved Gas Fees M$', 'right', '#0085ff']
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
