export class BasePaginationDTO<T> {
  filters: T; // TODO: dont use this version!
  page?: number = 1;
  limit?: number = 0;
}
