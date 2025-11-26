using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Category;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Project categories management endpoints with multi-tenant support
    /// </summary>
    public class CategoriesController : ApiControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(
            ICategoryRepository categoryRepository,
            ILogger<CategoriesController> logger)
        {
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all categories for current tenant
        /// </summary>
        /// <returns>List of categories</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var categories = await _categoryRepository.GetAllAsync(siteId);

                var categoryDtos = categories.Select(MapToDto);

                return Success(categoryDtos, "Categories retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, ApiResponse<IEnumerable<CategoryDto>>.ErrorResponse("Error retrieving categories"));
            }
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Category details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var category = await _categoryRepository.GetByIdAsync(siteId, id);

                if (category == null)
                {
                    return NotFound(ApiResponse<CategoryDto>.ErrorResponse("Category not found"));
                }

                var categoryDto = MapToDto(category);

                return Success(categoryDto, "Category retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category {CategoryId}", id);
                return StatusCode(500, ApiResponse<CategoryDto>.ErrorResponse("Error retrieving category"));
            }
        }

        /// <summary>
        /// Create new category
        /// </summary>
        /// <param name="createDto">Category creation data</param>
        /// <returns>Created category</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryDto createDto)
        {
            try
            {
                var siteId = GetSiteId();

                var category = new ProjectCategory
                {
                    CategoryID = Guid.NewGuid(),
                    SiteID = siteId,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Color = createDto.Color ?? "#3B82F6",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdCategory = await _categoryRepository.AddAsync(category);
                var categoryDto = MapToDto(createdCategory);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = categoryDto.CategoryID },
                    ApiResponse<CategoryDto>.SuccessResponse(categoryDto, "Category created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, ApiResponse<CategoryDto>.ErrorResponse("Error creating category"));
            }
        }

        /// <summary>
        /// Update existing category
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <param name="updateDto">Category update data</param>
        /// <returns>Updated category</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(Guid id, [FromBody] UpdateCategoryDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingCategory = await _categoryRepository.GetByIdAsync(siteId, id);

                if (existingCategory == null)
                {
                    return NotFound(ApiResponse<CategoryDto>.ErrorResponse("Category not found"));
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Name))
                    existingCategory.Name = updateDto.Name;

                if (updateDto.Description != null)
                    existingCategory.Description = updateDto.Description;

                if (!string.IsNullOrEmpty(updateDto.Color))
                    existingCategory.Color = updateDto.Color;

                existingCategory.UpdatedAt = DateTime.UtcNow;

                var updatedCategory = await _categoryRepository.UpdateAsync(siteId, id, existingCategory);
                var categoryDto = MapToDto(updatedCategory);

                return Success(categoryDto, "Category updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId}", id);
                return StatusCode(500, ApiResponse<CategoryDto>.ErrorResponse("Error updating category"));
            }
        }

        /// <summary>
        /// Delete category (soft delete)
        /// </summary>
        /// <param name="id">Category ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var category = await _categoryRepository.GetByIdAsync(siteId, id);

                if (category == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Category not found"));
                }

                await _categoryRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Category deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting category"));
            }
        }

        /// <summary>
        /// Get category by name
        /// </summary>
        /// <param name="name">Category name</param>
        /// <returns>Category details</returns>
        [HttpGet("name/{name}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> GetByName(string name)
        {
            try
            {
                var siteId = GetSiteId();
                var category = await _categoryRepository.GetByNameAsync(siteId, name);

                if (category == null)
                {
                    return NotFound(ApiResponse<CategoryDto>.ErrorResponse("Category not found"));
                }

                var categoryDto = MapToDto(category);

                return Success(categoryDto, "Category retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category by name {Name}", name);
                return StatusCode(500, ApiResponse<CategoryDto>.ErrorResponse("Error retrieving category"));
            }
        }

        // Helper method to map entity to DTO
        private static CategoryDto MapToDto(ProjectCategory category)
        {
            return new CategoryDto
            {
                CategoryID = category.CategoryID,
                SiteID = category.SiteID,
                Name = category.Name,
                Description = category.Description,
                Color = category.Color,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };
        }
    }
}
