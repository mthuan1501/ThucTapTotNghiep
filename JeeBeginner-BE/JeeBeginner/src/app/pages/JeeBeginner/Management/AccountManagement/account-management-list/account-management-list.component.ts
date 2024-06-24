import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { LayoutUtilsService, MessageType } from '../../../_core/utils/layout-utils.service';
import { DanhMucChungService } from '../../../_core/services/danhmuc.service';
import { QueryParamsModelNew } from '../../../_core/models/query-models/query-params.model';
import { DeleteEntityDialogComponent } from '../../../_shared/delete-entity-dialog/delete-entity-dialog.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccountManagementEditDialogComponent } from '../account-management-edit-dialog/account-management-edit-dialog.component';
import { TokenStorage } from '../../../../../modules/auth/_services/token-storage.service';
import { AccountManagementService } from '../Services/account-management.service';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { SubheaderService } from 'src/app/_metronic/partials/layout';
import { AccountModel } from '../Model/account-management.model';
import { AuthService } from 'src/app/modules/auth';
import { PartnerFilterDTO } from '../../PartnerManagement/Model/partner-management.model';
import { ResultModel } from '../../../_core/models/_base.model';
import { AccountManagementStatusDialogComponent } from '../account-management-status-dialog/account-management-status-dialog.component';

const COLOR_DANGHIEULUC = '#3699ff';
const COLOR_THANHLY = '#1bc5bd';
const COLOR_CHUAHIEULUC = '#ffa800';
const COLOR_HETHIEULUC = '#f64e60';

@Component({
  selector: 'app-account-management-list',
  templateUrl: './account-management-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AccountManagementListComponent
  implements
  OnInit,
  OnDestroy {
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isLoading: boolean;
  filterGroup: FormGroup;
  searchGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  displayedColumns = ['stt', 'username', 'tendoitac', 'hoten', 'dienthoai', 'ngaytao', 'dangnhaplancuoi', 'tinhtrang', 'thaotac'];
  partnerFilters: PartnerFilterDTO[] = [];
  constructor(
    private changeDetect: ChangeDetectorRef,
    public accountManagementService: AccountManagementService,
    private translate: TranslateService,
    public subheaderService: SubheaderService,
    private layoutUtilsService: LayoutUtilsService,
    private tokenStorage: TokenStorage,
    public dialog: MatDialog,
    public danhmuc: DanhMucChungService,
    public auth: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.filterForm();
    this.searchForm();
    this.accountManagementService.fetch();
    this.grouping = this.accountManagementService.grouping;
    this.paginator = this.accountManagementService.paginator;
    this.sorting = this.accountManagementService.sorting;
    const sb = this.accountManagementService.isLoading$.subscribe((res) => (this.isLoading = res));
    this.subscriptions.push(sb);
    const add = this.accountManagementService.getPartnerFilters().subscribe((res: ResultModel<PartnerFilterDTO>) => {
      if (res && res.status === 1) {
        this.partnerFilters = res.data;
      }
    });
    this.subscriptions.push(add);
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  // filtration
  filterForm() {
    this.filterGroup = this.fb.group({
      doitac: ['-1'],
      status: ['-1'],
    });
    this.subscriptions.push(this.filterGroup.controls.status.valueChanges.subscribe(() => this.filter()));
    this.subscriptions.push(this.filterGroup.controls.doitac.valueChanges.subscribe(() => this.filter()));
  }

  filter() {
    const filter = {};
    const status = this.filterGroup.get('status').value;
    if (status) {
      filter['status'] = status;
    }

    const doitac = this.filterGroup.get('doitac').value;
    if (doitac) {
      filter['doitac'] = doitac;
    }
    this.accountManagementService.patchState({ filter });
  }

  // search
  searchForm() {
    this.searchGroup = this.fb.group({
      searchTerm: [''],
    });
    const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
      .pipe(
        /*
      The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
      we are limiting the amount of server requests emitted to a maximum of one every 150ms
      */
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val) => this.search(val));
    this.subscriptions.push(searchEvent);
  }

  search(searchTerm: string) {
    this.accountManagementService.patchState({ searchTerm });
  }

  sort(column: string): void {
    const sorting = this.sorting;
    const isActiveColumn = sorting.column === column;
    if (!isActiveColumn) {
      sorting.column = column;
      sorting.direction = 'asc';
    } else {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    }
    this.accountManagementService.fetchStateSort({ sorting });
  }

  paginate(paginator: PaginatorState) {
    this.accountManagementService.fetchStateSort({ paginator });
  }

  getHeight(): any {
    let tmp_height = 0;
    tmp_height = window.innerHeight - 236;
    return tmp_height + 'px';
  }

  // 05/05/2021 09:40:58 => 05/05/2021
  getDate(date: string) {
    return date.split(' ')[0];
  }
  // 05/05/2021 09:40:58 => 09:40:58 05/05/2021
  getDateTime(date: string) {
    const time = date.split(' ')[1];
    const day = date.split(' ')[0];
    return time + ' ' + day;
  }

  create() {
    const item = new AccountModel();
    item.empty();
    let saveMessageTranslateParam = '';
    saveMessageTranslateParam += 'Thêm thành công';
    const saveMessage = this.translate.instant(saveMessageTranslateParam);
    const messageType = MessageType.Create;
    const dialogRef = this.dialog.open(AccountManagementEditDialogComponent, {
      data: { item: item },
      width: '900px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        this.accountManagementService.fetch();
      } else {
        this.layoutUtilsService.showActionNotification(saveMessage, messageType, 4000, true, false);
        this.accountManagementService.fetch();
      }
    });
  }

  update(item) {
    let saveMessageTranslateParam = '';
    saveMessageTranslateParam += 'Cập nhật thành công';
    const saveMessage = this.translate.instant(saveMessageTranslateParam);
    const messageType = MessageType.Create;
    const dialogRef = this.dialog.open(AccountManagementEditDialogComponent, {
      data: { item: item },
      width: '900px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        this.accountManagementService.fetch();
      } else {
        this.layoutUtilsService.showActionNotification(saveMessage, messageType, 4000, true, false);
        this.accountManagementService.fetch();
      }
    });
  }

  updateStatus(item) {
    let saveMessageTranslateParam = '';
    saveMessageTranslateParam += 'Cập nhật thành công';
    const saveMessage = this.translate.instant(saveMessageTranslateParam);
    const messageType = MessageType.Create;
    const dialogRef = this.dialog.open(AccountManagementStatusDialogComponent, {
      data: { item: item },
      width: '900px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        this.accountManagementService.fetch();
      } else {
        this.layoutUtilsService.showActionNotification(saveMessage, messageType, 4000, true, false);
        this.accountManagementService.fetch();
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(e) {
    this.auth.updateLastlogin().subscribe();
  }

  getTileStatus(value: boolean) {
    if (value) return this.translate.instant('COMMOM.TAMKHOA');
    return this.translate.instant('COMMOM.DANGSUDUNG');
  }

  getColorStatus(value: boolean) {
    if (!value) return COLOR_DANGHIEULUC;
    return COLOR_HETHIEULUC;
  }
}
