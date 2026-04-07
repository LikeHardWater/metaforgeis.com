'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(1, 'Company name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  service: z.string().min(1, 'Please select a service type'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

const serviceOptions = [
  'Dock Equipment',
  'Industrial Doors',
  'Emergency Repair',
  'Planned Maintenance',
  'Parts Supply',
  'New Installation',
  'General Inquiry',
]

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" aria-hidden="true" />
        <h3 className="text-white font-black text-2xl mb-2">Message Sent!</h3>
        <p className="text-gray-400 mb-6">
          We&apos;ll be in touch shortly. For urgent needs, call us at (866) 563-8247.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="bg-gold hover:bg-gold-dark text-dark-bg font-bold px-6 py-3 rounded transition-colors min-h-[44px]"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {status === 'error' && (
        <div className="flex items-center gap-3 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          Something went wrong. Please try again or call us directly at (866) 563-8247.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name <span className="text-emergency" aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full bg-dark-tertiary border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[44px]"
            placeholder="John Smith"
            {...register('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-emergency text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
            Company <span className="text-emergency" aria-hidden="true">*</span>
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            className="w-full bg-dark-tertiary border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[44px]"
            placeholder="ACME Distribution"
            {...register('company')}
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'company-error' : undefined}
          />
          {errors.company && (
            <p id="company-error" className="text-emergency text-xs mt-1">{errors.company.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email <span className="text-emergency" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full bg-dark-tertiary border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[44px]"
            placeholder="john@company.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-emergency text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            Phone <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="w-full bg-dark-tertiary border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[44px]"
            placeholder="(555) 000-0000"
            {...register('phone')}
          />
        </div>
      </div>

      {/* Service */}
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1">
          Service Type <span className="text-emergency" aria-hidden="true">*</span>
        </label>
        <select
          id="service"
          className="w-full bg-dark-tertiary border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white focus:outline-none transition-colors min-h-[44px] appearance-none"
          {...register('service')}
          aria-invalid={!!errors.service}
          aria-describedby={errors.service ? 'service-error' : undefined}
        >
          <option value="">Select a service...</option>
          {serviceOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.service && (
          <p id="service-error" className="text-emergency text-xs mt-1">{errors.service.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
          Message <span className="text-emergency" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full bg-dark-tertiary border border-dark-tertiary focus:border-gold rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors resize-vertical"
          placeholder="Describe your facility's needs, equipment types, number of doors/docks, urgency..."
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-emergency text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto self-start bg-gold hover:bg-gold-dark disabled:opacity-60 text-dark-bg font-bold px-8 py-4 rounded transition-colors flex items-center justify-center gap-2 min-h-[44px]"
      >
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
