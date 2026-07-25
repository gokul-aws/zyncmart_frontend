'use client';

import { use, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useAdminProduct, useDeleteAdminProduct, useToggleAdminProductStatus } from '@/hooks/useAdminProducts';
import AdminPageShell from '@/components/admin/AdminPageShell';
import Badge from '@/components/ui/Badge';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function AdminProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useAdminProduct(slug);
  const deleteMutation = useDeleteAdminProduct();
  const toggleStatusMutation = useToggleAdminProductStatus();

  const statusLabel = useMemo(
    () => (product?.isActive ? 'Active' : 'Inactive'),
    [product]
  );

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Delete product ${product.name}? This cannot be undone.`)) {
      return;
    }

    await deleteMutation.mutateAsync(product._id);
  };

  const handleStatusToggle = async () => {
    if (!product) return;
    await toggleStatusMutation.mutateAsync({ id: product._id, isActive: !product.isActive });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        Loading product details…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
        <p className="text-lg font-semibold">Unable to load product.</p>
        <p className="mt-2 text-sm">Try again or head back to the product list.</p>
        <Link href="/admin/products" className="mt-4 inline-flex rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors">
          Back to products
        </Link>
      </div>
    );
  }

  // Products created before colorVariants existed (or not yet migrated) may
  // not have this field populated.
  const variants = product.variants ?? [];
  const isVariable = product.productType === 'variable';

  return (
    <AdminPageShell
      title={product.name}
      description="Review product details, manage images, or update content for this listing."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleStatusToggle}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {product.isActive ? 'Set inactive' : 'Set active'}
          </button>
          <Link
            href={`/admin/products/${product.slug}/edit`}
            className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Status</p>
                <Badge variant={product.isActive ? 'success' : 'outline'}>{statusLabel}</Badge>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Created {new Date(product.createdAt).toLocaleDateString('en-IN')}</div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Product Type</p>
                <Badge variant={isVariable ? 'outline' : 'success'}>{isVariable ? 'Variable' : 'Simple'}</Badge>
              </div>
              {isVariable ? (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Variants</p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{variants.length} defined</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Stock</p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{product.stock}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">SKU</p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">₹{(product.price ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Stock</p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{product.stock}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{product.category.name}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Short description</p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{product.shortDescription}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{product.description}</p>
              </div>
            </div>
          </div>

          {isVariable ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Variants</p>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{variants.length} defined</div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full table-auto text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-950">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Image</th>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">SKU</th>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Colour</th>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Size</th>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Price</th>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Original Price</th>
                      <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {variants.map((variant) => (
                      <tr key={variant._id} className="bg-slate-50 dark:bg-slate-950">
                        <td className="px-4 py-3">
                          {variant.image ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                              <Image src={variant.image} alt={variant.sku} fill className="object-cover" sizes="40px" />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-xs text-slate-400">
                              —
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{variant.sku}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {variant.color?.code && (
                              <span className="h-4 w-4 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: variant.color.code }} />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">{variant.color?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{variant.size}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{variant.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {variant.originalPrice ? `₹${variant.originalPrice.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{variant.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tags</p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{product.tags.length} tags</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-slate-700 dark:text-slate-200">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <ArrowLeft className="h-4 w-4" />
              <Link href="/admin/products" className="font-medium text-slate-900 hover:text-primary dark:text-white dark:hover:text-primary">
                Back to product list
              </Link>
            </div>
          </div>

          {isVariable && variants.map((variant) => (
            variant._id ? (
              <div key={variant._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-3">
                  {variant.color?.code && (
                    <span className="h-5 w-5 flex-shrink-0 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: variant.color.code }} />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {variant.color?.name} / {variant.size}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {variant.sku}</p>
                  </div>
                </div>
                {variant.image ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <Image src={variant.image} alt={variant.sku} fill className="object-cover" sizes="96px" />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No image uploaded</p>
                )}
              </div>
            ) : null
          ))}

          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
            <p className="font-semibold">Danger zone</p>
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">Delete this product permanently from the storefront.</p>
            <button
              type="button"
              onClick={handleDelete}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
            >
              Delete product
            </button>
          </div>
        </aside>
      </div>
    </AdminPageShell>
  );
}
