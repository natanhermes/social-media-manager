'use client'

import { useMemo, useState } from 'react'

interface UsePaginationProps<T> {
  data: T[]
  initialItemsPerPage?: number
}

export function usePagination<T>({
  data,
  initialItemsPerPage = 10,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  }
}
