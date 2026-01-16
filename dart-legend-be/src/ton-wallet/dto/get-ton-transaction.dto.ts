export class GetTonTransactionDto {
  limit: number;
  lt?: string;
  hash?: string;
  to_lt?: string;
  inclusive?: boolean;
  archival?: boolean;
}
