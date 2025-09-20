'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardProducts from '@/components/DashboardProducts'
import Image from 'next/image'
import Pagination from '@/components/Pagination'
import { Edit, Trash2, Search, Package, Plus } from 'lucide-react'
import '@/styles/dashboard.css'

// Inline styles for placeholders
const placeholderStyle: React.CSSProperties = {
  opacity: 1, // Ensure text is fully visible
  color: 'inherit',
};

// Add global styles for placeholders
const globalStyles = `
  input::placeholder,
  textarea::placeholder {
    opacity: 0.3 !important;
    color: inherit;
  }
  input::-webkit-input-placeholder,
  textarea::-webkit-input-placeholder {
    opacity: 0.3 !important;
    color: inherit;
  }
  input::-moz-placeholder,
  textarea::-moz-placeholder {
    opacity: 0.3 !important;
    color: inherit;
  }
  input:-ms-input-placeholder,
  textarea:-ms-input-placeholder {
    opacity: 0.3 !important;
    color: inherit;
  }
  input:-moz-placeholder,
  textarea:-moz-placeholder {
    opacity: 0.3 !important;
    color: inherit;
  }
`;

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  tax_percentage: number
  hsn_code: string | null
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    tax_percentage: '',
    hsn_code: '',
    is_active: true
  })
  
  const itemsPerPage = 12

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            sku: formData.sku,
            name: formData.name,
            description: formData.description || null,
            price: parseFloat(formData.price),
            tax_percentage: parseFloat(formData.tax_percentage),
            hsn_code: formData.hsn_code || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([{
            sku: formData.sku,
            name: formData.name,
            description: formData.description || null,
            price: parseFloat(formData.price),
            tax_percentage: parseFloat(formData.tax_percentage),
            hsn_code: formData.hsn_code || null
          }])

        if (error) throw error
      }

      setShowModal(false)
      setEditingProduct(null)
      setFormData({ 
        sku: '', 
        name: '', 
        description: '', 
        price: '', 
        tax_percentage: '18', 
        hsn_code: '',
        is_active: true 
      })
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      tax_percentage: product.tax_percentage.toString(),
      hsn_code: product.hsn_code || '',
      is_active: product.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardProducts 
        title="Products" 
        subtitle="Manage your product catalog"
      />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => {
                  setFormData({
                    sku: '',
                    name: '',
                    description: '',
                    price: '',
                    tax_percentage: '18',
                    hsn_code: '',
                    is_active: true
                  })
                  setEditingProduct(null)
                  setShowModal(true)
                }}
                className="btn btn-secondary"
              >
                <Plus className="btn-icon" />
                Add New Product
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {product.sku}
                      </span>
                      {product.hsn_code && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          HSN: {product.hsn_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {product.description && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span> {product.description}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> ₹{product.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tax:</span> {product.tax_percentage}%
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total with Tax:</span> ₹{(product.price * (1 + product.tax_percentage / 100)).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
            </p>
            <button
              onClick={() => {
                setFormData({
                  sku: '',
                  name: '',
                  description: '',
                  price: '',
                  tax_percentage: '18',
                  hsn_code: '',
                  is_active: true
                })
                setEditingProduct(null)
                setShowModal(true)
              }}
              className="btn btn-secondary"
            >
              <Plus className="btn-icon" />
              Add New Product
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* Background with image and blur */}
          <div className="fixed inset-0 bg-black/60">
            <div className="absolute inset-0">
              <div className="w-full h-full">
                <Image
                  src="/images/background.jpg"
                  alt="Background"
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover blur-lg"
                  quality={50}
                  priority
                />
              </div>
            </div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
          </div>
          
          {/* Modal Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-md w-full p-6 relative z-10 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  placeholder="SKU-001"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={placeholderStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Wireless Mouse"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={placeholderStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={placeholderStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="999.00"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={placeholderStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={placeholderStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  placeholder="8471"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={placeholderStyle}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                    setFormData({ 
                      sku: '', 
                      name: '', 
                      description: '', 
                      price: '', 
                      tax_percentage: '18', 
                      hsn_code: '',
                      is_active: true 
                    })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
