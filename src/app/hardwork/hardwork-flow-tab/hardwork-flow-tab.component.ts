import { Component, Input, OnInit } from '@angular/core';
import {HardWorkDto} from '../../models/hardwork-dto';
import { ViewTypeService } from '../../services/view-type.service';

@Component({
  selector: 'app-hardwork-flow-tab',
  templateUrl: './hardwork-flow-tab.component.html',
  styleUrls: ['./hardwork-flow-tab.component.css']
})
export class HardworkFlowTabComponent implements OnInit {
  @Input() dtos: HardWorkDto[] = [];
  @Input() maxHeight: 600;
  @Input() showFullDate = false;
  @Input() vaultFilter = 'all';
  @Input() showMoreColumns = false;
  constructor(public vt: ViewTypeService) { }

  ngOnInit(): void {
  }

}
