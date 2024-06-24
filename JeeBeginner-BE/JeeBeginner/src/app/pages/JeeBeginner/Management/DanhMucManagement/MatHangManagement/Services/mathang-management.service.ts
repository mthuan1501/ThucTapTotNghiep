import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { Inject, Injectable } from "@angular/core";

import { QueryParamsModelNew } from "../../../../_core/models/query-models/query-params.model";
import {
  ResultModel,
  ResultObjModel,
} from "../../../../_core/models/_base.model";
import { QueryParamsModel } from "../../../../_core/models/query-models/query-params.model";
import { environment } from "../../../../../../../environments/environment";
import { CATCH_ERROR_VAR } from "@angular/compiler/src/output/output_ast";
import { catchError, finalize, tap } from "rxjs/operators";
import {
  GroupingState,
  ITableState,
  PaginatorState,
  SortState,
} from "src/app/_metronic/shared/crud-table";
import { MatHangModel } from "../Model/mathang-management.model";
import { QueryResultsModel } from "../../../../_core/models/query-models/query-results.model";
import { HttpUtilsService } from "../../../../_core/utils/http-utils.service";
import { AnyARecord } from "dns";

const API_PRODUCTS_URL = environment.ApiRoot + "/dm_mathang";
const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: "",
  grouping: new GroupingState(),
  entityId: undefined,
};

@Injectable()
export class MatHangManagementService {
  // Private fields
  lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(
    new QueryParamsModel({}, "asc", "", 0, 10)
  );
  public _items$ = new BehaviorSubject<MatHangModel[]>([]);
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _itemstemp$ = new MatHangModel();
  private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
  private _tableState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  private _errorMessage = new BehaviorSubject<string>("");
  private _subscriptions: Subscription[] = [];
  private _tableAppCodeState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  public Visible: boolean;

  // Getters
  get items$() {
    return this._items$.asObservable();
  }
  get itemstemp$() {
    return this._itemstemp$;
  }
  setitemstemp(value: MatHangModel) {
    this._itemstemp$ = value;
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
        tap((res: ResultModel<MatHangModel>) => {
          if (res && res.status === 1) {
            this.Visible = res.Visible;
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
    const url = API_PRODUCTS_URL + "/DM_MatHang_List";
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
  getData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
    const url = API_PRODUCTS_URL + "/DM_MatHang_List";
    return this.http.post<QueryResultsModel>(url, null, {
      headers: httpHeaders,
      params: httpParams,
    });
  }
  DM_MatHang_Insert(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/DM_MatHang_Insert";
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
  UpdateMatHang(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/UpdateMatHang";
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
  DeleteMH(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + "/DeleteMH";
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
  DeleteMHs(ids: any[] = []): Observable<any> {
    const url = API_PRODUCTS_URL + "/DeleteMHs";
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    return this.http.post<any>(url, ids, { headers: httpHeaders });
  }

  getAccountModelByRowID(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetAccountByRowID?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetMatHangID(IdMH: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetMatHangID?IdMH=${IdMH}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetKhoID(IdK: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetKhoID?IdK=${IdK}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }

  DM_DVT_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_DVT_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_NhanHieu_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_NhanHieu_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_LoaiMatHang_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_LoaiMatHang_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_XuatXu_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_XuatXu_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetLoaiMHChaID(lmhchaID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetLoaiMHChaID?lmhchaID=${lmhchaID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  SearchLMH(TenLMH: string): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/SearchLMH?TenLMH=${TenLMH}`;
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
  MatHangCha_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/MatHangCha_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  importData(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    const url = API_PRODUCTS_URL + `/import`;
    return this.http.post<any>(url, formData);
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
  exportToExcel(): Observable<Blob> {
    const url = API_PRODUCTS_URL + "/TaiFileMau"; // Replace YOUR_API_URL with your actual API endpoint
    return this.http.get<Blob>(url, { responseType: "blob" as "json" });
  }
  IsReadOnlyPermitAccountRole(roleName: string): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url =
      API_PRODUCTS_URL + `/IsReadOnlyPermitAccountRole?roleName=${roleName}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
}
