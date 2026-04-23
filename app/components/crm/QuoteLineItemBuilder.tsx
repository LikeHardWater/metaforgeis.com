'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { saveQuoteLineItems } from '@/src/lib/actions/quotes'

type Product = {
  id: string
  name: string
  description: string | null
  unitPrice: number
  taxable: boolean
  productType: string
}

type StateTax = {
  stateCode: string
  stateName: string
  taxRate: number
  taxesServices: boolean
}

type LineItem = {
  _key: string
  productId: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  lineTotal: number
  sortOrder: number
}

interface Props {
  quoteId: string
  products: Product[]
  stateTaxes: StateTax[]
  defaultTaxRate: number
  shippingStateCode: string
  initialItems: LineItem[]
}

let keyCounter = 0
const newKey = () => `item_${++keyCounter}`

function calcLineTotal(qty: number, price: number, discount: number, taxRate: number): number {
  const base = qty * price - discount
  return Math.max(0, base + (base * taxRate) / 100)
}

export function QuoteLineItemBuilder({ quoteId, products, stateTaxes, defaultTaxRate, shippingStateCode, initialItems }: Props) {
  const [items, setItems] = useState<LineItem[]>(
    initialItems.length > 0
      ? initialItems.map((i) => ({ ...i, _key: newKey() }))
      : []
  )
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const shippingState = stateTaxes.find((t) => t.stateCode === shippingStateCode)

  const subTotal      = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const discountTotal = items.reduce((s, i) => s + i.discount, 0)
  const taxTotal      = items.reduce((s, i) => { const b = i.quantity * i.unitPrice - i.discount; return s + (b * i.taxRate) / 100 }, 0)
  const grandTotal    = subTotal - discountTotal + taxTotal

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { _key: newKey(), productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: defaultTaxRate, lineTotal: 0, sortOrder: prev.length },
    ])
  }

  const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i._key !== key))

  const updateItem = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== key) return item
        const next = { ...item, ...patch }
        next.lineTotal = calcLineTotal(next.quantity, next.unitPrice, next.discount, next.taxRate)
        return next
      })
    )
  }

  const selectProduct = (key: string, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) { updateItem(key, { productId: '', description: '' }); return }

    // Determine tax rate: services use 0 if the shipping state doesn't tax services
    let taxRate = 0
    if (product.taxable) {
      if (product.productType === 'SERVICE') {
        taxRate = shippingState?.taxesServices ? defaultTaxRate : 0
      } else {
        taxRate = defaultTaxRate
      }
    }

    updateItem(key, {
      productId: product.id,
      description: '',
      unitPrice: product.unitPrice,
      taxRate,
    })
  }

  const handleSave = () => {
    setSaved(false)
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await saveQuoteLineItems(quoteId, JSON.stringify(items.map(({ _key, ...rest }) => rest)))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-500 text-xs uppercase tracking-wider">Line Items</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
          <button
            onClick={handleSave}
            disabled={pending}
            className="flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-dark-bg font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {pending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save Line Items
          </button>
        </div>
      </div>

      <div className="bg-slate-50 rounded-t-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="text-left px-4 py-2.5 w-72">Product / Description</th>
              <th className="text-right px-3 py-2.5 w-20">Qty</th>
              <th className="text-right px-3 py-2.5 w-28">Unit Price ($)</th>
              <th className="text-right px-3 py-2.5 w-24">Discount ($)</th>
              <th className="text-right px-3 py-2.5 w-24">Tax (%)</th>
              <th className="text-right px-3 py-2.5 w-28">Tax ($)</th>
              <th className="text-right px-3 py-2.5 w-28">Total</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => {
              const selectedProduct = products.find((p) => p.id === item.productId)
              return (
                <tr key={item._key}>
                  <td className="px-4 py-2">
                    <select
                      value={item.productId}
                      onChange={(e) => selectProduct(item._key, e.target.value)}
                      className="w-full text-xs bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="">— Custom —</option>
                      <optgroup label="Products">
                        {products.filter((p) => p.productType === 'PRODUCT').map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Services">
                        {products.filter((p) => p.productType === 'SERVICE').map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    {/* Show description field only when no catalog item selected, or as notes override */}
                    {!item.productId && (
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item._key, { description: e.target.value })}
                        placeholder="Description"
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-gold rounded px-2 py-1 mt-1 focus:outline-none"
                      />
                    )}
                    {selectedProduct && (
                      <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedProduct.productType === 'SERVICE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {selectedProduct.productType === 'SERVICE' ? 'Service' : 'Product'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" step="0.01" value={item.quantity}
                      onChange={(e) => updateItem(item._key, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs text-right bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" step="0.01" value={item.unitPrice}
                      onChange={(e) => updateItem(item._key, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs text-right bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" step="0.01" value={item.discount}
                      onChange={(e) => updateItem(item._key, { discount: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs text-right bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={item.taxRate}
                      onChange={(e) => updateItem(item._key, { taxRate: parseFloat(e.target.value) })}
                      className="w-full text-xs bg-slate-100 border border-slate-200 focus:border-gold rounded px-2 py-1.5 focus:outline-none">
                      <option value={0}>0% (exempt)</option>
                      {stateTaxes.map((t) => (
                        <option key={t.stateCode} value={t.taxRate}>
                          {t.stateCode} – {Number(t.taxRate)}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500 text-sm">
                    ${fmt(Math.max(0, item.quantity * item.unitPrice - item.discount) * item.taxRate / 100)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900 text-sm">${fmt(item.lineTotal)}</td>
                  <td className="px-2 py-2">
                    <button onClick={() => removeItem(item._key)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">No line items yet. Add one below.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-gold hover:text-gold-dark font-medium transition-colors">
        <Plus className="w-4 h-4" /> Add Line Item
      </button>

      {items.length > 0 && (
        <div className="flex justify-end">
          <div className="min-w-72 bg-white border border-slate-200 rounded-xl p-5 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${fmt(subTotal)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Discount</span><span>-${fmt(discountTotal)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax</span><span>${fmt(taxTotal)}</span></div>
            <div className="flex justify-between font-black text-base border-t border-slate-200 pt-2 mt-2">
              <span>Grand Total</span><span className="text-gold">${fmt(grandTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
