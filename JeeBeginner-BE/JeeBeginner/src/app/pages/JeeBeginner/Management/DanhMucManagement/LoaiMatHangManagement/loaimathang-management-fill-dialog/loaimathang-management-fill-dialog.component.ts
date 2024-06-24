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
import { LoaiMatHangManagementService } from "../Services/loaimathang-management.service";
import { LoaiMatHangModel } from "../Model/loaimathang-management.model";
import { TranslateService } from "@ngx-translate/core";
import { GeneralService } from "../../../../_core/services/general.service";
import { debug } from "console";

@Component({
  selector: "app-loaimathang-management-fill-dialog",
  templateUrl: "./loaimathang-management-fill-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaiMatHangManagementFillDialogComponent
  implements OnInit, OnDestroy
{
  item: LoaiMatHangModel = new LoaiMatHangModel();
  // itemcha: LoaiMatHangModel = new LoaiMatHangModel();
  // itemkho: LoaiMatHangModel = new LoaiMatHangModel();
  isLoading;
  formGroup: FormGroup;
  khoFilters: LoaiMatHangModel[] = [];
  loaiMHFilters: LoaiMatHangModel[] = [];
  private subscriptions: Subscription[] = [];
  KhofilterForm: FormControl;
  loaiMHfilterForm: FormControl;
  isInitData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoadingSubmit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LoaiMatHangManagementFillDialogComponent>,
    private fb: FormBuilder,
    public loaimathangManagementService: LoaiMatHangManagementService,
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

  ngOnInit(): void {
    // this.itemkho.empty();
    // this.itemcha.empty();
    this.item.empty();
    // this.itemcha.IdLMHParent = this.data.item.IdLMHParent;
    // this.itemkho.IdKho = this.data.item.IdKho;
    this.item.IdLMH = this.data.item.IdLMH;
    this.loadForm();
    const sb = this.loaimathangManagementService.isLoading$.subscribe((res) => {
      this.isLoading = res;
    });
    this.subscriptions.push(sb);
    this.loadInitDataUpdate();

    const add = this.loaimathangManagementService
      .DM_Kho_List()
      .subscribe((res: ResultModel<LoaiMatHangModel>) => {
        if (res && res.status === 1) {
          this.khoFilters = res.data;
          this.KhofilterForm = new FormControl(this.khoFilters[0].IdKho);
          this.isInitData.next(true);
        }
      });
    this.subscriptions.push(add);
    this.loadInitData();

    const addLMHC = this.loaimathangManagementService
      .LoaiMatHangCha_List()
      .subscribe((res: ResultModel<LoaiMatHangModel>) => {
        if (res && res.status === 1) {
          this.loaiMHFilters = res.data;
          this.loaiMHfilterForm = new FormControl(
            this.loaiMHFilters[0].IdLMHParent
          );
          this.isInitData.next(true);
        }
      });
    this.subscriptions.push(addLMHC);
    this.loadInitDataLoaiMHCHA();
    this.checkboxes.valueChanges.subscribe((checkboxValues) => {
      this.toggleFields(checkboxValues);
    });

    this.toggleFields(this.checkboxes.value);
  }
  loadInitDataUpdate() {
    debugger;
    if (this.item.IdLMH !== 0) {
      const sbGet = this.loaimathangManagementService
        .GetLoaiMHID(this.item.IdLMH)
        .pipe(
          tap((res: ResultObjModel<LoaiMatHangModel>) => {
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
  loadInitData() {
    if (this.item.IdKho !== 0) {
      const sbGet = this.loaimathangManagementService
        .GetKhoID(this.item.IdKho)
        .pipe(
          tap((res: ResultObjModel<LoaiMatHangModel>) => {
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

  loadInitDataLoaiMHCHA() {
    if (this.item.IdLMHParent !== 0) {
      const sbGet = this.loaimathangManagementService
        .GetKhoID(this.item.IdLMHParent)
        .pipe(
          tap((res: ResultObjModel<LoaiMatHangModel>) => {
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
  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const url = window.webkitURL.createObjectURL(selectedFile);
      console.log(url); // Đây là URL của tệp trên máy tính
      // Làm điều gì đó với URL ở đây, ví dụ: gán vào thuộc tính của đối tượng
      this.item.HinhAnh = url;
    }
  }

  onSelectionChangeKho(event: any) {
    const selectedValue = event.target.value;
    this.item.IdKho = selectedValue;
  }
  onSelectionChangeCha(event: any) {
    const selectedValue = event.target.value;
    this.item.IdLMHParent = selectedValue;
  }

  loadForm() {
    this.formGroup = this.fb.group({
      tenloaimathang: ["", Validators.compose([Validators.maxLength(500)])],
      loaimathangcha: [
        this.item.IdLMHParent == null ? "0" : this.item.IdLMHParent.toString(),
      ],
      douutien: [
        0,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^-?(0|[0-9]\d*)?$/),
          Validators.maxLength(50),
        ]),
      ],
      mota: ["", Validators.compose([Validators.maxLength(500)])],
      checkboxes: this.fb.array([false, false, false, false]),
    });
  }

  setValueToForm(model: LoaiMatHangModel) {
    this.formGroup.controls.tenloaimathang.setValue(model.TenLMH);
    this.formGroup.controls.loaimathangcha.setValue(model.IdLMHParent);
    this.formGroup.controls.mota.setValue(model.Mota);
    this.formGroup.controls.douutien.setValue(model.DoUuTien);
  }
  get checkboxes(): FormArray {
    return this.formGroup.get("checkboxes") as FormArray;
  }

  toggleFields(checkboxValues: boolean[]) {
    const controlNames = [
      "tenloaimathang",
      "loaimathangcha",
      "douutien",
      "mota",
    ];
    controlNames.forEach((controlName, index) => {
      const control = this.formGroup.get(controlName);
      if (control) {
        if (checkboxValues[index]) {
          control.enable();
        } else {
          control.disable();
        }
      }
    });
  }
  private prepareData(): LoaiMatHangModel {
    let model = new LoaiMatHangModel();
    model.empty();
    model.TenLMH = this.formGroup.controls.tenloaimathang.value;
    model.IdLMHParent = this.formGroup.controls.loaimathangcha.value;
    model.IdKho = this.formGroup.controls.kho.value;
    model.Mota = this.formGroup.controls.mota.value;
    model.DoUuTien = this.formGroup.controls.douutien.value;
    model.IdLMH = this.item.IdLMH;
    return model;
  }
  resetForm() {
    this.formGroup.reset();

    Object.keys(this.formGroup.controls).forEach((key) => {
      this.formGroup.get(key).setErrors(null);
    });
    this.setValueToForm(this.item);
  }

  resetData() {
    this.resetForm();
  }
  Loc() {}

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
  onChangeNumber(event: any) {
    const kq = event.target.value.replace(/^0+(?=\d)/, "");
    this.formGroup.get("douutien").setValue(kq);
  }

  goBack() {
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

  @HostListener("window:beforeunload", ["$event"])
  beforeunloadHandler(e) {
    e.preventDefault(); //for Firefox
    return (e.returnValue = ""); //for Chorme
  }
}
