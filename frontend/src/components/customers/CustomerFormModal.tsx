import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateCustomer } from '../../hooks/useCustomers'
import { Button, Input, Modal } from '../ui'
import { useToast } from '../ui/Toast'

const customerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Invalid email format'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number format'),
})

type CustomerFormInput = z.input<typeof customerSchema>
type CustomerFormValues = z.output<typeof customerSchema>

type CustomerFormModalProps = {
  onClose: () => void
  open: boolean
}

const defaultValues: CustomerFormInput = {
  email: '',
  full_name: '',
  phone: '',
}

export function CustomerFormModal({ onClose, open }: CustomerFormModalProps) {
  const createCustomer = useCreateCustomer()
  const toast = useToast()
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CustomerFormInput, undefined, CustomerFormValues>({
    defaultValues,
    resolver: zodResolver(customerSchema),
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset])

  async function onSubmit(values: CustomerFormValues) {
    try {
      await createCustomer.mutateAsync({
        email: values.email.trim(),
        full_name: values.full_name.trim(),
        phone: values.phone.trim(),
      })

      toast.success('Customer created')
      onClose()
      reset(defaultValues)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError('email', { message: error.message, type: 'manual' })
        return
      }

      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to save customer.',
        type: 'server',
      })
    }
  }

  const isPending = createCustomer.isPending

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isPending) {
          onClose()
        }
      }}
      title="New Customer"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" disabled={isPending}>
            {isPending ? 'Saving...' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          error={errors.full_name?.message}
          placeholder="Aarav Sharma"
          {...register('full_name')}
        />

        <Input
          label="Email"
          error={errors.email?.message}
          placeholder="aarav@example.com"
          {...register('email')}
        />

        <Input
          label="Phone"
          error={errors.phone?.message}
          placeholder="+919876543210"
          {...register('phone')}
        />

        {errors.root?.message ? (
          <div className="rounded border border-error/40 bg-error/10 px-3 py-2 font-body text-body-sm text-error">
            {errors.root.message}
          </div>
        ) : null}
      </form>
    </Modal>
  )
}
