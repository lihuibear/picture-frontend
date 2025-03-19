// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** mail GET /api/mail/getCode */
export async function mailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.mailUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<string>('/api/mail/getCode', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
