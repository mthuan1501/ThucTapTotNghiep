import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LayoutComponent } from "./_layout/layout.component";
import { RoleGuard } from '../modules/auth/_services/auth.guard'; // Adjust the path to your AuthGuard

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "builder",
        loadChildren: () =>
          import("./builder/builder.module").then((m) => m.BuilderModule),
      },
      {
        path: "dashboard",
        loadChildren: () =>
          import(
            "./JeeBeginner/page-girdters-dashboard/page-girdters-dashboard.module"
          ).then((m) => m.PageGirdtersDashboardModule),
      },
      {
        path: "Management/CustomerManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/CustomerManagement/customer-management.module"
          ).then((m) => m.CustomerManagementModule),
      },
      {
        path: "Management/PartnerManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/PartnerManagement/partner-management.module"
          ).then((m) => m.PartnerManagementModule),
      },
      {
        path: "Management/AccountManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/AccountManagement/account-management.module"
          ).then((m) => m.AccountManagementModule),
      },
      {
        path: "Management/TaikhoanManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/TaikhoanManagement/taikhoan-management.module"
          ).then((m) => m.TaikhoanManagementModule),
      },
      {
        path: "Management/AccountRoleManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/AccountRoleManagement/accountrole-management.module"
          ).then((m) => m.AccountRoleManagementModule),
      },
      {
        path: "Management/DanhMucManagement/LoaiMatHangManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/LoaiMatHangManagement/loaimathang-management.module"
          ).then((m) => m.LoaiMatHangManagementModule),
          canActivate: [RoleGuard], 
          data: { role: '3502' } 
      },
      {
        path: "Management/DanhMucManagement/DVTManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/DVTManagement/dvt-management.module"
          ).then((m) => m.DVTManagementModule),
          canActivate: [RoleGuard], 
          data: { role: '3503' } 
      },
      {
        path: "Management/DanhMucManagement/NhanHieuManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/NhanHieuManagement/nhanhieu-management.module"
          ).then((m) => m.NhanHieuManagementModule),
          canActivate: [RoleGuard], // Thêm guard vào route
          data: { role: '3610' } // Chỉ định quyền truy cập cần thiết
      },
      {
        path: "Management/DanhMucManagement/XuatXuManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/XuatXuManagement/xuatxu-management.module"
          ).then((m) => m.XuatXuManagementModule), canActivate: [RoleGuard], // Thêm guard vào route
          data: { role: '3700' } // Chỉ định quyền truy cập cần thiết
      },
      {
        path: "Management/DanhMucManagement/DoiTacBaoHiemManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/DoiTacBaoHiemManagement/doitacbaohiem-management.module"
          ).then((m) => m.DoiTacBaoHiemManagementModule),
      },
      {
        path: "Management/DanhMucManagement/LoaiTaiSanManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/LoaiTaiSanManagement/loaitaisan-management.module"
          ).then((m) => m.LoaiTaiSanManagementModule),
      },
      {
        path: "Management/DanhMucManagement/NhomTaiSanManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/NhomTaiSanManagement/nhomtaisan-management.module"
          ).then((m) => m.NhomTaiSanManagementModule),
      },
      {
        path: "Management/DanhMucManagement/LyDoTangGiamTaiSanManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/LyDoTangGiamTaiSanManagement/lydotanggiamtaisan-management.module"
          ).then((m) => m.LyDoTangGiamTaiSanManagementModule),
      },
      {
        path: "Management/DanhMucManagement/MatHangManagement",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/DanhMucManagement/MatHangManagement/mathang-management.module"
          ).then((m) => m.MatHangManagementModule),
      },
      {
        path: "Abc",
        loadChildren: () =>
          import(
            "./JeeBeginner/Management/AccountManagement/account-management.module"
          ).then((m) => m.AccountManagementModule),
      },
      {
        path: "",
        redirectTo: "/Management/CustomerManagement",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "error/404",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
