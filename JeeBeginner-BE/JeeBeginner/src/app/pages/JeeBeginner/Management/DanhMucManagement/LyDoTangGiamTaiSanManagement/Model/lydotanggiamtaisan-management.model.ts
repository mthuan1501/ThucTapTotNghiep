export class LyDoTangGiamTaiSanModel {
  IdRow: number;
  LoaiTangGiam: number;
  MaTangGiam: string;
  TenTangGiam: string;
  TrangThai: boolean;
RowId : number;
  empty() {
    this.IdRow = 0;
    this.LoaiTangGiam = 0;
    this.MaTangGiam = "";
    this.TenTangGiam = "";
    this.TrangThai = false;
    this.RowId =0;
  }
}
