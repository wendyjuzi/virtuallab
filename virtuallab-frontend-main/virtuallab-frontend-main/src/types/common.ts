// 通用后端返回结构类型
export interface CommonResult<T = any> {
  code: number;
  data: T;
  message: string;
} 