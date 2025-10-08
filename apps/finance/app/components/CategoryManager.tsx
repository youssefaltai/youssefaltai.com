'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Input } from '@repo/ui'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
]

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: COLORS[0],
    icon: '📁',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create category')
      }

      // Reset form and refresh categories
      setFormData({
        name: '',
        type: 'expense',
        color: COLORS[0],
        icon: '📁',
      })
      setShowForm(false)
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.message || 'Failed to delete category')
        return
      }

      fetchCategories()
    } catch (err) {
      console.error('Error deleting category:', err)
      alert('Failed to delete category')
    }
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto"></div>
        <p className="mt-4 text-ios-body text-ios-gray-1">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Category Button */}
      {!showForm && (
        <Button
          variant="secondary"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          + Add New Category
        </Button>
      )}

      {/* Add Category Form */}
      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-ios-headline font-semibold text-ios-label-primary">New Category</h3>
            
            {error && (
              <div className="bg-ios-red/10 border-l-4 border-ios-red text-ios-red p-4 rounded-ios-sm text-ios-callout" role="alert">
                <p>{error}</p>
              </div>
            )}

          <div>
            <label className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-3 px-4 rounded-ios font-semibold transition-all ${
                  formData.type === 'income'
                    ? 'bg-ios-green text-white'
                    : 'bg-ios-gray-6 text-ios-label-primary border border-ios-gray-3'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-3 px-4 rounded-ios font-semibold transition-all ${
                  formData.type === 'expense'
                    ? 'bg-ios-red text-white'
                    : 'bg-ios-gray-6 text-ios-label-primary border border-ios-gray-3'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <Input
            label="Name *"
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Groceries, Salary, etc."
          />

          <div>
            <label className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full border-2 transition ${
                    formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Income Categories */}
      <div>
        <h3 className="text-ios-headline font-semibold text-ios-label-primary mb-3">Income Categories</h3>
        {incomeCategories.length === 0 ? (
          <p className="text-ios-gray-2 text-ios-callout">No income categories yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {incomeCategories.map((category) => (
              <Card
                key={category.id}
                padding="sm"
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#007AFF' }}
                  />
                  <span className="text-ios-callout font-medium text-ios-label-primary">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-ios-red hover:text-ios-red/80 transition p-1 -m-1"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div>
        <h3 className="text-ios-headline font-semibold text-ios-label-primary mb-3">Expense Categories</h3>
        {expenseCategories.length === 0 ? (
          <p className="text-ios-gray-2 text-ios-callout">No expense categories yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {expenseCategories.map((category) => (
              <Card
                key={category.id}
                padding="sm"
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#007AFF' }}
                  />
                  <span className="text-ios-callout font-medium text-ios-label-primary">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-ios-red hover:text-ios-red/80 transition p-1 -m-1"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
