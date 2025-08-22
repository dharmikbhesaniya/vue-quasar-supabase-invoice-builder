import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // { path: "", component: () => import("pages/TodoPage.vue") },
      {
        path: "/",
        component: () => import("pages/TemplatesPage.vue"),
        name: "Templates",
      },
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
        path: "/forms",
        name: "FormsList",
        component: () => import("pages/FormsList.vue"),
        meta: { title: "Custom Forms" },
      },
      {
        path: "/forms/create",
        name: "CreateForm",
        component: () => import("pages/form/CustomFormBuilder.vue"),
        meta: { title: "Create Form" },
      },
      {
        path: "/forms/:id/edit",
        name: "EditForm",
        component: () => import("pages/form/CustomFormBuilder.vue"),
        meta: { title: "Edit Form" },
      },
      {
        path: "/forms/:id/fill",
        name: "FillForm",
        component: () => import("pages/FormFill.vue"),
        meta: { title: "Fill Form" },
      },
      {
        path: "/forms/:id/view",
        name: "ViewForm",
        component: () => import("pages/FormFill.vue"),
        meta: { title: "View Form" },
        props: { readonly: true },
      },
      // TODO: below page are not required now
      {
        path: "/forms/:id/submissions",
        name: "FormSubmissions",
        component: () => import("pages/FormSubmissions.vue"),
        meta: { title: "Form Submissions" },
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
