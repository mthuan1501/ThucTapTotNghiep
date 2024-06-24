import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BehaviorSubject, of, ReplaySubject, Subscription } from "rxjs";
import { AuthService } from "src/app/modules/auth/_services/auth.service";
import {
  LayoutUtilsService,
  MessageType,
} from "../../../../_core/utils/layout-utils.service";
import {
  ResultModel,
  ResultObjModel,
} from "../../../../_core/models/_base.model";
import { DatePipe } from "@angular/common";
import { finalize, tap } from "rxjs/operators";
import { PaginatorState } from "src/app/_metronic/shared/crud-table";
import { DoiTacBaoHiemManagementService } from "../Services/doitacbaohiem-management.service";
import { DoiTacBaoHiemModel } from "../Model/doitacbaohiem-management.model";
import { TranslateService } from "@ngx-translate/core";
import { GeneralService } from "../../../../_core/services/general.service";

@Component({
  selector: "app-doitacbaohiem-management-edit-dialog",
  templateUrl: "./doitacbaohiem-management-edit-dialog.component.html",
  styleUrls: ["./StylePhongTo.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoiTacBaoHiemManagementEditDialogComponent
  implements OnInit, OnDestroy
{
  item: DoiTacBaoHiemModel = new DoiTacBaoHiemModel();
  itemkho: DoiTacBaoHiemModel = new DoiTacBaoHiemModel();
  isLoading;
  formGroup: FormGroup;
  khoFilters: DoiTacBaoHiemModel[] = [];
  loaiMHFilters: DoiTacBaoHiemModel[] = [];
  private subscriptions: Subscription[] = [];
  isExpanded = false;
  KhofilterForm: FormControl;
  loaiMHfilterForm: FormControl;
  isInitData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoadingSubmit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DoiTacBaoHiemManagementEditDialogComponent>,
    private fb: FormBuilder,
    public doitacbaohiemManagementService: DoiTacBaoHiemManagementService,
    private changeDetect: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    public general: GeneralService,
    public authService: AuthService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
  getTitle() {
    if (this.item.RowId === 0) {
      return this.translateService.instant('Thêm mới');
    }
    return this.translateService.instant('Chỉnh sửa')
  }
  ngOnInit(): void {
    this.item.empty();
    this.item.Id_DV = this.data.item.Id_DV;
    this.loadForm();
    const sb = this.doitacbaohiemManagementService.isLoading$.subscribe(
      (res) => {
        this.isLoading = res;
      }
    );
    this.subscriptions.push(sb);
    this.loadInitData();
  }
  loadInitData() {
    if (this.item.Id_DV !== 0) {
      const sbGet = this.doitacbaohiemManagementService
        .GetDoiTacBaoHiemID(this.item.Id_DV)
        .pipe(
          tap((res: ResultObjModel<DoiTacBaoHiemModel>) => {
            if (res.status === 1) {
              this.item = res.data;
              this.setValueToForm(res.data);
            }
          })
        )
        .subscribe();
      this.subscriptions.push(sbGet);
    }
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
  loadForm() {
    this.formGroup = this.fb.group({
      TenDonVi: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ],
      DiaChi: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ],
      SoDT: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.maxLength(50),
        ]),
      ],
      NguoiLienHe: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ],
      GhiChu: ["", Validators.compose([Validators.maxLength(500)])],
    });
  }

  setValueToForm(model: DoiTacBaoHiemModel) {
    if (this.item.Id_DV !== 0) this.Visible = false;
    this.formGroup.controls.TenDonVi.setValue(model.TenDonVi);
    this.formGroup.controls.DiaChi.setValue(model.DiaChi);
    this.formGroup.controls.SoDT.setValue(model.SoDT);
    this.formGroup.controls.NguoiLienHe.setValue(model.NguoiLienHe);
    this.formGroup.controls.GhiChu.setValue(model.GhiChu);
  }

  private prepareData(): DoiTacBaoHiemModel {
    let model = new DoiTacBaoHiemModel();
    model.empty();
    model.Id_DV = this.item.Id_DV;
    model.TenDonVi = this.formGroup.controls.TenDonVi.value;
    model.DiaChi = this.formGroup.controls.DiaChi.value;
    model.SoDT = this.formGroup.controls.SoDT.value;
    model.NguoiLienHe = this.formGroup.controls.NguoiLienHe.value;
    model.GhiChu = this.formGroup.controls.GhiChu.value;
    return model;
  }
  onMouseEnter(event: any, color: string) {
    event.target.style.backgroundColor = color;
  }

  onMouseLeave(event: any, color: string) {
    event.target.style.backgroundColor = color;
  }
  Luu() {
    debugger;
    if (this.formGroup.valid) {
      const model = this.prepareData();
      this.item.Id_DV === 0 ? this.create(model) : this.update(model);
    } else {
      this.validateAllFormFields(this.formGroup);
    }
  }
  LuuVaThemMoi() {
    if (this.formGroup.valid) {
      const model = this.prepareData();
      if (this.item.Id_DV === 0) {
        this.createNew(model);
      } else {
        this.update(model);
      }
    } else {
      this.validateAllFormFields(this.formGroup);
    }
  }
  Visible: boolean = true;
  handleKeyDown(event: KeyboardEvent) {
    // Kiểm tra nếu cả Ctrl và Enter đều được nhấn cùng lúc
    if (event.ctrlKey && event.key === "Enter") {
      // Gọi hàm lưu và đóng modal
      this.Luu();
      // Ngăn chặn hành vi mặc định của trình duyệt
      event.preventDefault();
    }
  }
  createNew(item: DoiTacBaoHiemModel) {
    this.isLoadingSubmit$.next(true);
    if (
      !this.authService.currentUserValue.IsMasterAccount ||
      this.authService.currentUserValue.IsMasterAccount
    )
      this.doitacbaohiemManagementService
        .DM_DoiTacBaoHiem_Insert(item)
        .subscribe((res) => {
          this.isLoadingSubmit$.next(false);
          if (res && res.status === 1) {
            this.formGroup.reset();
            Object.keys(this.formGroup.controls).forEach((key) => {
              this.formGroup.get(key).setErrors(null);
            });
            this.setValueToForm(this.item);
            this.layoutUtilsService.showActionNotification(
              "Thêm mới thành công",
              MessageType.Create,
              3000,
              true,
              false
            );
          } else {
            this.layoutUtilsService.showActionNotification(
              res.error.message,
              MessageType.Read,
              999999999,
              true,
              false,
              3000,
              "top",
              0
            );
          }
        });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  create(item: DoiTacBaoHiemModel) {
    this.isLoadingSubmit$.next(true);
    if (
      !this.authService.currentUserValue.IsMasterAccount ||
      this.authService.currentUserValue.IsMasterAccount
    )
      this.doitacbaohiemManagementService
        .DM_DoiTacBaoHiem_Insert(item)
        .subscribe((res) => {
          this.isLoadingSubmit$.next(false);
          if (res && res.status === 1) {
            this.dialogRef.close(res);
          } else {
            this.layoutUtilsService.showActionNotification(
              res.error.message,
              MessageType.Read,
              999999999,
              true,
              false,
              3000,
              "top",
              0
            );
          }
        });
  }

  update(item: DoiTacBaoHiemModel) {
    debugger;
    this.isLoadingSubmit$.next(true);
    this.doitacbaohiemManagementService
      .UpdateDoiTacBaoHiem(item)
      .subscribe((res) => {
        this.isLoadingSubmit$.next(false);
        if (res && res.status === 1) {
          this.dialogRef.close(res);
        } else {
          this.layoutUtilsService.showActionNotification(
            res.error.message,
            MessageType.Read,
            999999999,
            true,
            false,
            3000,
            "top",
            0
          );
        }
      });
  }

  goBack() {
    if (this.checkDataBeforeClose()) {
      this.dialogRef.close();
    } else {
      const _title = this.translateService.instant("CHECKPOPUP.TITLE");
      const _description = this.translateService.instant(
        "CHECKPOPUP.DESCRIPTION"
      );
      const _waitDesciption = this.translateService.instant(
        "CHECKPOPUP.WAITDESCRIPTION"
      );
      const popup = this.layoutUtilsService.deleteElement(
        _title,
        _description,
        _waitDesciption
      );
      popup.afterClosed().subscribe((res) => {
        res ? this.dialogRef.close() : undefined;
      });
    }
  }

  checkDataBeforeClose(): boolean {
    const model = this.prepareData();
    if (this.item.Id_DV === 0) {
      const empty = new DoiTacBaoHiemModel();
      empty.empty();
      return this.general.isEqual(empty, model);
    }
    return this.general.isEqual(model, this.item);
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeunloadHandler(e) {
    if (!this.checkDataBeforeClose()) {
      e.preventDefault(); //for Firefox
      return (e.returnValue = ""); //for Chorme
    }
  }
}
