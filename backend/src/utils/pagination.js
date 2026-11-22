/**
 * Standardized pagination parser and response wrapper for REST API list operations.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const paginatedResponse = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit) || 1;
  return {
    data,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  parsePagination,
  paginatedResponse,
};
