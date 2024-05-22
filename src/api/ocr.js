import request from '@/utils/request'

export function img_detect(data) {
  return request({
    url: '/ocr/img-detect/',
    method: 'post',
    data
  })
}
