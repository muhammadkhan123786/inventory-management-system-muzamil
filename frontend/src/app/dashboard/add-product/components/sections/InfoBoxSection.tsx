import React from 'react'
import { Info } from 'lucide-react';
const InfoBoxSection = () => {
  return (
    <div>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Marketplace Pricing Management:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Add different pricing for each marketplace (Amazon, eBay, Shopify, etc.)</li>
                  <li>Each marketplace can have unique cost, selling price, and vat configuration</li>
                  <li>Stock quantity is shared across all marketplaces</li>
                  <li>SKU must be unique for each variant</li>
                  <li>Profit margins are calculated automatically for each marketplace</li>
                  <li>You can edit or remove marketplace pricing before adding the variant</li>
                </ul>
              </div>
            </div>
          </div>
    </div>
  )
}

export default InfoBoxSection