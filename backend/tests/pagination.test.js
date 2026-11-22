const { parsePagination, paginatedResponse } = require('../src/utils/pagination');

describe('REST API Pagination Optimization Utility', () => {
  describe('parsePagination', () => {
    test('uses correct defaults when query parameters are omitted', () => {
      const { page, limit, skip } = parsePagination({});
      expect(page).toBe(1);
      expect(limit).toBe(10);
      expect(skip).toBe(0);
    });

    test('calculates correct skip for arbitrary page and limit', () => {
      const { page, limit, skip } = parsePagination({ page: '3', limit: '20' });
      expect(page).toBe(3);
      expect(limit).toBe(20);
      expect(skip).toBe(40); // (3 - 1) * 20
    });

    test('clamps invalid or negative values to safe boundaries', () => {
      const { page, limit, skip } = parsePagination({ page: '-5', limit: '500' });
      expect(page).toBe(1); // Min page is 1
      expect(limit).toBe(100); // Max limit clamped at 100
      expect(skip).toBe(0);
    });
  });

  describe('paginatedResponse', () => {
    test('constructs standardized pagination envelope', () => {
      const dummyData = [{ id: 1 }, { id: 2 }];
      const totalCount = 25;
      const page = 2;
      const limit = 10;

      const response = paginatedResponse(dummyData, totalCount, page, limit);

      expect(response.data).toEqual(dummyData);
      expect(response.pagination).toEqual({
        totalCount: 25,
        totalPages: 3,
        currentPage: 2,
        limit: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    test('correctly handles edge case of empty result set', () => {
      const response = paginatedResponse([], 0, 1, 10);
      expect(response.pagination.totalCount).toBe(0);
      expect(response.pagination.totalPages).toBe(1);
      expect(response.pagination.hasNextPage).toBe(false);
      expect(response.pagination.hasPrevPage).toBe(false);
    });
  });
});
