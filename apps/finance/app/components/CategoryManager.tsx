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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Category Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
        >
          + Add New Category
        </button>
      )}

      {/* Add Category Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Category</h3>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2 px-4 rounded-lg border font-medium transition ${
                  formData.type === 'income'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2 px-4 rounded-lg border font-medium transition ${
                  formData.type === 'expense'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Groceries, Salary, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
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
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setError('')
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {/* Income Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Income Categories</h3>
        {incomeCategories.length === 0 ? (
          <p className="text-gray-500 text-sm">No income categories yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 transition"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Expense Categories</h3>
        {expenseCategories.length === 0 ? (
          <p className="text-gray-500 text-sm">No expense categories yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 transition"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
