'use client'

import { useState } from 'react'

type StateTax = { stateCode: string; stateName: string }

interface AddressValues {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

interface Props {
  billing: AddressValues
  shipping: AddressValues
  stateTaxes: StateTax[]
}

const FIELD_CLASS = 'w-full bg-slate-100 border border-slate-200 focus:border-gold rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none'

function StateSelect({ name, value, onChange, stateTaxes, className }: {
  name: string
  value: string
  onChange: (v: string) => void
  stateTaxes: StateTax[]
  className?: string
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${FIELD_CLASS}${className ? ` ${className}` : ''}`}
    >
      <option value="">— State —</option>
      {stateTaxes.map((t) => (
        <option key={t.stateCode} value={t.stateCode}>
          {t.stateCode} – {t.stateName}
        </option>
      ))}
    </select>
  )
}

export function QuoteAddressFields({ billing: initBilling, shipping: initShipping, stateTaxes }: Props) {
  const [billing, setBilling] = useState(initBilling)
  const [shipping, setShipping] = useState(initShipping)
  const [sameAsBilling, setSameAsBilling] = useState(false)

  const handleSameAsBilling = (checked: boolean) => {
    setSameAsBilling(checked)
    if (checked) setShipping({ ...billing })
  }

  const updateBilling = (field: keyof AddressValues, value: string) => {
    const next = { ...billing, [field]: value }
    setBilling(next)
    if (sameAsBilling) setShipping({ ...next })
  }

  return (
    <div className="grid grid-cols-2 gap-6 pt-2">
      {/* Billing */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Billing Address</p>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Street</label>
          <input name="billingStreet" value={billing.street} onChange={(e) => updateBilling('street', e.target.value)} className={FIELD_CLASS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">City</label>
            <input name="billingCity" value={billing.city} onChange={(e) => updateBilling('city', e.target.value)} className={FIELD_CLASS} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">State</label>
            <StateSelect name="billingState" value={billing.state} onChange={(v) => updateBilling('state', v)} stateTaxes={stateTaxes} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Zip</label>
            <input name="billingZip" value={billing.zip} onChange={(e) => updateBilling('zip', e.target.value)} className={FIELD_CLASS} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Country</label>
            <input name="billingCountry" value={billing.country} onChange={(e) => updateBilling('country', e.target.value)} className={FIELD_CLASS} />
          </div>
        </div>
      </div>

      {/* Shipping / Service */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Service / Shipping Address</p>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 hover:text-slate-700">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => handleSameAsBilling(e.target.checked)}
              className="w-3.5 h-3.5 accent-yellow-500"
            />
            Same as billing
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Street</label>
          <input name="shippingStreet" value={shipping.street}
            readOnly={sameAsBilling}
            onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))}
            className={`${FIELD_CLASS} ${sameAsBilling ? 'opacity-60 cursor-default' : ''}`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">City</label>
            <input name="shippingCity" value={shipping.city}
              readOnly={sameAsBilling}
              onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
              className={`${FIELD_CLASS} ${sameAsBilling ? 'opacity-60 cursor-default' : ''}`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">State (tax)</label>
            {/* select doesn't support readOnly — block changes via onChange when locked */}
            <StateSelect name="shippingState" value={shipping.state}
              onChange={(v) => { if (!sameAsBilling) setShipping((s) => ({ ...s, state: v })) }}
              stateTaxes={stateTaxes}
              className={sameAsBilling ? 'opacity-60 pointer-events-none' : ''} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Zip</label>
            <input name="shippingZip" value={shipping.zip}
              readOnly={sameAsBilling}
              onChange={(e) => setShipping((s) => ({ ...s, zip: e.target.value }))}
              className={`${FIELD_CLASS} ${sameAsBilling ? 'opacity-60 cursor-default' : ''}`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Country</label>
            <input name="shippingCountry" value={shipping.country}
              readOnly={sameAsBilling}
              onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
              className={`${FIELD_CLASS} ${sameAsBilling ? 'opacity-60 cursor-default' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
