import { GoodsReceivedNote, PurchaseOrder } from '../types/goodsReceived';

// export const mockPurchaseOrders: PurchaseOrder[] = [
//   {
//     id: '1',
//     orderNumber: 'PO-2024-001',
//     supplier: 'Pride Mobility Supplies Ltd',
//     supplierContact: 'sales@pridemobility.co.uk',
//     orderDate: new Date('2024-01-20'),
//     expectedDelivery: new Date('2024-02-05'),
//     status: 'ordered',
//     deliveryStatus: 'not-delivered',
//     items: [
//       {
//         id: '1',
//         productName: 'Pride Victory 10 3-Wheel',
//         sku: 'PV10-3W-001',
//         quantity: 5,
//         receivedQuantity: 0,
//         unitPrice: 1299.99,
//         totalPrice: 6499.95
//       },
//       {
//         id: '2',
//         productName: 'Battery 12V 35Ah AGM',
//         sku: 'BAT-12V35-003',
//         quantity: 20,
//         receivedQuantity: 0,
//         unitPrice: 75.00,
//         totalPrice: 1500.00
//       }
//     ],
//     subtotal: 7999.95,
//     tax: 1599.99,
//     total: 9599.94,
//     notes: 'Urgent order for restocking'
//   },
//   {
//     id: '2',
//     orderNumber: 'PO-2024-002',
//     supplier: 'Drive Medical UK',
//     supplierContact: 'orders@drivemedical.co.uk',
//     orderDate: new Date('2024-01-25'),
//     expectedDelivery: new Date('2024-02-10'),
//     status: 'ordered',
//     deliveryStatus: 'not-delivered',
//     items: [
//       {
//         id: '1',
//         productName: 'Drive Medical Scout Compact',
//         sku: 'DM-SC-002',
//         quantity: 3,
//         receivedQuantity: 0,
//         unitPrice: 799.99,
//         totalPrice: 2399.97
//       },
//       {
//         id: '2',
//         productName: 'Joystick Controller',
//         sku: 'CTL-JOY-005',
//         quantity: 10,
//         receivedQuantity: 0,
//         unitPrice: 110.00,
//         totalPrice: 1100.00
//       }
//     ],
//     subtotal: 3499.97,
//     tax: 699.99,
//     total: 4199.96,
//     notes: 'Standard monthly order'
//   }
// ];

// export const mockGRNs: GoodsReceivedNote[] = [
//   {
//     id: '1',
//     grnNumber: 'GRN-2024-001',
//     purchaseOrderId: '1',
//     purchaseOrderNumber: 'PO-2024-001',
//     supplier: 'Pride Mobility Supplies Ltd',
//     receivedDate: new Date('2024-01-30'),
//     receivedBy: 'John Smith',
//     items: [
//       {
//         id: '1',
//         purchaseOrderItemId: '1',
//         productName: 'Pride Victory 10 3-Wheel',
//         sku: 'PV10-3W-001',
//         orderedQuantity: 5,
//         receivedQuantity: 5,
//         acceptedQuantity: 5,
//         rejectedQuantity: 0,
//         damageQuantity: 0,
//         unitPrice: 1299.99,
//         condition: 'good',
//         notes: 'All items in perfect condition'
//       },
//       {
//         id: '2',
//         purchaseOrderItemId: '2',
//         productName: 'Battery 12V 35Ah AGM',
//         sku: 'BAT-12V35-003',
//         orderedQuantity: 20,
//         receivedQuantity: 20,
//         acceptedQuantity: 20,
//         rejectedQuantity: 0,
//         damageQuantity: 0,
//         unitPrice: 75.00,
//         condition: 'good',
//         notes: 'All batteries received'
//       }
//     ],
//     totalOrdered: 25,
//     totalReceived: 25,
//     totalAccepted: 25,
//     totalRejected: 0,
//     status: 'completed',
//     notes: 'All items delivered in perfect condition',
//     signature: 'J.Smith'
//   }
// ];