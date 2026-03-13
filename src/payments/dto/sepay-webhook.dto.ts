import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Payload SePay gửi về webhook khi phát hiện giao dịch chuyển khoản.
 * Docs: https://docs.sepay.vn
 */
export class SepayWebhookDto {
  /** ID giao dịch bên SePay */
  @IsNumber()
  id: number;

  /** Ngân hàng nhận, e.g. "MB", "VCB" */
  @IsString()
  gateway: string;

  /** Thời gian giao dịch, e.g. "2024-01-01 12:00:00" */
  @IsString()
  transactionDate: string;

  /** Số tài khoản thụ hưởng */
  @IsString()
  accountNumber: string;

  /** Nội dung chuyển khoản — dùng để match payment_code */
  @IsString()
  @IsOptional()
  content?: string;

  /**
   * Mã đối chiếu — SePay parse từ nội dung
   * Có thể null nếu SePay không nhận diện được
   */
  @IsString()
  @IsOptional()
  code?: string | null;

  /** "in" = tiền vào, "out" = tiền ra */
  @IsString()
  transferType: string;

  /** Số tiền giao dịch */
  @IsNumber()
  transferAmount: number;

  /** Mã tham chiếu ngân hàng */
  @IsString()
  @IsOptional()
  referenceCode?: string;

  /** Số dư lũy kế */
  @IsNumber()
  @IsOptional()
  accumulated?: number;
}
