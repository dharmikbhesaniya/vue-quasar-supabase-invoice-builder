import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // { path: "", component: () => import("pages/TodoPage.vue") },
      // {
      //   path: "",
      //   component: () => import("pages/DashboardPage.vue"),
      //   name: "Dashboard",
      // },
      // {
      //   path: "/invoices",
      //   component: () => import("pages/InvoiceListPage.vue"),
      //   name: "InvoiceList",
      // },
      // {
      //   path: "/invoice/new",
      //   component: () => import("pages/InvoicePage.vue"),
      //   name: "NewInvoice",
      // },
      // {
      //   path: "/invoice/edit/:id",
      //   component: () => import("components/InvoiceEditor.vue"),
      //   name: "EditInvoice",
      // },
      {
        path: "/",
        component: () => import("pages/TemplatesPage.vue"),
        name: "Templates",
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
