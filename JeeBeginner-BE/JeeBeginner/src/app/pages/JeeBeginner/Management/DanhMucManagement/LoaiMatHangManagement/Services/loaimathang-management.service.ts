import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { Inject, Injectable } from "@angular/core";

import { QueryParamsModelNew } from "../../../../_core/models/query-models/query-params.model";
import {
  ResultModel,
  ResultObjModel,
} from "../../../../_core/models/_base.model";
import { environment } from "../../../../../../../environments/environment";
import { CATCH_ERROR_VAR } from "@angular/compiler/src/output/output_ast";
import { catchError, finalize, tap } from "rxjs/operators";
import {
  GroupingState,
  ITableState,
  PaginatorState,
  SortState,
} from "src/app/_metronic/shared/crud-table";
import { LoaiMatHangModel } from "../Model/loaimathang-management.model";
import { HttpUtilsService } from "../../../../_core/utils/http-utils.service";

const API_PRODUCTS_URL = environment.ApiRoot + "/dm_loaimathang";
const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: "",
  grouping: new GroupingState(),
  entityId: undefined,
};

@Injectable()
export class LoaiMatHangManagementService {
  // Private fields
  private _items$ = new BehaviorSubject<LoaiMatHangModel[]>([]);
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
  private _tableState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  private _errorMessage = new BehaviorSubject<string>("");
  private _subscriptions: Subscription[] = [];
  private _tableAppCodeState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  // Getters
  get items$() {
    return this._items$.asObservable();
  }

  get isLoading$() {
    return this._isLoading$.asObservable();
  }
  get isFirstLoading$() {
    return this._isFirstLoading$.asObservable();
  }
  get errorMessage$() {
    return this._errorMessage.asObservable();
  }
  get subscriptions() {
    return this._subscriptions;
  }
  get tableAppCodeState$() {
    return this._tableAppCodeState$.asObservable();
  }
  // State getters
  get paginator() {
    return this._tableState$.value.paginator;
  }
  get paginatorAppList() {
    return this._tableAppCodeState$.value.paginator;
  }
  get filter() {
    return this._tableState$.value.filter;
  }
  get sorting() {
    return this._tableState$.value.sorting;
  }
  get searchTerm() {
    return this._tableState$.value.searchTerm;
  }
  get grouping() {
    return this._tableState$.value.grouping;
  }

  constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

  public fetch() {
    this._isLoading$.next(true);
    this._errorMessage.next("");
    const request = this.findData(this._tableState$.value)
      .pipe(
        tap((res: ResultModel<LoaiMatHangModel>) => {
          if (res && res.status === 1) {
            this._items$.next(res.data);
            this._tableState$.value.paginator.total = res.panigator.TotalCount;
          } else {
            this._errorMessage.next(res.error.message);
            return of({
              items: [],
              total: 0,
            });
          }
        }),
        finalize(() => {
          this._isLoading$.next(false);
        })
      )
      .subscribe();
    this._subscriptions.push(request);
  }

  // Base Methods
  public patchState(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch();
    // đổi tên thành fetch thì chạy các chức năng còn lại bth
  }

  public fetchStateSort(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch();
  }

  public patchStateWithoutFetch(patch: Partial<ITableState>) {
    const newState = Object.assign(this._tableState$.value, patch);
    this._tableState$.next(newState);
  }

  private findData(tableState: ITableState): Observable<any> {
    this._errorMessage.next("");
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/DM_LoaiMatHang_List";
    return this.http
      .post<any>(url, tableState, {
        headers: httpHeaders,
      })
      .pipe(
        catchError((err) => {
          this._errorMessage.next(err);
          return of({ items: [], total: 0 });
        })
      );
  }
  DM_LoaiMatHang_Insert(item: LoaiMatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/DM_LoaiMatHang_Insert";
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
  UpdateLoaiMatHang(item: LoaiMatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/UpdateLoaiMatHang";
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
  DeleteLMH(item: LoaiMatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/DeleteLMH";
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
  Deletes(ids: any[] = []): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/Deletes";
    return this.http.post<any>(url, ids, { headers: httpHeaders });
  }

  getAccountModelByRowID(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetAccountByRowID?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetKhoID(IdK: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetKhoID?IdK=${IdK}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetLoaiMHChaID(lmhchaID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetLoaiMHChaID?lmhchaID=${lmhchaID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetLoaiMHID(IdLMH: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetLoaiMHID?IdLMH=${IdLMH}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetImage(IdLMH: number): Observable<Blob> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetImage?IdLMH=${IdLMH}`;
    return this.http.get(url, { headers: httpHeaders, responseType: "blob" });
  }
  SearchLMH(item: LoaiMatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/SearchLMH`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }

  getNoteLock(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetNoteLock?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }

  DM_Kho_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_Kho_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_LoaiMatHang_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_LoaiMatHang_List`;
    return this.http.post<any>(url, { headers: httpHeaders });
  }
  LoaiMatHangCha_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/LoaiMatHangCha_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  exportToExcel(whereStr: string): Observable<Blob> {
    const url = API_PRODUCTS_URL + `/export?whereStr=${whereStr}`;
    return this.http.get<Blob>(url, { responseType: "blob" as "json" });
  }
  uploadImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", imageFile);

    const url = API_PRODUCTS_URL + "/Upload"; // Sử dụng URL chính xác của bạn
    return this.http
      .post<any>(url, formData)
      .toPromise()
      .then((response) => response.filePath);
  }
  IsReadOnlyPermitAccountRole(roleName: string): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url =
      API_PRODUCTS_URL + `/IsReadOnlyPermitAccountRole?roleName=${roleName}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
}
