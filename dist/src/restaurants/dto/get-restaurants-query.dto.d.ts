export declare class GetRestaurantsQueryDto {
    search?: string;
    location?: string;
    category?: string;
    status?: 'OPEN' | 'CLOSED';
    sortBy?: 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
