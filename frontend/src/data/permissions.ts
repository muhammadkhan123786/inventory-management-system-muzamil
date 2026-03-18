import { nanoid } from "nanoid";
import {
  LayoutDashboard,
  
  ListTree,
  Boxes,
  Package,
  Wrench,
  ShoppingCart,
  PackageX,
  PackageCheck,
  Store,
  Database,
  Wallet,
  Receipt,
 
  Activity,
  Radio,
  
  ShieldCheck,
  Globe,
  Tags,
  Scale,
  Warehouse,
   Maximize,
  Settings,
  
  Briefcase,
  
  MapPin,
  CreditCard,
  HandCoins,
  FileText,
 
} from "lucide-react";
import { INavBarLinkSharedInterface } from "@common/INavBarLinkSharedInterface";

export const navigation: INavBarLinkSharedInterface[] = [
  // {
  //   _id: nanoid(),
  //   label: "Dashboard",
  //   href: "/dashboard",
  //   icon: LayoutDashboard,
  //   roleId: [1, 2],
  // },

 

  //quotation

  /* ================= INVENTORY SYSTEM ================= */
  {
    _id: nanoid(),
    label: "Inventory System",
    href: "#",
    icon: Boxes,
    roleId: [1],
    subItems: [
      {
        _id: nanoid(),
        label: "Product Catalog",
        href: "/dashboard/product-catalog",
        icon: ListTree,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Product Registration",
        href: "/dashboard/product-register",
        icon: FileText,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Product Listing",
        href: "/dashboard/product",
        icon: Package,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Parts Inventory",
        href: "/dashboard/parts",
        icon: Wrench,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Purchase Orders",
        href: "/dashboard/product-Orders",
        icon: ShoppingCart,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Goods Received Notes",
        href: "/dashboard/product-goods-received",
        icon: PackageX,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Goods Return Notes",
        href: "/dashboard/product-goods-return",
        icon: PackageCheck,
        roleId: [1],
      },
      // {
      //   _id: nanoid(),
      //   label: "Marketplace Distribution",
      //   href: "/dashboard/inventory-dashboard/marketplace-distribution",
      //   icon: BarChart3,
      //   roleId: [1],
      // },
      // {
      //   _id: nanoid(),
      //   label: "Marketplace Connections",
      //   href: "/dashboard/inventory-dashboard/marketplace-connections",
      //   icon: Store,
      //   roleId: [1],
      // },
    ],
  },

  /* ================= INVENTORY MASTER DATA ================= */
  {
    _id: nanoid(),
    label: "Inventory Master Data",
    href: "#",
    icon: Database,
    roleId: [1],
    subItems: [
      {
        _id: nanoid(),
        label: "Warehouses",
        href: "/dashboard/inventory-masterdata/warehouses",
        icon: Warehouse,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Currencies",
        href: "/dashboard/inventory-masterdata/currencies",
        icon: Wallet,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Payment Terms",
        href: "/dashboard/inventory-masterdata/payment-terms",
        icon: Receipt,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Order Status",
        href: "/dashboard/inventory-masterdata/order-status",
        icon: Activity,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Product Channel",
        href: "/dashboard/inventory-masterdata/product-channel",
        icon: Radio,
        roleId: [1],
      },
      
      {
        _id: nanoid(),
        label: "Item Conditions",
        href: "/dashboard/inventory-masterdata/item-conditions",
        icon: ShieldCheck,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Product Source",
        href: "/dashboard/inventory-masterdata/product-source",
        icon: Globe,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Tax",
        href: "/dashboard/inventory-masterdata/tax",
        icon: Receipt,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Units",
        href: "/dashboard/inventory-masterdata/units",
        icon: Scale,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Warehouse Status",
        href: "/dashboard/inventory-masterdata/warehouse-status",
        icon: Warehouse,
        roleId: [1],
      },
    
      {
        _id: nanoid(),
        label: "Sizes",
        href: "/dashboard/inventory-masterdata/sizes",
        icon: Maximize,
        roleId: [1],
      },
         {
        _id: nanoid(),
        label: "Job Titles",
        href: "/dashboard/inventory-masterdata/job-title",
        icon: Tags,
        roleId: [1],
      },
       {
        _id: nanoid(),
        label: "Country",
        href: "/dashboard/inventory-masterdata/country",
        icon: Globe,
        roleId: [1],
      },
       {
        _id: nanoid(),
        label: "Product & Services",
        href: "/dashboard/inventory-masterdata/product-services",
        icon: ShoppingCart,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "City",
        href: "/dashboard/inventory-masterdata/city",
        icon: MapPin,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Payment Method",
        href: "/dashboard/inventory-masterdata/payment-method",
        icon: CreditCard,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Pricing Agreement",
        href: "/dashboard/inventory-masterdata/pricing-agreement",
        icon: HandCoins,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Business Types",
        href: "/dashboard/inventory-masterdata/business-types",
        icon: Briefcase,
        roleId: [1],
      },
     
        
      ],
  },

 
  /* ================= SYSTEM SETUP ================= */
  {
    _id: nanoid(),
    label: "System Setup",
    href: "#",
    icon: Settings,
    roleId: [1],
    subItems: [
      {
        _id: nanoid(),
        label: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Store,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Product Attribute",
        href: "/dashboard/inventory-masterdata/product-attribute",
        icon: Settings,
        roleId: [1],
      },
      {
        _id: nanoid(),
        label: "Category",
        href: "/dashboard/inventory-masterdata/category",
        icon: Tags,
        roleId: [1],
      },
      // {
      //   _id: nanoid(),
      //   label: "Marketplace Setup",
      //   href: "/dashboard/marketplace-setup",
      //   icon: Store,
      //   roleId: [1],
      // },
      
    ],
  },
];
