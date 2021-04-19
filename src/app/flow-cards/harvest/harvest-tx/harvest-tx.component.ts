import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {WebsocketService} from '../../../services/websocket.service';
import {HttpService} from '../../../services/http/http.service';
import {NGXLogger} from 'ngx-logger';
import {HarvestDto} from '../../../models/harvest-dto';
import {WsConsumer} from '../../../services/ws-consumer';
import {PricesCalculationService} from '../../../services/prices-calculation.service';
import {StaticValues} from '../../../static/static-values';
import {ViewTypeService} from '../../../services/view-type.service';
import {SnackService} from '../../../services/snack.service';
import {HardWorkDto} from '../../../models/hardwork-dto';
import {RewardDto} from '../../../models/reward-dto';
import { CustomModalComponent } from 'src/app/dialogs/custom-modal/custom-modal.component';
import {ContractsService} from '../../../services/contracts.service';
import {Vault} from '../../../models/vault';
import {Observable, Subscriber} from 'rxjs';
import {map} from 'rxjs/operators';
import {HarvestsService} from '../../../services/http/harvests.service';
import {HardworksService} from '../../../services/http/hardworks.service';
import {RewardsService} from '../../../services/http/rewards.service';

@Component({
  selector: 'app-harvest-tx',
  templateUrl: './harvest-tx.component.html',
  styleUrls: ['./harvest-tx.component.scss']
})
export class HarvestTxComponent implements AfterViewInit, WsConsumer {
  dtos: HarvestDto[] = [];
  subscribed = false;
  txIds = new Set<string>();
  vaultFilter = 'all';
  private maxMessages = 50;
  @ViewChild('harvestHistoryModal') private harvestHistoryModal: CustomModalComponent;

  constructor(private ws: WebsocketService,
              private httpService: HttpService,
              private cdRef: ChangeDetectorRef,
              private pricesCalculationService: PricesCalculationService,
              public vt: ViewTypeService,
              private snack: SnackService,
              private log: NGXLogger,
              private  contractsService: ContractsService,
              private  harvestsService: HarvestsService,
              private  hardworksService: HardworksService,
              private  rewardsService: RewardsService,
  ) {
  }

  get tvlNames(): Observable<string[]> {
    return this.contractsService.getContracts(Vault).pipe(
        map(vaults => vaults.map(_ => _.contract.name))
    );
  }

  setSubscribed(s: boolean): void {
    this.subscribed = s;
  }

  isSubscribed(): boolean {
    return this.subscribed;
  }

  ngAfterViewInit(): void {
    this.loadLastHarwests(() => this.loadLastTvls(() => {
          this.loadLastHardWorks();
          // this.loadLastRewards();
        })
    );

    this.initWs();
    // this.priceSubscriberService.initWs();
  }

  public initWs(): void {
    if (this.ws.registerConsumer(this) && !this.subscribed) {
      this.subscribeToTopic();
    }
  }

  public subscribeToTopic(): void {
    this.log.info('Harvest Subscribe on topic');
    this.subscribed = true;
    this.ws.onMessage('/topic/harvest', (m => HarvestDto.fromJson(m.body)))
    ?.subscribe(tx => {
      try {
        this.log.debug('harvest tx', tx);
        if (tx.methodName === 'price_stub') {
          return;
        }
        this.snack.openSnack(tx.print());
        if (!this.isUniqTx(tx)) {
          this.log.error('Not unique', tx);
          return;
        }
        this.addInArray(this.dtos, tx);
      } catch (e) {
        this.log.error('Error harvest', e, tx);
      }
    });
  }

  private loadLastHarwests(next: () => void): void {
    this.harvestsService.getHarvestTxHistoryData().subscribe(data => {
      this.log.debug('harvest data fetched', data);
      data?.forEach(tx => {
        HarvestDto.enrich(tx);
        this.addInArray(this.dtos, tx);
      });
      next();
    });
  }

  private loadLastTvls(next: () => void): void {
    this.harvestsService.getLastTvls().subscribe(data => {
      this.log.debug('Loaded last tvls ', data);
      data?.forEach(tvl => {
        HarvestDto.enrich(tvl);
        this.pricesCalculationService.writeFromHarvestTx(tvl);
      });

      this.log.debug('All tvl values loaded');
      next();
    });
  }

  private loadLastHardWorks(): void {
    this.hardworksService.getLastHardWorks().subscribe(data => {
      data?.forEach(hardWork => {
        HardWorkDto.enrich(hardWork);
        this.pricesCalculationService.saveHardWork(hardWork);
      });
      this.log.debug('Loaded last hardworks ', data, this.pricesCalculationService.lastHardWorks);
    });
  }

  // private loadLastRewards(): void {
  //   this.rewardsService.getLastRewards().subscribe(data => {
  //     data?.forEach(reward => {
  //       RewardDto.enrich(reward);
  //       this.pricesCalculationService.saveReward(reward);
  //     });
  //     this.log.debug('Loaded last rewards ', data);
  //   });
  // }

  private isUniqTx(tx: HarvestDto): boolean {
    if (this.txIds.has(tx.id)) {
      return false;
    }
    this.txIds.add(tx.id);
    if (this.txIds.size > 100_000) {
      this.txIds = new Set<string>();
    }
    return true;
  }

  private addInArray(arr: HarvestDto[], tx: HarvestDto): void {
    this.pricesCalculationService.writeFromHarvestTx(tx);
    arr.unshift(tx);
    if (arr.length > this.maxMessages) {
      arr.pop();
    }
  }

  openHarvestHistory(): void {
    this.harvestHistoryModal.open();
  }
}
