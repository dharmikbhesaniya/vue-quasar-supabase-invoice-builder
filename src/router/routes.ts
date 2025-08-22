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
      //--------- fo invoice------------
      // {
      //   path: "/invoice",
      //   name: "NewInvoice",
      //   component: () => import("pages/InvoicePage.vue"),
      //   meta: { title: "New Invoice" },
      // },
      // {
      //   path: "/invoice/:id",
      //   name: "EditInvoice",
      //   component: () => import("pages/InvoicePage.vue"),
      //   meta: { title: "Edit Invoice" },
      // },
      {
        path: "/invoice/:customerFormId",
        name: "invoice-create",
        component: () => import("pages/InvoicePage.vue"),
        props: true, // Pass params as props
      },
      {
        path: "/invoice/:customerFormId/:formId",
        name: "invoice-edit",
        component: () => import("pages/InvoicePage.vue"),
        props: true,
      },
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
        component: () => import("components/invoice/FormCreateEdit.vue"),
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
